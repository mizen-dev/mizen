import { lstat, realpath } from "node:fs/promises";
import { join, relative, resolve, sep } from "node:path";
import type { Catalog } from "../catalog.js";
import { readOptional } from "../doctor/files.js";
import { versionCheck } from "../doctor/packages.js";
import { frameworkOf, targetProject } from "../doctor/project.js";
import { diagnosticDetail } from "../doctor/report.js";
import { CliError } from "../errors.js";
import { configEdit } from "./config.js";
import { type Install, installation, managerFor } from "./dependencies.js";
import { conflict, type FileEdit } from "./edit.js";
import { rootEdit } from "./styles.js";

export interface InitOptions {
	cwd?: string;
	dryRun?: boolean;
	feature?: string[];
	package?: string;
	packageManager?: string;
	yes?: boolean;
}
export interface InitPlan {
	edits: FileEdit[];
	framework: "next" | "start" | "vite";
	inputs?: { path: string; before: string | null }[];
	install: Install | null;
	manifestBefore: string;
	project: string;
	uiVersion: string;
}
export const JOURNAL = ".mizen-init-journal.json";

async function safePath(project: string, edit: FileEdit): Promise<void> {
	const path = join(project, edit.path);
	const resolved = edit.before === null ? path : await realpath(path);
	const within = relative(project, resolved);
	if (within.startsWith(`..${sep}`) || within === "..") {
		conflict(`Source path leaves the selected app: ${edit.path}.`);
	}
	// biome-ignore lint/suspicious/noBitwiseOperators: POSIX owner-write permission bit.
	if (edit.before !== null && !((await lstat(path)).mode & 0o200)) {
		conflict(`Source file is read-only: ${edit.path}.`);
	}
}

async function projectContext(options: InitOptions, catalog: Catalog) {
	const target = await targetProject(resolve(options.cwd ?? process.cwd()));
	if (!(target.project && target.manifest)) {
		throw new CliError(
			"project_not_found",
			`Couldn't find an app to set up. ${target.diagnostic?.message ?? ""}`.trim(),
			1,
			{
				next: {
					argv: ["mizen", "init", "--cwd", "<APP_DIR>"],
					benefit: "Select the app",
				},
				...(target.diagnostic ? diagnosticDetail(target.diagnostic) : {}),
			}
		);
	}
	const project = await realpath(target.project);
	await validateProjectFiles(project);
	const framework = frameworkOf(target.manifest);
	if (framework === "unknown") {
		return conflict(
			"Init supports an unambiguous Next.js App Router, TanStack Start, or React + Vite app."
		);
	}
	if (
		versionCheck("node", process.versions.node, catalog.nodeRange, [])
			.status !== "pass"
	) {
		return conflict(`Use Node ${catalog.nodeRange} before init.`);
	}
	return { framework, manifest: target.manifest, project };
}

async function validateProjectFiles(project: string): Promise<void> {
	const manifestStat = await lstat(join(project, "package.json"));
	if (!manifestStat.isFile() || manifestStat.nlink !== 1) {
		return conflict(
			"The app manifest must be a regular, unlinked file before init."
		);
	}
	if ((await readOptional(join(project, JOURNAL))) !== null) {
		return conflict(
			`An interrupted init journal exists at ${join(project, JOURNAL)}. Review its recorded edits and restore or finish them before removing the journal.`
		);
	}
}

export async function planInit(
	options: InitOptions,
	catalog: Catalog
): Promise<InitPlan> {
	const { project, manifest, framework } = await projectContext(
		options,
		catalog
	);

	const inputs =
		framework === "vite"
			? [
					{
						before: await readOptional(join(project, "index.html")),
						path: "index.html",
					},
				]
			: [];
	const manager = await managerFor(project, options.packageManager);
	const [config, root] = await Promise.all([
		configEdit(project, framework),
		rootEdit(project, framework),
	]);
	const edits = [config, root].filter(
		(edit): edit is FileEdit => edit !== null
	);
	await Promise.all(edits.map((edit) => safePath(project, edit)));
	const install = await installation(
		project,
		manifest,
		catalog,
		options.package,
		options.feature ?? [],
		manager
	);
	const manifestBefore = await readOptional(join(project, "package.json"));
	if (!manifestBefore) {
		return conflict("The app manifest changed while planning. Rerun init.");
	}
	return {
		edits,
		framework,
		inputs,
		install,
		manifestBefore,
		project,
		uiVersion: catalog.uiVersion,
	};
}
