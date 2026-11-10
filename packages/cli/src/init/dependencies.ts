import semver from "semver";
import type { Manifest } from "../doctor/files.js";
import {
	type Installed,
	installedFrom,
	versionCheck,
} from "../doctor/packages.js";
import { frameworkOf, packageManagerCheck } from "../doctor/project.js";
import { diagnosticDetail } from "../doctor/report.js";
import { supportsInitialization } from "../vite/render.js";
import { conflict } from "./edit.js";
import { type Archive, releaseArchive } from "./release.js";

export interface Install {
	archive: { path: string; sha256: string } | null;
	args: string[];
	command: "npm" | "pnpm";
	packages: string[];
}

export async function managerFor(
	project: string,
	explicit?: string
): Promise<{ command: "npm" | "pnpm"; needsLockfile: boolean }> {
	const diagnostic = await packageManagerCheck(project);
	const lockfiles = diagnostic.evidence.filter(
		(path) => !path.endsWith("package.json")
	);
	if (diagnostic.status !== "pass" && lockfiles.length) {
		return conflict(
			"The package-manager declaration and lockfiles disagree.",
			diagnosticDetail(diagnostic)
		);
	}
	const detected = diagnostic.packageManager;
	if (!detected && diagnostic.evidence.length) {
		return conflict(
			"The package-manager declaration needs review.",
			diagnosticDetail(diagnostic)
		);
	}
	const command = selectedManager(explicit, detected);
	return { command, needsLockfile: !lockfiles.length };
}

async function compatiblePeers(
	project: string,
	manifest: Manifest
): Promise<void> {
	const checks = await Promise.all(
		["react", "react-dom"].map(async (name) => {
			const installed = await installedFrom(project, name);
			if (!installed) {
				return conflict(`Install ${name} in this app before init.`);
			}
			const check = versionCheck(
				name,
				installed.manifest.version,
				manifest.peerDependencies?.[name],
				[installed.path]
			);
			if (check.status !== "pass") {
				return conflict(
					`${name}: ${check.message} Resolve compatibility before init.`
				);
			}
			return installed.manifest.version;
		})
	);
	if (checks[0] !== checks[1]) {
		conflict("React and ReactDOM versions must match before init.");
	}
}

async function optionalPackages(
	project: string,
	manifest: Manifest,
	ui: Manifest,
	features: string[]
): Promise<string[]> {
	if (features.some((feature) => feature !== "diagram")) {
		return conflict("The supported optional feature is diagram.");
	}
	if (!features.includes("diagram")) {
		return [];
	}
	const range = ui.peerDependencies?.pele;
	if (!(range && semver.validRange(range))) {
		return conflict("This Mizen archive has no valid Pele peer range.");
	}
	const pele = await installedFrom(project, "pele");
	validatePele(pele, range);
	const declared = { ...manifest.dependencies, ...manifest.devDependencies }
		.pele;
	return pele && declared ? [] : [`pele@${range}`];
}

function installCommand(
	command: "npm" | "pnpm",
	packages: string[],
	archive: Archive | null
): Install {
	const args =
		command === "npm"
			? [
					"install",
					"--ignore-scripts",
					"--no-audit",
					"--no-fund",
					"--save-exact",
					"--include=dev",
					...packages,
				]
			: [
					packages.length ? "add" : "install",
					"--ignore-scripts",
					"--prod=false",
					...packages,
				];
	return {
		archive: archive ? { path: archive.path, sha256: archive.sha256 } : null,
		args,
		command,
		packages,
	};
}

async function selectedRelease(
	project: string,
	version: string,
	specifier?: string
) {
	const archive = specifier ? await releaseArchive(specifier, version) : null;
	const installed = await installedFrom(project, "@mizen-labs/ui");
	const ui = archive?.manifest ?? installed?.manifest;
	if (!ui || ui.version !== version) {
		return conflict(
			`Install @mizen-labs/ui@${version} in this app before init, or pass --package with a local archive of that version.`
		);
	}
	await compatiblePeers(project, ui);
	return { archive, installed, ui };
}

function mizenPackage(
	manifest: Manifest,
	release: Awaited<ReturnType<typeof selectedRelease>>,
	version: string
): string[] {
	const declared = { ...manifest.dependencies, ...manifest.devDependencies }[
		"@mizen-labs/ui"
	];
	if (
		release.installed &&
		declared &&
		release.installed.manifest.version === version &&
		(frameworkOf(manifest) !== "vite" ||
			supportsInitialization(release.installed.manifest))
	) {
		return [];
	}
	if (!release.archive) {
		return conflict(
			`Add @mizen-labs/ui@${version} to this app's dependencies before init, or pass --package with a local archive of that version.`
		);
	}
	return [release.archive.path];
}

export async function installation(
	project: string,
	manifest: Manifest,
	version: string,
	specifier: string | undefined,
	features: string[],
	manager: Awaited<ReturnType<typeof managerFor>>
): Promise<Install | null> {
	const release = await selectedRelease(project, version, specifier);
	if (frameworkOf(manifest) === "vite" && !supportsInitialization(release.ui)) {
		return conflict(
			"This UI build lacks synchronous client theme initialization. Rebuild and pack @mizen-labs/ui before running Vite init."
		);
	}
	const packages = [
		...mizenPackage(manifest, release, version),
		...(await optionalPackages(project, manifest, release.ui, features)),
	];
	if (!(packages.length || manager.needsLockfile)) {
		return null;
	}
	return installCommand(manager.command, packages, release.archive);
}

function selectedManager(explicit?: string, detected?: string): "npm" | "pnpm" {
	if (explicit && detected && explicit !== detected) {
		return conflict(
			"The requested package manager conflicts with the project's lockfile or declaration."
		);
	}
	const selected = explicit ?? detected;
	if (selected !== "npm" && selected !== "pnpm") {
		return conflict(
			"Init currently supports verified npm and pnpm writes. Select --package-manager npm or pnpm for an app without a lockfile, or configure this app manually."
		);
	}
	return selected;
}

function validatePele(pele: Installed | null, range: string): void {
	if (pele && !semver.satisfies(pele.manifest.version ?? "", range)) {
		conflict(
			"Resolve the existing Pele peer version before enabling diagrams."
		);
	}
}
