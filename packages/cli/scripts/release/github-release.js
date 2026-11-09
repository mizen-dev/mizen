import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { cleanup } from "../../../../scripts/cleanup.mjs";
import { execute } from "../process.js";
import { ensureTag, github } from "./github.js";
import { digest, REPOSITORY } from "./publication.js";

async function attachAsset(release, path, staging) {
	const name = basename(path);
	if (release.assets.some((asset) => asset.name === name)) {
		execute("gh", [
			"release",
			"download",
			release.tag_name,
			"--repo",
			REPOSITORY,
			"--pattern",
			name,
			"--dir",
			staging,
		]);
		assert.equal(
			digest(await readFile(join(staging, name))),
			digest(await readFile(path)),
			`Existing release asset differs: ${name}`
		);
		return;
	}
	assert.equal(
		release.draft,
		true,
		"Do not alter a completed release with missing assets."
	);
	execute("gh", [
		"release",
		"upload",
		release.tag_name,
		path,
		"--repo",
		REPOSITORY,
	]);
}

export async function finishGithubRelease(candidate) {
	const tag = `v${candidate.version}`;
	await ensureTag(tag, candidate.commit);
	const release =
		(await github(`releases/tags/${tag}`, { missing: true })) ??
		(await github("releases", {
			body: {
				body: candidate.notes,
				draft: true,
				name: `Mizen ${tag}`,
				tag_name: tag,
				target_commitish: candidate.commit,
			},
			method: "POST",
		}));
	const staging = await mkdtemp(join(tmpdir(), "mizen-release-assets-"));
	try {
		const notesPath = join(candidate.directory, "release-notes.md");
		await writeFile(notesPath, `${candidate.notes}\n`);
		await Promise.all(
			[
				...candidate.archives.map((archive) => archive.file),
				join(candidate.directory, "release-manifest.json"),
				notesPath,
			].map((path) => attachAsset(release, path, staging))
		);
		if (release.draft) {
			await github(`releases/${release.id}`, {
				body: { draft: false, make_latest: "true" },
				method: "PATCH",
			});
		}
	} finally {
		await cleanup(staging);
	}
}
