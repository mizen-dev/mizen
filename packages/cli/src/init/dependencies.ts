import semver from "semver";
import type { Catalog } from "../catalog.js";
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

const UI = "@mizen-labs/ui";
type Release = Pick<Catalog, "uiPeerDependencies" | "uiVersion">;

function declaredUi(manifest: Manifest): string | undefined {
	return { ...manifest.dependencies, ...manifest.devDependencies }[UI];
}

function alignedCopy(
	manifest: Manifest,
	local: Manifest | undefined,
	version: string
): Manifest | undefined {
	if (local && local.version !== version) {
		return conflict(
			`This app resolves ${UI} ${local.version ?? "without a version"}, but this CLI sets up ${version}. Install matching UI and CLI versions before init.`
		);
	}
	if (!local && declaredUi(manifest)) {
		return conflict(
			`${UI} is declared but not installed. Install this app's dependencies before init.`
		);
	}
	return local;
}

// A local copy is an archive or the installed package. Without one, init
// installs the published release, whose peer ranges the catalog records.
async function selectedRelease(
	project: string,
	manifest: Manifest,
	{ uiPeerDependencies, uiVersion }: Release,
	specifier?: string
) {
	const archive = specifier ? await releaseArchive(specifier, uiVersion) : null;
	const installed = await installedFrom(project, UI);
	const local = alignedCopy(
		manifest,
		archive?.manifest ?? installed?.manifest,
		uiVersion
	);
	const ui = local ?? { peerDependencies: uiPeerDependencies };
	await compatiblePeers(project, ui);
	return { archive, installed, local, ui };
}

function mizenPackage(
	manifest: Manifest,
	release: Awaited<ReturnType<typeof selectedRelease>>,
	version: string
): string[] {
	const { archive, installed } = release;
	const current =
		installed?.manifest.version === version &&
		(frameworkOf(manifest) !== "vite" ||
			supportsInitialization(installed.manifest));
	if (current && declaredUi(manifest)) {
		return [];
	}
	if (archive) {
		return [archive.path];
	}
	if (!installed) {
		return [`${UI}@${version}`];
	}
	return conflict(
		`Add ${UI}@${version} to this app's dependencies before init, or pass --package with a local archive of that version.`
	);
}

export async function installation(
	project: string,
	manifest: Manifest,
	catalog: Release,
	specifier: string | undefined,
	features: string[],
	manager: Awaited<ReturnType<typeof managerFor>>
): Promise<Install | null> {
	const release = await selectedRelease(project, manifest, catalog, specifier);
	// Only a local copy can be a stale build without the initializer.
	if (
		release.local &&
		frameworkOf(manifest) === "vite" &&
		!supportsInitialization(release.local)
	) {
		return conflict(
			"This UI build lacks synchronous client theme initialization. Rebuild and pack @mizen-labs/ui before running Vite init."
		);
	}
	const packages = [
		...mizenPackage(manifest, release, catalog.uiVersion),
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
