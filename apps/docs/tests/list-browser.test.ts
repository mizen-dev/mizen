import { type Browser, chromium, type Page } from "playwright";
import { expect as expectLocator } from "playwright/test";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const errors: string[] = [];
let handle: TestServerHandle;
let browser: Browser;
let page: Page;

describe("List", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		page.setDefaultTimeout(8000);
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
		expect(errors).toEqual([]);
	});

	it("preserves list semantics and separate keyboard actions", async () => {
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "domcontentloaded",
		});
		const list = page.getByRole("list", { name: "Project resources" });
		await expectLocator(list).toBeVisible();
		expect(await list.evaluate((element) => element.tagName)).toBe("UL");
		expect(await list.getByRole("listitem").count()).toBeGreaterThan(1);
		await expectLocator(
			list.getByRole("link", { name: "Action controls" })
		).toHaveAttribute("href", "#compound-actions-heading");
		await expectLocator(
			list.getByRole("link", { name: "Site navigation" })
		).toHaveAttribute("href", "#site-navigation-heading");
		await expectLocator(
			list.getByRole("link", { name: "Budget table" })
		).toHaveAttribute("href", "#data-table-heading");
		const link = list.getByRole("link").first();
		await link.focus();
		await expectLocator(link).toBeFocused();
		await page.keyboard.press("Tab");
		await expectLocator(link).not.toBeFocused();
		await expectLocator(
			list.locator("a a, a button, button a, button button")
		).toHaveCount(0);
	});

	for (const theme of ["light", "dark"] as const) {
		it(`keeps ${theme} content and actions visible with enlarged text`, async () => {
			await page.setViewportSize({ height: 900, width: 1280 });
			await page.addInitScript(
				(preference) => localStorage.setItem("mizen-theme", preference),
				theme
			);
			await page.goto(`${handle.url}/internal/specimens`, {
				waitUntil: "domcontentloaded",
			});
			const example = page.getByTestId("list-example");
			await expectLocator(example).toBeVisible();
			await page.evaluate(() => document.fonts.ready);
			await example.screenshot({
				caret: "initial",
				path: `/private/tmp/mizen-list-${theme}.png`,
			});
			await page.setViewportSize({ height: 900, width: 390 });
			await page.addStyleTag({
				content:
					"html {font-size:32px !important} * {line-height:1.5 !important;letter-spacing:0.12em !important;word-spacing:0.16em !important}",
			});
			const list = example.getByRole("list", { name: "Project resources" });
			expect(
				await list.evaluate(
					(element) => element.scrollWidth <= element.clientWidth
				)
			).toBe(true);
			const lastLink = list.getByRole("link").last();
			await lastLink.scrollIntoViewIfNeeded();
			await expectLocator(lastLink).toBeInViewport();
			expect(
				await list.getByRole("link").evaluateAll((links) =>
					links.every((link) => {
						const bounds = link.getBoundingClientRect();
						return (
							bounds.width > 0 && bounds.x >= 0 && bounds.right <= innerWidth
						);
					})
				)
			).toBe(true);
		});
	}
});
