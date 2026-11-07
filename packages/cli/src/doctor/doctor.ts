import { resolve } from "node:path";
import { InvalidManifestError } from "./files.js";
import {
	frameworkVersionCheck,
	PackageResolutionError,
	packageChecks,
	versionCheck,
} from "./packages.js";
import { frameworkOf, packageManagerCheck, targetProject } from "./project.js";
import { check, report } from "./report.js";
import { setupChecks } from "./setup.js";

export async function doctor(
	cwd: string,
	nodeRange: string,
	options: { allowWorkspaceRoot?: boolean } = {}
) {
	try {
		return await inspectProject(cwd, nodeRange, options);
	} catch (error) {
		if (error instanceof PackageResolutionError) {
			return report(resolve(cwd), [
				check(
					"package.metadata",
					"error",
					error.message,
					[error.directory],
					"Repair the installed package metadata or reinstall dependencies, then rerun doctor."
				),
			]);
		}
		if (!(error instanceof InvalidManifestError)) {
			throw error;
		}
		return report(resolve(cwd), [
			check(
				"package.metadata",
				"error",
				"An installed or workspace package manifest is invalid.",
				[error.path],
				"Repair the named manifest or reinstall dependencies, then rerun doctor."
			),
		]);
	}
}

async function inspectProject(
	cwd: string,
	nodeRange: string,
	options: { allowWorkspaceRoot?: boolean }
) {
	const target = await targetProject(resolve(cwd), options);
	if (!(target.manifest && target.project)) {
		return report(target.project, target.diagnostic ? [target.diagnostic] : []);
	}
	const { project, manifest } = target;
	const framework = frameworkOf(manifest);
	const { diagnostics, ui } = await packageChecks(project);
	diagnostics.unshift(
		versionCheck("runtime.node", process.versions.node, nodeRange, [])
	);
	diagnostics.push(await packageManagerCheck(project));
	diagnostics.push(
		check(
			"project.framework",
			framework === "unknown" ? "unverified" : "pass",
			`Framework: ${framework}.`,
			[project],
			"Setup checks target Next.js App Router, TanStack Start, and React + Vite. Select the application package when using a workspace."
		)
	);
	if (framework !== "unknown") {
		diagnostics.push(
			await frameworkVersionCheck(project, framework),
			...(await setupChecks(project, framework))
		);
	}
	return {
		...report(project, diagnostics),
		framework,
		uiVersion: ui?.manifest.version ?? null,
	};
}
