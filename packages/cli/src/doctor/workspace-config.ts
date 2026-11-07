import { lstat, realpath } from "node:fs/promises";
import {
	dirname,
	isAbsolute,
	join,
	posix,
	relative,
	resolve,
	sep,
} from "node:path";
import glob from "fast-glob";
import { minimatch } from "minimatch";
import { parseDocument } from "yaml";
import { exists, manifestAt, readOptional } from "./files.js";
import { check, type Diagnostic } from "./report.js";

export interface Workspace {
	kind: "npm" | "pnpm";
	patterns: string[];
	project: string;
	source: string;
}
export class WorkspaceConfigError extends Error {
	readonly diagnostic: Diagnostic;
	constructor(diagnostic: Diagnostic) {
		super(diagnostic.message);
		this.diagnostic = diagnostic;
	}
}
function invalid(path: string, message: string): never {
	throw new WorkspaceConfigError(
		check(
			"workspace.config",
			"error",
			message,
			[path],
			"Repair the workspace declaration, then rerun mizen doctor --workspace."
		)
	);
}
function targetError(path: string, message: string): never {
	throw new WorkspaceConfigError(
		check(
			"workspace.target",
			"error",
			message,
			[path],
			"Use --cwd with a declared workspace root, or run mizen doctor --cwd <APP_DIR> without --workspace."
		)
	);
}

function patterns(value: unknown, path: string): string[] {
	if (
		!(
			Array.isArray(value) &&
			value.every((item) => typeof item === "string" && item.trim().length > 0)
		)
	) {
		return invalid(
			path,
			"Workspace packages must be an array of nonempty path patterns."
		);
	}
	return value;
}
function npmPatterns(value: unknown, path: string): string[] {
	if (value && typeof value === "object" && "packages" in value) {
		return patterns(value.packages, path);
	}
	return patterns(value, path);
}
async function yamlPatterns(path: string): Promise<string[]> {
	const source = await readOptional(path);
	if (source === null) {
		return invalid(
			path,
			"The workspace declaration disappeared during discovery."
		);
	}
	const document = parseDocument(source);
	if (document.errors.length || document.warnings.length) {
		return invalid(
			path,
			"The pnpm workspace YAML is invalid or contains unsupported tags."
		);
	}
	const value: unknown = yamlValue(document, path);
	if (value === null) {
		return [];
	}
	if (typeof value !== "object" || Array.isArray(value)) {
		return invalid(path, "The pnpm workspace declaration must be a mapping.");
	}
	return "packages" in value ? patterns(value.packages, path) : [];
}
function yamlValue(
	document: ReturnType<typeof parseDocument>,
	path: string
): unknown {
	try {
		return document.toJS();
	} catch {
		return invalid(
			path,
			"The workspace YAML aliases could not be resolved safely."
		);
	}
}

async function declaration(project: string): Promise<Workspace | null> {
	const yaml = join(project, "pnpm-workspace.yaml");
	if (await exists(yaml)) {
		return {
			kind: "pnpm",
			patterns: await yamlPatterns(yaml),
			project,
			source: yaml,
		};
	}
	try {
		const manifest = await manifestAt(join(project, "package.json"));
		if (manifest?.workspaces !== undefined) {
			return {
				kind: "npm",
				patterns: npmPatterns(
					manifest.workspaces,
					join(project, "package.json")
				),
				project,
				source: join(project, "package.json"),
			};
		}
	} catch (error) {
		if (error instanceof WorkspaceConfigError) {
			throw error;
		}
		// A malformed member must not hide its enclosing workspace.
	}
	return null;
}
export async function findWorkspace(cwd: string): Promise<Workspace> {
	let directory: string;
	try {
		directory = await realpath(resolve(cwd));
		if (!(await lstat(directory)).isDirectory()) {
			return targetError(
				directory,
				"Select an existing workspace directory with --cwd."
			);
		}
	} catch {
		return targetError(
			resolve(cwd),
			"The requested workspace directory is unavailable."
		);
	}
	return findDeclaration(directory, resolve(cwd));
}
async function findDeclaration(
	directory: string,
	requested: string
): Promise<Workspace> {
	const workspace = await declaration(directory);
	if (workspace) {
		return workspace;
	}
	const parent = dirname(directory);
	return parent === directory
		? targetError(
				requested,
				"No pnpm-workspace.yaml or package.json workspaces declaration was found."
			)
		: findDeclaration(parent, requested);
}

