import { type Browser, chromium, type Locator } from "playwright";
import { expect as expectLocator } from "playwright/test";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
const REQUEST_RANGE_NAME = /Requests range/u;
const errors: string[] = [];
let handle: TestServerHandle;
let browser: Browser;

async function waitForChartMount(svg: Locator): Promise<void> {
	await expectLocator
		.poll(() =>
			svg.evaluate((node) => {
				if (!(node instanceof SVGSVGElement)) {
					return Number.POSITIVE_INFINITY;
				}
				const host = node.closest(".ts-chart-host");
				return host
					? Math.abs(
							node.viewBox.baseVal.width - host.getBoundingClientRect().width
						)
					: Number.POSITIVE_INFINITY;
			})
		)
		.toBeLessThan(1);
}

describe("heatmap browser behavior", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
	}, 120_000);

	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
		expect(errors).toEqual([]);
	}, 120_000);

	async function open(theme: "dark" | "light", width = 1280) {
		const context = await browser.newContext({
			viewport: { height: 900, width },
		});
		await context.addInitScript(
			(preference) => window.localStorage.setItem("mizen-theme", preference),
			theme
		);
		const page = await context.newPage();
		page.setDefaultTimeout(5000);
		page.on("pageerror", (error) => errors.push(error.message));
		await page.goto(`${handle.url}/internal/specimens`, { waitUntil: "load" });
		await expectLocator(page.locator("html")).toHaveAttribute(
			"data-theme",
			theme
		);
		return { context, page };
	}

	it.each(["light", "dark"] as const)(
		"exposes exact cells and chart tooltips in %s mode",
		async (theme) => {
			const { context, page } = await open(theme);
			try {
				const heatmap = page.getByTestId("heatmap-example");
				const chart = heatmap.getByRole("img", {
					name: "Requests by weekday and time",
				});
				await expectLocator(chart).toBeVisible();
				await heatmap.screenshot({
					caret: "initial",
					path: `/private/tmp/mizen-heatmap-${theme}.png`,
				});
				await expectLocator(
					heatmap.getByRole("img", { name: REQUEST_RANGE_NAME })
				).toContainText("No data");
				// The exact table is visually hidden but present for assistive technology.
				await expectLocator(heatmap.getByRole("table")).toContainText(
					"No data"
				);
				await expectLocator(heatmap.locator('data[value="0"]')).toHaveCount(2);
				const cells = chart.locator("rect");
				await expectLocator(cells).toHaveCount(28);
				// The chart remounts once it measures its container; hover after that.
				await waitForChartMount(chart);
				async function hoverCell(index: number) {
					const bounds = await cells.nth(index).boundingBox();
					if (!bounds) {
						throw new Error("Heatmap cell was not rendered");
					}
					await page.mouse.move(
						bounds.x + bounds.width / 2,
						bounds.y + bounds.height / 2
					);
				}
				await hoverCell(6);
				const tooltip = page.locator('[data-slot="chart-tooltip"]');
				await expectLocator(tooltip).toContainText("Morning · Sun");
				await expectLocator(tooltip).toContainText("Requests");
				await expectLocator(tooltip).toContainText("0");
				await hoverCell(13);
				await expectLocator(tooltip).toContainText("Afternoon · Sun");
				await expectLocator(tooltip).toContainText("No data");
				await chart.focus();
				await chart.press("ArrowRight");
				await expectLocator(tooltip).toBeVisible();
				await expectLocator(tooltip).toContainText("Evening · Sun");
				await expectLocator(tooltip).toContainText("2");
			} finally {
				await context.close();
			}
		}
	);

	it("contains the chart and data table in a narrow viewport", async () => {
		const { context, page } = await open("light", 390);
		try {
			const heatmap = page.getByTestId("heatmap-example");
			const bounds = await heatmap.evaluate((element) => {
				const rect = element.getBoundingClientRect();
				return {
					right: rect.right,
					scrollWidth: element.scrollWidth,
					width: element.clientWidth,
				};
			});
			expect(bounds.right).toBeLessThanOrEqual(390);
			expect(bounds.scrollWidth).toBeLessThanOrEqual(bounds.width);
		} finally {
			await context.close();
		}
	});

	it("wraps the legend without page overflow at 200% text on 320px", async () => {
		const { context, page } = await open("light", 320);
		try {
			await page.evaluate(() => {
				document.documentElement.style.fontSize = "32px";
			});
			const bounds = await page.evaluate(() => {
				const legend = document.querySelector('[data-slot="heatmap-legend"]');
				if (!legend) {
					throw new Error("Heatmap legend was not rendered");
				}
				const rect = legend.getBoundingClientRect();
				return {
					documentWidth: document.documentElement.clientWidth,
					legendRight: rect.right,
					pageWidth: document.documentElement.scrollWidth,
				};
			});
			expect(bounds.legendRight).toBeLessThanOrEqual(bounds.documentWidth);
			expect(bounds.pageWidth).toBeLessThanOrEqual(bounds.documentWidth);
			await expectLocator(
				page.getByRole("img", { name: REQUEST_RANGE_NAME })
			).toContainText("No data");
		} finally {
			await context.close();
		}
	});
});
