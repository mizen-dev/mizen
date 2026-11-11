import { type Browser, chromium, type Locator, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
const noAnimation = /^none$/u;
let handle: TestServerHandle;
let browser: Browser;
let page: Page;

function throwTeardownFailures(
	results: readonly PromiseSettledResult<unknown>[]
): void {
	const failures = results
		.filter(
			(result): result is PromiseRejectedResult => result.status === "rejected"
		)
		.map(({ reason }) => reason);
	if (failures.length === 1) {
		throw failures[0];
	}
	if (failures.length > 1) {
		throw new AggregateError(failures, "Failed to tear down the button test");
	}
}

async function focusWithKeyboard(locator: Locator): Promise<void> {
	await locator.focus();
	await page.keyboard.press("Shift+Tab");
	await page.keyboard.press("Tab");
	if (
		!(await locator.evaluate((element) => document.activeElement === element))
	) {
		throw new Error("Keyboard traversal did not return focus to the target");
	}
}

describe("Button component route", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		page.setDefaultTimeout(6000);
		await page.goto(`${handle.url}/components/button`, {
			waitUntil: "networkidle",
		});
	}, 120_000);

	afterAll(async () => {
		const results = await Promise.allSettled([
			Promise.resolve().then(() => browser?.close()),
			Promise.resolve().then(() => teardownTestServer(handle)),
		]);
		throwTeardownFailures(results);
	}, 120_000);

	it("keeps ordinary and icon dimensions", async () => {
		// Given desktop and mobile viewports
		// When measuring Default button and icon button dimensions
		await page.setViewportSize({ height: 800, width: 375 });
		// Then mobile height is 36px and icon is 32x32px
		expect(
			await page
				.getByRole("button", { exact: true, name: "Default" })
				.evaluate((e) => e.getBoundingClientRect().height)
		).toBe(32);
		const icon = page.getByRole("button", { exact: true, name: "Add" });
		expect(await icon.evaluate((e) => e.getBoundingClientRect().height)).toBe(
			28
		);
		expect(await icon.evaluate((e) => e.getBoundingClientRect().width)).toBe(
			28
		);
		await page.setViewportSize({ height: 800, width: 1024 });
		// Then desktop keeps the same named sizes as mobile
		expect(
			await page
				.getByRole("button", { exact: true, name: "Default" })
				.evaluate((e) => e.getBoundingClientRect().height)
		).toBe(32);
		expect(await icon.evaluate((e) => e.getBoundingClientRect().height)).toBe(
			28
		);
		expect(await icon.evaluate((e) => e.getBoundingClientRect().width)).toBe(
			28
		);
	});

	it("supports variant names", async () => {
		const variantNames = [
			"Default",
			"Brand",
			"Secondary",
			"Outline",
			"Ghost",
			"Link",
			"Destructive",
			"Delete",
		];
		// When reading rendered button labels
		const buttonLabels = await page
			.locator('[data-slot="button"]:not(a)')
			.allTextContents();
		// Then all variant names are supported
		expect(variantNames.every((name) => buttonLabels.includes(name))).toBe(
			true
		);
	});

	it("keeps loading accessible and focusable", async () => {
		// Given the loading button
		const loading = page.getByRole("button", { name: "Saving" });
		const indicator = loading.locator(
			'svg[data-slot="button-loading-indicator"]'
		);
		// Then loading indicator is present with 24x24 viewBox and 16x16 size
		expect(await indicator.count()).toBe(1);
		expect(await indicator.getAttribute("viewBox")).toBe("0 0 24 24");
		expect(
			await indicator.evaluate((element) => {
				const style = getComputedStyle(element);
				return [style.width, style.height];
			})
		).toEqual(["16px", "16px"]);
		const indicatorColor = await indicator.evaluate(
			(element) => getComputedStyle(element).color
		);
		expect(indicatorColor).not.toBe("rgba(0, 0, 0, 0)");
		expect(
			await page
				.getByRole("button", { exact: true, name: "Default" })
				.locator('svg[data-slot="button-loading-indicator"]')
				.count()
		).toBe(0);
		// Then loading state accessibility attributes match contract
		expect(await loading.getAttribute("aria-busy")).toBe("true");
		expect(await loading.getAttribute("aria-disabled")).toBe("true");
		expect(await loading.getAttribute("disabled")).toBeNull();
		expect(
			await loading.evaluate((element) => getComputedStyle(element).opacity)
		).toBe("0.55");
		expect(await loading.getAttribute("tabindex")).toBe("0");
		expect(await loading.getAttribute("data-slot")).toBe("button");
		expect(await loading.locator('[data-slot="button-content"]').count()).toBe(
			0
		);
		expect(
			await loading
				.locator(":scope > svg[data-slot='button-loading-indicator']")
				.count()
		).toBe(1);
		expect(
			await loading.evaluate((element) => getComputedStyle(element).color)
		).toBe("rgba(0, 0, 0, 0)");
		expect(
			await loading.locator('[data-slot="button-loading-indicator"]').count()
		).toBe(1);
	});

	it("shows a keyboard focus ring and respects reduced motion", async () => {
		// Given the default button
		const primary = page.getByRole("button", { exact: true, name: "Default" });
		// When focused with keyboard navigation
		await focusWithKeyboard(primary);
		// Then the ring fades in and settles flush with the edge
		expect(
			await primary.evaluate((element) => {
				const style = getComputedStyle(element);
				return [style.animationName, style.animationDuration];
			})
		).toEqual([expect.not.stringMatching(noAnimation), "0.2s"]);
		await expect
			.poll(() =>
				primary.evaluate((element) => {
					const style = getComputedStyle(element);
					return [style.outlineWidth, style.outlineOffset, style.outlineColor];
				})
			)
			.toEqual(["2px", "2px", "oklch(0.48 0.19 3)"]);
		expect(
			await primary.evaluate(
				(element) => getComputedStyle(element).transitionTimingFunction
			)
		).toBe("cubic-bezier(0.16, 1, 0.3, 1)");

		// When reduced motion is preferred
		await page.emulateMedia({ reducedMotion: "reduce" });
		// Then transitions and the focus ring animation are instant
		expect(
			await primary.evaluate((element) => {
				const style = getComputedStyle(element);
				return [style.transitionDuration, style.animationDuration];
			})
		).toEqual(["0s", "0s"]);
		// The loader's dots stop chasing.
		expect(
			await page
				.getByRole("button", { name: "Saving" })
				.locator('svg[data-slot="button-loading-indicator"] circle')
				.evaluateAll((elements) =>
					elements.map((element) => getComputedStyle(element).animationName)
				)
		).toEqual(Array.from({ length: 8 }, () => "none"));
		await page.emulateMedia({ reducedMotion: "no-preference" });
	});
});
