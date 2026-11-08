import { type Browser, chromium, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const PERCEPTUAL_COLOR = /^(?:oklch|oklab|lab)\(/u;

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
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
		throw new AggregateError(
			failures,
			"Failed to tear down the button style test"
		);
	}
}

describe("Button semantic colors and styles", () => {
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

	it("applies light and dark semantic colors", async () => {
		const primary = page.getByRole("button", { exact: true, name: "Default" });
		// The surface is painted on ::before so press feedback can inset it.
		expect(
			await primary.evaluate(
				(element) => getComputedStyle(element, "::before").backgroundColor
			)
		).toMatch(PERCEPTUAL_COLOR);
		const loading = page.getByRole("button", { name: "Saving" });
		const loadingIndicator = loading.locator(
			'[data-slot="button-loading-indicator"]'
		);
		expect(
			await loadingIndicator.evaluate(
				(element) => getComputedStyle(element).color
			)
		).toMatch(PERCEPTUAL_COLOR);
		const secondary = page.getByRole("button", {
			exact: true,
			name: "Secondary",
		});
		expect(
			await secondary.evaluate((element) => {
				const style = getComputedStyle(element);
				return [style.borderColor, style.borderWidth];
			})
		).toEqual(["rgba(0, 0, 0, 0)", "1px"]);
		const deleteButton = page.getByRole("button", {
			exact: true,
			name: "Delete",
		});
		await deleteButton.hover();
		expect(
			await deleteButton.evaluate(
				(element) => getComputedStyle(element, "::before").backgroundColor
			)
		).toMatch(PERCEPTUAL_COLOR);
		await page.mouse.down();
		expect(
			await deleteButton.evaluate(
				(element) => getComputedStyle(element, "::before").backgroundColor
			)
		).toMatch(PERCEPTUAL_COLOR);
		await page.mouse.up();
		await deleteButton.evaluate((element) => element.blur());
		await page.reload({ waitUntil: "networkidle" });
		const outline = page.getByRole("button", {
			exact: true,
			name: "Outline",
		});
		const restBorder = await outline.evaluate(
			(element) => getComputedStyle(element, "::before").borderColor
		);
		await outline.hover();
		const hoverBorder = await outline.evaluate(
			(element) => getComputedStyle(element, "::before").borderColor
		);
		expect(hoverBorder).not.toBe(restBorder);
		await page.mouse.down();
		const activeBorder = await outline.evaluate(
			(element) => getComputedStyle(element, "::before").borderColor
		);
		expect(activeBorder).not.toBe(restBorder);
		await page.mouse.up();
		await page.reload({ waitUntil: "networkidle" });
		const assertShadowStates = async (name: string) => {
			await page.mouse.move(0, 0);
			const button = page.getByRole("button", { exact: true, name });
			const restBackground = await button.evaluate(
				(el) => getComputedStyle(el, "::before").backgroundColor
			);
			const restShadow = await button.evaluate(
				(element) => getComputedStyle(element, "::before").boxShadow
			);
			expect(
				await button.evaluate((element) => {
					const pseudo = getComputedStyle(element, "::before");
					return [
						pseudo.content,
						pseudo.borderStartStartRadius ===
							getComputedStyle(element).borderStartStartRadius,
					];
				})
			).toEqual(['""', true]);
			await button.hover();
			await expect
				.poll(() =>
					button.evaluate(
						(el) => getComputedStyle(el, "::before").backgroundColor
					)
				)
				.not.toBe(restBackground);
			await expect
				.poll(() =>
					button.evaluate(
						(element) => getComputedStyle(element, "::before").boxShadow
					)
				)
				.not.toBe(restShadow);
			await page.mouse.down();
			expect(
				await button.evaluate(
					(el) => getComputedStyle(el, "::before").backgroundColor
				)
			).not.toBe(restBackground);
			await expect
				.poll(() =>
					button.evaluate(
						(element) => getComputedStyle(element, "::before").boxShadow
					)
				)
				.not.toBe(restShadow);
			await page.mouse.up();
		};
		await assertShadowStates("Default");
		await page.reload({ waitUntil: "networkidle" });
		await assertShadowStates("Outline");
		await page.mouse.up();
		await page.reload({ waitUntil: "networkidle" });
		expect(
			await Promise.all(
				["Secondary", "Ghost", "Link"].map((name) =>
					page
						.getByRole("button", { exact: true, name })
						.evaluate((element) => getComputedStyle(element).boxShadow)
				)
			)
		).toEqual(["none", "none", "none"]);
	});
});
