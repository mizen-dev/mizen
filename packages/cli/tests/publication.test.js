import assert from "node:assert/strict";
import { test } from "node:test";
import { verifyTag } from "../scripts/release/github.js";
import {
	digest,
	PACKAGE_NAMES,
	publishMissing,
	REPOSITORY,
	releaseNotes,
	validateCandidate,
	validateLatest,
	validatePublished,
	validateRun,
	validateVersionedChanges,
} from "../scripts/release/publication.js";
import { registryVersion } from "../scripts/release/registry.js";

const commit = "a".repeat(40);
const version = "0.1.1";
const bytes = Buffer.from("verified archive");
const lockfile = Buffer.from("locked dependencies");
const packages = PACKAGE_NAMES.map((name) => ({
	name,
	sha256: digest(bytes),
	version,
}));
const run = {
	conclusion: "success",
	event: "push",
	head_branch: "main",
	head_repository: { full_name: REPOSITORY },
	head_sha: commit,
	path: ".github/workflows/ci.yml",
	repository: { full_name: REPOSITORY },
	status: "completed",
};
const manifest = {
	consumers: [{ manager: "npm" }, { manager: "pnpm" }],
	git: { commit, dirty: false },
	lockfileSha256: digest(lockfile),
	packages,
	schemaVersion: 1,
};

test("only successful main push CI from this repository can supply releases", () => {
	assert.equal(validateRun(run), commit);
	for (const change of [
		{ conclusion: "failure" },
		{ status: "in_progress" },
		{ event: "pull_request" },
		{ head_branch: "feature" },
		{ path: ".github/workflows/other.yml" },
		{ head_repository: { full_name: "someone/mizen" } },
		{ head_sha: "short" },
	]) {
		assert.throws(() => validateRun({ ...run, ...change }));
	}
});

test("candidate rejects dirty sources, mismatched commits, locks, packages and versions", () => {
	validateCandidate(manifest, commit, version, lockfile);
	for (const change of [
		{ git: { commit, dirty: true } },
		{ git: { commit: "b".repeat(40), dirty: false } },
		{ lockfileSha256: "0".repeat(64) },
		{ packages: [...packages].reverse() },
		{ packages: [packages[0]] },
		{ consumers: [{ manager: "npm" }] },
	]) {
		assert.throws(() =>
			validateCandidate({ ...manifest, ...change }, commit, version, lockfile)
		);
	}
	assert.throws(() => validateCandidate(manifest, commit, "0.2.0", lockfile));
	assert.throws(() =>
		validateCandidate(manifest, commit, "0.1.1-beta.1", lockfile)
	);
});

test("release notes isolate the exact version and require an entry", () => {
	assert.equal(
		releaseNotes(
			"# UI\n\n## 0.1.1\n\n### Patch Changes\n\n- Fix keyboard input.\n\n## 0.1.0\n\nOld notes.",
			version
		),
		"### Patch Changes\n\n- Fix keyboard input."
	);
	assert.throws(() => releaseNotes("## 0.1.0\nOld notes.", version));
	assert.throws(() =>
		releaseNotes("## 0.1.1\n\n## 0.1.0\nOld notes.", version)
	);
});

test("registry verification rejects republished bytes and latest downgrades", () => {
	validatePublished(packages[0], bytes, packages[0]);
	assert.throws(() =>
		validatePublished(packages[0], Buffer.from("different"), packages[0])
	);
	assert.throws(() =>
		validatePublished({ ...packages[0], version: "0.1.0" }, bytes, packages[0])
	);
	validateLatest(version, "0.1.0");
	validateLatest(version, version);
	assert.throws(() => validateLatest(version, "0.2.0"));
});

test("partial publication resumes the missing package and complete retries publish nothing", async () => {
	const published = [];
	const lookup = (item) => (item.name === PACKAGE_NAMES[0] ? item : null);
	const verify = (record, item) => validatePublished(record, bytes, item);
	await publishMissing(
		packages,
		lookup,
		(item) => published.push(item.name),
		verify
	);
	assert.deepEqual(published, [PACKAGE_NAMES[1]]);
	await publishMissing(
		packages,
		(item) => item,
		() => assert.fail("Already published"),
		verify
	);
});

test("conflicting existing versions stop before any missing package is published", async () => {
	await assert.rejects(
		publishMissing(
			packages,
			(item) => (item.name === PACKAGE_NAMES[1] ? item : null),
			() => assert.fail("Must not publish"),
			(record, item) =>
				validatePublished(record, Buffer.from("other build"), item)
		)
	);
});

test("registry outages are not treated as absent versions", async (context) => {
	const request = context.mock.method(
		globalThis,
		"fetch",
		async () => new Response("missing", { status: 404 })
	);
	assert.equal(await registryVersion(PACKAGE_NAMES[0], version), null);
	request.mock.mockImplementation(
		async () => new Response("outage", { status: 503 })
	);
	await assert.rejects(registryVersion(PACKAGE_NAMES[0], version));
});

test("existing tags must be annotated and point to the exact release commit", async (context) => {
	context.mock.method(globalThis, "fetch", async (url) =>
		Response.json(
			url.includes("git/ref/")
				? { object: { sha: "tag-object", type: "tag" } }
				: { object: { sha: commit, type: "commit" } }
		)
	);
	const token = process.env.GH_TOKEN;
	process.env.GH_TOKEN = "test-only";
	try {
		assert.equal(await verifyTag("v0.1.1", commit), true);
		await assert.rejects(verifyTag("v0.1.1", "b".repeat(40)));
	} finally {
		if (token === undefined) {
			delete process.env.GH_TOKEN;
		} else {
			process.env.GH_TOKEN = token;
		}
	}
});

test("release requires package changesets to be consumed but permits tooling-only changes", () => {
	validateVersionedChanges("---\n---\n\nTooling only.", "tooling.md");
	assert.throws(() =>
		validateVersionedChanges(
			'---\n"@mizen-labs/ui": patch\n---\n\nFix keyboard input.',
			"fix.md"
		)
	);
	assert.throws(() =>
		validateVersionedChanges("Missing frontmatter", "broken.md")
	);
});
