import { type Browser, chromium } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
// Wix lacks tnum glyphs. Verify the requested feature and preserve the owner's font choice.
const cases = [
	{ selector: '[data-slot="score-gauge-score"]', slug: "score-gauge" },
	{ selector: '[data-slot="data-table-pagination"]', slug: "data-table" },
	{
		selector: '[data-slot="overflow-list-trigger-item"] button',
		slug: "overflow-list",
	},
	{ selector: '[data-slot="timestamp"]', slug: "timestamp" },
	{ selector: '[data-slot="chart-frame"]', slug: "time-series" },
	{ selector: '[data-slot="stepper-indicator"]', slug: "stepper" },
	{ selector: '[data-slot="calendar"] [role="gridcell"]', slug: "calendar" },
	{ selector: 'input[type="time"]', slug: "time-input" },
	{ selector: 'input[type="datetime-local"]', slug: "date-time-input" },
] as const;
let handle: TestServerHandle;
let browser: Browser;

describe("changing numbers", () => {
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
			it(`requests tabular figures without replacing Wix in ${theme} at ${width}px`, async () => {
				const context = await browser.newContext({
					reducedMotion: "reduce",
					viewport: { height: 900, width },
				});
				await context.addInitScript(
					(value) => localStorage.setItem("mizen-theme", value),
					theme
				);
				const page = await context.newPage();
				try {
					for (const { slug, selector } of cases) {
						// biome-ignore lint/performance/noAwaitInLoops: One browser visits each numeric control in sequence.
						await page.goto(`${handle.url}/docs/components/${slug}`, {
							waitUntil: "networkidle",
						});
						const target = page.locator(selector).first();
						await target.waitFor({ state: "attached" });
						await page.evaluate(() => document.fonts.ready);
						const metrics = await target.evaluate((element) => {
							const computed = getComputedStyle(element);
							return {
								family: computed.fontFamily,
								variant: computed.fontVariantNumeric,
							};
						});
						expect(metrics.variant, slug).toContain("tabular-nums");
						expect(metrics.family, slug).toContain("Wix Madefor Text");
						if (slug === "score-gauge") {
							await target.screenshot({
								path: `/private/tmp/mizen-numbers-${slug}-${theme}-${width}.png`,
							});
						}
					}
				} finally {
					await context.close();
				}
			});
		});
	});
});
