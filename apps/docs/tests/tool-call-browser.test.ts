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
const USED = /^Used 3 tools · \d+(\.\d)?s$/;
let handle: TestServerHandle;
let browser: Browser;

describe("ToolCall browser behavior", () => {
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

	it("waits for approval, then runs the call and sums up the turn", async () => {
		const page = await browser.newPage();
		page.on("pageerror", (error) => errors.push(error.message));
		await page.goto(`${handle.url}/docs/components/tool-call`, {
			waitUntil: "domcontentloaded",
		});
		const group = page.locator('[data-slot="tool-call-group"]').first();
		const issue = group.locator('[data-slot="tool-call"]').nth(2);
		await expectLocator(issue).toHaveAttribute("data-status", "approval", {
			timeout: 10_000,
		});
		await expectLocator(group).toHaveAttribute("data-status", "running");
		// Folding the call keeps Approve and Deny in view.
		const row = issue.locator("button").first();
		await expectLocator(async () => {
			await row.click({ timeout: 1000 });
			await expectLocator(row).toHaveAttribute("aria-expanded", "false", {
				timeout: 500,
			});
		}).toPass({ timeout: 10_000 });
		await expectLocator(
			issue.getByRole("button", { name: "Deny" })
		).toBeVisible();
		await issue.getByRole("button", { name: "Approve" }).click();
		// The group folds into its summary once the last call finishes.
		await expectLocator(group).toHaveAttribute("data-status", "complete", {
			timeout: 5000,
		});
		await expectLocator(group.locator("button").first()).toHaveText(USED);
		await expectLocator(group.locator("button").first()).toHaveAttribute(
			"aria-expanded",
			"false"
		);
		await page.close();
	}, 30_000);

	it("keeps opened calls inside their container", async () => {
		const page = await browser.newPage();
		await page.goto(`${handle.url}/docs/components/tool-call`, {
			waitUntil: "domcontentloaded",
		});
		const group = page.locator('[data-slot="tool-call-group"]').first();
		const first = group.locator('[data-slot="tool-call"]').first();
		await expectLocator(first).toHaveAttribute("data-status", "complete", {
			timeout: 10_000,
		});
		await first.locator("button").first().click();
		await expectLocator(first.locator('[aria-label="Result"]')).toBeVisible();
		// Long code scrolls inside its block instead of widening the call.
		const [call, frame] = await Promise.all([
			first.boundingBox(),
			group.boundingBox(),
		]);
		expect(call?.width).toBeLessThanOrEqual(frame?.width ?? 0);
		await page.close();
	}, 30_000);

	it("runs a failed call again from Retry", async () => {
		const page = await browser.newPage();
		await page.goto(`${handle.url}/docs/components/tool-call`, {
			waitUntil: "domcontentloaded",
		});
		const call = page
			.getByRole("region", { name: "Tool Call: Failed call example" })
			.locator('[data-slot="tool-call"]');
		await expectLocator(call).toHaveAttribute("data-status", "error");
		// Retry until hydration attaches the handler.
		await expectLocator(async () => {
			await call
				.getByRole("button", { name: "Retry" })
				.click({ timeout: 1000 });
			await expectLocator(call).not.toHaveAttribute("data-status", "error", {
				timeout: 500,
			});
		}).toPass({ timeout: 10_000 });
		await expectLocator(call).toHaveAttribute("data-status", "complete", {
			timeout: 5000,
		});
		await expectLocator(call.locator("button").first()).toContainText(
			"Read web.dev"
		);
		await page.close();
	}, 30_000);
});
