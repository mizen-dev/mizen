import { lstat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { row, type Style } from "../output.js";
import { doctor } from "./doctor.js";
import { exists, type Manifest, manifestAt } from "./files.js";
import { type Framework, frameworkOf } from "./project.js";
import {
	check,
	type Diagnostic,
	formatDiagnostic,
	report,
	summaryLine,
} from "./report.js";
import {
	findWorkspace,
	linkedProject,
	memberPath,
	type Workspace,
	WorkspaceConfigError,
	workspaceMembers,
} from "./workspace-config.js";

type AppReport = Awaited<ReturnType<typeof doctor>> & {
	framework: Framework;
	name: string | null;
	path: string;
};
interface SkippedPackage {
	name: string | null;
	path: string;
	project: string;
	reason: string;
	status: "skipped" | "unverified";
}
interface Member {
	app?: AppReport;
	diagnostic?: Diagnostic;
	skipped?: SkippedPackage;
}
function skipped(
	workspace: Workspace,
	project: string,
	name: string | null,
	reason: string,
	uncertain = false
): Member {
	return {
		...(uncertain
			? {
					diagnostic: check(
						"workspace.package",
						"unverified",
						reason,
						[project],
						"Inspect this package explicitly with mizen doctor --cwd <APP_DIR>."
					),
				}
			: {}),
		skipped: {
			name,
			path: memberPath(workspace.project, project),
			project,
			reason,
			status: uncertain ? "unverified" : "skipped",
		},
	};
}
function uncertainFramework(manifest: Manifest) {
	const dependencies = {
		...manifest.dependencies,
		...manifest.devDependencies,
	};
	return [
		"next",
		"@tanstack/react-start",
		"astro",
		"@react-router/dev",
		"@sveltejs/kit",
	].some((name) => name in dependencies);
}
async function inspectMember(
	workspace: Workspace,
	project: string,
	nodeRange: string
): Promise<Member> {
	const path = join(project, "package.json");
	try {
		if (
			(await lstat(project)).isSymbolicLink() ||
			(await linkedProject(project))
		) {
			return skipped(
				workspace,
				project,
				null,
				"Linked package directories are not inspected implicitly.",
				true
			);
		}
		const manifest = await manifestAt(path);
		if (!manifest) {
			return {};
		}
		return inspectApp(workspace, project, manifest, nodeRange);
	} catch {
		return {
			diagnostic: check(
				"workspace.manifest",
				"error",
				"A workspace package manifest or directory is invalid or unreadable.",
				[path],
				"Repair this package's manifest or directory, then rerun mizen doctor --workspace."
			),
			skipped: {
				name: null,
				path: memberPath(workspace.project, project),
				project,
				reason:
					"The package cannot be classified because its metadata is unavailable.",
				status: "unverified",
			},
		};
	}
}
async function inspectApp(
	workspace: Workspace,
	project: string,
	manifest: Manifest,
	nodeRange: string
): Promise<Member> {
	const framework = frameworkOf(manifest);
	if (framework === "unknown") {
		return skipped(
			workspace,
			project,
			manifest.name ?? null,
			uncertainFramework(manifest)
				? "The package declares an unsupported or ambiguous application framework."
				: "No supported application framework is declared.",
			uncertainFramework(manifest)
		);
	}
	if (framework === "vite" && !(await exists(join(project, "index.html")))) {
		return skipped(
			workspace,
			project,
			manifest.name ?? null,
			"React and Vite are declared without index.html; this may be a library or a custom app.",
			true
		);
	}
	const result = await doctor(project, nodeRange, {
		allowWorkspaceRoot: true,
	}).catch(() =>
		report(project, [
			check(
				"workspace.inspection",
				"error",
				"The application could not be inspected.",
				[project],
				"Run mizen doctor --cwd <APP_DIR> to inspect this failure separately."
			),
		])
	);
	return {
		app: {
			...result,
			framework,
			name: manifest.name ?? null,
			path: memberPath(workspace.project, project),
		},
	};
}

function aggregate(
	workspace: Workspace,
	diagnostics: Diagnostic[],
	members: Member[]
) {
	const apps = members.flatMap((member) => (member.app ? [member.app] : []));
	const skippedPackages = members.flatMap((member) =>
		member.skipped ? [member.skipped] : []
	);
	const all = [
		...diagnostics,
		...members.flatMap((member) =>
			member.diagnostic ? [member.diagnostic] : []
		),
		...apps.flatMap((app) =>
			app.diagnostics.map((item) => ({ ...item, project: app.project }))
		),
	];
	if (!apps.length) {
		all.push(
			check(
				"workspace.apps",
				"unverified",
				"No supported applications were inspected.",
				[workspace.source],
				"Check workspace patterns and skipped packages, or inspect an app with mizen doctor --cwd <APP_DIR>."
			)
		);
	}
	return {
		...report(workspace.project, all),
		apps,
		skipped: skippedPackages,
		workspace: {
			kind: workspace.kind,
			patterns: workspace.patterns,
			source: workspace.source,
		},
	};
}
export async function workspaceDoctor(cwd: string, nodeRange: string) {
	try {
		const workspace = await findWorkspace(cwd);
		const { diagnostics, projects } = await workspaceMembers(workspace);
		const members: Member[] = [];
		for (const project of projects) {
			// biome-ignore lint/performance/noAwaitInLoops: Keep filesystem inspection bounded and report apps independently.
			members.push(await inspectMember(workspace, project, nodeRange));
		}
		return aggregate(workspace, diagnostics, members);
	} catch (error) {
		const diagnostic =
			error instanceof WorkspaceConfigError
				? error.diagnostic
				: check(
						"workspace.discovery",
						"error",
						"The workspace could not be read.",
						[resolve(cwd)],
						"Check directory permissions and workspace configuration, then rerun mizen doctor --workspace."
					);
		return {
			...report(resolve(cwd), [diagnostic]),
			apps: [],
			skipped: [],
			workspace: null,
		};
	}
}
function appLabel(app: {
	framework: string;
	name?: string | null;
	path: string;
}) {
	return `${app.path} (${app.framework}${app.name ? `, ${app.name}` : ""})`;
}

export function formatWorkspace(
	style: Style,
	result: Awaited<ReturnType<typeof workspaceDoctor>>
) {
	const appFindings = result.apps.flatMap((app) => {
		const findings = app.diagnostics.filter((item) => item.status !== "pass");
		return findings.length
			? [
					style.bold(appLabel(app)),
					...findings.flatMap((item) =>
						formatDiagnostic(style, item, app.path)
					),
				]
			: [];
	});
	const rootFindings = result.diagnostics.filter(
		(item) => !("project" in item) && item.status !== "pass"
	);
	return [
		row("Workspace", result.project ?? "Not found"),
		...(result.workspace ? [row("Declared in", result.workspace.source)] : []),
		"",
		...(result.apps.length
			? [
					style.bold("Apps"),
					...result.apps.map((app) =>
						row(
							`${app.status[0]?.toUpperCase()}${app.status.slice(1)}`,
							appLabel(app)
						)
					),
					"",
				]
			: []),
		...rootFindings.flatMap((item) => formatDiagnostic(style, item)),
		...appFindings,
		...(result.skipped.length
			? [
					style.bold("Skipped"),
					...result.skipped.map((item) => row(item.path, item.reason)),
					"",
				]
			: []),
		summaryLine(style, result),
	].join("\n");
}
