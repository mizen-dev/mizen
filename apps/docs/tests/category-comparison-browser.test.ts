import { type Browser, chromium, type Locator } from "playwright";
import { expect as expectLocator } from "playwright/test";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
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

describe("category comparison browser behavior", () => {
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
		"shows signed values and pointer and keyboard tooltips in %s mode",
		async (theme) => {
			const { context, page } = await openPage(theme);
			try {
				const section = page.getByTestId("category-comparison-example");
				const chart = section.getByRole("img", {
					exact: true,
					name: "Regional revenue variance",
				});
				await expectLocator(chart).toBeVisible();
				await expectLocator(
					section.getByRole("list", { name: "Variance series" })
				).toContainText("Variance");
				await Promise.all(
					["West", "East", "Central", "South"].map((label) =>
						expectLocator(
							section.locator("svg text").filter({ hasText: label }).first()
						).toBeVisible()
					)
				);
				await section.screenshot({
					caret: "initial",
					path: `/private/tmp/mizen-category-comparison-${theme}.png`,
				});

				const tooltip = page.locator('[data-slot="chart-tooltip"]').last();
				await waitForChartMount(chart);
				const bars = await chart
					.locator('[data-ts-key^="category-comparison-bars:"]')
					.evaluateAll((rectangles) =>
						rectangles
							.map((element) => element.getBoundingClientRect())
							.filter((rect) => rect.width > 8 && rect.height > 8)
							.map((rect) => ({
								x: rect.x + rect.width / 2,
								y: rect.y + rect.height / 2,
							}))
					);
				expect(bars.length).toBeGreaterThanOrEqual(2);
				await page.mouse.move(bars[1].x, bars[1].y);
				await expectLocator(tooltip).toContainText("Variance");
				await expectLocator(tooltip).toContainText("East");
				await expectLocator(tooltip).toContainText("-$8,500");
				await page.screenshot({
					caret: "initial",
					path: `/private/tmp/mizen-category-comparison-tooltip-${theme}.png`,
				});

				await page.mouse.move(0, 0);
				await chart.scrollIntoViewIfNeeded();
				await chart.focus();
				await expectLocator(chart).toBeFocused();
				expect(await chart.getAttribute("tabindex")).toBe("0");
				await page.keyboard.press("Home");
				await expectLocator(tooltip).toContainText("West");
				await expectLocator(tooltip).toContainText("+$24,000");
				await page.keyboard.press("ArrowDown");
				await expectLocator(tooltip).toContainText("East");
				await expectLocator(tooltip).toContainText("-$8,500");
				await page.keyboard.press("ArrowDown");
				await expectLocator(tooltip).toContainText("Central");
				await expectLocator(tooltip).toContainText("+$0");
				await page.keyboard.press("ArrowDown");
				await expectLocator(tooltip).toContainText("South");
				await expectLocator(tooltip).toContainText("+$12,100");
				const categoryMarks = chart.locator(
					'[data-ts-key^="category-comparison-bars:"]'
				);
				expect(await categoryMarks.count()).toBeGreaterThanOrEqual(4);
				const zeroCategory = await categoryMarks.evaluateAll((elements) =>
					elements
						.map((element) => ({
							key: element.getAttribute("data-ts-key") ?? "",
							width: element.getBoundingClientRect().width,
						}))
						.find(({ key }) => key.endsWith(":central"))
				);
				expect(zeroCategory?.width).toBe(0);
			} finally {
				await context.close();
			}
		}
	);

	it("contains the chart at 32px text with reduced motion", async () => {
		const { context, page } = await openPage("light", 390, "reduce");
		try {
			await page.addStyleTag({
				content:
					"html { font-size: 32px !important; } * { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }",
			});
			const section = page.getByTestId("category-comparison-example");
			const chartHost = section.locator('[data-slot="chart-frame"]');
			await expectLocator(chartHost).toBeVisible();
			const boxes = await Promise.all(
				[section, chartHost].map((element) =>
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
				path: "/private/tmp/mizen-category-comparison-narrow.png",
			});
			const chart = section.getByRole("img", {
				exact: true,
				name: "Regional revenue variance",
			});
			await waitForChartMount(chart);
			await chart.scrollIntoViewIfNeeded();
			await chart.focus();
			await expectLocator(chart).toBeFocused();
			await page.keyboard.press("ArrowRight");
			await expectLocator(
				page.locator('[data-slot="chart-tooltip"]')
			).toBeVisible();
		} finally {
			await context.close();
		}
	});
});
