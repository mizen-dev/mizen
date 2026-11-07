#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import type { Catalog } from "./catalog.js";
import { formatInfo, formatSearch, info, search } from "./discover.js";
import {
	CliError,
	commandLine,
	errorDocument,
	formatError,
	invalidUsage,
	normalizeError,
	type Recovery,
} from "./errors.js";
import {
	argumentOptions,
	help,
	isCommand,
	unknownCommand,
	validateOptions,
} from "./help.js";
import { nextStep, styleFor, unstyled } from "./output.js";

// --no-color applies before any stream decides its styling.
if (process.argv.includes("--no-color")) {
	process.env.NO_COLOR = "1";
}
const out = styleFor(process.stdout);
const err = styleFor(process.stderr);

interface Result {
	command: string;
	data: unknown;
	exitCode?: 0 | 1;
	/** Prose for stderr: an empty result or the next step. */
	note?: string;
	/** The answer, for stdout. */
	text: string;
}

function runSearch(catalog: Catalog, query: string): Result {
	const components = search(catalog.components, query);
	const data = { components, query, uiVersion: catalog.uiVersion };
	if (components.length) {
		return {
			command: "search",
			data,
			text: formatSearch(out, components, process.stdout),
		};
	}
	return {
		command: "search",
		data,
		note: [
			`No components match "${query}".`,
			"",
			nextStep(err, "List every component", "mizen search"),
		].join("\n"),
		// A pipe still gets the table header, so a parser sees the columns.
		text: process.stdout.isTTY ? "" : "Component\tDescription",
	};
}

function runInfo(catalog: Catalog, query: string): Result {
	if (!query.trim()) {
		throw new CliError(
			"missing_name",
			"Can't show a component without its name.",
			2,
			{
				next: { argv: ["mizen", "search"], benefit: "Find a component" },
			}
		);
	}
	const component = info(catalog.components, query);
	return {
		command: "info",
		data: { component, uiVersion: catalog.uiVersion },
		text: formatInfo(out, component),
	};
}

interface CommandOptions {
	cwd?: string;
	"dry-run"?: boolean;
	feature?: string[];
	package?: string;
	"package-manager"?: string;
	strict?: boolean;
	workspace?: boolean;
	yes?: boolean;
}

async function runDoctor(
	catalog: Catalog,
	values: CommandOptions
): Promise<Result> {
	const cwd = values.cwd ?? process.cwd();
	const { doctor } = await import("./doctor/doctor.js");
	const { formatReport } = await import("./doctor/report.js");
	const { formatWorkspace, workspaceDoctor } = await import(
		"./doctor/workspace.js"
	);
	const failed = (summary: { errors: number; unverified: number }) =>
		summary.errors > 0 || Boolean(values.strict && summary.unverified);
	if (values.workspace) {
		const data = await workspaceDoctor(cwd, catalog.nodeRange);
		const text = formatWorkspace(out, data);
		return {
			command: "doctor",
			data,
			exitCode: failed(data.summary) ? 1 : 0,
			text,
		};
	}
	const data = await doctor(cwd, catalog.nodeRange);
	const text = formatReport(out, data);
	return {
		command: "doctor",
		data,
		exitCode: failed(data.summary) ? 1 : 0,
		text,
	};
}

// What to run after init: apply a plan, or check the app after a failure.
function initNext(values: CommandOptions, project: string, state: string) {
	if (state === "planned") {
		const argv = [
			"mizen",
			"init",
			"--cwd",
			project,
			...(values.package ? ["--package", values.package] : []),
			...(values["package-manager"]
				? ["--package-manager", values["package-manager"]]
				: []),
			...(values.feature ?? []).flatMap((feature) => ["--feature", feature]),
			"--yes",
		];
		return { argv, benefit: "Apply the plan" };
	}
	if (state === "install-failed" || state === "verification-failed") {
		return {
			argv: ["mizen", "doctor", "--cwd", project],
			benefit: "See what needs attention",
		};
	}
	return null;
}

