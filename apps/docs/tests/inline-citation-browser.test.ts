import { type Browser, chromium } from "playwright";
import { expect as expectLocator } from "playwright/test";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
const errors: string[] = [];
let handle: TestServerHandle;
let browser: Browser;

describe("InlineCitation browser behavior", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
	}, 120_000);

	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
		expect(errors).toEqual([]);
	}, 120_000);

	it("previews a source on hover and lists a group from the keyboard", async () => {
		const page = await browser.newPage();
		page.on("pageerror", (error) => errors.push(error.message));
		await page.goto(`${handle.url}/docs/components/inline-citation`, {
			waitUntil: "domcontentloaded",
		});
		const chips = page
			.locator('[data-slot="component-preview"]')
			.first()
			.locator('[data-slot="inline-citation"]');
		const card = page.locator('[data-slot="inline-citation-card"]');
		// Leave and enter again on each try, so a hover before hydration retries.
		await expectLocator(async () => {
			await page.mouse.move(0, 0);
			await chips.first().hover({ timeout: 1000 });
			await expectLocator(card).toBeVisible({ timeout: 1500 });
		}).toPass({ timeout: 10_000 });
		await expectLocator(card).toContainText("CSS container queries");
		await page.mouse.move(0, 0);
		await expectLocator(card).toBeHidden();

		const group = chips.nth(1);
		await group.focus();
		await page.keyboard.press("Enter");
		const list = page.locator('[data-slot="inline-citation-sources"]');
		await expectLocator(list.getByRole("link")).toHaveCount(2);
		await page.keyboard.press("Escape");
		await expectLocator(list).toBeHidden();
		await expectLocator(group).toBeFocused();
		await page.close();
	}, 30_000);
});
