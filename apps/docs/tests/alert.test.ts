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

function throwTeardownFailures(
	results: readonly PromiseSettledResult<unknown>[]
): void {
	const failures = results
		.filter((r): r is PromiseRejectedResult => r.status === "rejected")
		.map((r) => r.reason);
	if (failures.length > 0) {
		throw new AggregateError(failures, "Failed to tear down alert test");
	}
}

async function gotoAlert(width = 1280, height = 900): Promise<void> {
	await page.setViewportSize({ height, width });
	await page.goto(`${handle.url}/components/alert`, {
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
			throw new Error("Canvas 2D context unavailable");
		}

		const readRgb = (color: string) => {
			ctx.clearRect(0, 0, 1, 1);
			ctx.fillStyle = color;
			ctx.fillRect(0, 0, 1, 1);
			const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
			return [r ?? 0, g ?? 0, b ?? 0] as const;
		};
		const lum = ([r, g, b]: readonly [number, number, number]) => {
			const lin = (c: number) => {
				const s = c / 255;
				return s <= 0.039_28 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
			};
			return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
		};
		const comp = getComputedStyle(node);
		const parentComp = getComputedStyle(
			node.closest('[data-slot="alert"]') ?? node
		);
		const fg = lum(readRgb(comp.color));
		const bg = lum(readRgb(parentComp.backgroundColor));
		return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
	});
}

