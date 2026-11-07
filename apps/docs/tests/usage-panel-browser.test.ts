import { type Browser, chromium } from "playwright";
import { expect as expectLocator } from "playwright/test";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
let browser: Browser;
let handle: TestServerHandle;

describe("usage panel recipe", () => {
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
	}, 120_000);

	it("shows labeled limits, remaining capacity, and stable reset times", async () => {
		const context = await browser.newContext({
			viewport: { height: 900, width: 1280 },
		});
		const page = await context.newPage();
		page.setDefaultTimeout(6000);

		try {
			await page.goto(`${handle.url}/internal/specimens`, {
				waitUntil: "load",
			});
			const section = page.getByTestId("usage-panel-example");
			await expectLocator(
				section.getByRole("heading", { name: "Usage limits" })
			).toBeVisible();
			await expectLocator(section.getByRole("meter")).toHaveCount(3);

			const requestLimit = section.getByRole("meter", { name: "Requests" });
			await expectLocator(requestLimit).toHaveAttribute(
				"aria-valuetext",
				"87 of 100 requests used"
			);
			await expectLocator(section).toContainText("13 requests remaining");
			await expectLocator(section).toContainText("Near limit");
			await expectLocator(section).toContainText("9 October 2026 at 16:30 UTC");

			const weeklyLimit = section.getByRole("meter", { name: "All models" });
			await expectLocator(weeklyLimit).toHaveAttribute(
				"aria-valuetext",
				"43,200 of 50,000 credits used"
			);
			await expectLocator(section).toContainText("6,800 credits remaining");
			await expectLocator(section.locator("time")).toHaveCount(2);
			await expectLocator(section.locator("time").nth(1)).toHaveAttribute(
				"dateTime",
				"2026-10-14T16:30:00Z"
			);

			await page.setViewportSize({ height: 900, width: 390 });
			expect(
				await section.evaluate(
					(element) => element.scrollWidth <= element.clientWidth + 1
				)
			).toBe(true);
			await page.setViewportSize({ height: 900, width: 320 });
			expect(
				await section.evaluate(
					(element) => element.scrollWidth <= element.clientWidth + 1
				)
			).toBe(true);
		} finally {
			await context.close();
		}
	});

	it("keeps all limits readable in dark mode with reduced motion", async () => {
		const context = await browser.newContext({
			reducedMotion: "reduce",
			viewport: { height: 900, width: 390 },
		});
		await context.addInitScript(() => {
			window.localStorage.setItem("mizen-theme", "dark");
		});
		const page = await context.newPage();
		page.setDefaultTimeout(6000);

		try {
			await page.goto(`${handle.url}/internal/specimens`, {
				waitUntil: "load",
			});
			const section = page.getByTestId("usage-panel-example");
			await expectLocator(section.getByRole("meter")).toHaveCount(3);
			await expectLocator(section).toContainText("Near limit");
			expect(
				await section.evaluate(
					(element) => element.scrollWidth <= element.clientWidth + 1
				)
			).toBe(true);
		} finally {
			await context.close();
		}
	});
});
