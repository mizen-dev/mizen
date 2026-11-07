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
let handle: TestServerHandle;
let browser: Browser;

describe("Terminal browser behavior", () => {
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

	it("keeps the newest line in view while output streams, then folds", async () => {
		const page = await browser.newPage();
		page.on("pageerror", (error) => errors.push(error.message));
		await page.goto(`${handle.url}/docs/components/terminal`, {
			waitUntil: "domcontentloaded",
		});
		const build = page.locator('[data-slot="terminal"]').nth(2);
		const output = build.locator('[data-slot="terminal-output"]');
		await expectLocator(output).toContainText("Compiled successfully", {
			timeout: 10_000,
		});
		const gap = await output.evaluate(
			(pre) => pre.scrollHeight - pre.scrollTop - pre.clientHeight
		);
		expect(gap).toBeLessThan(8);
		await expectLocator(build).toHaveAttribute("data-status", "complete", {
			timeout: 10_000,
		});
		await expectLocator(build.locator("button").first()).toHaveAttribute(
			"aria-expanded",
			"false"
		);
		await page.close();
	}, 30_000);

	it("opens a failed command with Retry", async () => {
		const page = await browser.newPage();
		await page.goto(`${handle.url}/docs/components/terminal`, {
			waitUntil: "domcontentloaded",
		});
		const failed = page
			.getByRole("region", { name: "Terminal: Failed command example" })
			.locator('[data-slot="terminal"]');
		await expectLocator(
			failed.locator('[data-slot="terminal-output"]')
		).toContainText("2 problems");
		await expectLocator(async () => {
			await failed
				.getByRole("button", { name: "Retry" })
				.click({ timeout: 1000 });
			await expectLocator(failed).toHaveAttribute("data-status", "running", {
				timeout: 500,
			});
		}).toPass({ timeout: 10_000 });
		await expectLocator(failed).toHaveAttribute("data-status", "complete", {
			timeout: 5000,
		});
		await page.close();
	}, 30_000);
});