describe("Alert component browser behavior", () => {
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
		const results = await Promise.allSettled([
			Promise.resolve().then(() => browser?.close()),
			Promise.resolve().then(() => teardownTestServer(handle)),
		]);
		throwTeardownFailures(results);
	}, 120_000);

	it("renders route with non-transparent token-backed background, border, and text for all five variants", async () => {
		await gotoAlert(1280, 900);
		const variants = [
			"default",
			"info",
			"success",
			"warning",
			"error",
		] as const;

		const stylesList = await Promise.all(
			variants.map(async (variant) => {
				const alert = page
					.locator(`[data-slot="alert"][data-variant="${variant}"]`)
					.first();
				expect(await alert.count()).toBeGreaterThan(0);
				return alert.evaluate((el) => {
					const c = getComputedStyle(el);
					return {
						bc: c.borderColor,
						bg: c.backgroundColor,
						bs: c.borderStyle,
						bw: c.borderWidth,
						fg: c.color,
					};
				});
			})
		);

		for (const s of stylesList) {
			expect(s.bg).not.toMatch(transparentColor);
			expect(s.bc).not.toMatch(transparentColor);
			expect(s.fg).not.toMatch(transparentColor);
			expect(s.bs).toBe("solid");
			expect(Number.parseFloat(s.bw)).toBeGreaterThanOrEqual(1);
		}
	});

	it("provides readable text contrast >= 4.5:1 for rendered alert variants", async () => {
		await gotoAlert(1280, 900);
		const titles = page.locator('[data-slot="alert-title"]');
		const count = await titles.count();
		expect(count).toBeGreaterThan(0);

		const contrastValues = await Promise.all(
			Array.from({ length: count }, (_, i) =>
				measureTextContrast(titles.nth(i))
			)
		);
		for (const contrast of contrastValues) {
			expect(contrast).toBeGreaterThanOrEqual(4.5);
		}

		const errorIcon = page
			.locator(
				'[data-slot="alert"][data-variant="error"] [data-slot="alert-icon"]'
			)
			.first();
		const errorIconColor = await errorIcon.evaluate(
			(el) => getComputedStyle(el).color
		);
		expect(errorIconColor).not.toMatch(transparentColor);
	});

	it("places action on the right on desktop, wraps with gap on 375px mobile, and avoids overflow", async () => {
		await gotoAlert(1280, 900);
		const actionAlert = page
			.locator('[data-slot="alert"]:has([data-slot="alert-action"])')
			.first();
		const title = actionAlert.locator('[data-slot="alert-title"]');
		const action = actionAlert.locator('[data-slot="alert-action"]');

		const actionStyles = await action.evaluate((el) => {
			const c = getComputedStyle(el);
			return { flexWrap: c.flexWrap, gap: c.gap };
		});
		expect(actionStyles.flexWrap).toBe("wrap");
		expect(Number.parseFloat(actionStyles.gap)).toBeCloseTo(8, 0);

		const [titleRect, actionRect] = await Promise.all([
			title.evaluate((el) => el.getBoundingClientRect()),
			action.evaluate((el) => el.getBoundingClientRect()),
		]);
		expect(actionRect.left).toBeGreaterThan(titleRect.right);

		await gotoAlert(375, 812);
		const mobileAlert = page
			.locator('[data-slot="alert"]:has([data-slot="alert-action"])')
			.first();
		const mobileDesc = mobileAlert.locator('[data-slot="alert-description"]');
		const mobileAction = mobileAlert.locator('[data-slot="alert-action"]');

		const [descBounds, actionBounds] = await Promise.all([
			mobileDesc.evaluate((el) => el.getBoundingClientRect()),
			mobileAction.evaluate((el) => el.getBoundingClientRect()),
		]);
		expect(actionBounds.top).toBeGreaterThanOrEqual(descBounds.bottom - 1);

		const buttons = mobileAlert.locator('[data-slot="alert-action"] button');
		expect(await buttons.count()).toBeGreaterThanOrEqual(2);

		const overflow = await page.evaluate(() => [
			document.body.scrollWidth,
			document.body.clientWidth,
		]);
		expect(overflow[0]).toBe(overflow[1]);
	});

	it("aligns iconless alert title flush with container padding", async () => {
		await gotoAlert(1280, 900);
		const iconless = page
			.locator('[data-slot="alert"]:not(:has([data-slot="alert-icon"]))')
			.first();
		const withIcon = page
			.locator('[data-slot="alert"]:has([data-slot="alert-icon"])')
			.first();

		const iconlessOffset = await iconless.evaluate((el) => {
			const aRect = el.getBoundingClientRect();
			const tEl = el.querySelector('[data-slot="alert-title"]');
			if (!tEl) {
				throw new Error("No title in iconless alert");
			}
			const tRect = tEl.getBoundingClientRect();
			const c = getComputedStyle(el);
			return {
				expected:
					Number.parseFloat(c.paddingLeft) +
					Number.parseFloat(c.borderLeftWidth),
				relative: tRect.left - aRect.left,
			};
		});

		const withIconOffset = await withIcon.evaluate((el) => {
			const aRect = el.getBoundingClientRect();
			const tEl = el.querySelector('[data-slot="alert-title"]');
			if (!tEl) {
				throw new Error("No title in alert with icon");
			}
			return tEl.getBoundingClientRect().left - aRect.left;
		});

		expect(iconlessOffset.relative).toBeCloseTo(iconlessOffset.expected, 0);
		expect(withIconOffset).toBeGreaterThan(iconlessOffset.relative + 10);
	});

	it("aligns description-only alert flush at top container padding without ghost gap", async () => {
		await gotoAlert(1280, 900);
		const descOnly = page
			.locator('[data-slot="alert"]:not(:has([data-slot="alert-title"]))')
			.first();
		const offset = await descOnly.evaluate((el) => {
			const aRect = el.getBoundingClientRect();
			const dEl = el.querySelector('[data-slot="alert-description"]');
			if (!dEl) {
				throw new Error("No description in desc-only alert");
			}
			const dRect = dEl.getBoundingClientRect();
			const c = getComputedStyle(el);
			return {
				expected:
					Number.parseFloat(c.paddingTop) + Number.parseFloat(c.borderTopWidth),
				relative: dRect.top - aRect.top,
			};
		});

		expect(offset.relative).toBeCloseTo(offset.expected, 0);
	});
});
