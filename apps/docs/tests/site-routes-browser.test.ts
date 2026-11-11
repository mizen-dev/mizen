// biome-ignore-all lint/performance/noAwaitInLoops: One browser page and sequential requests keep route checks ordered and resource use bounded.
import { type Browser, chromium, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import { componentDocs } from "../src/entities/documentation/model/docs-registry";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

let handle: TestServerHandle;
let browser: Browser;
let page: Page;
const docsRoot = new URL("..", import.meta.url).pathname;

describe("site route boundaries", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
	}, 120_000);
	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
	});
	it("preserves every legacy component and Markdown URL, including query parameters", async () => {
		for (const { slug } of componentDocs) {
			for (const suffix of ["", "/markdown"]) {
				const response = await page.request.get(
					`${handle.url}/components/${slug}${suffix}?page=2`,
					{ maxRedirects: 0 }
				);
				expect(response.status()).toBe(308);
				expect(response.headers().location).toBe(
					`/docs/components/${slug}${suffix}?page=2`
				);
			}
		}
	}, 60_000);
	it("separates site and docs layouts and retains mobile navigation", async () => {
		await page.setViewportSize({ height: 900, width: 1280 });
		for (const route of ["/", "/docs"]) {
			await page.goto(`${handle.url}${route}`, { waitUntil: "networkidle" });
			expect(await page.getByRole("main").count()).toBe(1);
			expect(await page.locator('[data-slot="desktop-sidebar"]').count()).toBe(
				route === "/docs" ? 1 : 0
			);
			const current = page
				.getByRole("navigation", { name: "Site navigation" })
				.locator('[aria-current="page"]');
			expect(await current.count()).toBe(route === "/docs" ? 1 : 0);
		}
		await page.goto(`${handle.url}/docs/components/data-table`, {
			waitUntil: "networkidle",
		});
		expect(await page.locator('[data-slot="component-document"]').count()).toBe(
			1
		);
		await page.setViewportSize({ height: 900, width: 320 });
		await page.getByRole("button", { exact: true, name: "Browse" }).click();
		await page
			.locator('[data-slot="drawer-popup"]')
			.getByRole("link", { exact: true, name: "Docs" })
			.click();
		await page.waitForURL(`${handle.url}/docs`);
		// The drawer closes after navigation.
		await page
			.locator('[data-slot="drawer-popup"]')
			.waitFor({ state: "detached" });
	}, 60_000);
});
