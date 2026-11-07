import { type Browser, chromium, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
let handle: TestServerHandle;
let browser: Browser;
let page: Page;

const TODAY_REGEX = /^Today,/;
const JUNE_10_REGEX = /June 10/i;
const JUNE_9_REGEX = /June 9/i;
const JUNE_11_REGEX = /June 11/i;
const JUNE_15_REGEX = /June 15/i;
const JULY_1_REGEX = /July 1(?:st)?(?!\d)/i;

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
		throw new AggregateError(failures, "Calendar browser teardown failed");
	}
}

type RgbColor = readonly [number, number, number];

function linearizeChannel(channel: number): number {
	const normalized = channel / 255;
	return normalized <= 0.040_45
		? normalized / 12.92
		: ((normalized + 0.055) / 1.055) ** 2.4;
}

function calculateRelativeLuminance([r, g, b]: RgbColor): number {
	return (
		0.2126 * linearizeChannel(r) +
		0.7152 * linearizeChannel(g) +
		0.0722 * linearizeChannel(b)
	);
}

function calculateContrastRatio(
	foreground: RgbColor,
	background: RgbColor
): number {
	const l1 = calculateRelativeLuminance(foreground);
	const l2 = calculateRelativeLuminance(background);
	return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function convertCssColorsToRgb(
	targetPage: Page,
	firstColor: string,
	secondColor: string
): Promise<readonly [RgbColor, RgbColor]> {
	return targetPage.evaluate<
		readonly [RgbColor, RgbColor],
		readonly [string, string]
	>(
		([color1, color2]) => {
			const canvas = document.createElement("canvas");
			canvas.width = 1;
			canvas.height = 1;
			const context = canvas.getContext("2d");
			if (!context) {
				throw new Error("Canvas 2D context unavailable");
			}
			const readRgb = (cssColor: string): RgbColor => {
				context.fillStyle = cssColor;
				context.fillRect(0, 0, 1, 1);
				const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
				return [r ?? 0, g ?? 0, b ?? 0];
			};
			return [readRgb(color1), readRgb(color2)];
		},
		[firstColor, secondColor]
	);
}

describe("Calendar browser regression", {
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
	}, 120_000);

	afterAll(async () => {
		const results = await Promise.allSettled([
			Promise.resolve().then(() => browser?.close()),
			Promise.resolve().then(() => teardownTestServer(handle)),
		]);
		throwTeardownFailures(results);
	}, 120_000);

	it("proves next-month button is clickable and advances visible month to July 2026", async () => {
		await page.goto(`${handle.url}/components/calendar`, {
			waitUntil: "networkidle",
		});

		const calendar = page.getByTestId("calendar-single");
		await calendar.waitFor({ state: "visible" });

		const nextButton = calendar.getByRole("button", {
			name: "Go to the Next Month",
		});
		await nextButton.focus();
		const outline = await nextButton.evaluate((element) => ({
			style: getComputedStyle(element).outlineStyle,
			width: getComputedStyle(element).outlineWidth,
		}));
		expect(outline.width).toBe("3px");
		expect(outline.style).toBe("solid");
		await nextButton.click();

		const nextMonthHeading = calendar.getByText("July 2026");
		await nextMonthHeading.waitFor({ state: "visible" });
		expect(await nextMonthHeading.isVisible()).toBe(true);
	});

	it("inherits selected gridcell text color on the selected date button", async () => {
		await page.goto(`${handle.url}/components/calendar`, {
			waitUntil: "networkidle",
		});

		const calendar = page.getByTestId("calendar-single");
		await calendar.waitFor({ state: "visible" });

		const selectedCell = calendar.getByRole("gridcell", { selected: true });
		const selectedButton = selectedCell.getByRole("button", {
			name: JUNE_15_REGEX,
		});
		await selectedButton.waitFor({ state: "visible" });

		const cellColor = await selectedCell.evaluate(
			(element) => getComputedStyle(element).color
		);
		const buttonColor = await selectedButton.evaluate(
			(element) => getComputedStyle(element).color
		);

		expect(buttonColor).toBe(cellColor);
	});

	it("ensures range-middle date text uses normal content color matching unselected dates", async () => {
		await page.goto(`${handle.url}/components/calendar`, {
			waitUntil: "networkidle",
		});

		const calendar = page.getByTestId("calendar-range");
		await calendar.waitFor({ state: "visible" });

		const rangeMiddleButton = calendar.getByRole("button", {
			name: JUNE_11_REGEX,
		});
		const unselectedButton = calendar.getByRole("button", {
			name: JUNE_9_REGEX,
		});
		await rangeMiddleButton.waitFor({ state: "visible" });
		await unselectedButton.waitFor({ state: "visible" });

		const rangeMiddleColor = await rangeMiddleButton.evaluate(
			(element) => getComputedStyle(element).color
		);
		const unselectedColor = await unselectedButton.evaluate(
			(element) => getComputedStyle(element).color
		);

		expect(rangeMiddleColor).toBe(unselectedColor);
	});

	it("asserts outside July 1 date cell has full opacity, distinct color from in-month dates, and at least 4.5:1 contrast in light and dark", async () => {
		await page.goto(`${handle.url}/components/calendar`, {
			waitUntil: "networkidle",
		});

		try {
			const verifyTheme = async (theme: "light" | "dark") => {
				await page.emulateMedia({ colorScheme: theme });
				await page.reload({ waitUntil: "networkidle" });

				const calendar = page.getByTestId("calendar-single");
				await calendar.waitFor({ state: "visible" });

				const outsideButton = calendar.getByRole("button", {
					name: JULY_1_REGEX,
				});
				await outsideButton.waitFor({ state: "visible" });
				const outsideCell = outsideButton.locator("xpath=..");
				const inMonthButton = calendar.getByRole("button", {
					name: JUNE_9_REGEX,
				});
				await inMonthButton.waitFor({ state: "visible" });
				const surfaceElement = calendar.locator('[data-slot="calendar"]');
				await surfaceElement.waitFor({ state: "visible" });

				const cellOpacity = await outsideCell.evaluate(
					(element) => getComputedStyle(element).opacity
				);
				const outsideColor = await outsideButton.evaluate(
					(element) => getComputedStyle(element).color
				);
				const inMonthColor = await inMonthButton.evaluate(
					(element) => getComputedStyle(element).color
				);
				const surfaceColor = await surfaceElement.evaluate(
					(element) => getComputedStyle(element).backgroundColor
				);

				const [outsideRgb, surfaceRgb] = await convertCssColorsToRgb(
					page,
					outsideColor,
					surfaceColor
				);
				const contrast = calculateContrastRatio(outsideRgb, surfaceRgb);

				expect(cellOpacity).toBe("1");
				expect(contrast).toBeGreaterThanOrEqual(4.5);
				expect(outsideColor).not.toBe(inMonthColor);
				const weekdayColor = await calendar
					.locator("thead th")
					.first()
					.evaluate((element) => getComputedStyle(element).color);
				const [weekdayRgb] = await convertCssColorsToRgb(
					page,
					weekdayColor,
					surfaceColor
				);
				expect(weekdayColor).not.toBe(inMonthColor);
				expect(
					calculateContrastRatio(weekdayRgb, surfaceRgb)
				).toBeGreaterThanOrEqual(4.5);
			};

			await verifyTheme("light");
			await verifyTheme("dark");
		} finally {
			await page.emulateMedia({ colorScheme: "light" });
		}
	});

	it("keeps focus on the rounded date button, never its square gridcell", async () => {
		await page.goto(`${handle.url}/components/calendar`, {
			waitUntil: "networkidle",
		});
		const calendar = page.getByTestId("calendar-single");
		const day = calendar.getByRole("button", { name: JUNE_15_REGEX });
		await day.focus();
		await page.keyboard.press("ArrowRight");
		const focus = await calendar
			.locator("button:focus")
			.evaluate((element) => ({
				buttonOutline: getComputedStyle(element).outlineWidth,
				buttonRadius: getComputedStyle(element).borderRadius,
				cellOutline: getComputedStyle(element.parentElement ?? element)
					.outlineStyle,
			}));
		expect(focus.buttonRadius).not.toBe("0px");
		expect(focus.buttonOutline).toBe("3px");
		expect(focus.cellOutline).toBe("none");
	});
	it("shows brand selection, a visible today dot, and outline navigation in both themes", async () => {
		const verifyTheme = async (theme: "light" | "dark") => {
			await page.emulateMedia({ colorScheme: theme });
			await page.goto(`${handle.url}/components/calendar`, {
				waitUntil: "networkidle",
			});
			const single = page.getByTestId("calendar-single");
			const selected = single.getByRole("button", { name: JUNE_15_REGEX });
			const appearance = await selected.evaluate((element) => ({
				background: getComputedStyle(element, "::before").backgroundColor,
				color: getComputedStyle(element).color,
			}));
			const [foreground, background] = await convertCssColorsToRgb(
				page,
				appearance.color,
				appearance.background
			);
			expect(
				calculateContrastRatio(foreground, background)
			).toBeGreaterThanOrEqual(4.5);
			const endpoint = page
				.getByTestId("calendar-range")
				.getByRole("button", { name: JUNE_10_REGEX });
			expect(
				await endpoint.evaluate(
					(element) => getComputedStyle(element, "::before").backgroundColor
				)
			).toBe(appearance.background);
			const primary = page.locator('[data-slot="component-preview"]').first();
			const now = new Date();
			const monthOffset = (now.getFullYear() - 2026) * 12 + now.getMonth() - 9;
			const navigation = primary.locator(
				monthOffset < 0
					? '[data-slot="calendar-previous"]'
					: '[data-slot="calendar-next"]'
			);
			for (let month = 0; month < Math.abs(monthOffset); month += 1) {
				// biome-ignore lint/performance/noAwaitInLoops: Month changes must finish in order.
				await navigation.click();
			}
			const today = page
				.locator('[data-slot="component-preview"]')
				.first()
				.getByRole("button", { name: TODAY_REGEX });
			const dot = await today.evaluate((element) => ({
				background: getComputedStyle(element).backgroundColor,
				color: getComputedStyle(element, "::after").backgroundColor,
				colorText: getComputedStyle(element).color,
				content: getComputedStyle(element, "::after").content,
				size: getComputedStyle(element, "::after").width,
			}));
			expect(dot.size).toBe("4px");
			expect(dot.content).toBe('""');
			expect(dot.color).toBe(appearance.background);
			expect(dot.background).not.toBe("rgba(0, 0, 0, 0)");
			expect(dot.background).not.toBe(appearance.background);
			const [todayText, todayBackground] = await convertCssColorsToRgb(
				page,
				dot.colorText,
				dot.background
			);
			expect(
				calculateContrastRatio(todayText, todayBackground)
			).toBeGreaterThanOrEqual(4.5);
			await today.click();
			const selectedToday = await today.evaluate((element) => ({
				color: getComputedStyle(element).color,
				dot: getComputedStyle(element, "::after").backgroundColor,
			}));
			expect(selectedToday.dot).toBe(selectedToday.color);
			const next = single.locator('[data-slot="calendar-next"]');
			const restingBorder = await next.evaluate(
				(element) => getComputedStyle(element, "::before").borderColor
			);
			await next.hover();
			await expect
				.poll(() =>
					next.evaluate(
						(element) => getComputedStyle(element, "::before").borderColor
					)
				)
				.not.toBe(restingBorder);
			await page.mouse.down();
			await expect
				.poll(() =>
					next.evaluate(
						(element) => getComputedStyle(element, "::before").inset
					)
				)
				.toBe("1px");
			await page.mouse.up();
		};
		await verifyTheme("light");
		await verifyTheme("dark");
		await page.emulateMedia({ colorScheme: "light" });
	});
	it("navigates with Mizen month and year selects within declared bounds", async () => {
		await page.goto(`${handle.url}/components/calendar`, {
			waitUntil: "networkidle",
		});
		const example = page.locator("#CalendarDropdownNavigation");
		const year = example.getByRole("combobox", { name: "Choose the Year" });
		await year.click();
		await expect
			.poll(() =>
				page
					.getByRole("listbox")
					.getByRole("option", { includeHidden: true })
					.count()
			)
			.toBe(11);
		await page.getByRole("option", { exact: true, name: "2028" }).click();
		const month = example.getByRole("combobox", { name: "Choose the Month" });
		await month.click();
		await page.getByRole("option", { exact: true, name: "March" }).click();
		expect(
			await example.getByRole("grid").getAttribute("aria-label")
		).toContain("March 2028");
		expect(
			await example.getByRole("gridcell", { selected: true }).count()
		).toBe(0);
		await example.getByRole("button", { name: "Go to the Next Month" }).click();
		expect(await month.textContent()).toContain("Apr");
		await year.focus();
		await page.keyboard.press("ArrowDown");
		await page.keyboard.press("Escape");
		// Focus returns to the trigger after the popup finishes closing.
		await expect
			.poll(() =>
				year.evaluate((element) => element === document.activeElement)
			)
			.toBe(true);
		await page.setViewportSize({ height: 900, width: 320 });
		const layout = await example.evaluate((element) => ({
			visible: element.clientWidth,
			width: element.scrollWidth,
		}));
		expect(layout.width).toBeLessThanOrEqual(layout.visible);
	});
});
