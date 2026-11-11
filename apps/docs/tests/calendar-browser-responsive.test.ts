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

function throwTeardownFailures(
	results: readonly PromiseSettledResult<unknown>[]
): void {
	const failures = results
		.filter((r): r is PromiseRejectedResult => r.status === "rejected")
		.map(({ reason }) => reason);
	if (failures.length === 1) {
		throw failures[0];
	}
	if (failures.length > 1) {
		throw new AggregateError(
			failures,
			"Calendar responsive browser teardown failed"
		);
	}
}

describe("Calendar 320px responsive browser regression", {
	timeout: 20_000,
}, () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		page.setDefaultTimeout(8000);
	}, 120_000);

	afterAll(async () => {
		const results = await Promise.allSettled([
			Promise.resolve().then(() => browser?.close()),
			Promise.resolve().then(() => teardownTestServer(handle)),
		]);
		throwTeardownFailures(results);
	}, 120_000);

	it("proves docs page has no horizontal overflow at 320px viewport", async () => {
		await page.setViewportSize({ height: 640, width: 320 });
		await page.goto(`${handle.url}/components/calendar`, {
			waitUntil: "networkidle",
		});

		const overflowCheck = await page.evaluate(() => {
			const { body, documentElement: docElement } = document;
			const scrollWidth = Math.max(docElement.scrollWidth, body.scrollWidth);
			return {
				clientWidth: window.innerWidth,
				hasHorizontalOverflow: scrollWidth > window.innerWidth,
				scrollWidth,
			};
		});

		expect(overflowCheck.hasHorizontalOverflow).toBe(false);
		expect(overflowCheck.scrollWidth).toBeLessThanOrEqual(320);
	});

	it("proves calendar fits inside specimen panel and date targets are at least 32x32px", async () => {
		await page.setViewportSize({ height: 640, width: 320 });
		await page.goto(`${handle.url}/components/calendar`, {
			waitUntil: "networkidle",
		});

		const singleCalendar = page.locator(
			'[data-testid="calendar-single"] [data-slot="calendar"]'
		);
		await singleCalendar.waitFor({ state: "visible" });
		const singlePanel = page
			.locator('[data-testid="calendar-single"]')
			.locator("..");

		const singlePanelBox = await singlePanel.boundingBox();
		const singleCalendarBox = await singleCalendar.boundingBox();

		expect(singlePanelBox).not.toBeNull();
		expect(singleCalendarBox).not.toBeNull();
		expect(
			(singleCalendarBox?.x ?? 0) + (singleCalendarBox?.width ?? 0)
		).toBeLessThanOrEqual(
			(singlePanelBox?.x ?? 0) + (singlePanelBox?.width ?? 0)
		);

		const targetDimensions = await page.evaluate(() => {
			const buttons = Array.from(
				document.querySelectorAll('[data-testid="calendar-single"] button')
			).filter((b) => {
				const text = b.textContent?.trim();
				return text !== "" && !Number.isNaN(Number(text));
			});
			return buttons.map((b) => {
				const rect = b.getBoundingClientRect();
				return { height: rect.height, width: rect.width };
			});
		});

		expect(targetDimensions.length).toBeGreaterThan(0);
		for (const dim of targetDimensions) {
			expect(dim.width).toBeGreaterThanOrEqual(32);
			expect(dim.height).toBeGreaterThanOrEqual(32);
		}
	});

	it("contains a large-text calendar and scrolls its focused day into view", async () => {
		await page.setViewportSize({ height: 900, width: 375 });
		await page.goto(`${handle.url}/components/calendar`, {
			waitUntil: "networkidle",
		});
		await page.evaluate(() => {
			document.documentElement.style.fontSize = "200%";
		});

		const calendar = page
			.locator('[data-testid="calendar-single"] [data-slot="calendar"]')
			.first();
		const firstDay = calendar.locator('[role="grid"] button').first();
		const lastDay = calendar.locator('[role="grid"] button').last();
		const focusIsVisible = () =>
			page.evaluate(() => {
				const button = document.activeElement;
				const root = button?.closest('[data-slot="calendar"]');
				if (!(button instanceof HTMLElement && root instanceof HTMLElement)) {
					return false;
				}
				const buttonRect = button.getBoundingClientRect();
				const rootRect = root.getBoundingClientRect();
				const styles = getComputedStyle(button);
				const focusExtent =
					Number.parseFloat(styles.outlineWidth) +
					Number.parseFloat(styles.outlineOffset);
				return (
					buttonRect.left - focusExtent >= rootRect.left &&
					buttonRect.right + focusExtent <= rootRect.right
				);
			});

		await firstDay.focus();
		const firstDayFocusIsVisible = await focusIsVisible();
		await lastDay.focus();
		const lastDayFocusIsVisible = await focusIsVisible();

		const layout = await page.evaluate(() => {
			const root = document.querySelector(
				'[data-testid="calendar-single"] [data-slot="calendar"]'
			);
			return {
				documentWidth: document.documentElement.scrollWidth,
				rootClientWidth: root?.clientWidth ?? 0,
				rootScrollLeft: root?.scrollLeft ?? 0,
				rootScrollWidth: root?.scrollWidth ?? 0,
			};
		});

		expect(layout.documentWidth).toBeLessThanOrEqual(375);
		expect(layout.rootScrollWidth).toBeGreaterThan(layout.rootClientWidth);
		expect(layout.rootScrollLeft).toBeGreaterThan(0);
		expect(firstDayFocusIsVisible).toBe(true);
		expect(lastDayFocusIsVisible).toBe(true);
	});

	it("verifies single and range calendars receive distinct contextual accessible names in specimen", async () => {
		await page.goto(`${handle.url}/components/calendar`, {
			waitUntil: "networkidle",
		});

		const singleGrid = page.locator(
			'[data-testid="calendar-single"] table[role="grid"]'
		);
		const rangeGrid = page.locator(
			'[data-testid="calendar-range"] table[role="grid"]'
		);

		await singleGrid.waitFor({ state: "visible" });
		await rangeGrid.waitFor({ state: "visible" });

		const singleAriaLabel = await singleGrid.getAttribute("aria-label");
		const rangeAriaLabel = await rangeGrid.getAttribute("aria-label");

		expect(singleAriaLabel).toContain("Single date");
		expect(rangeAriaLabel).toContain("Date range");
		expect(singleAriaLabel).not.toBe(rangeAriaLabel);
	});
});
