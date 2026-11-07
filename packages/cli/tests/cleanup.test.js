import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { cleanup } from "../scripts/cleanup.js";

test("cleanup removes its temporary directory", async () => {
	const directory = await fs.mkdtemp(join(tmpdir(), "mizen-cleanup-"));
	await fs.writeFile(join(directory, "fixture.txt"), "temporary");
	await cleanup(directory);
	await assert.rejects(fs.stat(directory), { code: "ENOENT" });
});

test("locked cleanup cannot replace the original verification failure", async (t) => {
	const original = new Error("npm install timed out");
	const locked = Object.assign(new Error("Directory is locked"), {
		code: "EBUSY",
	});
	const remove = t.mock.method(fs, "rm", () => Promise.reject(locked));
	const warning = t.mock.method(console, "warn", () => undefined);
	await assert.rejects(
		async () => {
			try {
				await Promise.reject(original);
			} finally {
				await cleanup("locked-fixture");
			}
		},
		(error) => error === original
	);
	assert.deepEqual(remove.mock.calls[0].arguments, [
		"locked-fixture",
		{ force: true, maxRetries: 5, recursive: true, retryDelay: 1000 },
	]);
	assert.equal(warning.mock.calls[0].arguments[1], locked);
});
