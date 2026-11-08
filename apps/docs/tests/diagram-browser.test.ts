import { type Browser, chromium } from "playwright";
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
describe("Diagrams", () => {
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
	});
	describe.each(["light", "dark"])("%s theme", (theme) => {
		describe.each([1280, 375])("%s width", (width) => {
			it(`renders every example diagram in ${theme} at ${width}px`, async () => {
				const context = await browser.newContext({
					reducedMotion: "reduce",
					viewport: { height: 1000, width },
				});
				await context.addInitScript(
					(value) => localStorage.setItem("mizen-theme", value),
					theme
				);
				const page = await context.newPage();
				const errors: string[] = [];
				page.on("pageerror", (error) => errors.push(error.message));
				try {
					await page.goto(`${handle.url}/docs/components/diagram`, {
						waitUntil: "networkidle",
					});
					for (const type of [
						"flowchart",
						"sequence",
						"er",
						"state",
						"class",
						"pie",
						"gantt",
						"timeline",
					]) {
						// biome-ignore lint/performance/noAwaitInLoops: Wait for each independently loaded grammar.
						await expectLocator(
							page
								.locator(`[data-slot="diagram-canvas"] svg.pele-${type}`)
								.first()
						).toBeVisible();
					}
					const figures = page.locator('[data-slot="diagram"]');
					await expectLocator(figures.first()).toHaveAttribute(
						"aria-label",
						"Release pipeline"
					);
					await expectLocator(
						page.getByRole("heading", { exact: true, name: "Diagram" })
					).toBeVisible();
					const ids = await page
						.locator('[data-slot="diagram-canvas"] [id]')
						.evaluateAll((nodes) => nodes.map((node) => node.id));
					expect(new Set(ids).size).toBe(ids.length);
					// Each diagram fits its figure, and text never drops below 12px.
					const bounds = await page
						.locator('[data-slot="diagram-canvas"]')
						.evaluateAll((canvases) =>
							canvases.map((canvas) => {
								const figure = canvas.closest('[data-slot="diagram"]');
								const texts = [...canvas.querySelectorAll("svg text")];
								return {
									fits:
										canvas.getBoundingClientRect().width <=
										(figure?.getBoundingClientRect().width ?? 0) + 1,
									minimumText: texts.length
										? Math.min(
												...texts.map((text) =>
													Number.parseFloat(getComputedStyle(text).fontSize)
												)
											)
										: 12,
								};
							})
						);
					for (const bound of bounds) {
						expect(bound.fits).toBe(true);
						expect(bound.minimumText).toBeGreaterThanOrEqual(12);
					}
					expect(
						await page.evaluate(
							() => document.documentElement.scrollWidth <= innerWidth + 1
						)
					).toBe(true);
					// Zoom controls stay hidden until the diagram is hovered or focused.
					const zoom = figures.first().locator(".pele-zoom");
					if (await zoom.count()) {
						expect(
							await zoom.evaluate(
								(element) => getComputedStyle(element).opacity
							)
						).toBe("0");
					}
					await page
						.locator("#DiagramUpdatingExample")
						.getByRole("button", { name: "Add publication step" })
						.click();
					await expectLocator(
						page.locator(
							'#DiagramUpdatingExample [data-slot="diagram-canvas"] svg'
						)
					).toContainText("Published");
					await page
						.locator("#DiagramUpdatingExample")
						.getByRole("button", { name: "Show draft flow" })
						.click();
					await expectLocator(
						page.locator(
							'#DiagramUpdatingExample [data-slot="diagram-canvas"] svg'
						)
					).not.toContainText("Published");
					const invalid = page.locator(
						'[data-slot="diagram"][aria-label="Invalid workflow"]'
					);
					await expectLocator(
						invalid.locator('[data-status="error"]')
					).toBeVisible();
					await expectLocator(invalid).toContainText("Line 2, column");
					await expectLocator(
						page.locator('[data-slot="diagram"][aria-label="Empty workflow"]')
					).toContainText("No diagram to show");
					await expectLocator(
						page.locator('[data-slot="diagram"][aria-label="Loading workflow"]')
					).toHaveAttribute("aria-busy", "true");
					await figures.first().screenshot({
						path: `/private/tmp/mizen-diagram-${theme}-${width}.png`,
					});
					expect(errors).toEqual([]);
				} finally {
					await context.close();
				}
			}, 30_000);
		});
	});
});
