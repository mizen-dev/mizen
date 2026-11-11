import { type Browser, chromium, type Page } from "playwright";
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
let page: Page;

describe("Data systems compositions", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage({ viewport: { height: 900, width: 1280 } });
		page.setDefaultTimeout(8000);
		page.on("pageerror", (error) => errors.push(error.message));
		page.on("console", (message) => {
			if (message.type() === "error") {
				errors.push(message.text());
			}
		});
	}, 120_000);
	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
		expect(errors).toEqual([]);
	});

	it("keeps metadata pairs and event timestamps native", async () => {
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		const metadata = page.getByTestId("metadata-example").locator("dl");
		await expectLocator(metadata.locator("dt")).toHaveCount(3);
		await expectLocator(metadata.locator("dd")).toHaveCount(3);
		const feed = page.getByRole("list", { name: "Release activity" });
		expect(await feed.evaluate((element) => element.tagName)).toBe("OL");
		await expectLocator(feed.locator("time[datetime]")).toHaveCount(3);
		expect(
			await feed
				.locator("time")
				.evaluateAll((elements) =>
					elements.every((element) =>
						Number.isFinite(Date.parse(element.getAttribute("datetime") ?? ""))
					)
				)
		).toBe(true);
	});

	it("reveals overflow items and restores keyboard focus on dismissal", async () => {
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		const section = page.getByTestId("overflow-example");
		await expectLocator(section.getByText("Sam Jordan")).toHaveCount(0);
		const trigger = section.getByRole("button", {
			name: "More contributors (2)",
		});
		await trigger.focus();
		await page.keyboard.press("Enter");
		const popup = page.getByRole("dialog", { name: "More contributors" });
		await expectLocator(popup.getByText("Sam Jordan")).toBeVisible();
		await expectLocator(popup.getByText("Rin Tanaka")).toBeVisible();
		await page.keyboard.press("Escape");
		await expectLocator(popup).toBeHidden();
		await expectLocator(trigger).toBeFocused();
	});

	describe.each(["light", "dark"] as const)("%s theme", (theme) => {
		it(`keeps ${theme} content readable at narrow widths and enlarged text`, async () => {
			await page.setViewportSize({ height: 900, width: 1280 });
			await page.addInitScript(
				(preference) => localStorage.setItem("mizen-theme", preference),
				theme
			);
			await page.goto(`${handle.url}/internal/specimens`, {
				waitUntil: "networkidle",
			});
			await page.getByTestId("activity-example").screenshot({
				caret: "initial",
				path: `/private/tmp/mizen-activity-${theme}.png`,
			});
			await page.setViewportSize({ height: 900, width: 390 });
			await page.addStyleTag({
				content:
					"html {font-size:32px !important} * {line-height:1.5 !important;letter-spacing:0.12em !important;word-spacing:0.16em !important}",
			});
			const sections = page.locator(
				'[data-testid="metadata-example"], [data-testid="tree-example"], [data-testid="overflow-example"], [data-testid="activity-example"]'
			);
			expect(
				await sections.evaluateAll((elements) =>
					elements.every(
						(element) => element.scrollWidth <= element.clientWidth + 1
					)
				)
			).toBe(true);
			await expectLocator(
				page.getByRole("button", { name: "More contributors (2)" })
			).toBeVisible();
			await expectLocator(
				page.getByRole("tree", { exact: true, name: "Workspace files" })
			).toBeVisible();
		});
	});
});
