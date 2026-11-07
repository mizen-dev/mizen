import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { test } from "node:test";
import { stopProcess } from "../scripts/stop-process.js";

test("server cleanup waits for an uncooperative child to exit", {
	timeout: 5000,
}, async (t) => {
	const child = spawn(
		process.execPath,
		[
			"-e",
			`
process.on("SIGTERM", () => {});
process.send("ready");
setInterval(() => {}, 1000);
`,
		],
		{ stdio: ["ignore", "ignore", "ignore", "ipc"] }
	);
	t.after(() => child.kill("SIGKILL"));
	await once(child, "message");
	await stopProcess(child, 50);
	assert.ok(child.exitCode !== null || child.signalCode !== null);
	await stopProcess(child, 50);
});

test("server cleanup accepts a server that was never started", async () => {
	await stopProcess(undefined);
});
