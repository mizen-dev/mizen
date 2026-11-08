// biome-ignore-all lint/performance/noAwaitInLoops: Sequential browser checks keep memory use bounded.
import { type Browser, chromium, type Page } from "playwright";
import { expect as expectLocator } from "playwright/test";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import { guides } from "../app/guides";
import {
	setDocsTheme,
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

let handle: TestServerHandle;
let browser: Browser;
let page: Page;
const errors: string[] = [];
const docsRoot = new URL("..", import.meta.url).pathname;

describe("Foundational documentation", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		page.on("pageerror", (error) => errors.push(error.message));
		page.on("console", (message) => {
			if (message.type() === "error") {
				errors.push(message.text());
			}
		});
	}, 120_000);

	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
	});

	it("publishes discoverable HTML and Markdown with valid destinations", async () => {
		const index = await (
			await page.request.get(`${handle.url}/llms.txt`)
		).text();
		const destinations = new Set<string>();
		for (const guide of guides) {
			expect(index).toContain(`/docs/${guide.slug}/markdown`);
			const response = await page.goto(`${handle.url}/docs/${guide.slug}`, {
				waitUntil: "networkidle",
			});
			expect(response?.status()).toBe(200);
			await expectLocator(page.getByRole("heading", { level: 1 })).toHaveText(
				guide.title
			);
			expect(await page.title()).toBe(guide.title);
			const markdown = await page.request.get(
				`${handle.url}/docs/${guide.slug}/markdown`
			);
			expect(markdown.status()).toBe(200);
			expect(markdown.headers()["content-type"]).toContain("text/markdown");
			const text = await markdown.text();
			for (const section of guide.sections) {
				expect(await page.locator(`section[id="${section.id}"]`).count()).toBe(
					1
				);
				expect(text).toContain(`## ${section.title}`);
				if (section.code) {
					expect(text).toContain(section.code.value);
				}
				for (const link of section.links ?? []) {
					destinations.add(link.href);
				}
			}
		}
		for (const destination of destinations) {
			const url = new URL(destination, handle.url);
			const response = await page.request.get(url.href);
			expect(response.status(), destination).toBe(200);
			if (url.hash) {
				expect(await response.text(), destination).toContain(
					`id="${url.hash.slice(1)}"`
				);
			}
		}
		const missing = await page.request.get(
			`${handle.url}/docs/unknown-guide/markdown`
		);
		expect(missing.status()).toBe(404);
		expect(
			(await page.request.get(`${handle.url}/docs/unknown-guide`)).status()
		).toBe(404);
	}, 120_000);

	it("retains the document frame, code scrolling, and TOC in light and dark at both widths", async () => {
		for (const theme of ["light", "dark"] as const) {
			await page.goto(`${handle.url}/docs/installation`, {
				waitUntil: "networkidle",
			});
			await setDocsTheme(page, theme);
			for (const width of [1440, 320]) {
				await page.setViewportSize({ height: 900, width });
				for (const guide of guides) {
					await page.goto(`${handle.url}/docs/${guide.slug}`, {
						waitUntil: "networkidle",
					});
					if (width === 1440) {
						const viewport = page
							.getByRole("navigation", { name: "On this page" })
							.locator('[data-slot="scroll-area-viewport"]');
						await expect
							.poll(() =>
								viewport.evaluate(
									(node) => node.scrollHeight - node.clientHeight
								)
							)
							.toBeLessThanOrEqual(1);
					}
					expect(
						await page.evaluate(() => document.documentElement.scrollWidth)
					).toBeLessThanOrEqual(width);
					expect(
						await page.locator('[data-slot="guide-document"]').count()
					).toBe(1);
					await page.screenshot({
						fullPage: true,
						path: `/private/tmp/mizen-guide-${guide.slug}-${theme}-${width}.png`,
					});
				}
			}
		}
		await page.setViewportSize({ height: 900, width: 1440 });
		await page.goto(`${handle.url}/docs/installation`, {
			waitUntil: "networkidle",
		});
		const outline = page.getByRole("navigation", { name: "On this page" });
		await outline.getByRole("link", { exact: true, name: "Next" }).click();
		await expectLocator(
			outline.locator('[aria-current="location"]')
		).toHaveAttribute("href", "#next");
		await expectLocator(
			page.getByRole("button", { exact: true, name: "Copy page" })
		).toBeVisible();
		const code = page.getByRole("region", {
			name: "Next code",
		});
		// The shared code body retains its bounded Scroll Area.
		expect(
			await page
				.locator('[data-slot="code-block"] [data-slot="scroll-area"]')
				.count()
		).toBeGreaterThan(0);
		expect(await code.count()).toBe(1);
		await page
			.context()
			.grantPermissions(["clipboard-read", "clipboard-write"]);
		await page
			.locator("#next")
			.getByRole("button", { name: "Copy code" })
			.click();
		const source = guides
			.find((guide) => guide.slug === "installation")
			?.sections.find((section) => section.id === "next")?.code?.value;
		await expect
			.poll(() => page.evaluate(() => navigator.clipboard.readText()))
			.toBe(source);
	}, 120_000);

	it("navigates guides on mobile and retains component search", async () => {
		await page.setViewportSize({ height: 900, width: 320 });
		await page.goto(`${handle.url}/docs/installation`, {
			waitUntil: "networkidle",
		});
		await page.getByRole("button", { exact: true, name: "Browse" }).click();
		const popup = page.locator('[data-slot="popover-popup"]');
		await popup
			.getByRole("navigation", { name: "Documentation guides" })
			.getByRole("link", { exact: true, name: "CLI" })
			.click();
		await page.waitForURL("**/docs/cli");
		await expectLocator(
			page.locator('[data-slot="popover-popup"]')
		).toHaveCount(0);
		await page.setViewportSize({ height: 900, width: 1440 });
		const sidebar = page.locator('[data-slot="desktop-sidebar"]');
		await expectLocator(
			sidebar
				.getByRole("navigation", { name: "Documentation guides" })
				.locator('[aria-current="page"]')
		).toHaveAttribute("href", "/docs/cli");
		await sidebar
			.getByRole("searchbox", { name: "Find a component" })
			.fill("button");
		await sidebar
			.getByRole("navigation", { name: "Component index" })
			.getByRole("link", { exact: true, name: "Button" })
			.click();
		await page.waitForURL("**/docs/components/button");
		await expectLocator(
			page.locator('[data-slot="component-document"]')
		).toHaveCount(1);
		expect(errors).toEqual([]);
	}, 60_000);
});
