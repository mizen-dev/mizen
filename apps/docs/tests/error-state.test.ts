import { type Browser, chromium, type Locator, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const transparentColor = /transparent|rgba\(0, 0, 0, 0\)/u;
const EXAMPLES = '[aria-label^="Error State: "][aria-label$=" example"]';
const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
let handle: TestServerHandle;
let browser: Browser;
let page: Page;

async function gotoErrorState(width = 1280, height = 900): Promise<void> {
	await page.setViewportSize({ height, width });
	await page.goto(`${handle.url}/components/error-state`, {
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

describe("ErrorState component browser behavior", () => {
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

	it("renders exactly five roots and token-backed slot styles", async () => {
		await gotoErrorState(1280, 900);
		const roots = page.locator(`${EXAMPLES} [data-slot="error-state"]`);
		expect(await roots.count()).toBe(5);

		const rootStyle = await roots
			.first()
			.evaluate((el) => getComputedStyle(el));
		expect(rootStyle.display).toBe("flex");
		expect(rootStyle.alignItems).toBe("center");
		expect(Number.parseFloat(rootStyle.paddingTop)).toBeGreaterThanOrEqual(24);

		const header = roots.first().locator('[data-slot="error-state-header"]');
		const maxW = await header.evaluate((el) =>
			Number.parseFloat(getComputedStyle(el).maxWidth)
		);
		expect(maxW).toBeCloseTo(384, 0);

		const title = roots.first().locator('[data-slot="error-state-title"]');
		const titleColor = await title.evaluate((el) => getComputedStyle(el).color);
		expect(titleColor).not.toMatch(transparentColor);
	});

	it("renders single destructive 36x36 media without card stack or data-variant", async () => {
		await gotoErrorState(1280, 900);
		const medias = page.locator(`${EXAMPLES} [data-slot="error-state-media"]`);
		expect(await medias.count()).toBe(5);

		const hasVariant = await medias.evaluateAll((els) =>
			els.some((el) => el.hasAttribute("data-variant"))
		);
		expect(hasVariant).toBe(false);

		const firstMedia = medias.first();
		expect(await firstMedia.locator("div").count()).toBe(0);
		expect(await firstMedia.getAttribute("aria-hidden")).toBe("true");

		const style = await firstMedia.evaluate((el) => getComputedStyle(el));
		expect(style.borderStyle).toBe("solid");
		expect(Number.parseFloat(style.borderWidth)).toBeGreaterThanOrEqual(1);
		expect(Number.parseFloat(style.width)).toBeCloseTo(36, 0);
		expect(Number.parseFloat(style.height)).toBeCloseTo(36, 0);
		expect(style.backgroundColor).not.toMatch(transparentColor);
		expect(style.borderColor).not.toMatch(transparentColor);
	});

	it("renders neutral roots by default and labelled region only where explicit", async () => {
		await gotoErrorState(1280, 900);
		expect(
			await page
				.locator(`${EXAMPLES} [data-slot="error-state"][role="alert"]`)
				.count()
		).toBe(0);
		expect(
			await page
				.locator(`${EXAMPLES} [data-slot="error-state"][role="status"]`)
				.count()
		).toBe(0);
		expect(
			await page
				.locator(`${EXAMPLES} [data-slot="error-state"][aria-live]`)
				.count()
		).toBe(0);

		const region = page.locator(
			`${EXAMPLES} [data-slot="error-state"][role="region"]`
		);
		expect(await region.count()).toBe(1);
		expect(await region.getAttribute("aria-labelledby")).toBe(
			"cluster-monitor-error"
		);

		const neutralRoots = page.locator(
			`${EXAMPLES} [data-slot="error-state"]:not([role])`
		);
		expect(await neutralRoots.count()).toBe(4);
	});

	it("renders semantic heading levels with continuous h1/h2/h3/h4 outline", async () => {
		await gotoErrorState(1280, 900);
		const defaultTitle = page
			.locator(`${EXAMPLES} [data-slot="error-state-title"]`)
			.first();
		expect(await defaultTitle.evaluate((el) => el.tagName.toLowerCase())).toBe(
			"h3"
		);

		expect(await page.locator(EXAMPLES).count()).toBe(5);

		const h4Title = page.locator(
			`${EXAMPLES} [data-slot="error-state-title"]:has-text("Payment processor unavailable")`
		);
		expect(await h4Title.evaluate((el) => el.tagName.toLowerCase())).toBe("h4");

		const prevTag = await page
			.locator(`${EXAMPLES} [data-slot="error-state"]:has(h4)`)
			.evaluate((el) => el.previousElementSibling?.tagName.toLowerCase());
		expect(prevTag).toBe("h3");
	});

	it("preserves layout bounds across viewports with responsive actions", async () => {
		await gotoErrorState(1280, 900);
		const grid = page
			.locator(
				`${EXAMPLES} [data-slot="error-state-content"] [data-slot="grid"]`
			)
			.first();
		const buttons = grid.locator("button");
		expect(await buttons.count()).toBe(2);

		const [d1, d2] = await Promise.all([
			buttons.first().evaluate((el) => el.getBoundingClientRect()),
			buttons.last().evaluate((el) => el.getBoundingClientRect()),
		]);
		expect(d2.left).toBeGreaterThan(d1.right);

		let [sw, cw] = await page.evaluate(() => [
			document.body.scrollWidth,
			document.body.clientWidth,
		]);
		expect(sw).toBe(cw);

		await gotoErrorState(375, 812);
		const [m1, m2] = await Promise.all([
			buttons.first().evaluate((el) => el.getBoundingClientRect()),
			buttons.last().evaluate((el) => el.getBoundingClientRect()),
		]);
		expect(m2.top - m1.bottom).toBeCloseTo(12, 0);

		[sw, cw] = await page.evaluate(() => [
			document.body.scrollWidth,
			document.body.clientWidth,
		]);
		expect(sw).toBe(cw);
	});

	it("renders scoped dark-theme surface with low lightness", async () => {
		await gotoErrorState(1280, 900);
		await page.goto(`${handle.url}/internal/theme-fixtures`, {
			waitUntil: "networkidle",
		});
		const dark = page.locator('[data-testid="error-state-dark-theme"]');
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

	it("provides readable text contrast >= 4.5:1 on titles and descriptions", async () => {
		await gotoErrorState(1280, 900);
		const textElements = page.locator(
			`${EXAMPLES} [data-slot="error-state-title"], [data-slot="error-state-description"]`
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
});
