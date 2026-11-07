import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const directory = fileURLToPath(new URL("../tests/", import.meta.url));
const files = readdirSync(directory)
	.filter((file) => file.endsWith(".test.js"))
	.sort()
	.map((file) => fileURLToPath(new URL(`../tests/${file}`, import.meta.url)));
// Packing rebuilds dist/catalog.json. Keep file readers and rebuilds sequential.
const result = spawnSync(
	process.execPath,
	["--test", "--test-concurrency=1", ...files],
	{
		killSignal: "SIGKILL",
		stdio: "inherit",
		timeout: 2_400_000,
	}
);
if (result.error) {
	throw result.error;
}
process.exitCode = result.status ?? 1;
