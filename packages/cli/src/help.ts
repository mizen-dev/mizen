import { CliError, invalidUsage } from "./errors.js";
import type { Style } from "./output.js";

export const argumentOptions = {
	cwd: { type: "string" },
	"dry-run": { type: "boolean" },
	feature: { multiple: true, type: "string" },
	help: { short: "h", type: "boolean" },
	json: { type: "boolean" },
	"no-color": { type: "boolean" },
	package: { type: "string" },
	"package-manager": { type: "string" },
	strict: { type: "boolean" },
	version: { short: "v", type: "boolean" },
	workspace: { type: "boolean" },
	yes: { type: "boolean" },
} as const;

type OptionName = keyof typeof argumentOptions;
const optionHelp: Record<OptionName, readonly [string, string]> = {
	cwd: ["--cwd <DIR>", "Select the app directory (default: current directory)"],
	"dry-run": [
		"--dry-run",
		"Print the plan without applying it, even with --yes",
	],
	feature: [
		"--feature <FEATURE>",
		"Add an optional feature, repeatable. Accepts: diagram",
	],
	help: ["-h, --help", "Show help"],
	json: ["--json", "Print one JSON document (schema version 1)"],
	"no-color": ["--no-color", "Turn off color"],
	package: [
		"--package <FILE>",
		"Install @mizen-labs/ui from a local .tgz archive",
	],
	"package-manager": [
		"--package-manager <NAME>",
		"Use npm or pnpm when the app declares neither",
	],
	strict: ["--strict", "Fail when any check is unverified"],
	version: ["-v, --version", "Show the version"],
	workspace: ["--workspace", "Check every app in the nearest workspace"],
	yes: ["--yes", "Apply the plan. Conflicts still stop init"],
};
const globals = ["help", "json", "no-color", "version"] as const;

interface CommandHelp {
	examples: string[];
	group: "Components" | "Setup";
	notes: string[];
	options: readonly OptionName[];
	summary: string;
	usage: string;
}

const commands = {
	doctor: {
		examples: [
			"mizen doctor --cwd ./apps/web",
			"mizen doctor --workspace --strict",
		],
		group: "Setup",
		notes: [
			"Checks Next.js App Router, TanStack Start, and React + Vite apps.",
			"With --workspace, --cwd selects where to look for the workspace root.",
			"Linked, external, and ambiguous packages stay unverified.",
			"Exits 1 when a check fails, or with --strict when one is unverified.",
		],
		options: ["cwd", "strict", "workspace"],
		summary: "Check an app's Mizen setup without changing files",
		usage: "mizen doctor [options]",
	},
	info: {
		examples: ["mizen info button", "mizen info button --json"],
		group: "Components",
		notes: [
			"Accepts a component slug or name.",
			"Describes the bundled catalog, which may differ from your installed version.",
			"Works offline and never reads your project.",
		],
		options: [],
		summary: "Show a component's API, imports, guidance, and examples",
		usage: "mizen info <COMPONENT> [options]",
	},
	init: {
		examples: [
			"mizen init --cwd ./apps/web",
			"mizen init --cwd ./apps/web --yes",
			"mizen init --cwd ./apps/web --package ./mizen-ui-0.1.0.tgz --yes",
		],
		group: "Setup",
		notes: [
			"Prints a plan by default. Only --yes applies it, and --dry-run always wins.",
			"Supports Next.js App Router, TanStack Start, and React + Vite apps.",
			"The package manager must match the app's declaration and lockfile.",
			"Installs skip lifecycle scripts.",
			"Until @mizen-labs/ui is published, pass a matching local archive with --package.",
			"--yes never overwrites a conflict. If init stops midway,",
			".mizen-init-journal.json records each edit. Restore or finish them,",
			"then remove the journal.",
			"Exits 1 on a conflict, or when an install or check fails.",
		],
		options: ["cwd", "dry-run", "feature", "package", "package-manager", "yes"],
		summary: "Plan or apply Mizen setup in an app",
		usage: "mizen init [options]",
	},
	search: {
		examples: ["mizen search dialog", "mizen search keyboard navigation"],
		group: "Components",
		notes: [
			"Matches every query word, ignoring case. With no query, lists every component.",
			"Works offline and never reads your project.",
		],
		options: [],
		summary: "Find components in the bundled catalog",
		usage: "mizen search [QUERY] [options]",
	},
} satisfies Record<string, CommandHelp>;

