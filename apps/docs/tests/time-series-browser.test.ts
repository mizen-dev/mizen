import { type Browser, chromium, type Locator } from "playwright";
import { expect as expectLocator } from "playwright/test";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
// SVG path commands: "M x,y" and "L x,y" vertices.
// Line vertices: the M point and each L or cubic C endpoint (C carries two
// control points first).
const LINE_VERTEX =
	/[MLC](?:[\d.e-]+,[\d.e-]+,){0,2}(?<x>[\d.]+),(?<y>[\d.]+)/u;
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

function xAxisLabels(svg: Locator) {
	return svg.locator("text").evaluateAll((elements) => {
		const labels = elements.map((element) => {
			const bounds = element.getBoundingClientRect();
			return {
				left: bounds.left,
				right: bounds.right,
				text: element.textContent?.trim() ?? "",
				top: bounds.top,
			};
		});
		const bottomAxisTop = Math.max(...labels.map(({ top }) => top));
		return labels
			.filter(({ top }) => Math.abs(top - bottomAxisTop) < 1)
			.sort((left, right) => left.left - right.left);
	});
}

describe("time series browser behavior", () => {
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

	async function openPage(
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
		page.setDefaultTimeout(5000);
		page.on("pageerror", (error) => errors.push(error.message));
		page.on("console", (message) => {
			if (message.type() === "error") {
				errors.push(message.text());
			}
		});
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		await expectLocator(page.locator("html")).toHaveAttribute(
			"data-theme",
			theme
		);
		return { context, page };
	}

	it.each(["light", "dark"] as const)(
		"shows timezone-aware points and keyboard tooltips in %s mode",
		async (theme) => {
			const { context, page } = await openPage(theme);
			try {
				const metric = page.getByTestId("metric-trend-example");
				await expectLocator(
					metric.getByText("Sign-ins on March 20")
				).toBeVisible();
				await expectLocator(
					metric.getByText("17", { exact: true })
				).toBeVisible();
				const sparkline = metric.getByRole("img", {
					exact: true,
					name: "Sign-in activity sparkline",
				});
				await expectLocator(sparkline).toBeVisible();
				const frame = metric.locator('[data-slot="chart-frame"]');
				const layoutBounds = await metric
					.getByTestId("metric-trend-layout")
					.boundingBox();
				expect(layoutBounds?.width).toBeLessThanOrEqual(640);
				const frameBounds = await frame.boundingBox();
				expect(frameBounds).not.toBeNull();
				expect(frameBounds?.height).toBe(64);
				expect(frameBounds?.width).toBeLessThanOrEqual(256);
				await metric.screenshot({
					caret: "initial",
					path: `/private/tmp/mizen-metric-trend-${theme}.png`,
				});
				expect(await metric.getByRole("list").count()).toBe(0);
				await waitForChartMount(sparkline);
				await sparkline.scrollIntoViewIfNeeded();
				await sparkline.focus();
				await expectLocator(sparkline).toBeFocused();
				expect(await sparkline.getAttribute("tabindex")).toBe("0");
				await page.keyboard.press("ArrowRight");
				await expectLocator(
					page.locator('[data-slot="chart-tooltip"]')
				).toContainText("Sign-ins");

				const section = page.getByTestId("time-series-example");
				const chart = section.getByRole("img", {
					exact: true,
					name: "Daily sign-ins",
				});
				await expectLocator(chart).toBeVisible();
				await expectLocator(
					section.getByRole("list", { name: "Sign-ins series" })
				).toContainText("Sign-ins");
				await expectLocator(section.locator("svg text").first()).toBeVisible();
				await section.screenshot({
					caret: "initial",
					path: `/private/tmp/mizen-time-series-${theme}.png`,
				});

				const tooltip = page.locator('[data-slot="chart-tooltip"]').last();
				const chartSvg = chart;
				await waitForChartMount(chartSvg);
				// Resting points are hidden, so read the fourth vertex from the line.
				const zeroPoint = await chart.evaluate((svg, vertexSource) => {
					const vertices = [
						...svg.querySelectorAll(".ts-chart__line path"),
					].flatMap((path) =>
						[
							...(path.getAttribute("d") ?? "").matchAll(
								new RegExp(vertexSource, "gu")
							),
						].map((match) => [Number(match[1]), Number(match[2])])
					);
					const [x, y] = vertices[3];
					const matrix = (svg as SVGSVGElement).getScreenCTM();
					const point = new DOMPoint(x, y).matrixTransform(matrix ?? undefined);
					return { x: point.x, y: point.y };
				}, LINE_VERTEX.source);
				await page.mouse.move(zeroPoint.x, zeroPoint.y);
				await expectLocator(tooltip).toContainText("Mar 12");
				await expectLocator(tooltip).toContainText("0");
				await page.screenshot({
					caret: "initial",
					path: `/private/tmp/mizen-time-series-tooltip-${theme}.png`,
				});

				await chartSvg.scrollIntoViewIfNeeded();
				await chartSvg.focus();
				await expectLocator(chartSvg).toBeFocused();
				expect(await chartSvg.getAttribute("tabindex")).toBe("0");
				await page.keyboard.press("ArrowRight");
				await expectLocator(tooltip).toBeVisible();
				await expectLocator(tooltip).toContainText("Sign-ins");
			} finally {
				await context.close();
			}
		}
	);

	it("keeps the metric and sparkline compact on a 320px canvas", async () => {
		const { context, page } = await openPage("light", 320);
		try {
			const metric = page.getByTestId("metric-trend-example");
			const chart = metric.locator('[data-slot="chart-frame"]');
			const chartBounds = await chart.boundingBox();
			expect(chartBounds).not.toBeNull();
			expect(chartBounds?.height).toBe(64);
			expect(chartBounds?.width).toBeLessThanOrEqual(256);
			const pageWidth = await page.evaluate(
				() => document.documentElement.scrollWidth
			);
			expect(pageWidth).toBeLessThanOrEqual(320);
			await metric.screenshot({
				caret: "initial",
				path: "/private/tmp/mizen-metric-trend-narrow.png",
			});
		} finally {
			await context.close();
		}
	});

	it.each(["light", "dark"] as const)(
		"keeps compact analytics chart date labels clearly separated in %s mode",
		async (theme) => {
			const { context, page } = await openPage(theme);
			try {
				const chart = page
					.getByTestId("analytics-workspace-trend")
					.getByRole("img", { name: "Daily API requests" });
				await waitForChartMount(chart);
				const labels = await xAxisLabels(chart);
				expect(labels.length).toBeGreaterThanOrEqual(3);
				expect(labels.map(({ text }) => text).join(" ")).toContain("Sep");
				expect(labels.map(({ text }) => text).join(" ")).toContain("Oct");
				for (let index = 1; index < labels.length; index += 1) {
					expect(
						labels[index].left - labels[index - 1].right
					).toBeGreaterThanOrEqual(11);
				}
				await page.getByTestId("analytics-workspace-example").screenshot({
					path: `/private/tmp/mizen-analytics-axis-${theme}-wide.png`,
				});

				await page.setViewportSize({ height: 900, width: 390 });
				await page.evaluate(() => {
					document.documentElement.style.fontSize = "32px";
				});
				await waitForChartMount(chart);
				const narrowLabels = await xAxisLabels(chart);
				expect(narrowLabels.length).toBeGreaterThanOrEqual(2);
				for (let index = 1; index < narrowLabels.length; index += 1) {
					expect(
						narrowLabels[index].left - narrowLabels[index - 1].right
					).toBeGreaterThanOrEqual(11);
				}
				await page.getByTestId("analytics-workspace-example").screenshot({
					path: `/private/tmp/mizen-analytics-axis-${theme}-narrow-text200.png`,
				});
			} finally {
				await context.close();
			}
		}
	);

	it("contains the metric and chart with enlarged text and reduced motion", async () => {
		const { context, page } = await openPage("light", 390, "reduce");
		try {
			await page.addStyleTag({
				content:
					"html { font-size: 32px !important; } * { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }",
			});
			const section = page.getByTestId("time-series-example");
			const chart = section.locator('[data-slot="chart-frame"]');
			await expectLocator(chart).toBeVisible();
			const [frameFont, svgTextFont] = await chart.evaluate((frame) => [
				getComputedStyle(frame).fontFamily,
				getComputedStyle(frame.querySelector("svg text") as SVGTextElement)
					.fontFamily,
			]);
			expect(frameFont).toContain("Geist Variable");
			expect(svgTextFont).toBe(frameFont);
			const boxes = await Promise.all(
				[page.getByTestId("metric-trend-example"), section, chart].map(
					(element) =>
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
			for (const box of boxes) {
				expect(box.x).toBeGreaterThanOrEqual(0);
				expect(box.right).toBeLessThanOrEqual(390);
				expect(box.scrollWidth).toBeLessThanOrEqual(box.width);
			}
			await section.screenshot({
				caret: "initial",
				path: "/private/tmp/mizen-time-series-narrow.png",
			});
			const chartSvg = chart.locator("svg");
			await waitForChartMount(chartSvg);
			await chartSvg.scrollIntoViewIfNeeded();
			await chartSvg.focus();
			await expectLocator(chartSvg).toBeFocused();
			expect(await chartSvg.getAttribute("tabindex")).toBe("0");
			await page.keyboard.press("ArrowRight");
			await expectLocator(
				page.locator('[data-slot="chart-tooltip"]')
			).toBeVisible();
		} finally {
			await context.close();
		}
	});
});
