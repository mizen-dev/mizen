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

const MARCH_TEN_REGEX = /March 10(?:th)?/i;
const MARCH_FOURTEEN_REGEX = /March 14(?:th)?/i;
const DAY_TEN_REGEX = /10/i;

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
		throw new AggregateError(failures, "DatePicker browser teardown failed");
	}
}

describe("DatePicker browser regression", {
	retry: 1,
	timeout: 120_000,
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

	it.each(["date-picker", "date-range-picker"])(
		"centers the calendar glyph and trigger in %s independently of font",
		async (slug) => {
			await page.setViewportSize({ height: 900, width: 1280 });
			await page.goto(`${handle.url}/components/${slug}`, {
				waitUntil: "networkidle",
			});
			const trigger = page
				.locator('[data-slot="component-preview"]')
				.first()
				.getByRole("button", { name: "Open calendar" });
			for (const font of ["Arial", "Georgia", "monospace"]) {
				// biome-ignore lint/performance/noAwaitInLoops: Verify each font after applying it.
				await page.evaluate((value) => {
					document.body.style.fontFamily = value;
				}, font);
				const alignment = await trigger.evaluate((element) => {
					const glyph = element.querySelector("svg");
					const field = element.closest('[data-slot="input-group"]');
					if (!(glyph && field)) {
						throw new Error("Missing calendar glyph or field");
					}
					const buttonBox = element.getBoundingClientRect();
					const glyphBox = glyph.getBoundingClientRect();
					const fieldBox = field.getBoundingClientRect();
					return {
						field: Math.abs(
							buttonBox.top +
								buttonBox.height / 2 -
								fieldBox.top -
								fieldBox.height / 2
						),
						horizontal: Math.abs(
							buttonBox.left +
								buttonBox.width / 2 -
								glyphBox.left -
								glyphBox.width / 2
						),
						vertical: Math.abs(
							buttonBox.top +
								buttonBox.height / 2 -
								glyphBox.top -
								glyphBox.height / 2
						),
					};
				});
				expect(alignment.horizontal).toBeLessThan(0.5);
				expect(alignment.vertical).toBeLessThan(0.5);
				expect(alignment.field).toBeLessThan(0.5);
			}
		}
	);

	it.each([
		{ slug: "date-picker", theme: "light" as const, width: 1280 },
		{ slug: "date-picker", theme: "dark" as const, width: 320 },
		{ slug: "date-range-picker", theme: "light" as const, width: 320 },
		{ slug: "date-range-picker", theme: "dark" as const, width: 1280 },
	])(
		"supports bounded dropdown navigation inside $slug in $theme at $width pixels",
		async ({ slug, theme, width }) => {
			await page.emulateMedia({ colorScheme: theme });
			await page.setViewportSize({ height: 900, width });
			await page.goto(`${handle.url}/components/${slug}`, {
				waitUntil: "networkidle",
			});
			const example = page.locator(
				slug === "date-picker"
					? "#DatePickerDropdownNavigation"
					: "#DateRangePickerDropdownNavigation"
			);
			await example.getByRole("button", { name: "Open calendar" }).click();
			const popup = page.locator('[data-slot="popover-popup"]');
			const year = popup.getByRole("combobox", { name: "Choose the Year" });

			await year.focus();
			await page.keyboard.press("ArrowDown");
			await page.keyboard.press("Escape");
			await expect
				.poll(() =>
					year.evaluate((element) => element === document.activeElement)
				)
				.toBe(true);
			expect(await popup.isVisible()).toBe(true);
			await year.click();
			const options = page
				.getByRole("listbox")
				.getByRole("option", { includeHidden: true });
			await expect.poll(() => options.count()).toBe(11);
			const selected = page.getByRole("option", { exact: true, name: "2026" });
			const spacing = await selected.evaluate((element) => {
				const text = element.firstElementChild;
				const icon = element.querySelector("svg");
				if (!(text && icon)) {
					throw new Error("Missing Select text or checkmark");
				}
				const range = document.createRange();
				range.selectNodeContents(text);
				return {
					end:
						element.getBoundingClientRect().right -
						icon.getBoundingClientRect().right,
					gap:
						icon.getBoundingClientRect().left -
						range.getBoundingClientRect().right,
				};
			});
			expect(spacing.gap).toBeGreaterThanOrEqual(7.5);
			expect(spacing.end).toBeGreaterThanOrEqual(7.5);
			await page.getByRole("option", { exact: true, name: "2028" }).click();
			await popup.getByRole("combobox", { name: "Choose the Month" }).click();
			await page.getByRole("option", { exact: true, name: "March" }).click();
			expect(
				await popup.getByRole("grid").getAttribute("aria-label")
			).toContain("March 2028");
			await popup.getByRole("button", { name: MARCH_TEN_REGEX }).click();
			if (slug === "date-range-picker") {
				await popup.getByRole("button", { name: MARCH_FOURTEEN_REGEX }).click();
			}
			await expect.poll(() => popup.isVisible()).toBe(false);
			expect(await example.getByRole("textbox").first().inputValue()).toContain(
				"2028-03-10"
			);
		}
	);

	it("opens popup on trigger click, selects a date, updates value, and closes popup", async () => {
		await page.setViewportSize({ height: 900, width: 1280 });
		const response = await page.goto(`${handle.url}/components/date-picker`, {
			waitUntil: "networkidle",
		});
		expect(response?.status()).toBe(200);

		const uncontrolledSection = page.locator(
			'[data-testid="date-picker-uncontrolled"]'
		);
		const triggerButton = uncontrolledSection.getByRole("button", {
			name: "Open calendar",
		});
		await triggerButton.click();

		const popup = page.locator('[data-slot="popover-popup"]');
		await popup.waitFor({ state: "visible" });

		const popupStyles = await popup.evaluate((element) => {
			const computed = window.getComputedStyle(element);
			return {
				borderStyle: computed.borderStyle,
				borderWidth: computed.borderWidth,
				boxShadow: computed.boxShadow,
				padding: computed.padding,
			};
		});
		expect(
			popupStyles.borderWidth === "0px" || popupStyles.borderStyle === "none"
		).toBe(true);
		expect(popupStyles.boxShadow).toBe("none");
		expect(popupStyles.padding).toBe("0px");

		const calendarShell = popup.locator('[data-slot="calendar"]');
		expect(await calendarShell.isVisible()).toBe(true);
		const calendarStyles = await calendarShell.evaluate((element) => {
			const computed = window.getComputedStyle(element);
			return {
				borderStyle: computed.borderStyle,
				borderWidth: computed.borderWidth,
			};
		});
		expect(calendarStyles.borderStyle).toBe("solid");
		expect(calendarStyles.borderWidth).not.toBe("0px");

		const activeElementRole = await page.evaluate(
			() =>
				document.activeElement?.getAttribute("role") ||
				document.activeElement?.tagName
		);
		expect(["gridcell", "BUTTON"]).toContain(activeElementRole);

		const day10 = popup.getByRole("button", { name: DAY_TEN_REGEX });
		await day10.click();

		await popup.waitFor({ state: "hidden" });

		const isTriggerFocused = await triggerButton.evaluate(
			(element) => document.activeElement === element
		);
		expect(isTriggerFocused).toBe(true);

		const input = uncontrolledSection.locator("input");
		expect(await input.inputValue()).toContain("-10");
	});
});
