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

describe("Segmented control browser states", { timeout: 20_000 }, () => {
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
		"aligns every size and preserves keyboard and disabled states in %s",
		async (theme) => {
			await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
			await page.setViewportSize({ height: 900, width: 1280 });
			await page.goto(`${handle.url}/components/segmented-control`, {
				waitUntil: "networkidle",
			});
			for (const [size, height] of [
				["sm", 28],
				["default", 32],
				["lg", 36],
			] as const) {
				const group = page.getByRole("group", {
					exact: true,
					name: `${size} views`,
				});
				// biome-ignore lint/performance/noAwaitInLoops: Native interaction and geometry checks must run sequentially.
				await group.scrollIntoViewIfNeeded();
				const list = group.getByRole("button", { exact: true, name: "List" });
				const board = group.getByRole("button", { exact: true, name: "Board" });
				const chart = group.getByRole("button", { exact: true, name: "Chart" });
				const geometry = await list.evaluate((el) => {
					const icon = el.querySelector("svg")?.getBoundingClientRect();
					const label = el.querySelector("span")?.getBoundingClientRect();
					if (!(icon && label)) {
						throw new Error("Missing segment anatomy");
					}
					return {
						gap: label.x - icon.right,
						height: el.getBoundingClientRect().height,
						offset: Math.abs(
							icon.y + icon.height / 2 - label.y - label.height / 2
						),
						width: icon.width,
					};
				});
				expect(geometry).toMatchObject({ gap: 4, height, width: 16 });
				expect(geometry.offset).toBeLessThan(1);
				expect((await group.boundingBox())?.height).toBe(height + 8);
				expect(await chart.isDisabled()).toBe(true);
				await list.focus();
				await page.keyboard.press("ArrowRight");
				expect(
					await board.evaluate((el) => el === document.activeElement)
				).toBe(true);
				expect(
					await board.evaluate((el) => getComputedStyle(el).outlineWidth)
				).toBe("3px");
				await page.keyboard.press("Space");
				expect(await board.getAttribute("aria-pressed")).toBe("true");
				await page.keyboard.press("ArrowRight");
				expect(
					await chart.evaluate((el) => el === document.activeElement)
				).toBe(false);
				await board.click();
				expect(await board.getAttribute("aria-pressed")).toBe("false");
				await list.click();
			}
			const managed = page.getByRole("group", { name: "Managed view" });
			expect(
				await managed.getByRole("button", { name: "Table" }).isDisabled()
			).toBe(true);
			expect(
				await managed
					.getByRole("button", { name: "Table" })
					.getAttribute("aria-pressed")
			).toBe("true");
			const vertical = page.getByRole("group", { name: "Vertical views" });
			await vertical.scrollIntoViewIfNeeded();
			await vertical.getByRole("button", { name: "List" }).focus();
			await page.keyboard.press("ArrowDown");
			expect(
				await vertical
					.getByRole("button", { name: "Board" })
					.evaluate((el) => el === document.activeElement)
			).toBe(true);
			const sample = page.getByRole("group", {
				exact: true,
				name: "default views",
			});
			await sample.scrollIntoViewIfNeeded();
			await sample.screenshot({
				path: `/private/tmp/mizen-segmented-${theme}.png`,
			});
		}
	);

	it("distinguishes hover, pressed, and selected states without changing disabled items", async () => {
		await page.emulateMedia({ forcedColors: "none", reducedMotion: "reduce" });
		await page.goto(`${handle.url}/components/segmented-control`, {
			waitUntil: "networkidle",
		});
		const group = page.getByRole("group", {
			exact: true,
			name: "default views",
		});
		await group.scrollIntoViewIfNeeded();
		const board = group.getByRole("button", { exact: true, name: "Board" });
		const chart = group.getByRole("button", { exact: true, name: "Chart" });
		const idle = await board.evaluate((el) => getComputedStyle(el).color);
		await board.hover();
		expect(await board.evaluate((el) => getComputedStyle(el).color)).not.toBe(
			idle
		);
		await page.mouse.down();
		expect(
			await board.evaluate((el) => getComputedStyle(el).backgroundColor)
		).not.toBe("rgba(0, 0, 0, 0)");
		await page.mouse.up();
		expect(await board.getAttribute("aria-pressed")).toBe("true");
		const disabledColor = await chart.evaluate(
			(el) => getComputedStyle(el).color
		);
		await chart.hover();
		expect(await chart.evaluate((el) => getComputedStyle(el).color)).toBe(
			disabledColor
		);
		await page.emulateMedia({ forcedColors: "active" });
		expect(
			await board.evaluate((el) => getComputedStyle(el).forcedColorAdjust)
		).toBe("none");
		expect(
			await board.evaluate(
				(el) =>
					getComputedStyle(el).backgroundColor === getComputedStyle(el).color
			)
		).toBe(false);
		await page.emulateMedia({ forcedColors: "none" });
	});

	it("keeps overflow bounded and focus visible on phones", async () => {
		await page.setViewportSize({ height: 800, width: 320 });
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.goto(`${handle.url}/components/segmented-control`, {
			waitUntil: "networkidle",
		});
		const group = page.getByRole("group", { exact: true, name: "lg views" });
		await group.scrollIntoViewIfNeeded();
		const box = await group.boundingBox();
		if (!box) {
			throw new Error("Missing segmented control");
		}
		expect(box.x).toBeGreaterThanOrEqual(0);
		expect(box.x + box.width).toBeLessThanOrEqual(320);
		expect(await group.evaluate((el) => getComputedStyle(el).overflowX)).toBe(
			"auto"
		);
		expect(
			await group
				.getByRole("button", { name: "List" })
				.evaluate((el) => getComputedStyle(el).transitionDuration)
		).toBe("0s");
	});
});
