import { type Browser, chromium, type Page } from "playwright";
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
let page: Page;

describe("website and workspace navigation", { timeout: 30_000 }, () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage({ viewport: { height: 900, width: 1280 } });
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

	it("opens by keyboard, switches panels, and closes with Escape", async () => {
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		const navigation = page.locator('[data-slot="navigation-menu"]');
		const triggers = navigation.locator(
			'[data-slot="navigation-menu-trigger"]'
		);
		await triggers.first().scrollIntoViewIfNeeded();
		await triggers.first().focus();
		await page.keyboard.press("Enter");
		const popup = page.locator('[data-slot="navigation-menu-popup"]');
		await expectLocator(popup).toBeVisible();
		await expectLocator(popup.getByRole("link")).toHaveCount(2);
		await page.keyboard.press("Tab");
		await expectLocator(popup.getByRole("link").first()).toBeFocused();
		await page.keyboard.press("Escape");
		await expectLocator(popup).not.toBeVisible();
		await expectLocator(triggers.first()).toBeFocused();
		await page.keyboard.press("ArrowRight");
		await expectLocator(triggers.last()).toBeFocused();
		await triggers.last().hover();
		await expectLocator(popup).toBeVisible();
		await expectLocator(popup.getByRole("link")).toHaveCount(2);
		await expectLocator(popup.getByRole("link").first()).toHaveAttribute(
			"href",
			"/components/field"
		);
		await popup.getByRole("link").first().click();
		await expectLocator(page).toHaveURL(`${handle.url}/docs/components/field`);
	});

	for (const theme of ["light", "dark"] as const) {
		it(`fits enlarged ${theme} navigation on narrow screens`, async () => {
			await page.setViewportSize({ height: 900, width: 390 });
			await page.emulateMedia({ reducedMotion: "reduce" });
			await page.addInitScript(
				(preference) => localStorage.setItem("mizen-theme", preference),
				theme
			);
			await page.goto(`${handle.url}/internal/specimens`, {
				waitUntil: "networkidle",
			});
			await page.addStyleTag({
				content:
					"html {font-size:32px !important} * {line-height:1.5 !important;letter-spacing:0.12em !important;word-spacing:0.16em !important}",
			});
			await page
				.locator('[data-slot="navigation-menu-trigger"]')
				.first()
				.click();
			const popup = page.locator('[data-slot="navigation-menu-popup"]');
			await expectLocator(popup).toBeVisible();
			const bounds = await popup.boundingBox();
			expect(bounds?.x).toBeGreaterThanOrEqual(0);
			expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(390);
			expect(
				await page.evaluate(
					() => document.documentElement.scrollWidth <= innerWidth
				)
			).toBe(true);
			expect(
				await popup.evaluate(
					(element) => getComputedStyle(element).transitionDuration
				)
			).toBe("0s");
			await popup.screenshot({
				path: `/private/tmp/mizen-site-navigation-${theme}.png`,
			});
		});
	}
});
