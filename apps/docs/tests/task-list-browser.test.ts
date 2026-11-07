import { type Browser, chromium } from "playwright";
import { expect as expectLocator } from "playwright/test";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const errors: string[] = [];
const DONE = /^Move Card to container queries · 4 steps · \d+(\.\d)?s$/;
let handle: TestServerHandle;
let browser: Browser;

describe("TaskList browser behavior", () => {
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

	it("keeps approval in view when folded, then runs to its summary", async () => {
		const page = await browser.newPage();
		page.on("pageerror", (error) => errors.push(error.message));
		await page.goto(`${handle.url}/docs/components/task-list`, {
			waitUntil: "domcontentloaded",
		});
		const plan = page.locator('[data-slot="task-list"]').first();
		await expectLocator(plan).toHaveAttribute("data-status", "approval");
		// Folding the steps keeps the question in view.
		const header = plan.locator("button").first();
		await expectLocator(async () => {
			await header.click({ timeout: 1000 });
			await expectLocator(header).toHaveAttribute("aria-expanded", "false", {
				timeout: 500,
			});
		}).toPass({ timeout: 10_000 });
		await expectLocator(
			plan.getByRole("button", { name: "Approve" })
		).toBeVisible();
		await expectLocator(async () => {
			await plan
				.getByRole("button", { name: "Approve" })
				.click({ timeout: 1000 });
			await expectLocator(plan).toHaveAttribute("data-status", "running", {
				timeout: 500,
			});
		}).toPass({ timeout: 10_000 });
		await expectLocator(plan).toHaveAttribute("data-status", "complete", {
			timeout: 10_000,
		});
		const summary = plan.locator("button").first();
		await expectLocator(summary).toHaveText(DONE);
		await expectLocator(summary).toHaveAttribute("aria-expanded", "false");
		await page.close();
	}, 30_000);

	it("runs a failed step again from Retry from here", async () => {
		const page = await browser.newPage();
		await page.goto(`${handle.url}/docs/components/task-list`, {
			waitUntil: "domcontentloaded",
		});
		const plan = page
			.getByRole("region", { name: "Task List: Failed step example" })
			.locator('[data-slot="task-list"]');
		await expectLocator(plan).toHaveAttribute("data-status", "error");
		await expectLocator(async () => {
			await plan
				.getByRole("button", { name: "Retry from here" })
				.click({ timeout: 1000 });
			await expectLocator(plan).toHaveAttribute("data-status", "running", {
				timeout: 500,
			});
		}).toPass({ timeout: 10_000 });
		await page.close();
	}, 30_000);
});
