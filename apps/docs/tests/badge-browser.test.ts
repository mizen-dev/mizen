import { type Browser, chromium, type Page } from "playwright";
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

describe("Badge browser layout", { timeout: 20_000 }, () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage({ viewport: { height: 900, width: 1280 } });
		page.setDefaultTimeout(8000);
	}, 120_000);
	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
	});

	it("keeps its own width inside a Stack", async () => {
		await page.goto(`${handle.url}/components/segmented-control`, {
			waitUntil: "networkidle",
		});
		await page
			.getByRole("button", { exact: true, name: "Board" })
			.first()
			.click();
		const badge = page
			.locator('[data-slot="stack"] > [data-slot="badge"]')
			.filter({ hasText: "In progress" })
			.first();
		const widths = await badge.evaluate((element) => ({
			badge: element.getBoundingClientRect().width,
			stack: element.parentElement?.getBoundingClientRect().width ?? 0,
		}));
		expect(widths.badge).toBeLessThan(widths.stack);
	});
});
