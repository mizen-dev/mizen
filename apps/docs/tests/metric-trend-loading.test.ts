import { type Browser, chromium, type Page } from "playwright";
import { expect as expectLocator } from "playwright/test";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
let handle: TestServerHandle;
let browser: Browser;
let page: Page;

describe("MetricTrend loading", { timeout: 30_000 }, () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
	}, 120_000);

	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
	});

	// The value is 28px on a wide screen and 20px on a phone.
	it.each([1280, 390])(
		"keeps the height of the loaded card in a %ipx window",
		async (width) => {
			await page.setViewportSize({ height: 900, width });
			await page.goto(`${handle.url}/components/metric-trend`, {
				waitUntil: "networkidle",
			});
			const example = page.locator('section[aria-label$=": Loading example"]');
			const cards = example.locator('[data-slot="metric-trend"]');
			const heights = () =>
				cards.evaluateAll((elements) =>
					elements.map((element) => element.getBoundingClientRect().height)
				);
			await expectLocator(cards).toHaveCount(3);
			await expectLocator(example.locator('[aria-busy="true"]')).toHaveCount(3);
			await expectLocator(
				example.locator('[data-slot$="-placeholder"]')
			).toHaveCount(8);
			await expectLocator(
				example.getByText("Income", { exact: true })
			).toBeVisible();
			const loading = await heights();
			await example.getByRole("button", { name: "Show the data" }).click();
			await expectLocator(example.locator("[aria-busy]")).toHaveCount(0);
			await expectLocator(example.getByText("18,420")).toBeVisible();
			expect(await heights()).toEqual(loading);
		}
	);
});
