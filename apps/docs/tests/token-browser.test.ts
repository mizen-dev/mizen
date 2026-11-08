import { type Browser, chromium, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
let browser: Browser;
let page: Page;
let handle: TestServerHandle;

describe("Token review", { timeout: 30_000 }, () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage({ viewport: { height: 1000, width: 1440 } });
	}, 120_000);
	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
	});
	it.each(["light", "dark"] as const)(
		"supports colors, contrast, keyboard actions, links, and removal in %s",
		async (theme) => {
			await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
			await page.goto(`${handle.url}/components/token`, {
				waitUntil: "networkidle",
			});
			const tokens = page.locator(
				'#TokenColorsExample [data-slot="token"]:not([data-disabled])'
			);
			await tokens.first().waitFor();
			expect(await tokens.count()).toBe(11);
			const ratios = await tokens.evaluateAll((els) => {
				const canvas = document.createElement("canvas");
				canvas.width = 1;
				canvas.height = 1;
				const ctx = canvas.getContext("2d");
				if (!ctx) {
					throw new Error("Missing color measurement context");
				}
				function luminance(color: string) {
					if (!ctx) {
						throw new Error("Missing context");
					}
					ctx.clearRect(0, 0, 1, 1);
					ctx.fillStyle = color;
					ctx.fillRect(0, 0, 1, 1);
					const pixel = ctx.getImageData(0, 0, 1, 1).data;
					const rgb = [pixel[0], pixel[1], pixel[2]].map((value) => {
						const s = value / 255;
						return s <= 0.040_45 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
					});
					return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
				}
				return els.map((el) => {
					const s = getComputedStyle(el);
					const f = luminance(s.color);
					const b = luminance(s.backgroundColor);
					return (Math.max(f, b) + 0.05) / (Math.min(f, b) + 0.05);
				});
			});
			expect(Math.min(...ratios)).toBeGreaterThanOrEqual(4.5);
			const filter = page.getByRole("button", {
				exact: true,
				name: "Accessibility filter",
			});
			await page.keyboard.press("Tab");
			await filter.focus();
			expect(
				await filter.evaluate((el) => getComputedStyle(el).outlineColor)
			).not.toBe("rgba(0, 0, 0, 0)");
			await filter.press("Enter");
			expect(await filter.getAttribute("aria-pressed")).toBe("true");
			await page
				.getByRole("button", { exact: true, name: "Remove Maya Chen" })
				.click();
			expect(
				await page.getByText("Maya was removed", { exact: true }).count()
			).toBe(1);
			expect(
				await page
					.getByRole("button", { exact: true, name: "Maya Chen" })
					.count()
			).toBe(0);
			expect(
				await page
					.getByRole("link", { name: "Unavailable link" })
					.getAttribute("href")
			).toBeNull();
			const glyphBounds = await page
				.locator(
					'#TokenSizesExample [data-slot="token"] > span[aria-hidden="false"]'
				)
				.evaluateAll((labels) =>
					labels.map((label) => {
						const clip = label.getBoundingClientRect();
						const text = document.createRange();
						text.selectNodeContents(label);
						const bounds = text.getBoundingClientRect();
						return {
							clearanceAbove: bounds.top - clip.top,
							clearanceBelow: clip.bottom - bounds.bottom,
						};
					})
				);
			expect(glyphBounds.length).toBe(3);
			expect(
				glyphBounds.every(
					(bounds) =>
						bounds.clearanceAbove >= -0.5 && bounds.clearanceBelow >= -0.5
				)
			).toBe(true);
			await page
				.locator("#TokenSizesExample")
				.screenshot({ path: `/private/tmp/mizen-token-clipping-${theme}.png` });
			await page
				.locator('#TokenSizesExample [data-slot="token"]')
				.first()
				.waitFor();
			expect(
				await page
					.locator('#TokenSizesExample [data-slot="token"]')
					.evaluateAll((es) => es.map((e) => e.getBoundingClientRect().height))
			).toEqual([24, 28, 32]);
		}
	);
});
