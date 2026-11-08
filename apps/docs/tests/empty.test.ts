import { type Browser, chromium, type Locator, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const transparentColor = /transparent|rgba\(0, 0, 0, 0\)/u;
const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
let handle: TestServerHandle;
let browser: Browser;
let page: Page;

async function gotoEmpty(width = 1280, height = 900): Promise<void> {
	await page.setViewportSize({ height, width });
	await page.goto(`${handle.url}/components/empty`, {
		waitUntil: "networkidle",
	});
}

function measureTextContrast(locator: Locator): Promise<number> {
	return locator.evaluate((node) => {
		const canvas = document.createElement("canvas");
		canvas.width = 1;
		canvas.height = 1;
		const ctx = canvas.getContext("2d");
		if (!ctx) {
			throw new Error("No canvas");
		}

		const readLum = (color: string) => {
			ctx.clearRect(0, 0, 1, 1);
			ctx.fillStyle = color;
			ctx.fillRect(0, 0, 1, 1);
			const [r = 0, g = 0, b = 0] = ctx.getImageData(0, 0, 1, 1).data;
			const lin = (c: number) =>
				c / 255 <= 0.039_28
					? c / 255 / 12.92
					: ((c / 255 + 0.055) / 1.055) ** 2.4;
			return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
		};
		let current: Element | null = node;
		let bgLum = readLum("rgb(255, 255, 255)");
		while (current) {
			const bg = getComputedStyle(current).backgroundColor;
			if (bg && !bg.includes("rgba(0, 0, 0, 0)") && bg !== "transparent") {
				bgLum = readLum(bg);
				break;
			}
			current = current.parentElement;
		}
		const fg = readLum(getComputedStyle(node).color);
		return (Math.max(fg, bgLum) + 0.05) / (Math.min(fg, bgLum) + 0.05);
	});
}

describe("Empty component browser behavior", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		page.setDefaultTimeout(6000);
	}, 120_000);

	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
	}, 120_000);

	it("renders all slots and variants with token-backed styles", async () => {
		await gotoEmpty(1280, 900);
		const empties = page.locator('[data-slot="empty"]');
		expect(await empties.count()).toBeGreaterThanOrEqual(4);

		const root = await empties.first().evaluate((el) => getComputedStyle(el));
		expect(root.display).toBe("flex");
		expect(root.alignItems).toBe("center");
		expect(Number.parseFloat(root.paddingTop)).toBeGreaterThanOrEqual(24);

		const header = empties.first().locator('[data-slot="empty-header"]');
		const maxW = await header.evaluate((el) =>
			Number.parseFloat(getComputedStyle(el).maxWidth)
		);
		expect(maxW).toBeCloseTo(384, 0);

		const title = empties.first().locator('[data-slot="empty-title"]');
		const titleColor = await title.evaluate((el) => getComputedStyle(el).color);
		expect(titleColor).not.toMatch(transparentColor);
	});

	it("renders decorative icon card stack with shared dimensions and transforms", async () => {
		await gotoEmpty(1280, 900);
		const iconMedia = page
			.locator('[data-slot="empty-media"][data-variant="icon"]')
			.first();
		const cards = iconMedia.locator("div");
		expect(await cards.count()).toBe(3);
		expect(await iconMedia.locator('div[aria-hidden="true"]').count()).toBe(2);

		const card = await cards.last().evaluate((el) => getComputedStyle(el));
		expect(card.borderStyle).toBe("solid");
		expect(Number.parseFloat(card.borderWidth)).toBeGreaterThanOrEqual(1);
		expect(Number.parseFloat(card.width)).toBeCloseTo(36, 0);
		expect(Number.parseFloat(card.height)).toBeCloseTo(36, 0);

		const defaultMedia = page
			.locator('[data-slot="empty-media"][data-variant="default"]')
			.first();
		expect(await defaultMedia.getAttribute("aria-hidden")).toBe("false");
		const statusDot = defaultMedia.locator('[data-slot="status-dot"]');
		expect(await statusDot.getAttribute("aria-hidden")).toBe("true");
	});

	it("renders semantic heading levels and accessible dynamic status attributes", async () => {
		await gotoEmpty(1280, 900);
		const defaultTitle = page.locator('[data-slot="empty-title"]').first();
		expect(await defaultTitle.evaluate((el) => el.tagName.toLowerCase())).toBe(
			"h3"
		);

		const examples = page.locator(
			'[aria-label^="Empty: "][aria-label$=" example"]'
		);
		expect(await examples.count()).toBe(5);

		const statusEmpty = page.locator(
			'[data-slot="empty"][role="status"][aria-live="polite"]'
		);
		expect(await statusEmpty.count()).toBeGreaterThan(0);

		const statusTitle = statusEmpty.locator('[data-slot="empty-title"]');
		expect(await statusTitle.evaluate((el) => el.tagName.toLowerCase())).toBe(
			"h4"
		);

		const predecessorTag = await statusEmpty.evaluate((el) =>
			el.previousElementSibling?.tagName.toLowerCase()
		);
		expect(predecessorTag).toBe("h3");
	});

	it("preserves layout bounds across viewports without horizontal overflow", async () => {
		await gotoEmpty(1280, 900);
		let [sw, cw] = await page.evaluate(() => [
			document.body.scrollWidth,
			document.body.clientWidth,
		]);
		expect(sw).toBe(cw);

		await gotoEmpty(375, 812);
		[sw, cw] = await page.evaluate(() => [
			document.body.scrollWidth,
			document.body.clientWidth,
		]);
		expect(sw).toBe(cw);

		const widths = await page
			.locator('[data-slot="empty-content"]')
			.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().width));
		for (const w of widths) {
			expect(w).toBeLessThanOrEqual(375);
		}
	});

	it("renders scoped dark-theme surface with low lightness", async () => {
		await gotoEmpty(1280, 900);
		await page.goto(`${handle.url}/internal/theme-fixtures`, {
			waitUntil: "networkidle",
		});
		const dark = page.locator('[data-testid="empty-dark-theme"]');
		expect(await dark.count()).toBe(1);

		const bg = await dark.evaluate(
			(el) => getComputedStyle(el).backgroundColor
		);
		expect(bg).not.toMatch(transparentColor);

		const isDark = await dark.evaluate((el) => {
			const canvas = document.createElement("canvas");
			canvas.width = 1;
			canvas.height = 1;
			const ctx = canvas.getContext("2d");
			if (!ctx) {
				return false;
			}
			ctx.fillStyle = getComputedStyle(el).backgroundColor;
			ctx.fillRect(0, 0, 1, 1);
			const [r = 0, g = 0, b = 0] = ctx.getImageData(0, 0, 1, 1).data;
			return 0.2126 * r + 0.7152 * g + 0.0722 * b < 128;
		});
		expect(isDark).toBe(true);
	});

	it("provides readable text contrast >= 4.5:1 on empty state titles and descriptions", async () => {
		await gotoEmpty(1280, 900);
		const textElements = page.locator(
			'[data-slot="empty-title"], [data-slot="empty-description"]'
		);
		const count = await textElements.count();
		expect(count).toBeGreaterThan(0);

		const contrastValues = await Promise.all(
			Array.from({ length: count }, (_, i) =>
				measureTextContrast(textElements.nth(i))
			)
		);
		for (const contrast of contrastValues) {
			expect(contrast).toBeGreaterThanOrEqual(4.5);
		}
	});

	it("supports multiple actions composed with layout primitives and wraps vertically at 375px", async () => {
		await gotoEmpty(1280, 900);
		const composedEmpty = page
			.locator(
				'[data-slot="empty"]:has([data-slot="empty-content"] button + button)'
			)
			.first();
		const buttons = composedEmpty.locator('[data-slot="empty-content"] button');
		expect(await buttons.count()).toBe(2);

		const [btn1Rect, btn2Rect] = await Promise.all([
			buttons.first().evaluate((el) => el.getBoundingClientRect()),
			buttons.last().evaluate((el) => el.getBoundingClientRect()),
		]);
		expect(btn2Rect.left).toBeGreaterThan(btn1Rect.right);

		await gotoEmpty(375, 812);
		const mobileEmpty = page
			.locator(
				'[data-slot="empty"]:has([data-slot="empty-content"] button + button)'
			)
			.first();
		const mobileButtons = mobileEmpty.locator(
			'[data-slot="empty-content"] button'
		);
		const [m1, m2] = await Promise.all([
			mobileButtons.nth(0).evaluate((el) => el.getBoundingClientRect()),
			mobileButtons.nth(1).evaluate((el) => el.getBoundingClientRect()),
		]);
		expect(m2.top - m1.bottom).toBeCloseTo(12, 0);

		const overflow = await page.evaluate(() => [
			document.body.scrollWidth,
			document.body.clientWidth,
		]);
		expect(overflow[0]).toBe(overflow[1]);
	});
});