const NEGATION = /^!+/;
const LEADING_SLASH = /^\.?\/+/;
const DRIVE = /^[a-z]:\//i;
const PARENT_SEGMENT = /(?:^|[/({|,])\.\.(?=\/|[)}|,]|$)/;
const GROUPED_ABSOLUTE = /[({|,](?:\/|[a-z]:\/)/i;
function normalize(pattern: string, kind: Workspace["kind"]) {
	const prefix = pattern.match(NEGATION)?.[0] ?? "";
	let value = pattern.slice(prefix.length).replaceAll("\\", "/");
	if (kind === "npm") {
		value = value.replace(LEADING_SLASH, "");
	}
	return { negative: prefix.length % 2 === 1, value: posix.normalize(value) };
}
function outside(value: string) {
	return (
		isAbsolute(value) ||
		DRIVE.test(value) ||
		PARENT_SEGMENT.test(value) ||
		GROUPED_ABSOLUTE.test(value) ||
		value === ".." ||
		value.startsWith("../")
	);
}
async function declarationWarnings(
	workspace: Workspace
): Promise<Diagnostic[]> {
	if (workspace.kind !== "pnpm") {
		return [];
	}
	const path = join(workspace.project, "package.json");
	try {
		const manifest = await manifestAt(path);
		if (manifest?.workspaces === undefined) {
			return [];
		}
		const npm = npmPatterns(manifest.workspaces, path).map((pattern) =>
			normalize(pattern, "npm")
		);
		const pnpm = workspace.patterns.map((pattern) =>
			normalize(pattern, "pnpm")
		);
		if (JSON.stringify(npm) === JSON.stringify(pnpm)) {
			return [];
		}
	} catch {
		// Member inspection separately reports an invalid root manifest.
		return [
			check(
				"workspace.declarations",
				"unverified",
				"The package.json workspace declaration cannot be compared with pnpm's declaration.",
				[path, workspace.source],
				"Align the declarations. pnpm-workspace.yaml controls this discovery."
			),
		];
	}
	return [
		check(
			"workspace.declarations",
			"unverified",
			"Workspace declarations differ; pnpm-workspace.yaml controls discovery.",
			[path, workspace.source],
			"Align package.json workspaces with the pnpm packages declaration."
		),
	];
}

export async function workspaceMembers(workspace: Workspace) {
	const include: string[] = [];
	let exclude: string[] = [];
	const diagnostics = await declarationWarnings(workspace);
	for (const pattern of workspace.patterns) {
		const { negative, value } = normalize(pattern, workspace.kind);
		if (outside(value) || value.includes("${")) {
			diagnostics.push(
				check(
					"workspace.pattern",
					"unverified",
					`Discovery cannot verify this external or environment-dependent pattern: ${pattern}`,
					[workspace.source],
					"Inspect the affected app explicitly with mizen doctor --cwd <APP_DIR>."
				)
			);
			continue;
		}
		if (negative) {
			exclude.push(value);
		} else {
			// npm lets a later positive pattern override a matching earlier exclusion.
			if (workspace.kind === "npm") {
				exclude = exclude.filter((ignored) => !minimatch(value, ignored));
			}
			include.push(value);
		}
	}
	const entries = include.length
		? await glob(include, {
				cwd: workspace.project,
				followSymbolicLinks: false,
				ignore: ["**/node_modules/**", "**/.git/**", ...exclude],
				objectMode: true,
				onlyFiles: false,
				unique: true,
			})
		: [];
	const directories = entries
		.filter(
			(entry) => entry.dirent.isDirectory() || entry.dirent.isSymbolicLink()
		)
		.map((entry) => resolve(workspace.project, entry.path));
	return {
		diagnostics,
		projects: [...new Set([workspace.project, ...directories])].sort((a, b) =>
			a.localeCompare(b, "en")
		),
	};
}
export async function linkedProject(project: string): Promise<boolean> {
	const actual = await realpath(project);
	return process.platform === "win32"
		? actual.toLowerCase() !== project.toLowerCase()
		: actual !== project;
}
export function memberPath(root: string, project: string) {
	return relative(root, project).split(sep).join("/") || ".";
}
