import { type Browser, chromium, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
const transparentColor = /transparent|rgba\(0, 0, 0, 0\)/u;
let handle: TestServerHandle;
let browser: Browser;
let page: Page;

// The look of every change chip in the example titled `heading`.
async function chips(theme: "dark" | "light", heading: string) {
	await page.evaluate(
		(value) => localStorage.setItem("mizen-theme", value),
		theme
	);
	await page.reload({ waitUntil: "networkidle" });
	return page
		.locator(
			`section[aria-label$=": ${heading} example"] [data-slot="metric-delta"]`
		)
		.evaluateAll((elements) => {
			const context = document.createElement("canvas").getContext("2d", {
				willReadFrequently: true,
			});
			const luminance = (color: string) => {
				if (!context) {
					throw new Error("Canvas 2D context is unavailable");
				}
				context.fillStyle = color;
				context.fillRect(0, 0, 1, 1);
				const [red = 0, green = 0, blue = 0] = context.getImageData(
					0,
					0,
					1,
					1
				).data;
				const [r = 0, g = 0, b = 0] = [red, green, blue].map((channel) => {
					const value = channel / 255;
					return value <= 0.039_28
						? value / 12.92
						: ((value + 0.055) / 1.055) ** 2.4;
				});
				return 0.2126 * r + 0.7152 * g + 0.0722 * b;
			};
			return elements.map((element) => {
				const style = getComputedStyle(element);
				const [light = 0, dark = 0] = [
					luminance(style.color),
					luminance(style.backgroundColor),
				].sort((first, second) => second - first);
				return {
					border: style.borderTopColor,
					contrast: (light + 0.05) / (dark + 0.05),
					dot: getComputedStyle(element, "::before").content,
					fill: style.backgroundColor,
				};
			});
		});
}

describe("MetricDelta", { timeout: 30_000 }, () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage({ viewport: { height: 900, width: 1280 } });
		await page.goto(`${handle.url}/components/metric-trend`, {
			waitUntil: "networkidle",
		});
	}, 120_000);

	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
	});

	it("shows its tone as a dot by default", async () => {
		const dots = await chips("light", "Stat cards");
		expect(dots).toHaveLength(4);
		for (const chip of dots) {
			expect(chip.dot).toBe('""');
			expect(chip.fill).toMatch(transparentColor);
		}
	});

	it("fills a soft chip with its tone and keeps it readable in both themes", async () => {
		const light = await chips("light", "Soft change chip");
		const dark = await chips("dark", "Soft change chip");
		expect(light).toHaveLength(3);
		expect(dark).toHaveLength(3);
		for (const chip of [...light, ...dark]) {
			expect(chip.dot).toBe("none");
			expect(chip.border).toMatch(transparentColor);
			expect(chip.fill).not.toMatch(transparentColor);
			expect(chip.contrast).toBeGreaterThanOrEqual(4.5);
		}
		// Better, flat and worse each have their own fill.
		expect(new Set(light.map((chip) => chip.fill)).size).toBe(3);
	});
});
