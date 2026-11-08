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

describe("Message browser behavior", () => {
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

	it("shows actions on hover and edits in place", async () => {
		const page = await browser.newPage();
		page.on("pageerror", (error) => errors.push(error.message));
		await page.goto(`${handle.url}/docs/components/message`, {
			waitUntil: "domcontentloaded",
		});
		const message = page
			.locator('[data-slot="message"][data-from="user"]')
			.first();
		const actions = message.locator('[data-slot="message-actions"]');
		await expectLocator(actions).toHaveCSS("opacity", "0");
		await message.locator('[data-slot="message-bubble"]').hover();
		await expectLocator(actions).toHaveCSS("opacity", "1");

		const edit = message.getByRole("button", { name: "Edit message" });
		// Retry until hydration attaches the handler.
		await expectLocator(async () => {
			await edit.click({ timeout: 1000 });
			await expectLocator(message.getByRole("textbox")).toBeFocused({
				timeout: 500,
			});
		}).toPass({ timeout: 10_000 });
		await page.keyboard.press("Escape");
		await expectLocator(edit).toBeFocused();

		await edit.click();
		await page.keyboard.type(" Card is in a sidebar.");
		await page.keyboard.press("Enter");
		await expectLocator(
			message.locator('[data-slot="message-text"]')
		).toHaveText(
			"How do I make Card respond to its container instead of the viewport? Card is in a sidebar."
		);
		await expectLocator(edit).toBeFocused();
		await page.close();
	}, 30_000);

	it("folds long text after eight lines and opens it with Show more", async () => {
		const page = await browser.newPage();
		await page.goto(`${handle.url}/docs/components/message`, {
			waitUntil: "domcontentloaded",
		});
		const long = page.getByRole("region", {
			name: "Message: Long text example",
		});
		const more = long.getByRole("button", { name: "Show more" });
		const text = long.locator('[data-slot="message-text"]');
		await expectLocator(more).toBeVisible({ timeout: 10_000 });
		const folded = await text.evaluate((node) => node.clientHeight);
		expect(folded).toBeLessThanOrEqual(8 * 24);
		await expectLocator(async () => {
			await more.click({ timeout: 1000 });
			await expectLocator(
				long.getByRole("button", { name: "Show less" })
			).toHaveAttribute("aria-expanded", "true", { timeout: 500 });
		}).toPass({ timeout: 10_000 });
		const open = await text.evaluate((node) => node.clientHeight);
		expect(open).toBeGreaterThan(folded);
		// Short messages never show the button.
		const short = page
			.locator('[data-slot="message"][data-from="user"]')
			.first();
		await expectLocator(
			short.getByRole("button", { name: "Show more" })
		).toBeHidden();
		await page.close();
	}, 30_000);

	it("opens sent images in a lightbox and pages through them", async () => {
		const page = await browser.newPage();
		await page.goto(`${handle.url}/docs/components/message`, {
			waitUntil: "domcontentloaded",
		});
		const files = page.getByRole("list", { name: "Attachments" });
		const cover = files.getByRole("button", { name: "report-cover.jpg" });
		const dialog = page.getByRole("dialog");
		await expectLocator(async () => {
			await cover.click({ timeout: 1000 });
			await expectLocator(dialog).toBeVisible({ timeout: 500 });
		}).toPass({ timeout: 10_000 });
		await expectLocator(dialog).toContainText("1 of 2");
		await expectLocator(
			dialog.getByRole("button", { exact: true, name: "Close" })
		).toBeFocused();
		await page.keyboard.press("ArrowRight");
		await expectLocator(dialog).toContainText("2 of 2");
		await page.keyboard.press("Escape");
		await expectLocator(dialog).toBeHidden();
		await expectLocator(cover).toBeFocused();
		await expectLocator(
			files.getByRole("link", {
				name: "monthly-report.csv, opens in a new tab",
			})
		).toHaveAttribute("href", "/media/monthly-report.csv");
		await page.close();
	}, 30_000);
});
