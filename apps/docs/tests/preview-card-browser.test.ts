import { type Browser, chromium, type Page } from "playwright";
import { expect as expectLocator } from "playwright/test";
import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from "vitest";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
let handle: TestServerHandle;
let browser: Browser;
let page: Page;
const errors: string[] = [];

describe("Preview Card browser states", { timeout: 20_000 }, () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		page.setDefaultTimeout(8000);
		page.on("pageerror", (error) => errors.push(error.message));
		page.on("console", (message) => {
			if (message.type() === "error") {
				errors.push(message.text());
			}
		});
	}, 120_000);
	beforeEach(async () => {
		errors.length = 0;
		await page.setViewportSize({ height: 900, width: 1280 });
		await page.goto(`${handle.url}/components/preview-card`, {
			waitUntil: "networkidle",
		});
	});
	afterEach(() => expect(errors).toEqual([]));
	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
	});

	it.each(["light", "dark"] as const)(
		"keeps hover content readable and reachable in %s",
		async (theme) => {
			await page.emulateMedia({
				colorScheme: theme,
				reducedMotion: "no-preference",
			});
			const link = page.locator(
				'[data-slot="preview-card-trigger"][href="/team/alex-morgan"]'
			);
			await link.hover();
			const popup = page.locator(
				'[data-slot="preview-card-content"][data-open]'
			);
			await popup.waitFor({ state: "visible" });
			await expect
				.poll(() => popup.evaluate((el) => getComputedStyle(el).opacity))
				.toBe("1");
			const heading = popup.getByRole("heading", {
				includeHidden: true,
				name: "Alex Morgan",
			});
			expect(
				await heading.evaluate((el) => getComputedStyle(el).fontSize)
			).toBe("20px");
			const paragraphs = popup.locator("p");
			expect(
				await paragraphs.last().evaluate((el) => getComputedStyle(el).fontSize)
			).toBe("14px");
			expect(await popup.evaluate((el) => getComputedStyle(el).padding)).toBe(
				"24px"
			);
			const box = await popup.boundingBox();
			const linkBox = await link.boundingBox();
			expect(box && linkBox && box.y >= linkBox.y + linkBox.height).toBe(true);
			await popup.hover();
			expect(await popup.isVisible()).toBe(true);
			await popup.screenshot({
				path: `/private/tmp/mizen-preview-card-${theme}.png`,
			});
			await page.mouse.move(0, 0);
			await popup.waitFor({ state: "detached" });
		}
	);

	it.each(["light", "dark"] as const)(
		"preserves link navigation and keyboard dismissal in %s",
		async (theme) => {
			await page.emulateMedia({ colorScheme: theme });
			const link = page.getByRole("link", {
				exact: true,
				name: "Card composition",
			});
			await link.focus();
			const popup = page.locator(
				'[data-slot="preview-card-content"][data-open]'
			);
			await popup.waitFor({ state: "visible" });
			expect(await link.getAttribute("href")).toBe("/components/card");
			expect(await link.evaluate((el) => document.activeElement === el)).toBe(
				true
			);
			await page.keyboard.press("Escape");
			await popup.waitFor({ state: "detached" });
			await page.keyboard.press("Enter");
			await page.waitForURL("**/docs/components/card");
		}
	);

	it.each(["light", "dark"] as const)(
		"forwards native callbacks and keepMounted with reduced motion in %s",
		async (theme) => {
			await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
			await page.setViewportSize({ height: 800, width: 390 });
			const link = page.getByRole("link", {
				exact: true,
				name: "Preview Card documentation",
			});
			await link.scrollIntoViewIfNeeded();
			await link.focus();
			const popup = page.locator('article[data-slot="preview-card-content"]');
			await popup.waitFor({ state: "visible" });
			await expectLocator(popup).toHaveAttribute("data-open", "");
			expect(
				await popup.evaluate((el) => getComputedStyle(el).transitionDuration)
			).toBe("0s");
			const box = await popup.boundingBox();
			expect(box?.x).toBeGreaterThanOrEqual(0);
			expect(box ? box.x + box.width : 1000).toBeLessThanOrEqual(390);
			await popup.screenshot({
				path: `/private/tmp/mizen-preview-card-narrow-${theme}.png`,
			});
			await page.keyboard.press("Escape");
			await popup.waitFor({ state: "hidden" });
			await expectLocator(popup).toHaveAttribute("data-closed", "");
			expect(await popup.count()).toBe(1);
		}
	);
});
