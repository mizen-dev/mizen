import { type Browser, chromium, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
let handle: TestServerHandle;
let browser: Browser;
let page: Page;

describe("Pagination browser states", { timeout: 30_000 }, () => {
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
		"aligns labels and all interactive states in %s",
		async (theme) => {
			await page.emulateMedia({ colorScheme: theme });
			await page.setViewportSize({ height: 900, width: 1280 });
			await page.goto(`${handle.url}/components/pagination`, {
				waitUntil: "networkidle",
			});
			const nav = page.getByRole("navigation", { name: "Record pages" });
			await nav.scrollIntoViewIfNeeded();
			const previous = nav.locator('[aria-label="Go to previous page"]');
			const next = nav.locator('[aria-label="Go to next page"]');
			const first = nav.getByRole("link", { exact: true, name: "Page 1" });
			expect(await previous.getAttribute("href")).toBeNull();
			expect(await previous.getAttribute("tabindex")).toBe("-1");
			const disabledColor = await previous.evaluate(
				(el) => getComputedStyle(el).backgroundColor
			);
			await previous.hover();
			expect(
				await previous.evaluate((el) => getComputedStyle(el).backgroundColor)
			).toBe(disabledColor);
			const geometry = await next.evaluate((el) => {
				const icon = el.querySelector("svg")?.getBoundingClientRect();
				const label = el.querySelector("span")?.getBoundingClientRect();
				if (!(icon && label)) {
					throw new Error("Missing control anatomy");
				}
				return {
					gap: icon.x - label.right,
					height: el.getBoundingClientRect().height,
					icon: icon.width,
					offset: Math.abs(
						icon.y + icon.height / 2 - label.y - label.height / 2
					),
				};
			});
			const pageBox = await first.boundingBox();
			expect(pageBox?.width).toBe(32);
			expect(pageBox?.height).toBe(32);
			expect(geometry.height).toBe(32);
			expect(geometry.icon).toBe(16);
			expect(geometry.gap).toBe(8);
			expect(geometry.offset).toBeLessThan(1);

			const restColor = await next.evaluate(
				(el) => getComputedStyle(el).backgroundColor
			);
			await next.hover();
			const hoverColor = await next.evaluate(
				(el) => getComputedStyle(el).backgroundColor
			);
			expect(hoverColor).not.toBe(restColor);
			await page.mouse.down();
			expect(
				await next.evaluate((el) => getComputedStyle(el).backgroundColor)
			).not.toBe(hoverColor);
			await page.mouse.up();
			await first.click();
			expect(await first.getAttribute("aria-current")).toBe("page");
			await first.focus();
			await page.keyboard.press("Tab");
			const second = nav.getByRole("link", { exact: true, name: "Page 2" });
			expect(
				await second.evaluate(
					(el) =>
						el === document.activeElement &&
						getComputedStyle(el).outlineWidth === "2px"
				)
			).toBe(true);
			await page.keyboard.press("Enter");
			expect(await second.getAttribute("aria-current")).toBe("page");
			await next.click();
			expect(await next.getAttribute("aria-disabled")).toBe("true");
			expect(
				await page.getByTestId("pagination-status").textContent()
			).toContain("21–30");
			const framework = page.getByRole("navigation", {
				name: "Framework pages",
			});
			await framework.scrollIntoViewIfNeeded();
			expect(
				await framework
					.locator("svg")
					.first()
					.evaluate((el) => getComputedStyle(el).transform)
			).toBe("matrix(-1, 0, 0, 1, 0, 0)");
			expect(
				await framework
					.getByRole("link", { exact: true, name: "Page 2" })
					.evaluate(
						(element) =>
							new URL(element.getAttribute("href") ?? "", location.href).href
					)
			).toBe(`${handle.url}/docs/components/pagination?page=2`);
			const preview = page.getByRole("navigation", {
				name: "Search results pages",
			});
			await preview.scrollIntoViewIfNeeded();
			await preview.screenshot({
				path: `/private/tmp/mizen-pagination-${theme}.png`,
			});
		}
	);

	it("keeps the current page visible in forced colors", async () => {
		await page.emulateMedia({ forcedColors: "active" });
		await page.goto(`${handle.url}/components/pagination`, {
			waitUntil: "networkidle",
		});
		const current = page
			.getByRole("navigation", { name: "Search results pages" })
			.locator('[aria-current="page"]');
		expect(
			await current.evaluate((el) => getComputedStyle(el).forcedColorAdjust)
		).toBe("none");
		expect(
			await current.evaluate(
				(el) =>
					getComputedStyle(el).color === getComputedStyle(el).backgroundColor
			)
		).toBe(false);
		await page.emulateMedia({ forcedColors: "none" });
	});

	it.each(["light", "dark"] as const)(
		"centers wrapped pages without phone overflow in %s",
		async (theme) => {
			await page.emulateMedia({ colorScheme: theme });
			await page.setViewportSize({ height: 800, width: 320 });
			await page.goto(`${handle.url}/components/pagination`, {
				waitUntil: "networkidle",
			});
			const nav = page.getByRole("navigation", {
				name: "Search results pages",
			});
			await nav.scrollIntoViewIfNeeded();
			const box = await nav.boundingBox();
			if (!box) {
				throw new Error("Missing pagination");
			}
			expect(box.x).toBeGreaterThanOrEqual(0);
			expect(box.x + box.width).toBeLessThanOrEqual(320);
			expect(
				await nav
					.locator("ul")
					.evaluate((el) => getComputedStyle(el).justifyContent)
			).toBe("center");
			expect(
				await nav.locator('[data-slot="pagination-ellipsis"]').textContent()
			).toBe("…More pages");
		}
	);
});
