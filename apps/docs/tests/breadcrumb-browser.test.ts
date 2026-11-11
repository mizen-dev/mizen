import { type Browser, chromium, type Page } from "playwright";
import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from "vite-plus/test";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
let handle: TestServerHandle;
let browser: Browser;
let page: Page;
const errors: string[] = [];

describe("Breadcrumb browser states", { timeout: 20_000 }, () => {
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
		page.on("pageerror", (error) => errors.push(error.message));
		page.on("console", (message) => {
			if (message.type() === "error") {
				errors.push(message.text());
			}
		});
	}, 120_000);
	beforeEach(async () => {
		errors.length = 0;
		await page.setViewportSize({ height: 900, width: 1280 });
		await page.goto(`${handle.url}/components/breadcrumb`, {
			waitUntil: "networkidle",
		});
	});
	afterEach(() => expect(errors).toEqual([]));
	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
	});
	it.each(["light", "dark"] as const)(
		"aligns icons and preserves hover and focus in %s",
		async (theme) => {
			await page.emulateMedia({ colorScheme: theme });
			const trail = page.getByRole("navigation", { name: "Icon trail" });
			await trail.scrollIntoViewIfNeeded();
			const link = trail.getByRole("link", { exact: true, name: "Home" });
			const current = trail.locator('[aria-current="page"]');
			expect(await current.getAttribute("tabindex")).toBeNull();
			expect(
				await current.evaluate((el) => getComputedStyle(el).fontWeight)
			).toBe("400");
			const icon = await link.locator("svg").boundingBox();
			const text = await link.locator("span").boundingBox();
			expect(icon?.width).toBe(16);
			expect(
				icon &&
					text &&
					Math.abs(icon.y + icon.height / 2 - text.y - text.height / 2) < 1
			).toBe(true);
			const normalColor = await link.evaluate(
				(el) => getComputedStyle(el).color
			);
			await link.hover();
			await expect
				.poll(() => link.evaluate((el) => getComputedStyle(el).color))
				.not.toBe(normalColor);
			await link.focus();
			expect(
				await link.evaluate((el) => getComputedStyle(el).outlineWidth)
			).toBe("2px");
			await trail.screenshot({
				path: `/private/tmp/mizen-breadcrumb-${theme}.png`,
			});
			await page.keyboard.press("Tab");
			expect(
				await trail
					.getByRole("link", { exact: true, name: "Docs" })
					.evaluate((el) => document.activeElement === el)
			).toBe(true);
		}
	);

	it.each(["light", "dark"] as const)(
		"opens collapsed ancestors by keyboard in %s",
		async (theme) => {
			await page.emulateMedia({ colorScheme: theme });
			const trigger = page.getByRole("button", {
				exact: true,
				name: "Show ancestors",
			});
			await trigger.focus();
			await page.keyboard.press("Enter");
			await page.getByRole("menu").waitFor({ state: "visible" });
			expect(
				await page
					.getByRole("menuitem", { exact: true, name: "Documentation" })
					.getAttribute("href")
			).toBe("/docs");
			await page.keyboard.press("ArrowDown");
			await page.keyboard.press("Escape");
			await page.getByRole("menu").waitFor({ state: "hidden" });
			expect(
				await trigger.evaluate((el) => document.activeElement === el)
			).toBe(true);
		}
	);

	it("gives a text link a 24px hit area without moving the trail", async () => {
		const trail = page.getByRole("navigation", { name: "Project location" });
		await trail.scrollIntoViewIfNeeded();
		const link = trail.getByRole("link").first();
		const fit = await link.evaluate((el) => {
			const box = el.getBoundingClientRect();
			const label = el.querySelector("span")?.getBoundingClientRect() ?? box;
			const list = el.closest("ol")?.getBoundingClientRect() ?? box;
			const current = el
				.closest("nav")
				?.querySelector('[aria-current="page"]')
				?.getBoundingClientRect();
			const middle = label.left + label.width / 2;
			return {
				above: el.contains(document.elementFromPoint(middle, label.top - 6)),
				// The link's label and the current page share one baseline.
				baselineShift: Math.abs((current?.bottom ?? 0) - label.bottom),
				below: el.contains(document.elementFromPoint(middle, label.bottom + 6)),
				clearance: Math.min(label.top - box.top, box.bottom - label.bottom),
				height: box.height,
				trail: list.height,
			};
		});
		expect(fit.height).toBeGreaterThanOrEqual(23.5);
		expect(fit.clearance).toBeGreaterThanOrEqual(6);
		expect(fit.above && fit.below).toBe(true);
		expect(fit.baselineShift).toBeLessThan(0.5);
		expect(fit.trail).toBeLessThanOrEqual(16);
	});

	it("wraps long labels on mobile and mirrors separators in RTL", async () => {
		await page.setViewportSize({ height: 800, width: 320 });
		const trail = page.getByRole("navigation", { name: "Long resource trail" });
		await trail.scrollIntoViewIfNeeded();
		expect(await trail.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
			true
		);
		const current = trail.locator('[aria-current="page"]');
		expect(
			await current.evaluate((el) => el.scrollWidth <= el.clientWidth)
		).toBe(true);
		await page.evaluate(() => {
			document.documentElement.dir = "rtl";
		});
		expect(
			await trail
				.locator('[data-slot="breadcrumb-separator"] svg')
				.evaluate((el) => getComputedStyle(el).transform)
		).toBe("matrix(-1, 0, 0, 1, 0, 0)");
		const custom = page.getByRole("navigation", {
			name: "Custom separator trail",
		});
		expect(
			await custom
				.locator('[data-slot="breadcrumb-separator"]')
				.allTextContents()
		).toEqual(["/", "/"]);
	});
});
