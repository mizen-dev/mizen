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

describe("ApprovalCard browser behavior", () => {
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

	it("denies with a note, folds, and moves focus to the line", async () => {
		const page = await browser.newPage();
		page.on("pageerror", (error) => errors.push(error.message));
		await page.goto(`${handle.url}/docs/components/approval-card`, {
			waitUntil: "domcontentloaded",
		});
		const card = page.locator('[data-slot="approval-card"]').first();
		const note = card.getByRole("textbox", {
			name: "What should the agent do instead? Optional.",
		});
		await expectLocator(async () => {
			await card.getByRole("button", { name: "Deny" }).click({ timeout: 1000 });
			await expectLocator(note).toBeFocused({ timeout: 500 });
		}).toPass({ timeout: 10_000 });
		// Escape goes back without denying.
		await page.keyboard.press("Escape");
		await expectLocator(card).toHaveAttribute("data-status", "pending");
		await card.getByRole("button", { name: "Deny" }).click();
		await page.keyboard.type("Send it tomorrow instead.");
		await page.keyboard.press("Enter");
		await expectLocator(card).toHaveAttribute("data-status", "denied");
		const line = card.getByRole("button", {
			name: "Denied · Send the October newsletter",
		});
		await expectLocator(line).toBeFocused();
		await line.click();
		await expectLocator(card).toContainText("Note: Send it tomorrow instead.");
		await page.close();
	}, 30_000);
});
