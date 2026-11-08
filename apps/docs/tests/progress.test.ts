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
		throw new AggregateError(failures, "Failed to tear down the progress test");
	}
}

async function gotoProgress(width = 375, height = 812): Promise<void> {
	await page.setViewportSize({ height, width });
	await page.goto(`${handle.url}/components/progress`, {
		waitUntil: "networkidle",
	});
}

describe("Progress component browser behavior", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		page.setDefaultTimeout(6000);
		await gotoProgress(1280, 900);
	}, 120_000);

	afterAll(async () => {
		const results = await Promise.allSettled([
			Promise.resolve().then(() => browser?.close()),
			Promise.resolve().then(() => teardownTestServer(handle)),
		]);
		throwTeardownFailures(results);
	}, 120_000);

	it("renders track and indicator with token-backed styles and accessible names", async () => {
		const track = page.locator('[data-slot="progress-track"]').first();
		const indicator = page.locator('[data-slot="progress-indicator"]').first();

		const trackStyles = await track.evaluate((el) => {
			const computed = getComputedStyle(el);
			return {
				backgroundColor: computed.backgroundColor,
				borderRadius: computed.borderRadius,
				height: computed.height,
				overflow: computed.overflow,
			};
		});

		expect(trackStyles.backgroundColor).not.toMatch(transparentColor);
		expect(Number.parseFloat(trackStyles.borderRadius)).toBeGreaterThanOrEqual(
			999
		);
		expect(trackStyles.overflow).toBe("hidden");
		expect(Number.parseFloat(trackStyles.height)).toBeCloseTo(6, 0);

		const indicatorStyles = await indicator.evaluate((el) => {
			const computed = getComputedStyle(el);
			return {
				backgroundColor: computed.backgroundColor,
				transitionProperty: computed.transitionProperty,
			};
		});

		expect(indicatorStyles.backgroundColor).not.toMatch(transparentColor);
		expect(indicatorStyles.transitionProperty).not.toContain("all");
		// The fill glides between values.
		expect(indicatorStyles.transitionProperty).toBe("width");

		const defaultProgress = page.getByRole("progressbar", {
			name: "Export progress",
		});
		expect(await defaultProgress.count()).toBe(1);

		const labeledProgress = page.getByRole("progressbar", {
			name: "Processing task",
		});
		expect(await labeledProgress.count()).toBe(1);
	}, 30_000);

	it("animates indeterminate progress and disables animation under reduced motion", async () => {
		const indeterminateIndicator = page
			.locator('[data-indeterminate] [data-slot="progress-indicator"]')
			.first();

		await page.emulateMedia({ reducedMotion: "no-preference" });
		const animatedStyle = await indeterminateIndicator.evaluate((el) => {
			const computed = getComputedStyle(el);
			return {
				animationIterationCount: computed.animationIterationCount,
				animationName: computed.animationName,
			};
		});
		expect(animatedStyle.animationName).not.toBe("none");
		expect(animatedStyle.animationIterationCount).toBe("infinite");

		await page.emulateMedia({ reducedMotion: "reduce" });
		const reducedStyle = await indeterminateIndicator.evaluate((el) => {
			const computed = getComputedStyle(el);
			return {
				animationName: computed.animationName,
			};
		});
		expect(reducedStyle.animationName).toBe("none");
		await page.emulateMedia({ reducedMotion: "no-preference" });
	}, 30_000);

	it("fits narrow viewport without horizontal overflow", async () => {
		await gotoProgress(375, 812);
		const widths = await page.evaluate(() => [
			document.body.scrollWidth,
			document.body.clientWidth,
		]);
		expect(widths[0]).toBe(widths[1]);
	}, 30_000);

	it("hydrates without mismatch under non-English client locales", async () => {
		const consoleErrors: string[] = [];
		const context = await browser.newContext({ locale: "fr-FR" });
		const localePage = await context.newPage();
		localePage.on("console", (msg) => {
			if (msg.type() === "error" || msg.type() === "warning") {
				consoleErrors.push(msg.text());
			}
		});

		try {
			const response = await localePage.goto(
				`${handle.url}/components/progress`,
				{
					waitUntil: "networkidle",
				}
			);
			expect(response?.ok()).toBe(true);

			const defaultProgress = localePage.getByRole("progressbar", {
				name: "Export progress",
			});
			const valueText = await defaultProgress.getAttribute("aria-valuetext");
			expect(valueText).toBe("65%");

			const labeledProgress = localePage.getByRole("progressbar", {
				name: "Processing task",
			});
			const labeledValueText =
				await labeledProgress.getAttribute("aria-valuetext");
			expect(labeledValueText).toBe("45%");

			const hydrationErrors = consoleErrors.filter(
				(text) =>
					text.includes("hydration") ||
					text.includes("Hydration") ||
					text.includes("did not match") ||
					text.includes("aria-valuetext")
			);
			expect(hydrationErrors).toHaveLength(0);
		} finally {
			await context.close();
		}
	}, 30_000);
});
