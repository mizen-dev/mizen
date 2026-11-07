import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { list } from "tar";
import { type Manifest, parseManifest } from "../doctor/files.js";
import { CliError } from "../errors.js";
import { conflict } from "./edit.js";

export interface Archive {
	manifest: Manifest;
	path: string;
	sha256: string;
}

async function inspectArchive(
	specifier: string,
	expectedVersion: string
): Promise<Archive> {
	const path = resolve(specifier);
	const info = await stat(path);
	if (!info.isFile() || info.size > 50_000_000) {
		return conflict("Use a local Mizen .tgz archive smaller than 50 MB.");
	}
	const sources: string[] = [];
	let invalid = false;
	await list({
		file: path,
		filter: (entry) => entry === "package/package.json",
		onReadEntry(entry) {
			if (entry.type !== "File" || entry.size > 1_000_000) {
				invalid = true;
				return;
			}
			const chunks: Buffer[] = [];
			entry.on("data", (data) => {
				chunks.push(Buffer.from(data));
			});
			entry.on("end", () => {
				sources.push(Buffer.concat(chunks).toString("utf8"));
			});
		},
		strict: true,
	});
	if (invalid || sources.length !== 1) {
		return conflict("The archive must contain one package/package.json.");
	}
	const manifest = parseManifest(sources[0], path);
	if (
		manifest.name !== "@mizen-labs/ui" ||
		manifest.version !== expectedVersion
	) {
		return conflict(
			`Use an @mizen-labs/ui ${expectedVersion} archive matching this CLI's catalog.`
		);
	}
	return {
		manifest,
		path,
		sha256: createHash("sha256")
			.update(await readFile(path))
			.digest("hex"),
	};
}

export async function releaseArchive(
	specifier: string,
	version: string
): Promise<Archive> {
	try {
		return await inspectArchive(specifier, version);
	} catch (error) {
		if (error instanceof CliError) {
			throw error;
		}
		return conflict(
			`Cannot read a valid Mizen archive at ${resolve(specifier)}. Check the file and retry.`
		);
	}
}
