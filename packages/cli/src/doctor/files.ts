import { readFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";

export class InvalidManifestError extends Error {
	readonly path: string;
	constructor(path: string, options?: ErrorOptions) {
		super(`Invalid package manifest: ${path}`, options);
		this.path = path;
	}
}

export interface Manifest {
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
	exports?: unknown;
	name?: string;
	packageManager?: string;
	peerDependencies?: Record<string, string>;
	version?: string;
	workspaces?: unknown;
}

function isMissing(error: unknown): boolean {
	return (
		error instanceof Error &&
		"code" in error &&
		["ENOENT", "ENOTDIR"].includes(String(error.code))
	);
}

export async function exists(path: string): Promise<boolean> {
	try {
		return (await stat(path)).isFile();
	} catch (error) {
		if (isMissing(error)) {
			return false;
		}
		throw error;
	}
}

export async function readOptional(path: string): Promise<string | null> {
	try {
		return await readFile(path, "utf8");
	} catch (error) {
		if (isMissing(error)) {
			return null;
		}
		throw error;
	}
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return !!value && typeof value === "object" && !Array.isArray(value);
}

function validManifest(value: Record<string, unknown>): boolean {
	const maps = [
		value.dependencies,
		value.devDependencies,
		value.peerDependencies,
	];
	const strings = [value.name, value.version, value.packageManager];
	return (
		maps.every(
			(map) =>
				map === undefined ||
				(isRecord(map) &&
					Object.values(map).every((item) => typeof item === "string"))
		) && strings.every((item) => item === undefined || typeof item === "string")
	);
}

export async function manifestAt(path: string): Promise<Manifest | null> {
	const source = await readOptional(path);
	if (source === null) {
		return null;
	}
	return parseManifest(source, path);
}

export function parseManifest(source: string, path: string): Manifest {
	let value: unknown;
	try {
		value = JSON.parse(source);
	} catch (error) {
		throw new InvalidManifestError(path, { cause: error });
	}
	if (!(isRecord(value) && validManifest(value))) {
		throw new InvalidManifestError(path);
	}
	return value;
}

export async function findProject(directory: string): Promise<string | null> {
	if (await exists(join(directory, "package.json"))) {
		return directory;
	}
	const parent = dirname(directory);
	return parent === directory ? null : findProject(parent);
}
