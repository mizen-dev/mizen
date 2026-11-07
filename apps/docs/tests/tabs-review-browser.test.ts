import { type Browser, chromium, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
let handle: TestServerHandle;
let browser: Browser;
let page: Page;

describe("Tabs visual states", { timeout: 25_000 }, () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		// Settled focus rings: the ring grows in over 200ms otherwise.
		await page.emulateMedia({ reducedMotion: "reduce" });
		page.setDefaultTimeout(8000);
	}, 120_000);
	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
	});

	it.each(["light", "dark"] as const)(
		"aligns sizes, selection, focus, and disabled tabs in %s",
		async (theme) => {
			await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
			await page.setViewportSize({ height: 900, width: 1280 });
			await page.goto(`${handle.url}/components/tabs`, {
				waitUntil: "networkidle",
			});
			for (const [size, height] of [
				["sm", 28],
				["default", 32],
				["lg", 36],
			] as const) {
				const list = page.getByRole("tablist", {
					exact: true,
					name: `${size} tabs`,
				});
				// biome-ignore lint/performance/noAwaitInLoops: Tabs must settle and move focus before the next size is checked.
				await list.scrollIntoViewIfNeeded();
				const first = list.getByRole("tab", { exact: true, name: "List" });
				const second = list.getByRole("tab", { exact: true, name: "Board" });
				const disabled = list.getByRole("tab", {
					exact: true,
					name: "Archived",
				});
				const geometry = await first.evaluate((el) => {
					const icon = el.querySelector("svg")?.getBoundingClientRect();
					const label = el.querySelector("span")?.getBoundingClientRect();
					if (!(icon && label)) {
						throw new Error("Missing tab anatomy");
					}
					return {
						height: el.getBoundingClientRect().height,
						icon: icon.width,
						offset: Math.abs(
							icon.y + icon.height / 2 - label.y - label.height / 2
						),
					};
				});
				expect(geometry.height).toBe(height);
				expect(geometry.icon).toBe(16);
				expect(geometry.offset).toBeLessThan(1);
				expect((await list.boundingBox())?.height).toBe(height + 8);
				expect(
					await list.locator('[data-slot="tabs-indicator"]:visible').count()
				).toBe(1);
				const restingColor = await second.evaluate(
					(el) => getComputedStyle(el).color
				);
				await second.hover();
				expect(
					await second.evaluate((el) => getComputedStyle(el).color)
				).not.toBe(restingColor);
				await page.mouse.down();
				expect(
					await second.evaluate((el) => getComputedStyle(el).backgroundColor)
				).not.toBe("rgba(0, 0, 0, 0)");
				await page.mouse.up();
				await first.click();
				const before = await second.boundingBox();
				await first.focus();
				await page.keyboard.press("ArrowRight");
				expect(
					await second.evaluate(
						(el) =>
							el === document.activeElement &&
							getComputedStyle(el).outlineWidth === "3px"
					)
				).toBe(true);
				await page.keyboard.press("Enter");
				expect(await second.getAttribute("aria-selected")).toBe("true");
				expect((await second.boundingBox())?.width).toBe(before?.width);
				expect(await disabled.isDisabled()).toBe(true);
				const indicator = await list
					.locator('[data-slot="tabs-indicator"]:visible')
					.boundingBox();
				const selected = await second.boundingBox();
				if (!(indicator && selected)) {
					throw new Error("Missing indicator geometry");
				}
				expect(Math.abs(indicator.width - selected.width)).toBeLessThan(1);
				expect(Math.abs(indicator.x - selected.x)).toBeLessThan(1);
				await page.keyboard.press("ArrowRight");
				await page.keyboard.press("Enter");
				expect(await disabled.getAttribute("aria-selected")).toBe("false");
				expect(await second.getAttribute("aria-selected")).toBe("true");
			}
			const manual = page.getByRole("tablist", {
				name: "Manual vertical tabs",
			});
			await manual.scrollIntoViewIfNeeded();
			await manual.getByRole("tab", { name: "List" }).focus();
			await page.keyboard.press("ArrowDown");
			expect(
				await manual
					.getByRole("tab", { name: "Board" })
					.getAttribute("aria-selected")
			).toBe("false");
			await page.keyboard.press("Enter");
			expect(
				await manual
					.getByRole("tab", { name: "Board" })
					.getAttribute("aria-selected")
			).toBe("true");
			const sample = page.getByRole("tablist", {
				exact: true,
				name: "default tabs",
			});
			await sample.scrollIntoViewIfNeeded();
			await sample.screenshot({ path: `/private/tmp/mizen-tabs-${theme}.png` });
		}
	);

	it("preserves explicit indicators and respects forced colors and reduced motion", async () => {
		await page.emulateMedia({
			forcedColors: "active",
			reducedMotion: "reduce",
		});
		await page.goto(`${handle.url}/components/tabs`, {
			waitUntil: "networkidle",
		});
		const list = page.getByRole("tablist", { name: "Record sections" });
		await list.scrollIntoViewIfNeeded();
		await expect
			.poll(() => list.locator('[data-slot="tabs-indicator"]:visible').count())
			.toBe(1);
		const selected = list.locator('[aria-selected="true"]');
		expect(
			await selected.evaluate((el) => getComputedStyle(el).forcedColorAdjust)
		).toBe("none");
		expect(
			await list
				.locator('[data-slot="tabs-indicator"]:visible')
				.evaluate((el) => getComputedStyle(el).transitionDuration)
		).toBe("0s");
		await page.emulateMedia({
			forcedColors: "none",
			reducedMotion: "no-preference",
		});
	});

	it("keeps the removed side navigation page gone", async () => {
		const response = await page.goto(
			`${handle.url}/components/side-navigation`,
			{ waitUntil: "networkidle" }
		);
		expect(response?.status()).toBe(404);
	});
});
