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
const consoleErrors: string[] = [];
const pageErrors: string[] = [];

function throwTeardownFailures(
	results: readonly PromiseSettledResult<unknown>[]
): void {
	const failures = results
		.filter((r): r is PromiseRejectedResult => r.status === "rejected")
		.map(({ reason }) => reason);
	if (failures.length === 1) {
		throw failures[0];
	}
	if (failures.length > 1) {
		throw new AggregateError(failures, "Sheet-drawer teardown failed");
	}
}

describe("Sheet and Drawer package behavior in docs", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		page.setDefaultTimeout(8000);
		page.on("console", (msg) => {
			if (msg.type() === "error") {
				consoleErrors.push(msg.text());
			}
		});
		page.on("pageerror", (err) => {
			pageErrors.push(err.message);
		});
	}, 120_000);

	afterAll(async () => {
		const results = await Promise.allSettled([
			Promise.resolve().then(() => browser?.close()),
			Promise.resolve().then(() => teardownTestServer(handle)),
		]);
		throwTeardownFailures(results);
	}, 120_000);

	it("renders Sheet route, opens in body portal, manages focus and scrolls", async () => {
		await page.setViewportSize({ height: 600, width: 375 });
		const response = await page.goto(`${handle.url}/components/sheet`, {
			waitUntil: "networkidle",
		});
		expect(response?.status()).toBe(200);
		expect(
			await page
				.getByRole("heading", { exact: true, level: 1, name: "Sheet" })
				.isVisible()
		).toBe(true);

		const trigger = page.getByRole("button", {
			name: "Edit workspace settings",
		});
		await trigger.waitFor({ state: "visible" });
		await trigger.click();

		const popup = page.locator('[data-slot="sheet-popup"]');
		await popup.waitFor({ state: "visible" });

		const state = await popup.evaluate((el) => ({
			hasBody: el.closest("body") === document.body,
			hasFocus: Boolean(
				document.activeElement && el.contains(document.activeElement)
			),
			inMain: Boolean(document.querySelector("#docs-content")?.contains(el)),
		}));
		expect(state.inMain).toBe(false);
		expect(state.hasBody).toBe(true);
		expect(state.hasFocus).toBe(true);

		const viewport = popup.locator('[data-slot="scroll-area-viewport"]');
		const canScroll = await viewport.evaluate(
			(el) => el.scrollHeight > el.clientHeight
		);
		expect(canScroll).toBe(true);

		const scrolled = await viewport.evaluate((el) => {
			el.scrollTop = 40;
			return el.scrollTop > 0;
		});
		expect(scrolled).toBe(true);

		const widths = await page.evaluate(() => [
			document.body.scrollWidth,
			document.body.clientWidth,
		]);
		expect(widths[0]).toBe(widths[1]);

		const isFocused = () =>
			trigger.evaluate((el) => el === document.activeElement);

		await page.keyboard.press("Escape");
		await popup.waitFor({ state: "hidden" });
		await expect.poll(isFocused).toBe(true);

		await trigger.click();
		await popup.waitFor({ state: "visible" });
		await page.getByRole("button", { name: "Cancel" }).click();
		await popup.waitFor({ state: "hidden" });
		await expect.poll(isFocused).toBe(true);
	}, 30_000);

	it("renders Drawer route, opens in body portal, responds to drag and restores focus", async () => {
		await page.setViewportSize({ height: 800, width: 600 });
		const response = await page.goto(`${handle.url}/components/drawer`, {
			waitUntil: "networkidle",
		});
		expect(response?.status()).toBe(200);
		expect(
			await page
				.getByRole("heading", { exact: true, level: 1, name: "Drawer" })
				.isVisible()
		).toBe(true);

		const trigger = page.getByRole("button", {
			exact: true,
			name: "View project activity",
		});
		await trigger.waitFor({ state: "visible" });
		await trigger.click();

		const popup = page.locator('[data-slot="drawer-popup"]');
		await popup.waitFor({ state: "visible" });

		const state = await popup.evaluate((el) => ({
			hasBody: el.closest("body") === document.body,
			hasFocus: Boolean(
				document.activeElement && el.contains(document.activeElement)
			),
			inMain: Boolean(document.querySelector("#docs-content")?.contains(el)),
		}));
		expect(state.inMain).toBe(false);
		expect(state.hasBody).toBe(true);
		expect(state.hasFocus).toBe(true);

		await page.getByRole("button", { name: "Close activity" }).click();
		await popup.waitFor({ state: "hidden" });
		await expect
			.poll(() => trigger.evaluate((el) => el === document.activeElement))
			.toBe(true);

		await trigger.click();
		await popup.waitFor({ state: "visible" });

		const bar = page.locator('[data-slot="drawer-bar"]');
		await bar.waitFor({ state: "visible" });
		const initialTransform = await popup.evaluate(
			(el) => getComputedStyle(el).transform
		);
		const barBox = await bar.boundingBox();
		if (!barBox) {
			throw new Error("Drawer bar bounding box not found");
		}

		const startX = barBox.x + barBox.width / 2;
		const startY = barBox.y + barBox.height / 2;
		await page.mouse.move(startX, startY);
		await page.mouse.down();
		await page.mouse.move(startX, startY + 40, { steps: 5 });

		const draggingTransform = await popup.evaluate(
			(el) => getComputedStyle(el).transform
		);
		expect(draggingTransform).not.toBe(initialTransform);
		await page.mouse.up();
		await expect
			.poll(async () => popup.evaluate((el) => el.hasAttribute("data-swiping")))
			.toBe(false);
	}, 30_000);

	it("exercises reduced-motion zero duration and active inset geometry on Drawer route", async () => {
		try {
			await page.emulateMedia({ reducedMotion: "reduce" });
			await page.setViewportSize({ height: 800, width: 900 });
			await page.goto(`${handle.url}/components/drawer`, {
				waitUntil: "networkidle",
			});

			await page
				.getByRole("button", { exact: true, name: "View project activity" })
				.click();

			const popup = page.locator('[data-slot="drawer-popup"]');
			await popup.waitFor({ state: "visible" });

			const duration = await popup.evaluate(
				(el) => getComputedStyle(el).transitionDuration
			);
			expect(duration).toBe("0s");

			const geom = await popup.evaluate((el) => {
				const r = el.getBoundingClientRect();
				const s = getComputedStyle(el);
				return {
					bGap: window.innerHeight - r.bottom,
					bW: [
						s.borderTopWidth,
						s.borderRightWidth,
						s.borderBottomWidth,
						s.borderLeftWidth,
					].map(Number.parseFloat),
					lGap: r.left,
					rGap: window.innerWidth - r.right,
					solid:
						s.borderTopStyle === "solid" &&
						s.borderRightStyle === "solid" &&
						s.borderBottomStyle === "solid" &&
						s.borderLeftStyle === "solid",
				};
			});
			expect(geom.solid).toBe(true);
			expect(geom.bW.every((w) => w > 0)).toBe(true);
			expect(geom.lGap > 0 && geom.rGap > 0 && geom.bGap > 0).toBe(true);

			const endingTop = await popup.evaluate((el) => {
				el.setAttribute("data-ending-style", "");
				const { top } = el.getBoundingClientRect();
				el.removeAttribute("data-ending-style");
				return top;
			});
			expect(endingTop).toBeGreaterThanOrEqual(800);

			await page.getByRole("button", { name: "Close activity" }).click();
			await popup.waitFor({ state: "hidden" });
		} finally {
			await page.emulateMedia({ reducedMotion: "no-preference" });
		}
	}, 30_000);

	it("has no console or page errors across sheet and drawer interactions", () => {
		expect(pageErrors).toEqual([]);
		expect(consoleErrors).toEqual([]);
	});
});
