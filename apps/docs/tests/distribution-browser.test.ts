import { type Browser, chromium, type Locator } from "playwright";
import { expect as expectLocator } from "playwright/test";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
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
				if (!host) {
					return Number.POSITIVE_INFINITY;
				}
				const widthDifference = Math.abs(
					node.viewBox.baseVal.width - host.getBoundingClientRect().width
				);
				const hasVisibleBin = Array.from(
					node.querySelectorAll('[data-ts-key^="distribution-bars:"]')
				).some((bin) => {
					const { height, width } = bin.getBoundingClientRect();
					return width > 8 && height > 8;
				});
				return hasVisibleBin ? widthDifference : Number.POSITIVE_INFINITY;
			})
		)
		.toBeLessThan(1);
}

describe("distribution browser behavior", () => {
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
		await page.goto(`${handle.url}/internal/specimens`, { waitUntil: "load" });
		await expectLocator(page.locator("html")).toHaveAttribute(
			"data-theme",
			theme
		);
		return { context, page };
	}

	it.each(["light", "dark"] as const)(
		"counts endpoint and interior values and supports ordered keyboard tooltips in %s mode",
		async (theme) => {
			const { context, page } = await openPage(theme);
			try {
				const section = page.getByTestId("distribution-example");
				const chart = section.getByRole("img", {
					exact: true,
					name: "Support resolution time distribution",
				});
				await expectLocator(chart).toBeVisible();
				await expectLocator(
					section.getByRole("list", { name: "Tickets series" })
				).toContainText("Tickets");
				await section.screenshot({
					caret: "initial",
					path: `/private/tmp/mizen-distribution-${theme}.png`,
				});

				await waitForChartMount(chart);
				const bins = chart.locator('[data-ts-key^="distribution-bars:"]');
				await expectLocator(bins).toHaveCount(8);
				const tooltip = page.locator('[data-slot="chart-tooltip"]').last();
				const visibleBin = await bins.evaluateAll(
					(elements) =>
						elements
							.map((element) => element.getBoundingClientRect())
							.filter((rect) => rect.width > 8 && rect.height > 8)
							.map((rect) => ({
								x: rect.x + rect.width / 2,
								y: rect.y + rect.height / 2,
							}))[0]
				);
				expect(visibleBin).toBeDefined();
				if (visibleBin) {
					await page.mouse.move(visibleBin.x, visibleBin.y);
					await expectLocator(tooltip).toContainText("Tickets");
					await expectLocator(tooltip).toContainText("5");
					await page.screenshot({
						caret: "initial",
						path: `/private/tmp/mizen-distribution-pointer-${theme}.png`,
					});
				}
				await page.mouse.move(0, 0);
				await chart.scrollIntoViewIfNeeded();
				await chart.focus();
				await expectLocator(chart).toBeFocused();
				await page.keyboard.press("Home");
				await expectLocator(tooltip).toContainText("0–10 minutes");
				await expectLocator(tooltip).toContainText("Tickets");
				await expectLocator(tooltip).toContainText("0");
				await page.keyboard.press("ArrowRight");
				await expectLocator(tooltip).toContainText("10–20 minutes");
				await expectLocator(tooltip).toContainText("5");
				await page.keyboard.press("ArrowRight");
				await expectLocator(tooltip).toContainText("20–30 minutes");
				await expectLocator(tooltip).toContainText("14");
				await page.keyboard.press("ArrowRight");
				await expectLocator(tooltip).toContainText("30–40 minutes");
				await expectLocator(tooltip).toContainText("9");
				await page.screenshot({
					caret: "initial",
					path: `/private/tmp/mizen-distribution-tooltip-${theme}.png`,
				});
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
			const section = page.getByTestId("distribution-example");
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
				path: "/private/tmp/mizen-distribution-narrow.png",
			});
			const chart = section.getByRole("img", {
				exact: true,
				name: "Support resolution time distribution",
			});
			await waitForChartMount(chart);
			await chart.scrollIntoViewIfNeeded();
			await chart.focus();
			await page.keyboard.press("Home");
			await expectLocator(
				page.locator('[data-slot="chart-tooltip"]')
			).toContainText("0–10 minutes");
		} finally {
			await context.close();
		}
	});
});