async function runInit(
	catalog: Catalog,
	values: CommandOptions
): Promise<Result> {
	const { formatInit, init } = await import("./init/init.js");
	const data = await init(
		{
			cwd: values.cwd,
			dryRun: values["dry-run"],
			feature: values.feature,
			package: values.package,
			packageManager: values["package-manager"],
			yes: values.yes,
		},
		catalog
	);
	const next: Recovery | null = initNext(
		values,
		data.plan.project,
		data.status
	);
	return {
		command: "init",
		data,
		exitCode: ["install-failed", "verification-failed"].includes(data.status)
			? 1
			: 0,
		text: formatInit(out, data),
		...(next
			? { note: nextStep(err, next.benefit, commandLine(next.argv)) }
			: {}),
	};
}

function dispatch(
	catalog: Catalog,
	positionals: string[],
	values: CommandOptions
): Result | Promise<Result> {
	const [command, ...args] = positionals;
	if (!isCommand(command)) {
		return unknownCommand(command ?? "");
	}
	validateOptions(command, values);
	if ((command === "init" || command === "doctor") && args.length) {
		invalidUsage(
			`Can't use arguments with mizen ${command}. Select the app with --cwd.`,
			command
		);
	}
	if (command === "init") {
		return runInit(catalog, values);
	}
	if (command === "doctor") {
		return runDoctor(catalog, values);
	}
	return command === "search"
		? runSearch(catalog, args.join(" "))
		: runInfo(catalog, args.join(" "));
}

function json(value: unknown, stream: NodeJS.WriteStream) {
	return JSON.stringify(value, null, stream.isTTY ? 2 : undefined);
}

function write(asJson: boolean | undefined, result: Result) {
	if (asJson) {
		const document = {
			command: result.command,
			data: result.data,
			schemaVersion: 1,
		};
		process.stdout.write(`${json(document, process.stdout)}\n`);
	} else {
		if (result.text) {
			process.stdout.write(`${result.text}\n`);
		}
		if (result.note) {
			process.stderr.write(`${result.text ? "\n" : ""}${result.note}\n`);
		}
	}
	process.exitCode = result.exitCode ?? 0;
}

async function version(): Promise<string> {
	const manifest = JSON.parse(
		await readFile(new URL("../package.json", import.meta.url), "utf8")
	);
	return manifest.version;
}

// `mizen help [command]` and `--help` at any depth print the same help;
// bare `mizen` prints it too, unless it asks for the version.
function helpTopic(
	positionals: string[],
	values: { help?: boolean; version?: boolean }
) {
	if (positionals[0] === "help") {
		return { topic: positionals[1] };
	}
	const bare = positionals.length === 0 && !values.version;
	return values.help || bare ? { topic: positionals[0] } : null;
}

async function main() {
	const { values, positionals } = parseArgs({
		allowPositionals: true,
		options: argumentOptions,
	});
	const asked = helpTopic(positionals, values);
	if (asked) {
		const text = help(out, asked.topic);
		const usage = values.json ? help(unstyled, asked.topic) : text;
		write(values.json, { command: "help", data: { usage }, text });
		return;
	}
	if (values.version) {
		const current = await version();
		write(values.json, {
			command: "version",
			data: { version: current },
			text: current,
		});
		return;
	}
	const catalog: Catalog = JSON.parse(
		await readFile(new URL("./catalog.json", import.meta.url), "utf8")
	);
	write(values.json, await dispatch(catalog, positionals, values));
}

function requestedJson(args: string[]): boolean {
	const terminator = args.indexOf("--");
	return (terminator < 0 ? args : args.slice(0, terminator)).includes("--json");
}

main().catch((error: unknown) => {
	const args = process.argv.slice(2);
	const failure = normalizeError(
		error,
		isCommand(args[0]) ? args[0] : undefined
	);
	const text = requestedJson(args)
		? JSON.stringify(errorDocument(failure))
		: formatError(err, failure);
	process.stderr.write(`${text}\n`);
	process.exitCode = failure.exitCode;
});
