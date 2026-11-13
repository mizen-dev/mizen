import { type Browser, chromium, type Page } from "playwright";
import { expect as expectLocator } from "playwright/test";
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

// Each layout around a copy of the control, with what the copy must do there.
const LAYOUTS = {
	column: "width:400px;display:flex;flex-direction:column",
	gridCell: "width:400px;display:grid",
	narrowRow: "width:120px;display:flex;flex-wrap:wrap",
	row: "width:600px;display:flex;flex-wrap:wrap",
} as const;

// The widths of the first control on a component page, copied into each layout.
async function widthsIn(slug: string, selector: string) {
	await page.goto(`${handle.url}/components/${slug}`, {
		waitUntil: "networkidle",
	});
	return page.evaluate(
		({ layouts, target }) => {
			const source = document.querySelector(`main ${target}`);
			if (!source) {
				throw new Error(`No ${target} on the page`);
			}
			return Object.fromEntries(
				Object.entries(layouts).map(([name, css]) => {
					const wrapper = document.createElement("div");
					wrapper.style.cssText = css;
					const copy = wrapper.appendChild(source.cloneNode(true)) as Element;
					document.body.append(wrapper);
					const result = {
						overflows: wrapper.scrollWidth > wrapper.clientWidth,
						width: copy.getBoundingClientRect().width,
					};
					wrapper.remove();
					return [name, result];
				})
			);
		},
		{ layouts: LAYOUTS, target: selector }
	);
}

describe("Control width", { timeout: 30_000 }, () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage({ viewport: { height: 900, width: 1280 } });
	}, 120_000);

	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
	});

	it.each([
		["date-picker", '[data-slot="input-group"]'],
		["date-range-picker", '[data-slot="input-group"]'],
		["input-group", '[data-slot="input-group"]'],
		["number-field", '[data-slot="number-field"]'],
		["select", 'button[role="combobox"]'],
	])("lets the layout set the width of %s", async (slug, selector) => {
		const widths = await widthsIn(slug, selector);
		// A column and a grid cell stretch the control.
		expect(widths.column?.width).toBe(400);
		expect(widths.gridCell?.width).toBe(400);
		// A row leaves it at its content width.
		expect(widths.row?.width).toBeGreaterThan(60);
		expect(widths.row?.width).toBeLessThan(360);
	});

	it.each(["date-picker", "date-range-picker", "input-group", "number-field"])(
		"shrinks %s in a row narrower than its content",
		async (slug) => {
			const selector =
				slug === "number-field"
					? '[data-slot="number-field"]'
					: '[data-slot="input-group"]';
			const { narrowRow } = await widthsIn(slug, selector);
			expect(narrowRow).toEqual({ overflows: false, width: 120 });
		}
	);

	it.each([1280, 390])(
		"keeps a date filter and the next filter on one line in a %ipx window",
		async (width) => {
			await page.setViewportSize({ height: 900, width });
			await page.goto(`${handle.url}/components/date-picker`, {
				waitUntil: "networkidle",
			});
			const row = page.locator(
				'section[aria-label$=": Filter row example"] [data-slot="inline"]'
			);
			const field = row.locator('[data-slot="input-group"]');
			const [date, period] = await row.evaluate((element) =>
				[...element.children].map((child) =>
					child.getBoundingClientRect().toJSON()
				)
			);
			if (!(date && period)) {
				throw new Error("The filter row needs a date field and a period");
			}
			expect(period.y).toBeLessThan(date.bottom);
			expect(period.x).toBeGreaterThan(date.right);
			// The field shows its whole value and is no wider than a date needs.
			const input = field.getByRole("textbox");
			await expectLocator(input).toHaveValue("2026-11-12");
			expect(
				await input.evaluate(
					(element) => element.scrollWidth <= element.clientWidth
				)
			).toBe(true);
			expect(date.width).toBeLessThan(224);
			await page.setViewportSize({ height: 900, width: 1280 });
		}
	);

	// The native width follows the font, which is 16px on a phone and 13px or
	// 14px above, by control size.
	it.each([1280, 390])(
		"fits a date and a range in a row in a %ipx window",
		async (width) => {
			await page.setViewportSize({ height: 900, width });
			const fits = async (slug: string, value: string) => {
				await page.goto(`${handle.url}/components/${slug}`, {
					waitUntil: "networkidle",
				});
				return page.evaluate((text) => {
					const group = document.querySelector(
						'main [data-slot="input-group"]'
					);
					if (!group) {
						throw new Error("No date field on the page");
					}
					const row = document.createElement("div");
					row.style.cssText = "display:flex;width:600px";
					const copy = row.appendChild(group.cloneNode(true)) as Element;
					const field = copy.querySelector("input");
					if (!field) {
						throw new Error("No input in the copy");
					}
					document.body.append(row);
					field.value = text;
					const result = field.scrollWidth <= field.clientWidth;
					row.remove();
					return result;
				}, value);
			};
			expect(await fits("date-picker", "2026-11-28")).toBe(true);
			expect(await fits("date-range-picker", "2026-11-28 – 2026-12-28")).toBe(
				true
			);
			await page.setViewportSize({ height: 900, width: 1280 });
		}
	);
});
