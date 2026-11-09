import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { execute } from "../process.js";
import { inspectArchive, validateCatalog } from "./archive.js";
import {
	REPOSITORY,
	releaseNotes,
	validateCandidate,
	validateVersionedChanges,
} from "./publication.js";

async function requireVersionedChanges(root) {
	const directory = join(root, ".changeset");
	const files = (await readdir(directory)).filter(
		(name) => name.endsWith(".md") && name !== "README.md"
	);
	await Promise.all(
		files.map(async (name) => {
			const content = await readFile(join(directory, name), "utf8");
			validateVersionedChanges(content, name);
		})
	);
}

export async function loadCandidate(root, input, version) {
	await requireVersionedChanges(root);
	const directories = await readdir(input, { withFileTypes: true });
	const candidates = directories.filter(
		(entry) => entry.isDirectory() && entry.name.startsWith("mizen-")
	);
	assert.equal(
		candidates.length,
		1,
		"Download one CI artifact containing one candidate directory."
	);
	const directory = join(input, candidates[0].name);
	const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
	const manifest = await readJson(join(directory, "release-manifest.json"));
	const commit = execute("git", ["rev-parse", "HEAD"], { cwd: root }).trim();
	assert.equal(
		execute("git", ["status", "--porcelain"], { cwd: root }).trim(),
		"",
		"Release verification requires a clean checkout."
	);
	validateCandidate(
		manifest,
		commit,
		version,
		await readFile(join(root, "pnpm-lock.yaml"))
	);
	const archives = await Promise.all(
		["ui", "cli"].map(async (name, index) => {
			const metadata = await readJson(
				join(root, "packages", name, "package.json")
			);
			assert.equal(
				metadata.repository.url,
				`git+https://github.com/${REPOSITORY}.git`
			);
			assert.equal(metadata.version, version);
			const file = join(directory, `mizen-${name}.tgz`);
			const archive = await inspectArchive(file, metadata);
			assert.deepEqual(
				archive.record,
				manifest.packages[index],
				"Archive bytes and entries must match the manifest."
			);
			assert.deepEqual(archive.manifest.repository, metadata.repository);
			return { ...archive, file };
		})
	);
	const registry = await readJson(
		join(
			root,
			"apps/docs/src/entities/documentation/model/docs-registry-data.json"
		)
	);
	validateCatalog(
		archives[0],
		archives[1],
		registry.map((item) => item.slug)
	);
	const notes = await Promise.all(
		["ui", "cli"].map(async (name) => {
			const changelog = await readFile(
				join(root, "packages", name, "CHANGELOG.md"),
				"utf8"
			);
			return `## @mizen-labs/${name}\n\n${releaseNotes(changelog, version)}`;
		})
	);
	return { archives, commit, directory, notes: notes.join("\n\n"), version };
}
