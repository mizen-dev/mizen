import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { setupTestServer, teardownTestServer } from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");

export default async function setup() {
	if (!process.env.MIZEN_DOCS_TEST_URL) {
		// Local runs refresh compiled exports; external servers need a current UI watcher.
		await promisify(execFile)("pnpm", ["--filter", "@mizen-labs/ui", "build"], {
			cwd: docsRoot,
			killSignal: "SIGKILL",
			timeout: 180_000,
		});
	}
	const handle = await setupTestServer(docsRoot);
	process.env.MIZEN_DOCS_TEST_URL = handle.url;

	return () => teardownTestServer(handle);
}
