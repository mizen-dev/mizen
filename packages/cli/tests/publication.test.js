import assert from "node:assert/strict";
import {
	copyFileSync,
	mkdtempSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { test } from "node:test";
import spawn from "cross-spawn";
import { cleanup } from "../../../scripts/cleanup.mjs";
import { findRelease, verifyTag } from "../scripts/release/github.js";
import { finishGithubRelease } from "../scripts/release/github-release.js";
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
import {
	registryVersion,
	verifyPublished,
} from "../scripts/release/registry.js";

const UPLOAD_FAILURE = /Simulated upload failure/u;
const ASSET_MISMATCH = /Existing release asset differs/u;
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

test("a listed version whose archive is not served yet is waited for", async (context) => {
	const [candidate] = packages;
	const record = {
		...candidate,
		dist: { tarball: "https://registry.npmjs.org/ui/-/ui.tgz" },
	};
	const responses = [
		new Response("Not found", { status: 404 }),
		new Response("Not found", { status: 404 }),
		new Response(bytes),
	];
	const request = context.mock.method(globalThis, "fetch", async () =>
		responses.shift()
	);
	await verifyPublished(record, candidate, 0);
	assert.equal(request.mock.callCount(), 3);
	request.mock.mockImplementation(
		async () => new Response("outage", { status: 503 })
	);
	await assert.rejects(verifyPublished(record, candidate, 0), {
		message:
			"Could not download published archive: 503. If npm lists the version, wait until it serves the archive, then re-run the failed jobs.",
	});
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

test("release retries find drafts beyond the first page and preserve published releases", async (context) => {
	const draft = { draft: true, id: 12, tag_name: "v0.1.1" };
	const firstPage = Array.from({ length: 100 }, (_, index) => ({
		tag_name: `v0.0.${index}`,
	}));
	const request = context.mock.method(globalThis, "fetch", async (url) =>
		Response.json(url.endsWith("page=1") ? firstPage : [draft])
	);
	const token = process.env.GH_TOKEN;
	process.env.GH_TOKEN = "test-only";
	try {
		assert.deepEqual(await findRelease("v0.1.1"), draft);
		assert.equal(request.mock.callCount(), 2);
		assert.equal(await findRelease("v9.0.0"), null);
		const published = { ...draft, draft: false };
		request.mock.mockImplementation(async () => Response.json([published]));
		assert.deepEqual(await findRelease("v0.1.1"), published);
		request.mock.mockImplementation(
			async () => new Response("outage", { status: 503 })
		);
		await assert.rejects(findRelease("v0.1.1"));
	} finally {
		if (token === undefined) {
			delete process.env.GH_TOKEN;
		} else {
			process.env.GH_TOKEN = token;
		}
	}
});

test("finalization resumes a partial draft upload and verifies completed release assets", async (context) => {
	const directory = mkdtempSync(join(tmpdir(), "mizen-release-retry-"));
	context.after(() => cleanup(directory));
	const file = join(directory, "mizen-ui.tgz");
	writeFileSync(file, bytes);
	writeFileSync(join(directory, "release-manifest.json"), "{}");
	const candidate = {
		archives: [{ file }],
		commit,
		directory,
		notes: "Patch notes",
		version,
	};
	let release;
	let creates = 0;
	context.mock.method(globalThis, "fetch", (url, options) => {
		if (url.includes("git/ref/")) {
			return Response.json({ object: { sha: "tag", type: "tag" } });
		}
		if (url.endsWith("git/tags/tag")) {
			return Response.json({ object: { sha: commit, type: "commit" } });
		}
		if (options.method === "POST") {
			creates += 1;
			release = { ...JSON.parse(options.body), assets: [], id: 1 };
		} else if (options.method === "PATCH") {
			Object.assign(release, JSON.parse(options.body));
		}
		return Response.json(
			options.method === "GET" ? [release].filter(Boolean) : release
		);
	});
	const failedUploads = new Set(["release-manifest.json"]);
	const uploaded = new Map();
	context.mock.method(spawn, "sync", (_command, args) => {
		if (args[1] === "download") {
			const name = args[args.indexOf("--pattern") + 1];
			copyFileSync(
				uploaded.get(name),
				join(args[args.indexOf("--dir") + 1], name)
			);
			return { status: 0, stdout: "" };
		}
		const [, , , path] = args;
		if (failedUploads.has(basename(path))) {
			return { status: 1, stderr: "Simulated upload failure" };
		}
		const saved = `${path}.uploaded`;
		copyFileSync(path, saved);
		uploaded.set(basename(path), saved);
		release.assets.push({ name: basename(path) });
		return { status: 0, stdout: "" };
	});
	const token = process.env.GH_TOKEN;
	process.env.GH_TOKEN = "test-only";
	context.after(() => {
		if (token === undefined) {
			delete process.env.GH_TOKEN;
		} else {
			process.env.GH_TOKEN = token;
		}
	});
	await assert.rejects(finishGithubRelease(candidate), UPLOAD_FAILURE);
	assert.equal(release.draft, true);
	failedUploads.clear();
	await finishGithubRelease(candidate);
	assert.equal(release.draft, false);
	assert.equal(creates, 1);
	assert.equal(uploaded.size, 3);
	await finishGithubRelease(candidate);
	assert.equal(creates, 1);
	assert.equal(readFileSync(file, "utf8"), bytes.toString());
	writeFileSync(uploaded.get("mizen-ui.tgz"), "wrong archive");
	await assert.rejects(finishGithubRelease(candidate), ASSET_MISMATCH);
});
