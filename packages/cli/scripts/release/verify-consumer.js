import { cp, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { cleanup } from "../../../../scripts/cleanup.mjs";
import { execute, INSTALL_TIMEOUT_MS } from "../process.js";
import { checkConsumer } from "./consumers.js";

export async function verifyRegistryConsumer(root, version) {
	const staging = await mkdtemp(join(tmpdir(), "mizen-published-"));
	try {
		const fixture = join(root, "apps/docs/tests/package-consumer");
		const metadata = JSON.parse(
			await readFile(join(fixture, "package.json"), "utf8")
		);
		await checkConsumer(
			staging,
			"npm",
			version,
			metadata.dependencies.react,
			"",
			true
		);
		const app = join(staging, "production");
		await cp(fixture, app, {
			filter: (path) => !["node_modules", ".next"].includes(basename(path)),
			recursive: true,
		});
		metadata.dependencies["@mizen-labs/ui"] = version;
		metadata.dependencies["@mizen-labs/cli"] = version;
		await writeFile(
			join(app, "package.json"),
			JSON.stringify(metadata, null, 2)
		);
		execute("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund"], {
			cwd: app,
			timeout: INSTALL_TIMEOUT_MS,
		});
		execute(
			"npm",
			[
				"exec",
				"--no",
				"--",
				"mizen",
				"init",
				"--yes",
				"--package-manager",
				"npm",
			],
			{ cwd: app, timeout: INSTALL_TIMEOUT_MS }
		);
		execute("npm", ["run", "build"], { cwd: app, timeout: INSTALL_TIMEOUT_MS });
	} finally {
		await cleanup(staging);
	}
}
