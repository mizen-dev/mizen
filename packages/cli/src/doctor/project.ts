import { stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { exists, findProject, type Manifest, manifestAt } from "./files.js";
import { check, type Diagnostic } from "./report.js";
import {
	hasPnpmWorkspacePackages,
	WorkspaceConfigError,
} from "./workspace-config.js";

const LOCKFILES: Record<string, string> = {
	"bun.lock": "bun",
	"bun.lockb": "bun",
	"npm-shrinkwrap.json": "npm",
	"package-lock.json": "npm",
	"pnpm-lock.yaml": "pnpm",
	"yarn.lock": "yarn",
};

export type Framework = "next" | "start" | "vite";

export function frameworkOf(manifest: Manifest): Framework | "unknown" {
	const dependencies = {
		...manifest.dependencies,
		...manifest.devDependencies,
	};
	const next = "next" in dependencies;
	const start = "@tanstack/react-start" in dependencies;
	if (next && start) {
		return "unknown";
	}
	if (next) {
		return "next";
	}
	if (start) {
		return "start";
	}
	if (
		["astro", "@react-router/dev", "@sveltejs/kit"].some(
			(name) => name in dependencies
		)
	) {
		return "unknown";
	}
	return "vite" in dependencies && "react" in dependencies ? "vite" : "unknown";
}

const MANAGER = /^(?<manager>npm|pnpm|yarn|bun)@/u;

interface ManagerDeclaration {
	manager: string;
	path: string;
}

async function managerMetadata(directory: string) {
	const path = join(directory, "package.json");
	const manifest = await manifestAt(path);
	const field = manifest?.packageManager;
	const manager = field?.match(MANAGER)?.[1];
	const workspace =
		manifest?.workspaces ||
		(await exists(join(directory, "pnpm-workspace.yaml")));
	const diagnostic =
		field && !manager
			? check(
					"project.package-manager",
					"unverified",
					"The declared package manager is not recognized.",
					[path],
					"Declare npm, pnpm, yarn, or bun with a version."
				)
			: null;
	return {
		declaration: manager ? { manager, path } : undefined,
		diagnostic,
		workspace,
	};
}

export async function packageManagerCheck(
	directory: string,
	declaration?: ManagerDeclaration
): Promise<Diagnostic> {
	const metadata = await managerMetadata(directory);
	if (!declaration && metadata.diagnostic) {
		return metadata.diagnostic;
	}
	const selected = declaration ?? metadata.declaration;
	const files = await Promise.all(
		Object.keys(LOCKFILES).map(async (name) =>
			(await exists(join(directory, name))) ? name : null
		)
	);
	const found = files.filter((item): item is string => item !== null);
	if (found.length) {
		return lockfileCheck(directory, found, selected);
	}
	const parent = dirname(directory);
	if (parent !== directory && !metadata.workspace) {
		return packageManagerCheck(parent, selected);
	}
	return missingLockfile(selected);
}

function missingLockfile(declaration?: ManagerDeclaration): Diagnostic {
	return {
		...check(
			"project.package-manager",
			"unverified",
			`No package-manager lockfile was found${declaration ? `; declared manager: ${declaration.manager}` : ""}.`,
			declaration ? [declaration.path] : [],
			"Install dependencies with your chosen package manager first."
		),
		packageManager: declaration?.manager,
	};
}

function lockfileCheck(
	directory: string,
	files: string[],
	declaration?: { manager: string; path: string }
): Diagnostic {
	const managers = [...new Set(files.map((name) => LOCKFILES[name]))];
	const matches = !declaration || managers[0] === declaration.manager;
	const verified = managers.length === 1 && matches;
	return {
		...check(
			"project.package-manager",
			verified ? "pass" : "unverified",
			`Lockfiles indicate ${managers.join(", ")}${declaration ? `; declared manager: ${declaration.manager}` : ""}.`,
			[
				...files.map((name) => join(directory, name)),
				...(declaration ? [declaration.path] : []),
			],
			"Keep the intended package manager's lockfile and align the packageManager field before setup."
		),
		packageManager: verified ? managers[0] : undefined,
	};
}

export async function targetProject(
	requested: string,
	options: { allowWorkspaceRoot?: boolean } = {}
): Promise<{
	project: string | null;
	manifest?: Manifest;
	diagnostic?: Diagnostic;
}> {
	try {
		if (!(await stat(requested)).isDirectory()) {
			throw new Error("Not a directory.");
		}
	} catch {
		return {
			diagnostic: check(
				"project.target",
				"error",
				"The target directory is unavailable.",
				[requested],
				"Use --cwd with an existing, readable app directory."
			),
			project: null,
		};
	}
	const project = await findProject(requested);
	if (!project) {
		return {
			diagnostic: check(
				"project.target",
				"error",
				"No package.json was found.",
				[requested],
				"Run the command in an app directory, or pass one with --cwd <APP_DIR>."
			),
			project: null,
		};
	}
	return inspectManifest(project, options.allowWorkspaceRoot);
}

async function inspectManifest(project: string, allowWorkspaceRoot = false) {
	const path = join(project, "package.json");
	try {
		const manifest = await manifestAt(path);
		if (!manifest) {
			throw new Error("Missing manifest.");
		}
		if (
			!allowWorkspaceRoot &&
			(manifest.workspaces || (await hasPnpmWorkspacePackages(project)))
		) {
			return {
				diagnostic: check(
					"project.target",
					"error",
					"This directory is a workspace root; select an app explicitly.",
					[path],
					"Run mizen doctor --cwd <APP_DIR>."
				),
				project,
			};
		}
		return { manifest, project };
	} catch (error) {
		if (error instanceof WorkspaceConfigError) {
			return { diagnostic: error.diagnostic, project };
		}
		return {
			diagnostic: check(
				"project.manifest",
				"error",
				"The app package.json is invalid or unreadable.",
				[path],
				"Repair package.json, then rerun mizen doctor."
			),
			project,
		};
	}
}
