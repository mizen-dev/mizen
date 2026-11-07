import assert from "node:assert/strict";
import { mkdir, mkdtemp, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { cleanup } from "../../../scripts/cleanup.mjs";
import { inputHashes } from "../scripts/benchmark/fixtures.js";
import {
	directoryBytes,
	markdown,
	summarize,
} from "../scripts/benchmark/measure.js";

test("benchmark statistics retain outliers and use nearest-rank p95", () => {
	const samples = [
		...Array.from({ length: 19 }, (_, index) => index + 1),
		1000,
	].reverse();
	const original = [...samples];
	assert.deepEqual(summarize(samples), {
		maxMs: 1000,
		medianMs: 10.5,
		minMs: 1,
		p95Ms: 19,
	});
	assert.deepEqual(samples, original);
	assert.equal(summarize([7]).medianMs, 7);
	assert.equal(summarize([3, 1, 2]).medianMs, 2);
	assert.throws(() => summarize([]));
	assert.throws(() => summarize([Number.NaN]));
});

test("installed size counts logical file bytes without following directory links", async (t) => {
	const root = await mkdtemp(join(tmpdir(), "mizen benchmark size "));
	t.after(() => cleanup(root));
	await mkdir(join(root, "nested"));
	await writeFile(join(root, "file"), "abc");
	await writeFile(join(root, "nested/file"), "12345");
	await symlink(
		join(root, "nested"),
		join(root, "linked"),
		process.platform === "win32" ? "junction" : "dir"
	);
	assert.equal(await directoryBytes(root), 8);
});

test("replay hashes detect a changed fixture without hashing installed dependencies", async (t) => {
	const root = await mkdtemp(join(tmpdir(), "mizen benchmark inputs "));
	t.after(() => cleanup(root));
	await mkdir(join(root, "cli-only"));
	await mkdir(join(root, "app/src"), { recursive: true });
	for (const path of [
		"mizen-cli.tgz",
		"mizen-ui.tgz",
		"cli-only/package.json",
		"cli-only/package-lock.json",
		"app/package.json",
		"app/package-lock.json",
		"app/src/main.jsx",
		"app/index.html",
	]) {
		// biome-ignore lint/performance/noAwaitInLoops: Eight small fixture files.
		await writeFile(join(root, path), path);
	}
	const before = await inputHashes(root);
	await mkdir(join(root, "app/node_modules"));
	await writeFile(join(root, "app/node_modules/local"), "not an input");
	assert.deepEqual(await inputHashes(root), before);
	await writeFile(join(root, "app/src/main.jsx"), "changed");
	assert.notDeepEqual(await inputHashes(root), before);
});

test("CI summary states units, sampling method, cache limits, and informational status", () => {
	const output = markdown({
		commands: [
			{ firstRunMs: 21.123, medianMs: 20.125, name: "help", p95Ms: 27 },
		],
		environment: {
			architecture: "x64",
			node: "24.11.0",
			npm: "10",
			platform: "linux",
		},
		protocol: { id: "test", samples: 20, warmups: 3 },
		sizes: { archiveBytes: 5, installedBytes: 15, packageBytes: 10 },
	});
	assert.ok(output.includes("| help | 21.12 | 20.13 | 27.00 |"));
	assert.ok(output.includes("Filesystem caches are uncontrolled"));
	assert.ok(output.includes("No regression threshold is enforced"));
	assert.ok(output.includes("CLI-only node_modules: 15 bytes"));
});
