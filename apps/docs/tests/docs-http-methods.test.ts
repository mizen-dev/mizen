import { afterAll, beforeAll, expect, it } from "vite-plus/test";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const paths = [
	"/docs/components/button/markdown",
	"/docs/components/button/metadata",
	"/docs/installation/markdown",
	"/llms.txt",
];
let handle: TestServerHandle;
beforeAll(async () => {
	handle = await setupTestServer(new URL("..", import.meta.url).pathname);
});
afterAll(() => teardownTestServer(handle));

it.each(
	paths.flatMap((path) =>
		["POST", "PUT", "PATCH", "DELETE"].map((method) => ({ method, path }))
	)
)("rejects $method $path", async ({ method, path }) => {
	const response = await fetch(`${handle.url}${path}`, { method });
	expect(response.status).toBe(405);
	expect(await response.text()).toBe("");
});

it.each(paths)("preserves HEAD headers for %s", async (path) => {
	const [get, head] = await Promise.all([
		fetch(`${handle.url}${path}`),
		fetch(`${handle.url}${path}`, { method: "HEAD" }),
	]);
	expect(head.status).toBe(get.status);
	expect(head.headers.get("content-type")).toBe(
		get.headers.get("content-type")
	);
	expect(await head.text()).toBe("");
});

it.each(paths)("advertises supported methods for %s", async (path) => {
	const response = await fetch(`${handle.url}${path}`, { method: "OPTIONS" });
	expect(response.status).toBe(204);
	expect(response.headers.get("allow")).toBe("GET, HEAD, OPTIONS");
	expect(await response.text()).toBe("");
});
