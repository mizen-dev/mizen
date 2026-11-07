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

describe("part-to-whole composition", () => {
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

	for (const theme of ["light", "dark"] as const) {
		it(`keeps labeled shares and keyboard tooltips in ${theme} mode`, async () => {
			const context = await browser.newContext({
				viewport: { height: 900, width: 1280 },
			});
			await context.addInitScript((preference) => {
				window.localStorage.setItem("mizen-theme", preference);
			}, theme);
			const page = await context.newPage();
			page.setDefaultTimeout(6000);
			page.on("pageerror", (error) => errors.push(error.message));
			page.on("console", (message) => {
				if (message.type() === "error") {
					errors.push(message.text());
				}
			});
			try {
				// Hydration replaces the server-rendered chart, so wait for it before focusing.
				await page.goto(`${handle.url}/internal/specimens`, {
					waitUntil: "networkidle",
				});
				const section = page.getByTestId("part-to-whole-example");
				const chart = section.getByRole("img", {
					exact: true,
					name: "Quarterly budget allocation",
				});
				const legend = section.getByRole("list", {
					name: "Quarterly budget allocation parts",
				});
				await expectLocator(chart).toBeVisible();
				await expectLocator(legend).toContainText("Payroll");
				await expectLocator(legend).toContainText("Reserve");
				await section.screenshot({
					caret: "initial",
					path: `/private/tmp/mizen-part-to-whole-${theme}.png`,
				});

				const arcs = chart.locator('[data-ts-key^="part-to-whole-arcs:"]');
				await expectLocator(arcs).toHaveCount(5);
				await chart.scrollIntoViewIfNeeded();
				await chart.focus();
				await expectLocator(chart).toBeFocused();
				await page.keyboard.press("Home");
				const tooltip = page.locator('[data-slot="chart-tooltip"]');
				await expectLocator(tooltip).toContainText("Payroll");
				await expectLocator(tooltip).toContainText("$52,000 · 52%");
				await page.keyboard.press("ArrowRight");
				await expectLocator(tooltip).toContainText("Infrastructure");
				await expectLocator(tooltip).toContainText("$21,000 · 21%");
				await page.screenshot({
					caret: "initial",
					path: `/private/tmp/mizen-part-to-whole-tooltip-${theme}.png`,
				});
			} finally {
				await context.close();
			}
		}, 30_000);
	}
});
