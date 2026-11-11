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

describe("Tooltip browser states", { timeout: 20_000 }, () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
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
		await page.goto(`${handle.url}/components/tooltip`, {
			waitUntil: "networkidle",
		});
	});
	afterEach(() => expect(errors).toEqual([]));
	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
	});
	it.each(["light", "dark"] as const)(
		"reviews grouped hover, focus, and dismissal in %s",
		async (theme) => {
			await page.emulateMedia({
				colorScheme: theme,
				reducedMotion: "no-preference",
			});
			const trigger = page.getByRole("button", { exact: true, name: "Bold" });
			await trigger.hover();
			const popup = page.locator('[data-slot="tooltip-popup"][data-open]');
			await popup.waitFor({ state: "visible" });
			await expect
				.poll(() => popup.evaluate((el) => getComputedStyle(el).transform))
				.toBe("none");
			const style = await popup.evaluate((el) => {
				const s = getComputedStyle(el);
				return {
					background: s.backgroundColor,
					color: s.color,
					font: s.fontSize,
				};
			});
			expect(style.font).toBe("12px");
			expect(style.color).not.toBe(style.background);
			expect(
				await popup
					.locator('[data-slot="tooltip-viewport"]')
					.evaluate((el) => getComputedStyle(el).padding)
			).toBe("4px 12px");
			const box = await popup.boundingBox();
			const anchor = await trigger.boundingBox();
			expect(
				box && anchor && Math.abs(anchor.y - box.y - box.height - 4) < 1
			).toBe(true);
			await popup.screenshot({
				path: `/private/tmp/mizen-tooltip-${theme}.png`,
			});
			await page.getByRole("button", { exact: true, name: "Italic" }).hover();
			await expect.poll(() => popup.textContent()).toBe("Italic");
			await page.keyboard.press("Escape");
			await popup.waitFor({ state: "detached" });
			const focusTrigger = page.getByRole("button", {
				exact: true,
				name: "Underline",
			});
			await focusTrigger.focus();
			await popup.waitFor({ state: "visible" });
			expect(await focusTrigger.getAttribute("aria-describedby")).toBe(
				await popup.getAttribute("id")
			);
			await page.keyboard.press("Escape");
			await popup.waitFor({ state: "detached" });
		}
	);

	it.each(["light", "dark"] as const)(
		"animates detached triggers and preserves hover travel in %s",
		async (theme) => {
			await page.emulateMedia({ colorScheme: theme });
			await page
				.getByRole("button", { exact: true, name: "Format bold" })
				.hover();
			const popup = page.locator('[data-slot="tooltip-popup"][data-open]');
			await popup.waitFor({ state: "visible" });
			const id = await popup.getAttribute("id");
			const startWidth = (await popup.boundingBox())?.width ?? 0;
			await page
				.getByRole("button", { exact: true, name: "Format italic" })
				.hover();
			await expect
				.poll(() => popup.locator("[data-current]").textContent())
				.toBe("Apply italic formatting to text");
			await expect
				.poll(async () => (await popup.boundingBox())?.width ?? 0)
				.toBeGreaterThan(startWidth);
			expect(await popup.getAttribute("id")).toBe(id);
			await popup.hover();
			expect(await popup.isVisible()).toBe(true);
			await page.mouse.move(0, 0);
			await popup.waitFor({ state: "detached" });
		}
	);

	it("opens a hint on keyboard focus of its named button", async () => {
		const hint = page.getByRole("button", {
			exact: true,
			name: "About server totals",
		});
		await hint.focus();
		const popup = page.locator('[data-slot="tooltip-popup"][data-open]');
		await popup.waitFor({ state: "visible" });
		expect(await popup.textContent()).toContain("server totals");
		await page.keyboard.press("Escape");
		await popup.waitFor({ state: "hidden" });
	});

	it("centers a wrapped tooltip on its trigger", async () => {
		await page.setViewportSize({ height: 800, width: 1280 });
		const trigger = page.getByRole("button", {
			exact: true,
			name: "Release identifier",
		});
		await trigger.focus();
		const popup = page.locator('[data-slot="tooltip-popup"][data-open]');
		await popup.waitFor({ state: "visible" });
		const [anchor, box, positioner] = await Promise.all([
			trigger.boundingBox(),
			popup.boundingBox(),
			popup.locator("xpath=..").boundingBox(),
		]);
		if (!(anchor && box && positioner)) {
			throw new Error("Expected the trigger and the tooltip to be rendered");
		}
		// The text wraps at the 20rem cap; the positioner has the same box.
		expect(box.width).toBe(320);
		expect(positioner.width).toBe(box.width);
		expect(positioner.height).toBe(box.height);
		expect(box.x + box.width / 2).toBeCloseTo(anchor.x + anchor.width / 2, 0);
		await page.keyboard.press("Escape");
		await popup.waitFor({ state: "hidden" });
	});

	it("wraps long content on mobile and respects reduced motion and keepMounted", async () => {
		await page.setViewportSize({ height: 800, width: 320 });
		await page.emulateMedia({ reducedMotion: "reduce" });
		const trigger = page.getByRole("button", {
			exact: true,
			name: "Release identifier",
		});
		await trigger.focus();
		const popup = page.locator('[data-slot="tooltip-popup"][data-open]');
		await popup.waitFor({ state: "visible" });
		expect(
			await popup.evaluate((el) => getComputedStyle(el).transitionDuration)
		).toBe("0s");
		const box = await popup.boundingBox();
		expect(
			box && box.x >= 0 && box.x + box.width <= 320 && box.height > 32
		).toBe(true);
		await page.keyboard.press("Escape");
		await popup.waitFor({ state: "hidden" });
		expect(await page.locator('[data-slot="tooltip-popup"]').count()).toBe(1);
	});

	it("keeps disabled hints closed and checks all positioning sides", async () => {
		await page
			.getByRole("button", { exact: true, name: "Hints disabled" })
			.focus();
		expect(
			await page.locator('[data-slot="tooltip-popup"][data-open]').count()
		).toBe(0);
		for (const side of ["top", "right", "bottom", "left"]) {
			// Each focus event must finish before the next side opens.
			// biome-ignore lint/performance/noAwaitInLoops: Sequential focus interactions share one page.
			await page.getByRole("button", { exact: true, name: side }).focus();
			const popup = page.locator('[data-slot="tooltip-popup"][data-open]');
			await popup.waitFor({ state: "visible" });
			expect(await popup.getAttribute("data-side")).toBe(side);
			await page.keyboard.press("Escape");
			await popup.waitFor({ state: "detached" });
		}
	});
});
