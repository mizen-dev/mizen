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
const viewportSelector = '[data-slot="scroll-area-viewport"]';
const scrollbarSelector = '[data-slot="scroll-area-scrollbar"]';
const thumbSelector = '[data-slot="scroll-area-thumb"]';

function area(name: string) {
	return page.locator(`[data-slot="scroll-area"][aria-label="${name}"]`);
}

describe("Scroll Area review", { timeout: 30_000 }, () => {
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

	it.each(["light", "dark"] as const)(
		"supports vertical scrolling, drag, focus, and fades in %s",
		async (theme) => {
			await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
			await page.goto(`${handle.url}/components/scroll-area`, {
				waitUntil: "networkidle",
			});
			// The first variant keeps the bounded audit list these checks measure.
			const root = area("Audit entries");
			const viewport = root.locator(viewportSelector);
			await viewport.waitFor();
			const size = await viewport.evaluate((el) => ({
				height: el.clientHeight,
				scrollHeight: el.scrollHeight,
				scrollWidth: el.scrollWidth,
				width: el.clientWidth,
			}));
			expect(size.width).toBeLessThanOrEqual(384);
			expect(size.scrollWidth).toBe(size.width);
			expect(size.scrollHeight).toBeGreaterThan(size.height);
			const track = root.locator(
				`${scrollbarSelector}[data-orientation="vertical"]`
			);
			await root.hover();
			await expect
				.poll(() =>
					track.evaluate((el) => Number(getComputedStyle(el).opacity))
				)
				.toBe(1);
			expect((await track.boundingBox())?.width).toBe(10);
			const thumb = track.locator(thumbSelector);
			expect((await thumb.boundingBox())?.width).toBe(6);
			const restingColor = await thumb.evaluate(
				(el) => getComputedStyle(el).backgroundColor
			);
			const box = await thumb.boundingBox();
			if (!box) {
				throw new Error("Missing vertical thumb");
			}
			await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
			expect(
				await thumb.evaluate((el) => getComputedStyle(el).backgroundColor)
			).not.toBe(restingColor);
			await page.mouse.down();
			await page.mouse.move(
				box.x + box.width / 2,
				box.y + box.height / 2 + 30,
				{ steps: 4 }
			);
			await page.mouse.up();
			expect(await viewport.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
			await viewport.focus();
			await page.mouse.move(0, 0);
			expect(
				await viewport.evaluate((el) => getComputedStyle(el).paddingInlineEnd)
			).toBe("16px");
			expect(
				await viewport.evaluate((el) => el === document.activeElement)
			).toBe(true);
			await viewport.evaluate((el) =>
				el.scrollTo({ behavior: "instant", top: 0 })
			);
			await page.keyboard.press("ArrowDown");
			await expect
				.poll(() => viewport.evaluate((el) => el.scrollTop))
				.toBeGreaterThan(0);
			await page.keyboard.press("End");
			await expect
				.poll(() =>
					viewport.evaluate(
						(el) => el.scrollTop + el.clientHeight >= el.scrollHeight - 1
					)
				)
				.toBe(true);

			await viewport.evaluate((el) =>
				el.scrollTo({ behavior: "instant", top: 0 })
			);
			expect(
				await viewport.evaluate((el) => getComputedStyle(el).maskImage)
			).toContain("linear-gradient");
			await root.hover();
			await root
				.locator("..")
				.screenshot({ path: `/private/tmp/mizen-scroll-area-${theme}.png` });
		}
	);

	it.each(["light", "dark"] as const)(
		"bounds horizontal and dual-axis content, handles RTL, and hides unused tracks in %s",
		async (theme) => {
			await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
			await page.goto(`${handle.url}/components/scroll-area`, {
				waitUntil: "networkidle",
			});
			const horizontal = area("Cluster health");
			const viewport = horizontal.locator(viewportSelector);
			await viewport.waitFor();
			const size = await viewport.evaluate((el) => ({
				height: el.clientHeight,
				scrollHeight: el.scrollHeight,
				scrollWidth: el.scrollWidth,
				width: el.clientWidth,
			}));
			expect(size.width).toBeLessThanOrEqual(384);
			expect(size.scrollWidth).toBeGreaterThan(size.width);
			expect(size.scrollHeight).toBe(size.height);
			await viewport.focus();
			await page.keyboard.press("ArrowRight");
			await expect
				.poll(() => viewport.evaluate((el) => el.scrollLeft))
				.toBeGreaterThan(0);
			const dual = area("Deployment matrix");
			await dual.hover();
			expect(await dual.locator(scrollbarSelector).count()).toBe(2);
			const corner = dual.locator('[data-slot="scroll-area-corner"]');
			await corner.waitFor();
			const cornerBox = await corner.boundingBox();
			expect(cornerBox?.width).toBe(10);
			expect(cornerBox?.height).toBe(10);
			const tracks = await dual
				.locator(scrollbarSelector)
				.evaluateAll((els) =>
					els.map((el) => el.getBoundingClientRect().toJSON())
				);
			const verticalTrack = tracks.find((b) => b.width === 10);
			const horizontalTrack = tracks.find((b) => b.height === 10);
			expect(verticalTrack?.bottom).toBeLessThanOrEqual(
				horizontalTrack?.top ?? 0
			);
			expect(
				await area("Workspace summary").locator(scrollbarSelector).count()
			).toBe(0);
			const rtl = area("Security activity");
			await rtl.hover();
			const rtlBox = await rtl.boundingBox();
			const rtlTrack = await rtl
				.locator(`${scrollbarSelector}[data-orientation="vertical"]`)
				.boundingBox();
			expect(Math.abs((rtlTrack?.x ?? 0) - (rtlBox?.x ?? 0))).toBeLessThan(6);
		}
	);
	it("keeps narrow previews inside the page", async () => {
		await page.setViewportSize({ height: 900, width: 320 });
		await page.goto(`${handle.url}/components/scroll-area`, {
			waitUntil: "networkidle",
		});
		const widths = await page
			.locator('[data-slot="scroll-area"][aria-label]')
			.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().width));
		expect(widths.length).toBe(6);
		expect(Math.max(...widths)).toBeLessThanOrEqual(320);
	});
});
