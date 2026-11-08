import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import { componentDocs } from "../app/docs-registry";
import { guides } from "../app/guides";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

let handle: TestServerHandle;
beforeAll(async () => {
	handle = await setupTestServer(new URL("..", import.meta.url).pathname);
});
afterAll(() => teardownTestServer(handle));

describe("public documentation URLs", () => {
	it("serves the existing site icon", async () => {
		const icon = await fetch(`${handle.url}/icon.svg`);
		expect(icon.status).toBe(200);
		expect(icon.headers.get("content-type")).toContain("image/svg+xml");
	});

	it.each(componentDocs)(
		"serves $slug HTML, Markdown and metadata",
		async ({ slug, name }) => {
			const path = `/docs/components/${slug}`;
			const [page, markdown, metadata] = await Promise.all([
				fetch(`${handle.url}${path}`),
				fetch(`${handle.url}${path}/markdown`),
				fetch(`${handle.url}${path}/metadata`),
			]);
			expect(page.status).toBe(200);
			expect(await page.text()).toContain('data-slot="component-document"');
			expect(markdown.headers.get("content-type")).toContain("text/markdown");
			expect(await markdown.text()).toContain(`# ${name}`);
			expect(metadata.status).toBe(200);
			expect(await metadata.json()).toMatchObject({ name, slug });
		}
	);

	it.each(guides)(
		"serves the $slug guide and Markdown",
		async ({ slug, title }) => {
			const page = await fetch(`${handle.url}/docs/${slug}`);
			expect(page.status).toBe(200);
			expect(await page.text()).toContain('data-slot="guide-document"');
			const markdown = await fetch(`${handle.url}/docs/${slug}/markdown`);
			expect(markdown.headers.get("content-type")).toContain("text/markdown");
			expect(await markdown.text()).toContain(`# ${title}`);
		}
	);

	it.each(["", "/markdown"])(
		"preserves legacy redirects%s and query parameters",
		async (suffix) => {
			const response = await fetch(
				`${handle.url}/components/button${suffix}?source=legacy`,
				{ redirect: "manual" }
			);
			expect(response.status).toBe(308);
			expect(response.headers.get("location")).toBe(
				`/docs/components/button${suffix}?source=legacy`
			);
		}
	);

	it.each([
		"/missing-page",
		"/docs/missing-guide",
		"/docs/missing-guide/markdown",
		"/docs/components/missing-component",
		"/docs/components/missing-component/markdown",
		"/docs/components/missing-component/metadata",
	])("returns HTTP 404 for %s", async (path) => {
		expect((await fetch(`${handle.url}${path}`)).status).toBe(404);
	});

	it("serves the agent index and public consumer skill", async () => {
		const index = await fetch(`${handle.url}/llms.txt`);
		expect(index.headers.get("content-type")).toContain("text/plain");
		expect(await index.text()).toContain("/docs/components/button/markdown");
		const skill = await fetch(`${handle.url}/skills/mizen-ui/SKILL.md`);
		expect(skill.status).toBe(200);
		expect(await skill.text()).toContain("Mizen");
	});
});
