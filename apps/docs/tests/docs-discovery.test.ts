import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
let handle: TestServerHandle;

describe("component discovery routes", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
	}, 120_000);

	afterAll(async () => {
		await teardownTestServer(handle);
	}, 120_000);

	it("indexes examples and resolves public component Markdown", async () => {
		const indexResponse = await fetch(new URL("/llms.txt", handle.url));
		expect(indexResponse.status).toBe(200);
		expect(indexResponse.headers.get("content-type")).toContain("text/plain");
		const index = await indexResponse.text();

		for (const phrase of ["Analytics workspace"]) {
			expect(index).toContain(phrase);
		}

		const home = await fetch(`${handle.url}/internal/specimens`);
		const homeMarkup = await home.text();
		for (const id of [
			"settings-heading",
			"data-table-example",
			"analytics-workspace-example",
		]) {
			expect(homeMarkup).toContain(`id="${id}"`);
		}
		for (const path of ["/internal/specimens#analytics-workspace-example"]) {
			expect(index).toContain(path);
		}

		const markdownResponses = await Promise.all(
			[
				["input", "onValueChange"],
				["data-table", "DataTable.table"],
				["composer", "ComposerInput"],
			].map(async ([slug, apiName]) => {
				const response = await fetch(
					new URL(`/components/${slug}/markdown`, handle.url)
				);
				return { apiName, body: await response.text(), response };
			})
		);
		for (const { apiName, body, response } of markdownResponses) {
			expect(response.status).toBe(200);
			expect(response.headers.get("content-type")).toContain("text/markdown");
			expect(body.startsWith("# ")).toBe(true);
			expect(body).toContain(apiName);
		}
	});

	it("returns a plain not-found response for unknown component slugs", async () => {
		const response = await fetch(
			new URL("/components/not-a-component/markdown", handle.url)
		);
		expect(response.status).toBe(404);
		expect(await response.text()).toContain("Component not found.");
	});
});
