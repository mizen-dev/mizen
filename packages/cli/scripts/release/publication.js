import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import semver from "semver";

const COMMIT_PATTERN = /^[a-f0-9]{40}$/u;
const HASH_PATTERN = /^[a-f0-9]{64}$/u;

export const REPOSITORY = "mizen-labs/mizen";
export const ARTIFACT = "release-ubuntu-latest-node-24.11.0";
export const PACKAGE_NAMES = ["@mizen-labs/ui", "@mizen-labs/cli"];
export const digest = (bytes) =>
	createHash("sha256").update(bytes).digest("hex");

export function validateRun(run) {
	assert.equal(run.repository.full_name, REPOSITORY);
	assert.equal(run.head_repository.full_name, REPOSITORY);
	assert.equal(run.path, ".github/workflows/ci.yml");
	assert.equal(run.event, "push");
	assert.equal(run.head_branch, "main");
	assert.equal(run.status, "completed");
	assert.equal(run.conclusion, "success");
	assert.match(run.head_sha, COMMIT_PATTERN);
	return run.head_sha;
}

export function validateCandidate(manifest, commit, version, lockfile) {
	assert.equal(
		semver.valid(version),
		version,
		"Use a complete SemVer version."
	);
	assert.equal(
		semver.prerelease(version),
		null,
		"This workflow releases stable versions only."
	);
	assert.equal(manifest.schemaVersion, 1);
	assert.equal(manifest.git.commit, commit, "Artifact commit must match CI.");
	assert.equal(
		manifest.git.dirty,
		false,
		"Refusing a dirty release candidate."
	);
	assert.equal(
		manifest.lockfileSha256,
		digest(lockfile),
		"Lockfile must match CI."
	);
	assert.deepEqual(
		manifest.packages.map((item) => item.name),
		PACKAGE_NAMES
	);
	assert.deepEqual(
		manifest.consumers.map((item) => item.manager),
		["npm", "pnpm"]
	);
	for (const item of manifest.packages) {
		assert.equal(
			item.version,
			version,
			"Package versions must match the requested release."
		);
		assert.match(item.sha256, HASH_PATTERN);
	}
}

export function validateLatest(version, latest) {
	if (latest) {
		assert.ok(semver.gte(version, latest), "Refusing to move latest backward.");
	}
}

export function validatePublished(record, bytes, candidate) {
	assert.equal(record.name, candidate.name);
	assert.equal(record.version, candidate.version);
	assert.equal(
		digest(bytes),
		candidate.sha256,
		"Published tarball differs from the verified candidate."
	);
}

export function releaseNotes(changelog, version) {
	const heading = `## ${version}`;
	const lines = changelog.split("\n");
	const start = lines.findIndex((line) => line.trim() === heading);
	assert.ok(
		start >= 0,
		`Missing changelog section for ${version}. Run pnpm version-packages.`
	);
	const following = lines.slice(start + 1);
	const end = following.findIndex((line) => line.startsWith("## "));
	const notes = following
		.slice(0, end < 0 ? undefined : end)
		.join("\n")
		.trim();
	assert.ok(notes, "Release notes cannot be empty.");
	return notes;
}

// Check every existing version before publishing either package. Only a 404 is absent.
export async function publishMissing(candidates, lookup, publish, verify) {
	const existing = await Promise.all(candidates.map(lookup));
	await Promise.all(
		existing.map((record, index) => record && verify(record, candidates[index]))
	);
	for (const [index, candidate] of candidates.entries()) {
		if (!existing[index]) {
			// biome-ignore lint/performance/noAwaitInLoops: Serialize external package publication and support partial retries.
			await publish(candidate);
		}
	}
}

export function validateVersionedChanges(content, name) {
	assert.equal(
		content.split("---")[1]?.trim(),
		"",
		`Unconsumed changeset: ${name}. Prepare a release PR first.`
	);
}