export type Command = keyof typeof commands;
export function isCommand(value: string | undefined): value is Command {
	return value !== undefined && Object.hasOwn(commands, value);
}

// Edit distance, for one close suggestion on a mistyped command.
function distance(a: string, b: string): number {
	let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
	for (const [i, letter] of [...a].entries()) {
		const current = [i + 1];
		for (const [j, other] of [...b].entries()) {
			const substitution = (previous[j] ?? 0) + (letter === other ? 0 : 1);
			current.push(
				Math.min(
					(previous[j + 1] ?? 0) + 1,
					(current[j] ?? 0) + 1,
					substitution
				)
			);
		}
		previous = current;
	}
	return previous[b.length] ?? 0;
}

/** The one known name within two edits of the input, if any. */
export function closest(
	input: string,
	names: readonly string[]
): string | undefined {
	const ranked = names
		.map((name) => ({ name, score: distance(input, name) }))
		.filter((item) => item.score <= 2)
		.toSorted((a, b) => a.score - b.score);
	return ranked[0]?.name;
}

export function unknownCommand(command: string): never {
	const suggestion = closest(command, Object.keys(commands));
	throw new CliError(
		"unknown_command",
		`Unknown command ${command} for mizen.${suggestion ? ` Did you mean ${suggestion}?` : ""}`,
		2,
		{
			next: {
				argv: suggestion
					? ["mizen", suggestion, "--help"]
					: ["mizen", "--help"],
				benefit: suggestion ? `See ${suggestion} usage` : "See usage",
			},
		}
	);
}

const sorted = (options: readonly OptionName[]) =>
	options.toSorted((a, b) => a.localeCompare(b));

function optionRows(options: readonly OptionName[]): string[] {
	const width =
		Math.max(...options.map((name) => optionHelp[name][0].length)) + 3;
	return sorted(options).map((name) => {
		const [label, description] = optionHelp[name];
		return `  ${label.padEnd(width)}${description}`;
	});
}

function section(style: Style, title: string, lines: string[]): string[] {
	return lines.length ? ["", style.heading(`${title}:`), ...lines] : [];
}

function examples(style: Style, list: string[]): string[] {
	return section(
		style,
		"Examples",
		list.map((command) => `    ${style.command(command)}`)
	);
}

function rootHelp(style: Style): string {
	const groups = ["Components", "Setup"] as const;
	return [
		style.bold("mizen <COMMAND> [options]"),
		"Find Mizen components and set up apps that use them",
		...groups.flatMap((group) =>
			section(
				style,
				group,
				Object.entries(commands)
					.filter(([, item]) => item.group === group)
					.map(
						([name, item]) => `  ${style.bold(name.padEnd(10))}${item.summary}`
					)
			)
		),
		...section(style, "Global Options", optionRows(globals)),
		...examples(style, ["mizen search dialog", "mizen init --cwd ./apps/web"]),
	].join("\n");
}

/** Help for the root, or for one command. Help never reads the project. */
export function help(style: Style, command?: string): string {
	if (!command) {
		return rootHelp(style);
	}
	if (!isCommand(command)) {
		return unknownCommand(command);
	}
	const entry: CommandHelp = commands[command];
	return [
		style.bold(entry.usage),
		entry.summary,
		...section(
			style,
			"Options",
			entry.options.length ? optionRows(entry.options) : []
		),
		"",
		`${style.heading("Global Options:")} See mizen --help`,
		...examples(style, entry.examples),
		...section(
			style,
			"Notes",
			entry.notes.map((line) => `  ${line}`)
		),
	].join("\n");
}

export function validateOptions(command: Command, values: object) {
	const allowed = new Set<string>([...commands[command].options, ...globals]);
	const invalid = Object.entries(values).find(
		([option, value]) => value !== undefined && !allowed.has(option)
	)?.[0];
	if (invalid) {
		invalidUsage(
			`Unknown option --${invalid} for mizen ${command}.`,
			command,
			"unknown_option"
		);
	}
}
