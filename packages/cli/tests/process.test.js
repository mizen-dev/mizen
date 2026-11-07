import assert from "node:assert/strict";
import { test } from "node:test";
import { execute } from "../scripts/process.js";

test("failed commands retain arguments and both output streams", () => {
	assert.throws(
		() =>
			execute(process.execPath, [
				"-e",
				'console.log("progress"); console.error("reason"); process.exit(7)',
			]),
		(error) => {
			assert.ok(error.message.includes("-e"));
			assert.ok(error.message.includes("failed (7)"));
			assert.ok(error.message.includes("progress"));
			assert.ok(error.message.includes("reason"));
			return true;
		}
	);
});

test("command timeouts retain their original error code and cause", () => {
	assert.throws(
		() =>
			execute(process.execPath, ["-e", "setInterval(() => {}, 1000)"], {
				timeout: 200,
			}),
		(error) => {
			assert.equal(error.cause.code, "ETIMEDOUT");
			assert.ok(error.message.includes("failed (ETIMEDOUT)"));
			return true;
		}
	);
});
