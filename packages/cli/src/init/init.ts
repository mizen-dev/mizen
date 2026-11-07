import { createHash } from "node:crypto";
import { readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import spawn from "cross-spawn";
import type { Catalog } from "../catalog.js";
import { doctor } from "../doctor/doctor.js";
import { formatReport } from "../doctor/report.js";
import { CliError, commandLine } from "../errors.js";
import { plural, row, type Style, status } from "../output.js";
import { conflict, unchanged } from "./edit.js";
import { type InitOptions, type InitPlan, JOURNAL, planInit } from "./plan.js";
import { applyFiles, restoreFiles } from "./transaction.js";

async function validate(plan: InitPlan): Promise<void> {
	await unchanged(join(plan.project, "package.json"), plan.manifestBefore);
	await validateInputs(plan);
	await Promise.all(
		plan.edits.map((edit) =>
			unchanged(join(plan.project, edit.path), edit.before)
		)
	);
	const archive = plan.install?.archive;
	if (
		archive &&
		createHash("sha256")
			.update(await readFile(archive.path))
			.digest("hex") !== archive.sha256
	) {
		conflict("The package archive changed after planning. Rerun init.");
	}
}

function installDependencies(plan: InitPlan): boolean {
	if (!plan.install) {
		return true;
	}
	const result = spawn.sync(plan.install.command, plan.install.args, {
		cwd: plan.project,
		killSignal: "SIGKILL",
		maxBuffer: 2_000_000,
		timeout: 600_000,
	});
	return !result.error && result.status === 0;
}

export async function init(options: InitOptions, catalog: Catalog) {
	const plan = await planInit(options, catalog);
	const empty = plan.edits.length === 0 && !plan.install;
	if (empty) {
		return verifyUnchanged(plan, catalog);
	}
	if (options.dryRun || !options.yes) {
		return {
			message: plannedMessage(plan),
			plan,
			status: empty ? "unchanged" : "planned",
			verification: null,
		};
	}
	return applyPlan(plan, catalog);
}

async function applyPlan(plan: InitPlan, catalog: Catalog) {
	await validate(plan);
	const journal = join(plan.project, JOURNAL);
	await writeFile(
		journal,
		`${JSON.stringify({ plan, schemaVersion: 1 }, null, 2)}\n`,
		{ flag: "wx", mode: 0o600 }
	);
	let keepJournal = false;
	try {
		if (!installDependencies(plan)) {
			return {
				message:
					"Couldn't install dependencies. No source files changed, but package.json, lockfiles, or node_modules may have.",
				plan,
				status: "install-failed",
				verification: null,
			};
		}
		const before = await doctor(plan.project, catalog.nodeRange);
		if (before.summary.errors) {
			return {
				message:
					"Doctor found errors after installing dependencies. No source files changed.",
				plan,
				status: "verification-failed",
				verification: before,
			};
		}
		await validateInputs(plan);
		await applyFiles(plan.project, plan.edits);
		const verification = await doctor(plan.project, catalog.nodeRange);
		if (verification.status !== "healthy") {
			await restoreFiles(plan.project, plan.edits);
			return {
				message:
					"Couldn't verify setup. Source edits were rolled back; dependency changes stay for review.",
				plan,
				status: "verification-failed",
				verification,
			};
		}
		return {
			message: "Set up Mizen. Doctor passed.",
			plan,
			status: "applied",
			verification,
		};
	} catch (error) {
		keepJournal = true;
		throw recoveryFailure(journal, error);
	} finally {
		if (!keepJournal) {
			await rm(journal);
		}
	}
}

function plannedMessage(plan: InitPlan): string {
	const parts = [
		...(plan.edits.length ? [plural(plan.edits.length, "file edit")] : []),
		...(plan.install ? ["1 install"] : []),
	];
	return `Planned ${parts.join(" and ")}. Nothing changed yet.`;
}

const PATCH_HEADER = /^(Index: |={10,})/;

// The unified diff without its banner lines, added lines green and removed
// lines red.
function formatDiff(style: Style, diff: string): string {
	return diff
		.split("\n")
		.filter((line) => !PATCH_HEADER.test(line))
		.map((line) => {
			if (line.startsWith("+") && !line.startsWith("+++")) {
				return style.pass(line);
			}
			if (line.startsWith("-") && !line.startsWith("---")) {
				return style.fail(line);
			}
			return line;
		})
		.join("\n")
		.trimEnd();
}

const FRAMEWORKS = {
	next: "Next.js App Router",
	start: "TanStack Start",
	vite: "React + Vite",
} as const;

type InitResult = Awaited<ReturnType<typeof init>>;

function outcome(style: Style, result: InitResult): string {
	if (result.status === "planned") {
		return result.message;
	}
	const kind = ["applied", "unchanged"].includes(result.status)
		? "pass"
		: "fail";
	return status(style, kind, result.message);
}

export function formatInit(style: Style, result: InitResult): string {
	const { install } = result.plan;
	return [
		row("Project", result.plan.project),
		row("Framework", FRAMEWORKS[result.plan.framework]),
		"",
		...result.plan.edits.flatMap((edit) => [formatDiff(style, edit.diff), ""]),
		...(install
			? [
					row("Install", [
						commandLine([install.command, ...install.args]),
						"May update package.json, lockfiles, and node_modules.",
					]),
					"",
				]
			: []),
		outcome(style, result),
		...(result.verification && result.verification.status !== "healthy"
			? ["", formatReport(style, result.verification)]
			: []),
	].join("\n");
}

async function verifyUnchanged(plan: InitPlan, catalog: Catalog) {
	const verification = await doctor(plan.project, catalog.nodeRange);
	const healthy = verification.status === "healthy";
	return {
		message: healthy
			? "Mizen is already set up. Doctor passed."
			: "Existing setup needs review. Resolve the doctor findings before init.",
		plan,
		status: healthy ? "unchanged" : "verification-failed",
		verification,
	};
}

function recoveryFailure(journal: string, cause: unknown): CliError {
	const failure = new CliError(
		"recovery_required",
		"Couldn't finish setup. Source edits may be partly applied.",
		1,
		{
			rows: [
				["Journal", journal],
				[
					"Recovery",
					"Restore or finish the recorded edits, then remove the journal.",
				],
			],
		}
	);
	failure.cause = cause;
	return failure;
}

async function validateInputs(plan: InitPlan): Promise<void> {
	await Promise.all(
		(plan.inputs ?? []).map((input) =>
			unchanged(join(plan.project, input.path), input.before)
		)
	);
}
