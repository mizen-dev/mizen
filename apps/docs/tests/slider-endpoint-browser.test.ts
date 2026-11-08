import { type Browser, chromium, type Page } from "playwright";
import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from "vite-plus/test";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
let handle: TestServerHandle;
let browser: Browser;
let page: Page;
const consoleErrors: string[] = [];
const pageErrors: string[] = [];

function resetErrors(): void {
	consoleErrors.length = 0;
	pageErrors.length = 0;
}

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
			"Slider endpoint browser teardown failed"
		);
	}
}

describe("Slider endpoint browser integration", {
	timeout: 20_000,
}, () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		// Settled focus rings: the ring grows in over 200ms otherwise.
		await page.emulateMedia({ reducedMotion: "reduce" });
		page.setDefaultTimeout(8000);
		page.on("console", (msg) => {
			if (msg.type() === "error") {
				consoleErrors.push(msg.text());
			}
		});
		page.on("pageerror", (err) => {
			pageErrors.push(err.message);
		});
	}, 120_000);

	beforeEach(async () => {
		resetErrors();
		await page.setViewportSize({ height: 800, width: 1280 });
		await page.goto(`${handle.url}/components/slider`, {
			waitUntil: "networkidle",
		});
	});

	afterEach(({ task }) => {
		try {
			if (task.result?.state !== "fail") {
				expect(consoleErrors).toEqual([]);
				expect(pageErrors).toEqual([]);
			}
		} finally {
			resetErrors();
		}
	});

	afterAll(async () => {
		const results = await Promise.allSettled([
			Promise.resolve().then(() => browser?.close()),
			Promise.resolve().then(() => teardownTestServer(handle)),
		]);
		throwTeardownFailures(results);
	}, 120_000);

	it.each(["light", "dark"] as const)(
		"keeps nested corners, end padding, and progress consistent in %s",
		async (theme) => {
			await page.emulateMedia({ colorScheme: theme });
			const corners = await page
				.locator('[data-testid^="slider-size-"]')
				.evaluateAll((elements) =>
					elements.map((element) => {
						const track = element.querySelector('[data-slot="slider-track"]');
						const thumb = element.querySelector('[data-slot="slider-thumb"]');
						if (!(track && thumb)) {
							throw new Error("Missing sized slider");
						}
						return (
							Number.parseFloat(
								getComputedStyle(track, "::before").borderRadius
							) - Number.parseFloat(getComputedStyle(thumb).borderRadius)
						);
					})
				);
			expect(corners).toEqual([4, 4, 4]);
			const slider = page.getByTestId("slider-thumb-value");
			const input = slider.locator("input");
			await slider.scrollIntoViewIfNeeded();
			const railBox = await slider
				.locator('[data-slot="slider-track"]')
				.boundingBox();
			if (!railBox) {
				throw new Error("Missing clickable rail");
			}
			await page.mouse.click(railBox.x - 3, railBox.y + railBox.height / 2);
			await expect.poll(() => input.inputValue()).toBe("0");
			await page.mouse.click(
				railBox.x + railBox.width + 3,
				railBox.y + railBox.height / 2
			);
			await expect.poll(() => input.inputValue()).toBe("2");
			await input.focus();
			for (const key of ["Home", "End"]) {
				// biome-ignore lint/performance/noAwaitInLoops: Home and End move the same thumb in order.
				await page.keyboard.press(key);
				const geometry = await slider.evaluate((element) => {
					const track = element.querySelector('[data-slot="slider-track"]');
					const thumb = element.querySelector('[data-slot="slider-thumb"]');
					const indicator = element.querySelector(
						'[data-slot="slider-indicator"]'
					);
					if (!(track && thumb && indicator)) {
						throw new Error("Missing endpoint geometry");
					}
					const rail = track.getBoundingClientRect();
					const thumbBox = thumb.getBoundingClientRect();
					const fill = indicator.getBoundingClientRect();
					const surface = getComputedStyle(track, "::before");
					const progress = getComputedStyle(indicator, "::before");
					return {
						ahead:
							fill.right - Number.parseFloat(progress.right) - thumbBox.right,
						fillColor: progress.backgroundColor,
						leftGap: thumbBox.x - rail.x - Number.parseFloat(surface.left),
						rightGap:
							rail.right - Number.parseFloat(surface.right) - thumbBox.right,
						trackColor: surface.backgroundColor,
					};
				});
				// The rail paint extends four pixels beyond each end of the usable control.
				expect(
					key === "Home" ? geometry.leftGap : geometry.rightGap
				).toBeCloseTo(4, 1);
				expect(geometry.ahead).toBeCloseTo(4, 1);
				expect(geometry.fillColor).not.toBe(geometry.trackColor);
			}
			const row = page.getByTestId("slider-with-value").locator("div").first();
			const label = row.locator("label");
			const value = row.locator("output");
			const labelBox = await label.boundingBox();
			const valueBox = await value.boundingBox();
			if (!(labelBox && valueBox)) {
				throw new Error("Missing Opacity row");
			}
			expect(valueBox.x).toBeGreaterThan(labelBox.x);
			expect(
				Math.abs(
					labelBox.y + labelBox.height / 2 - valueBox.y - valueBox.height / 2
				)
			).toBeLessThan(0.5);
			expect(
				await value.evaluate((element) => getComputedStyle(element).color)
			).not.toBe(
				await label.evaluate((element) => getComputedStyle(element).color)
			);
		}
	);

	it("keeps endpoint thumbs and focus rings unclipped and hit-testable at min and max boundaries", async () => {
		// Given: the default slider and its track, thumb, and native input
		const slider = page.getByTestId("slider-default");
		const track = slider.locator('[data-slot="slider-track"]');
		const thumb = slider.locator('[data-slot="slider-thumb"]');
		const indicator = slider.locator('[data-slot="slider-indicator"]');
		const input = thumb.locator("input");

		// When: checking track overflow and indicator border radius
		const trackOverflow = await track.evaluate(
			(el) => getComputedStyle(el).overflow
		);
		const trackRadius = await track.evaluate(
			(el) => getComputedStyle(el).borderRadius
		);
		const indicatorRadius = await indicator.evaluate(
			(el) => getComputedStyle(el).borderRadius
		);

		// Then: track does not clip with overflow hidden and indicator has matching inherited radius
		expect(trackOverflow).not.toBe("hidden");
		expect(indicatorRadius).toBe(trackRadius);

		// When: navigating to minimum endpoint
		await input.focus();
		await page.keyboard.press("Home");
		await expect.poll(async () => input.inputValue()).toBe("0");

		const minTrackBox = await track.boundingBox();
		const minThumbBox = await thumb.boundingBox();
		expect(minTrackBox).not.toBeNull();
		expect(minThumbBox).not.toBeNull();
		if (minTrackBox && minThumbBox) {
			expect(minThumbBox.x).toBeGreaterThanOrEqual(minTrackBox.x);
		}

		// Then: thumb and focus ring are hit-testable without clipping
		await expect
			.poll(async () =>
				thumb.evaluate((el) => getComputedStyle(el).outlineWidth)
			)
			.toBe("3px");
		await thumb.click();

		// When: navigating to maximum endpoint
		await page.keyboard.press("End");
		await expect.poll(async () => input.inputValue()).toBe("100");

		const maxTrackBox = await track.boundingBox();
		const maxThumbBox = await thumb.boundingBox();
		expect(maxTrackBox).not.toBeNull();
		expect(maxThumbBox).not.toBeNull();
		if (maxTrackBox && maxThumbBox) {
			expect(maxThumbBox.x + maxThumbBox.width).toBeLessThanOrEqual(
				maxTrackBox.x + maxTrackBox.width
			);
		}

		// Then: thumb remains directly clickable at maximum endpoint
		await expect
			.poll(async () =>
				thumb.evaluate((el) => getComputedStyle(el).outlineWidth)
			)
			.toBe("3px");
		await thumb.click();
	});
});
