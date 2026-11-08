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

describe("QuestionCard browser behavior", () => {
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

	it("answers with keys, own words, and Skip, then folds", async () => {
		const page = await browser.newPage();
		page.on("pageerror", (error) => errors.push(error.message));
		await page.goto(`${handle.url}/docs/components/question-card`, {
			waitUntil: "domcontentloaded",
		});
		const card = page.locator('[data-slot="question-card"]').first();
		const next = card.getByRole("button", { name: "Next" });
		// Number key 2 picks the second option once the page is live.
		await expectLocator(async () => {
			await next.focus({ timeout: 1000 });
			await page.keyboard.press("2");
			await expectLocator(
				card.getByRole("radio", { checked: true })
			).toHaveCount(1, {
				timeout: 500,
			});
		}).toPass({ timeout: 10_000 });
		await next.click();
		await expectLocator(
			card.getByText("Which places should get the new Card first?")
		).toBeFocused();
		await card.getByText("Settings sidebar").click();
		await card
			.getByRole("textbox", { name: "Your own answer" })
			.fill("Pricing page");
		await card.getByRole("button", { name: "Next" }).click();
		await card.getByRole("button", { name: "Skip" }).click();
		await expectLocator(card).toHaveAttribute("data-status", "answered");
		const line = card.getByRole("button", {
			name: "Answered 2 of 3 questions",
		});
		await expectLocator(line).toBeFocused();
		await line.click();
		const record = card.locator('[data-slot="question-card-answers"]');
		await expectLocator(record).toContainText("480px");
		await expectLocator(record).toContainText("Settings sidebar, Pricing page");
		await expectLocator(record).toContainText("Skipped");
		await page.close();
	}, 30_000);
});
