import { type Browser, chromium, type Locator, type Page } from "playwright";
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
		throw new AggregateError(failures, "Slider browser teardown failed");
	}
}

async function tabToElement(target: Locator, attempt = 0): Promise<void> {
	if (attempt === 0) {
		await page.locator("main#docs-content").click({ position: { x: 5, y: 5 } });
	}
	await page.keyboard.press("Tab");
	const isFocused = await target.evaluate(
		(el) => document.activeElement === el || el.contains(document.activeElement)
	);
	if (isFocused) {
		return;
	}
	if (attempt < 30) {
		return tabToElement(target, attempt + 1);
	}
	throw new Error("Could not reach target element via Tab navigation");
}

describe("Slider browser integration", {
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
		"presses only the active range thumb in %s",
		async (theme) => {
			await page.emulateMedia({ colorScheme: theme });
			const thumbs = page
				.getByTestId("slider-range")
				.locator('[data-slot="slider-thumb"]');
			for (const index of [0, 1]) {
				const active = thumbs.nth(index);
				const idle = thumbs.nth(1 - index);
				// biome-ignore lint/performance/noAwaitInLoops: Each thumb press must finish before the next starts.
				await active.hover();
				await page.mouse.down();
				try {
					await expect
						.poll(() =>
							active.evaluate((element) => getComputedStyle(element).cursor)
						)
						.toBe("grabbing");
					await expect
						.poll(() =>
							active.evaluate((element) => getComputedStyle(element).boxShadow)
						)
						.toContain("inset");
					await expect
						.poll(() =>
							idle.evaluate((element) => getComputedStyle(element).boxShadow)
						)
						.not.toContain("inset");
					expect(
						await idle.evaluate((element) => getComputedStyle(element).cursor)
					).toBe("grab");
				} finally {
					await page.mouse.up();
				}
				await expect
					.poll(() =>
						active.evaluate((element) => getComputedStyle(element).boxShadow)
					)
					.not.toContain("inset");
			}
		}
	);

	it("hydrates formatted values without locale mismatches or script warnings", async () => {
		const context = await browser.newContext({ locale: "ru-RU" });
		const localizedPage = await context.newPage();
		const errors: string[] = [];
		localizedPage.on("console", (message) => {
			if (message.type() === "error") {
				errors.push(message.text());
			}
		});
		localizedPage.on("pageerror", (error) => errors.push(error.message));
		try {
			await localizedPage.goto(`${handle.url}/components/slider`, {
				waitUntil: "networkidle",
			});
			const thumb = localizedPage
				.getByTestId("slider-thumb-value")
				.locator('[data-slot="slider-thumb"]');
			expect(await thumb.textContent()).toBe("100%");
			await thumb.locator("input").focus();
			await localizedPage.keyboard.press("ArrowRight");
			await expect.poll(() => thumb.textContent()).toBe("110%");
			expect(errors).toEqual([]);
		} finally {
			await context.close();
		}
	});

	it.each(["light", "dark"] as const)(
		"aligns ticks and snaps labeled thumbs in %s",
		async (theme) => {
			await page.emulateMedia({ colorScheme: theme });
			const slider = page.getByTestId("slider-ticks");
			const ticks = slider.locator('[data-slot="slider-ticks"] > span');
			expect(await ticks.count()).toBe(11);
			await ticks.nth(2).click({ force: true });
			const input = slider.locator("input");
			await expect.poll(() => input.inputValue()).toBe("20");
			await input.focus();
			await page.keyboard.press("ArrowRight");
			await expect.poll(() => input.inputValue()).toBe("30");
			const center = await slider.evaluate((element) => {
				const thumb = element.querySelector('[data-slot="slider-thumb"]');
				const tick = element.querySelector('[data-slot="slider-ticks"]')
					?.children[3];
				if (!(thumb && tick)) {
					throw new Error("Missing thumb or tick");
				}
				const a = thumb.getBoundingClientRect();
				const b = tick.getBoundingClientRect();
				return Math.abs(a.x + a.width / 2 - b.x - b.width / 2);
			});
			expect(center).toBeLessThan(1);
			const thumb = slider.locator('[data-slot="slider-thumb"]');
			await thumb.hover();
			const hoverShadow = await thumb.evaluate(
				(element) => getComputedStyle(element).boxShadow
			);
			await page.mouse.down();
			await expect
				.poll(() =>
					thumb.evaluate((element) => getComputedStyle(element).boxShadow)
				)
				.not.toBe(hoverShadow);
			await page.mouse.up();
			const labeled = page.getByTestId("slider-thumb-value");
			await labeled.locator("input").focus();
			await page.keyboard.press("End");
			expect(
				await labeled.locator('[data-slot="slider-thumb"]').textContent()
			).toBe("200%");
			await page.keyboard.press("Home");
			expect(
				await labeled.locator('[data-slot="slider-thumb"]').textContent()
			).toBe("0%");
			const bounds = await labeled.evaluate((element) => {
				const thumbElement = element.querySelector(
					'[data-slot="slider-thumb"]'
				);
				const track = element.querySelector('[data-slot="slider-track"]');
				if (!(thumbElement && track)) {
					throw new Error("Missing slider geometry");
				}
				const a = thumbElement.getBoundingClientRect();
				const b = track.getBoundingClientRect();
				// Allow sub-pixel rounding at the track ends.
				return a.x >= b.x - 0.5 && a.right <= b.right + 0.5;
			});
			expect(bounds).toBe(true);
			expect(
				await page
					.getByTestId("slider-with-value")
					.locator('[data-slot="slider-control"]')
					.count()
			).toBe(1);
			await page
				.locator("#SliderTicksAndValueExample5")
				.screenshot({ path: `/private/tmp/slider-options-${theme}.png` });
		}
	);

	it("renders slider route without console or page errors", async () => {
		const slider = page.locator('[data-slot="slider"]').first();
		await slider.waitFor({ state: "visible" });
		expect(consoleErrors).toEqual([]);
		expect(pageErrors).toEqual([]);
	});

	it("renders horizontal geometry with distinct indicator, track, and thumb styling", async () => {
		const slider = page.getByTestId("slider-default");
		const track = slider.locator('[data-slot="slider-track"]');
		const thumb = slider.locator('[data-slot="slider-thumb"]');
		const indicator = slider.locator('[data-slot="slider-indicator"]');

		const trackBox = await track.boundingBox();
		const thumbBox = await thumb.boundingBox();
		expect(trackBox).not.toBeNull();
		expect(thumbBox).not.toBeNull();
		if (!(trackBox && thumbBox)) {
			throw new Error("Missing track or thumb bounding box");
		}

		expect(trackBox.height).toBeGreaterThanOrEqual(30);
		expect(trackBox.height).toBeLessThanOrEqual(34);
		expect(thumbBox.height).toBe(24);
		expect(thumbBox.width).toBe(24);

		const trackBg = await track.evaluate(
			(el) => getComputedStyle(el, "::before").backgroundColor
		);
		const indicatorBg = await indicator.evaluate(
			(el) => getComputedStyle(el, "::before").backgroundColor
		);
		const thumbBg = await thumb.evaluate(
			(el) => getComputedStyle(el).backgroundColor
		);

		expect(trackBg).not.toBe(indicatorBg);
		expect(trackBg).not.toBe(thumbBg);
		expect(indicatorBg).not.toBe(thumbBg);
	});

	it("renders vertical orientation with rotated geometry", async () => {
		const vSlider = page.getByTestId("slider-vertical");
		const vTrack = vSlider.locator('[data-slot="slider-track"]');
		const vThumb = vSlider.locator('[data-slot="slider-thumb"]');

		const vTrackBox = await vTrack.boundingBox();
		const vThumbBox = await vThumb.boundingBox();
		expect(vTrackBox).not.toBeNull();
		expect(vThumbBox).not.toBeNull();
		if (!(vTrackBox && vThumbBox)) {
			throw new Error("Missing vertical track or thumb bounding box");
		}

		expect(vTrackBox.width).toBeGreaterThanOrEqual(30);
		expect(vTrackBox.width).toBeLessThanOrEqual(34);
		expect(vTrackBox.height).toBeGreaterThan(vTrackBox.width);
		expect(vThumbBox.width).toBe(24);
		expect(vThumbBox.height).toBe(24);
	});

	it("changes scalar value with ArrowRight and prevents changes when disabled", async () => {
		const slider = page.getByTestId("slider-default");
		const thumb = slider.locator('[data-slot="slider-thumb"]');
		const input = thumb.locator("input");
		const valueDisplay = page.getByTestId("slider-default-value");

		expect(await valueDisplay.textContent()).toBe("50");
		await input.focus();
		await page.keyboard.press("ArrowRight");
		await expect.poll(async () => valueDisplay.textContent()).toBe("51");

		const disabledSlider = page.getByTestId("slider-disabled");
		const disabledInput = disabledSlider.locator("input");
		const initialDisabledValue = await disabledInput.inputValue();

		const ignoreFocusError = () => undefined;
		await disabledInput.focus({ timeout: 500 }).catch(ignoreFocusError);
		await page.keyboard.press("ArrowRight");
		expect(await disabledInput.inputValue()).toBe(initialDisabledValue);
	});

	it("displays 2px visible focus outline upon keyboard navigation", async () => {
		const slider = page.getByTestId("slider-default");
		const thumb = slider.locator('[data-slot="slider-thumb"]');

		expect(
			await thumb.evaluate((el) => getComputedStyle(el).outlineWidth)
		).toBe("0px");

		await tabToElement(thumb);
		await expect
			.poll(async () =>
				thumb.evaluate((el) => getComputedStyle(el).outlineWidth)
			)
			.toBe("2px");
	});

	it("renders range slider with dual thumbs and honors disabled precedence over invalid", async () => {
		const rangeSlider = page.getByTestId("slider-range");
		const rangeThumbs = rangeSlider.locator('[data-slot="slider-thumb"]');
		expect(await rangeThumbs.count()).toBe(2);

		const disabledThumb = page
			.getByTestId("slider-disabled")
			.locator('[data-slot="slider-thumb"]');
		const invalidThumb = page
			.getByTestId("slider-invalid")
			.locator('[data-slot="slider-thumb"]');
		const disabledInvalidThumb = page
			.getByTestId("slider-disabled-invalid")
			.locator('[data-slot="slider-thumb"]');

		const disabledBg = await disabledThumb.evaluate(
			(el) => getComputedStyle(el).backgroundColor
		);
		const invalidBg = await invalidThumb.evaluate(
			(el) => getComputedStyle(el).backgroundColor
		);
		const disabledInvalidBg = await disabledInvalidThumb.evaluate(
			(el) => getComputedStyle(el).backgroundColor
		);

		expect(disabledInvalidBg).toBe(disabledBg);
		expect(disabledInvalidBg).not.toBe(invalidBg);
		const rangeIndicator = rangeSlider.locator(
			'[data-slot="slider-indicator"]'
		);
		await rangeIndicator.evaluate((element) =>
			element.setAttribute("data-invalid", "")
		);
		expect(
			await rangeIndicator.evaluate(
				(element) => getComputedStyle(element, "::before").backgroundColor
			)
		).toBe(
			await page
				.getByTestId("slider-invalid")
				.locator('[data-slot="slider-indicator"]')
				.evaluate(
					(element) => getComputedStyle(element, "::before").backgroundColor
				)
		);
	});

	it("propagates data-invalid to track, indicator, and thumb and keeps thumb visually distinct when slider is invalid", async () => {
		// Given: the rendered standalone invalid slider and its styled parts
		const slider = page.getByTestId("slider-invalid");
		const track = slider.locator('[data-slot="slider-track"]');
		const indicator = slider.locator('[data-slot="slider-indicator"]');
		const thumb = slider.locator('[data-slot="slider-thumb"]');

		// When: inspecting invalid state propagation and computed backgrounds
		const trackInvalid = await track.getAttribute("data-invalid");
		const indicatorInvalid = await indicator.getAttribute("data-invalid");
		const thumbInvalid = await thumb.getAttribute("data-invalid");
		const indicatorBg = await indicator.evaluate(
			(el) => getComputedStyle(el, "::before").backgroundColor
		);
		const thumbBg = await thumb.evaluate(
			(el) => getComputedStyle(el).backgroundColor
		);

		// Then: track, indicator, and thumb have data-invalid, and thumb remains visually distinct from the destructive indicator
		expect(trackInvalid).not.toBeNull();
		expect(indicatorInvalid).not.toBeNull();
		expect(thumbInvalid).not.toBeNull();
		expect(thumbBg).not.toBe(indicatorBg);
	});

	it("derives distinct accessible names for scalar and dual-thumb range inputs", async () => {
		// Given: scalar and range sliders with root labels
		const defaultSlider = page.getByTestId("slider-default");
		const rangeSlider = page.getByTestId("slider-range");

		// When: locating the generated range inputs
		const scalarInput = defaultSlider.locator("input");
		const minInput = rangeSlider.locator("input").nth(0);
		const maxInput = rangeSlider.locator("input").nth(1);

		// Then: scalar input receives root label, and range inputs receive distinct minimum and maximum labels
		expect(await scalarInput.getAttribute("aria-label")).toBe("Volume");
		expect(await minInput.getAttribute("aria-label")).toBe(
			"Price range minimum"
		);
		expect(await maxInput.getAttribute("aria-label")).toBe(
			"Price range maximum"
		);
	});

	it("synchronizes aria-invalid on the nested native range input for standalone invalid slider", async () => {
		// Given: valid and invalid sliders rendered with root labels
		const validSlider = page.getByTestId("slider-default");
		const invalidSlider = page.getByTestId("slider-invalid");

		// When: inspecting the nested native range inputs
		const validInput = validSlider.locator("input");
		const invalidInput = invalidSlider.locator("input");

		// Then: the invalid slider's native input has aria-invalid='true' while the valid slider does not
		expect(await invalidInput.getAttribute("aria-invalid")).toBe("true");
		expect(await validInput.getAttribute("aria-invalid")).toBeNull();
	});
});
