import { type Browser, chromium } from "playwright";
import { expect as expectLocator } from "playwright/test";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const errors: string[] = [];
const PALETTE_YEAR_TOOLTIP = /^Jan(?:This year38|Last year31)$/;
const PALETTE_ACTIVITY_TOOLTIP = /^Jan(?:Active24|New12)$/;
const TEAM_TOOLTIP = /Active teams|New teams/;
let handle: TestServerHandle;
let browser: Browser;

describe("chart frame browser behavior", () => {
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

	async function openChart(
		theme: "dark" | "light",
		width = 1280,
		reducedMotion: "reduce" | "no-preference" = "no-preference"
	) {
		const context = await browser.newContext({
			reducedMotion,
			viewport: { height: 900, width },
		});
		await context.addInitScript((preference) => {
			window.localStorage.setItem("mizen-theme", preference);
		}, theme);
		const page = await context.newPage();
		// Settled focus rings: the ring grows in over 200ms otherwise.
		await page.emulateMedia({ reducedMotion: "reduce" });
		page.setDefaultTimeout(5000);
		page.on("pageerror", (error) => errors.push(error.message));
		page.on("console", (message) => {
			if (message.type() === "error") {
				errors.push(message.text());
			}
		});
		await page.goto(`${handle.url}/internal/specimens`, { waitUntil: "load" });
		await expectLocator(page.locator("html")).toHaveAttribute(
			"data-theme",
			theme
		);
		return { context, page };
	}

	it.each(["light", "dark"] as const)(
		"renders named series and keyboard tooltips in %s mode",
		async (theme) => {
			const { context, page } = await openChart(theme);
			try {
				const palette = page.getByTestId("chart-palette-example");
				await expectLocator(
					palette.getByRole("list", { name: "Theme-aware chart series" })
				).toContainText("Series 6");
				const paletteChart = palette.getByRole("img", {
					exact: true,
					name: "Year over year totals",
				});
				await expectLocator(paletteChart).toBeVisible();
				const metrics = palette.locator('[data-slot="metric"]');
				await expectLocator(metrics).toHaveCount(3);
				const metricReadouts = [
					["April total", "61", "12 more than last year"],
					["April active teams", "39", "23 new teams in April"],
					["May growth", "42", "Up from 22 in January"],
				] as const;
				await Promise.all(
					metricReadouts.flatMap(([label, value, description], index) => {
						const metric = metrics.nth(index);
						return [
							expectLocator(
								metric.locator('[data-slot="metric-label"]')
							).toHaveText(label),
							expectLocator(
								metric.locator('[data-slot="metric-value"]')
							).toHaveText(value),
							expectLocator(
								metric.locator('[data-slot="metric-description"]')
							).toHaveText(description),
						];
					})
				);
				expect(
					await palette
						.locator('[data-slot="chart-frame"]')
						.first()
						.evaluate((frame) => getComputedStyle(frame).backgroundColor)
				).toBe("rgba(0, 0, 0, 0)");
				expect(
					await palette
						.locator('[data-slot="card"]')
						.evaluate((card) => getComputedStyle(card).backgroundColor)
				).not.toBe("rgba(0, 0, 0, 0)");
				const section = page.getByTestId("chart-example");
				const chart = section.getByRole("img", {
					exact: true,
					name: "Monthly team counts",
				});
				await expectLocator(chart).toBeVisible();
				await expectLocator(
					section.getByRole("list", { name: "Team series" })
				).toContainText("Active teams");
				await expectLocator(
					section.getByRole("list", { name: "Team series" })
				).toContainText("New teams");
				await section.screenshot({
					caret: "initial",
					path: `/private/tmp/mizen-chart-${theme}.png`,
				});

				const tooltip = page
					.locator('[data-slot="chart-tooltip"]')
					.filter({ hasText: "Active teams" });
				const keyboardTooltip = page
					.locator('[data-slot="chart-tooltip"]')
					.filter({ hasText: TEAM_TOOLTIP });
				const firstPoint = chart.locator("circle").first();
				await expectLocator(firstPoint).toBeVisible();
				const chartFrame = section.locator('[data-slot="chart-frame"]');
				const pointPosition = await chartFrame.evaluate((frame) => {
					const point = frame.querySelector("circle");
					if (!point) {
						throw new Error("The chart's first data point was not rendered");
					}
					const pointBounds = point.getBoundingClientRect();
					const frameBounds = frame.getBoundingClientRect();
					return {
						x: pointBounds.x + pointBounds.width / 2 - frameBounds.x,
						y: pointBounds.y + pointBounds.height / 2 - frameBounds.y,
					};
				});
				await chartFrame.hover({ position: pointPosition });
				await expectLocator(tooltip).toContainText("Jan");
				await expectLocator(tooltip).toContainText("Active teams");
				await expectLocator(tooltip).toContainText("42");
				await page.screenshot({
					caret: "initial",
					path: `/private/tmp/mizen-chart-tooltip-${theme}.png`,
				});
				const paletteTooltip = page.locator('[data-slot="chart-tooltip"]');
				for (const [paletteChartNode, metric, series, value] of [
					[paletteChart, metrics.nth(0), PALETTE_YEAR_TOOLTIP, "61"],
					[
						palette.getByRole("img", { exact: true, name: "Team activity" }),
						metrics.nth(1),
						PALETTE_ACTIVITY_TOOLTIP,
						"39",
					],
					[
						palette.getByRole("img", { exact: true, name: "Monthly growth" }),
						metrics.nth(2),
						"Growth28",
						"42",
					],
				] as const) {
					// biome-ignore lint/performance/noAwaitInLoops: These charts share one page and keyboard focus must move sequentially.
					await expectLocator(paletteChartNode).toBeVisible();
					await paletteChartNode.focus();
					await paletteChartNode.press("ArrowRight");
					const activeTooltip = paletteTooltip.filter({ hasText: series });
					await expectLocator(activeTooltip).toBeVisible();
					await expectLocator(
						metric.locator('[data-slot="metric-value"]')
					).toHaveText(value);
				}

				await chart.focus();
				await chart.press("ArrowRight");
				await expectLocator(keyboardTooltip).toBeVisible();
				await expectLocator(chart).toHaveCSS("outline-style", "solid");
				await expectLocator(chart).toHaveCSS("outline-width", "3px");
				await expectLocator(chart).toHaveCSS("outline-offset", "0px");
				const tooltipFrame = section.locator(".ts-chart-tooltip");
				await expectLocator(tooltipFrame).toHaveCSS("border-width", "0px");
				await expectLocator(tooltipFrame).toHaveCSS("padding", "0px");
				await expectLocator(tooltipFrame).toHaveCSS("box-shadow", "none");
				await expectLocator(tooltipFrame).toHaveCSS(
					"background-color",
					"rgba(0, 0, 0, 0)"
				);
			} finally {
				await context.close();
			}
		}
	);

	it("keeps chart and legend contained with enlarged text and reduced motion", async () => {
		const { context, page } = await openChart("light", 390, "reduce");
		try {
			await page.addStyleTag({
				content:
					"html { font-size: 32px !important; } * { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }",
			});
			const section = page.getByTestId("chart-example");
			const palette = page.getByTestId("chart-palette-example");
			const paletteGrid = page.getByTestId("chart-palette-grid");
			await expectLocator(
				palette.getByTestId("chart-palette-swatch")
			).toHaveCount(24);
			const chart = section.locator('[data-slot="chart-frame"]');
			await expectLocator(chart).toBeVisible();
			const [frameFont, svgTextFont] = await chart.evaluate((frame) => [
				getComputedStyle(frame).fontFamily,
				getComputedStyle(frame.querySelector("svg text") as SVGTextElement)
					.fontFamily,
			]);
			expect(frameFont).toContain("Wix Madefor Text Variable");
			expect(svgTextFont).toBe(frameFont);
			const bounds = await Promise.all(
				[
					section,
					chart,
					section.getByRole("list", { name: "Team series" }),
					palette,
					paletteGrid,
				].map((element) =>
					element.evaluate((node) => {
						const rect = node.getBoundingClientRect();
						return {
							right: rect.right,
							scrollWidth: node.scrollWidth,
							width: node.clientWidth,
							x: rect.left,
						};
					})
				)
			);
			for (const box of bounds) {
				expect(box.x).toBeGreaterThanOrEqual(0);
				expect(box.right).toBeLessThanOrEqual(390);
				expect(box.scrollWidth).toBeLessThanOrEqual(box.width);
			}
			await section.screenshot({
				caret: "initial",
				path: "/private/tmp/mizen-chart-narrow.png",
			});
			await chart.locator("svg").focus();
			await page.keyboard.press("ArrowRight");
			await expectLocator(
				page.locator('[data-slot="chart-tooltip"]')
			).toBeVisible();
		} finally {
			await context.close();
		}
	});
});
