import { type Browser, chromium, type Page } from "playwright";
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
		.filter(
			(result): result is PromiseRejectedResult => result.status === "rejected"
		)
		.map(({ reason }) => reason);
	if (failures.length === 1) {
		throw failures[0];
	}
	if (failures.length > 1) {
		throw new AggregateError(failures, "Failed to tear down the skeleton test");
	}
}

async function gotoSkeleton(width = 375, height = 812): Promise<void> {
	await page.setViewportSize({ height, width });
	await page.goto(`${handle.url}/components/skeleton`, {
		waitUntil: "networkidle",
	});
}

describe("Skeleton component browser behavior", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		page.setDefaultTimeout(6000);
		await gotoSkeleton(1280, 900);
	}, 120_000);

	afterAll(async () => {
		const results = await Promise.allSettled([
			Promise.resolve().then(() => browser?.close()),
			Promise.resolve().then(() => teardownTestServer(handle)),
		]);
		throwTeardownFailures(results);
	}, 120_000);

	it("renders token-backed visible fill, radii, and responsive 16:9 rectangle geometry", async () => {
		await gotoSkeleton(1280, 900);
		const line = page
			.locator('[data-slot="skeleton"][data-shape="line"]')
			.first();
		const circle = page
			.locator('[data-slot="skeleton"][data-shape="circle"]')
			.first();
		const rectangle = page
			.locator('[data-slot="skeleton"][data-shape="rectangle"]')
			.first();

		const lineStyles = await line.evaluate((el) => {
			const computed = getComputedStyle(el);
			return {
				backgroundColor: computed.backgroundColor,
				borderRadius: computed.borderRadius,
				height: computed.height,
			};
		});
		expect(lineStyles.backgroundColor).not.toMatch(transparentColor);
		expect(Number.parseFloat(lineStyles.borderRadius)).toBeCloseTo(4, 0);
		expect(Number.parseFloat(lineStyles.height)).toBeCloseTo(16, 0);

		const circleStyles = await circle.evaluate((el) => {
			const computed = getComputedStyle(el);
			return {
				backgroundColor: computed.backgroundColor,
				borderRadius: computed.borderRadius,
				height: computed.height,
				width: computed.width,
			};
		});
		expect(circleStyles.backgroundColor).not.toMatch(transparentColor);
		expect(Number.parseFloat(circleStyles.borderRadius)).toBeGreaterThanOrEqual(
			999
		);
		expect(Number.parseFloat(circleStyles.width)).toBeGreaterThan(0);
		expect(Number.parseFloat(circleStyles.width)).toBeCloseTo(
			Number.parseFloat(circleStyles.height),
			0
		);

		const desktopRect = await rectangle.evaluate((el) => {
			const computed = getComputedStyle(el);
			const rect = el.getBoundingClientRect();
			return {
				aspectRatio: computed.aspectRatio,
				backgroundColor: computed.backgroundColor,
				borderRadius: computed.borderRadius,
				height: rect.height,
				width: rect.width,
			};
		});
		expect(desktopRect.backgroundColor).not.toMatch(transparentColor);
		expect(Number.parseFloat(desktopRect.borderRadius)).toBeCloseTo(8, 0);
		expect(desktopRect.width).toBeGreaterThan(0);
		expect(desktopRect.height).toBeGreaterThan(100);
		expect(desktopRect.width / desktopRect.height).toBeCloseTo(16 / 9, 1);

		await gotoSkeleton(375, 812);
		const mobileRect = await rectangle.evaluate((el) => {
			const rect = el.getBoundingClientRect();
			return {
				height: rect.height,
				width: rect.width,
			};
		});
		expect(mobileRect.width).toBeGreaterThan(0);
		expect(mobileRect.height).toBeGreaterThan(100);
		expect(mobileRect.width / mobileRect.height).toBeCloseTo(16 / 9, 1);
		expect(mobileRect.height).toBeLessThan(desktopRect.height);
	}, 45_000);

	it("ensures all line skeletons have non-zero width across desktop, tablet, and mobile", async () => {
		const assertLineWidths = async (width: number, height: number) => {
			await gotoSkeleton(width, height);
			const lineSkeletons = page.locator(
				'[data-slot="skeleton"][data-shape="line"]'
			);
			const count = await lineSkeletons.count();
			expect(count).toBeGreaterThan(0);

			const widths = await lineSkeletons.evaluateAll((elements) =>
				elements.map((el) => el.getBoundingClientRect().width)
			);
			for (const lineWidth of widths) {
				expect(lineWidth).toBeGreaterThan(0);
			}
		};

		await assertLineWidths(1280, 900);
		await assertLineWidths(768, 1024);
		await assertLineWidths(375, 812);
	}, 45_000);

	it("animates shimmer and disables animation under reduced motion", async () => {
		const skeleton = page.locator('[data-slot="skeleton"]').first();

		await page.emulateMedia({ reducedMotion: "no-preference" });
		const animatedStyle = await skeleton.evaluate((el) => {
			const computed = getComputedStyle(el);
			return {
				animationIterationCount: computed.animationIterationCount,
				animationName: computed.animationName,
			};
		});
		expect(animatedStyle.animationName).not.toBe("none");
		expect(animatedStyle.animationIterationCount).toBe("infinite");

		await page.emulateMedia({ reducedMotion: "reduce" });
		const reducedStyle = await skeleton.evaluate((el) => {
			const computed = getComputedStyle(el);
			return {
				animationName: computed.animationName,
			};
		});
		expect(reducedStyle.animationName).toBe("none");
		await page.emulateMedia({ reducedMotion: "no-preference" });
	}, 30_000);

	it("defaults aria-hidden to true on all rendered skeletons", async () => {
		const skeletons = page.locator('[data-slot="skeleton"]');
		const count = await skeletons.count();
		expect(count).toBeGreaterThan(0);

		const ariaHiddens = await Promise.all(
			Array.from({ length: count }, (_, index) =>
				skeletons.nth(index).getAttribute("aria-hidden")
			)
		);
		for (const ariaHidden of ariaHiddens) {
			expect(ariaHidden).toBe("true");
		}
	}, 30_000);

	it("fits narrow viewport without horizontal overflow", async () => {
		await gotoSkeleton(375, 812);
		const widths = await page.evaluate(() => [
			document.body.scrollWidth,
			document.body.clientWidth,
		]);
		expect(widths[0]).toBe(widths[1]);
	}, 30_000);
});
