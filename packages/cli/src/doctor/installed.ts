import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { type Manifest, manifestAt } from "./files.js";

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
