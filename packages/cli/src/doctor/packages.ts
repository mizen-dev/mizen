import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import semver from "semver";
import { type Manifest, manifestAt } from "./files.js";
import { check, type Diagnostic } from "./report.js";

export class PackageResolutionError extends Error {
	readonly directory: string;
	constructor(message: string, options: ErrorOptions & { directory: string }) {
		super(message, options);
		this.directory = options.directory;
	}
}

export interface Installed {
	manifest: Manifest;
	path: string;
}

async function findPackage(
	directory: string,
	name: string
): Promise<Installed | null> {
	const path = join(directory, "package.json");
	const manifest = await manifestAt(path);
	if (manifest?.name === name) {
		return { manifest, path };
	}
	const parent = dirname(directory);
	return parent === directory ? null : findPackage(parent, name);
}

export async function installedFrom(
	directory: string,
	name: string
): Promise<Installed | null> {
	const { resolve } = createRequire(join(directory, "package.json"));
	try {
		const path = resolve(`${name}/package.json`);
		const manifest = await manifestAt(path);
		return manifest ? { manifest, path } : null;
	} catch (error) {
		if (!(error instanceof Error && "code" in error)) {
			throw error;
		}
		if (error.code === "ERR_INVALID_PACKAGE_CONFIG") {
			throw new PackageResolutionError(
				`Node could not read package metadata while resolving ${name}.`,
				{ cause: error, directory }
			);
		}
		if (error.code === "MODULE_NOT_FOUND") {
			return null;
		}
		if (error.code !== "ERR_PACKAGE_PATH_NOT_EXPORTED") {
			throw error;
		}
	}
	return findPackage(dirname(resolve(name)), name);
}

export function versionCheck(
	id: string,
	version: unknown,
	range: unknown,
	evidence: string[]
): Diagnostic {
	if (
		typeof version !== "string" ||
		typeof range !== "string" ||
		!semver.valid(version) ||
		!semver.validRange(range)
	) {
		return check(
			id,
			"unverified",
			"No valid version or compatibility range is available.",
			evidence,
			"Check the installed package metadata."
		);
	}
	return check(
		id,
		semver.satisfies(version, range) ? "pass" : "error",
		`Installed ${version}; required ${range}.`,
		evidence,
		`Use a version satisfying ${range}.`
	);
}

async function peerChecks(
	project: string,
	ui: Installed,
	name: string
): Promise<Diagnostic[]> {
	const [host, library] = await Promise.all([
		installedFrom(project, name),
		installedFrom(dirname(ui.path), name),
	]);
	if (!host) {
		return [
			check(
				`package.${name}`,
				"error",
				`${name} cannot be resolved from this app.`,
				[],
				`Install ${name} using the Mizen peer range.`
			),
		];
	}
	const same = host.path === library?.path;
	return [
		versionCheck(
			`package.${name}`,
			host.manifest.version,
			ui.manifest.peerDependencies?.[name],
			[host.path, ui.path]
		),
		check(
			`identity.${name}`,
			same ? "pass" : "error",
			`${name} ${same ? "shares" : "does not share"} the app's module identity.`,
			[host.path, ...(library ? [library.path] : [])],
			"Align workspace dependencies and deduplicate React; do not bundle a separate React copy in Mizen."
		),
	];
}

export async function packageChecks(project: string) {
	const ui = await installedFrom(project, "@mizen-labs/ui");
	if (!ui) {
		return {
			diagnostics: [
				check(
					"package.mizen",
					"error",
					"@mizen-labs/ui cannot be resolved from this app.",
					[join(project, "package.json")],
					"Install Mizen in the target app, then rerun doctor."
				),
			],
			ui: null,
		};
	}
	const peers = await Promise.all(
		["react", "react-dom"].map((name) => peerChecks(project, ui, name))
	);
	return {
		diagnostics: [
			check(
				"package.mizen",
				"pass",
				`Resolved @mizen-labs/ui ${ui.manifest.version ?? "(unknown version)"}.`,
				[ui.path]
			),
			...peers.flat(),
			...(await reactPairCheck(project)),
		],
		ui,
	};
}

export async function frameworkVersionCheck(
	project: string,
	framework: "next" | "start" | "vite"
): Promise<Diagnostic> {
	const name = { next: "next", start: "@tanstack/react-start", vite: "vite" }[
		framework
	];
	const installed = await installedFrom(project, name);
	if (!installed) {
		return check(
			"project.framework-version",
			"error",
			`${name} is declared but cannot be resolved.`,
			[],
			"Install the app's framework dependencies."
		);
	}
	return check(
		"project.framework-version",
		"pass",
		`Resolved ${name} ${installed.manifest.version ?? "(unknown version)"}. No broader framework compatibility range is claimed.`,
		[installed.path]
	);
}

async function reactPairCheck(project: string): Promise<Diagnostic[]> {
	const [react, dom] = await Promise.all([
		installedFrom(project, "react"),
		installedFrom(project, "react-dom"),
	]);
	if (!(react && dom)) {
		return [];
	}
	const versions = [react.manifest.version, dom.manifest.version];
	if (
		!versions.every(
			(version) => typeof version === "string" && semver.valid(version)
		)
	) {
		return [];
	}
	const same = versions[0] === versions[1];
	return [
		check(
			"package.react-pair",
			same ? "pass" : "error",
			`React ${versions[0]} and ReactDOM ${versions[1]} ${same ? "match" : "differ"}.`,
			[react.path, dom.path],
			"Install matching React and ReactDOM versions."
		),
	];
}
