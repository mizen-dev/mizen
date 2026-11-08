import { type Browser, chromium } from "playwright";
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

describe("scatter chart browser behavior", () => {
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
		"supports point tooltips in %s mode",
		async (theme) => {
			const { context, page } = await open(theme);
			try {
				const example = page.getByTestId("scatter-chart-example");
				const chart = example.getByRole("img", {
					exact: true,
					name: "Assessment scores by study hours",
				});
				await expectLocator(chart).toBeVisible();
				await example.screenshot({
					caret: "initial",
					path: `/private/tmp/mizen-scatter-chart-${theme}.png`,
				});
				const points = chart.locator("circle");
				await expectLocator(points).toHaveCount(7);
				// Center the chart so the sticky docs header cannot cover the point.
				await example.evaluate((element) =>
					element.scrollIntoView({ block: "center" })
				);
				const point = await points.first().boundingBox();
				if (!point) {
					throw new Error("The scatter chart point was not rendered");
				}
				await page.mouse.move(
					point.x + point.width / 2,
					point.y + point.height / 2
				);
				const tooltip = page.locator('[data-slot="chart-tooltip"]');
				await expectLocator(tooltip).toContainText("Student 1");
				await expectLocator(tooltip).toContainText("2");
				await expectLocator(tooltip).toContainText("62");
				await chart.focus();
				await page.keyboard.press("ArrowRight");
				await expectLocator(tooltip).toBeVisible();
				await expectLocator(tooltip).toContainText("Student 2");
				await expectLocator(tooltip).toContainText("4");
				await expectLocator(tooltip).toContainText("71");
				// The exact table is visually hidden but present for assistive technology.
				const dataRegion = example.getByRole("region", {
					name: "Assessment scores by study hours data",
				});
				await expectLocator(dataRegion).toContainText("2");
				await expectLocator(dataRegion).toContainText("62");
				await example
					.getByText("Single-observation example", { exact: true })
					.click();
				const single = page.getByTestId("scatter-single-point");
				await expectLocator(single.locator("circle")).toHaveCount(1);
				await expectLocator(
					single.locator('[data-slot="chart-frame"] svg').first()
				).toBeVisible();
			} finally {
				await context.close();
			}
		}
	);

	it("keeps the chart and exact table inside a narrow viewport", async () => {
		const { context, page } = await open("light", 390);
		try {
			const example = page.getByTestId("scatter-chart-example");
			const bounds = await example.evaluate((element) => {
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
});
