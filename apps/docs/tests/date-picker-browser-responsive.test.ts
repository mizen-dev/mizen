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
			"DatePicker responsive browser teardown failed"
		);
	}
}

async function getRightEdge(
	locator: import("playwright").Locator
): Promise<number> {
	const box = await locator.boundingBox();
	expect(box).not.toBeNull();
	return (box?.x ?? 0) + (box?.width ?? 0);
}

describe("DatePicker 320px responsive browser regression", {
	retry: 1,
	timeout: 120_000,
}, () => {
	it.each(
		['"Wix Madefor Text Variable"', "Arial", "Georgia", "monospace"].flatMap(
			(family) =>
				(["light", "dark"] as const).flatMap((theme) =>
					["date-picker", "date-range-picker"].map((slug) => ({
						family,
						slug,
						theme,
					}))
				)
		)
	)(
		"keeps $slug inside its frame with $family in $theme",
		async ({ family, slug, theme }) => {
			await page.setViewportSize({ height: 900, width: 320 });
			await page.emulateMedia({ colorScheme: theme });
			await page.addInitScript(
				(value) => localStorage.setItem("mizen-theme", value),
				theme
			);
			await page.goto(`${handle.url}/components/${slug}`, {
				waitUntil: "networkidle",
			});
			await page.evaluate((font) => {
				document.body.style.fontFamily = font;
			}, family);
			const bounds = await page
				.locator("[data-slot=component-preview]")
				.first()
				.evaluate((preview) => ({
					content: preview.scrollWidth,
					visible: preview.clientWidth,
				}));
			expect(bounds.content).toBeLessThanOrEqual(bounds.visible);
		}
	);

	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		page.setDefaultTimeout(8000);
	}, 120_000);

	afterAll(async () => {
		const results = await Promise.allSettled([
			Promise.resolve().then(() => browser?.close()),
			Promise.resolve().then(() => teardownTestServer(handle)),
		]);
		throwTeardownFailures(results);
	}, 120_000);

	it("renders DatePicker specimens within 320px viewport without clipping or page horizontal overflow", async () => {
		await page.setViewportSize({ height: 600, width: 320 });
		const response = await page.goto(`${handle.url}/components/date-picker`, {
			waitUntil: "networkidle",
		});
		expect(response?.status()).toBe(200);

		const scrollWidth = await page.evaluate(
			() => document.documentElement.scrollWidth
		);
		expect(scrollWidth).toBeLessThanOrEqual(320);

		const uncontrolledPicker = page.locator(
			'[data-testid="date-picker-uncontrolled"]'
		);
		await uncontrolledPicker.waitFor({ state: "visible" });
		expect(await getRightEdge(uncontrolledPicker)).toBeLessThanOrEqual(320);

		const triggerButton = uncontrolledPicker.getByRole("button", {
			name: "Open calendar",
		});
		await triggerButton.click();

		const popup = page.locator('[data-slot="popover-popup"]');
		await popup.waitFor({ state: "visible" });

		const openScrollWidth = await page.evaluate(
			() => document.documentElement.scrollWidth
		);
		expect(openScrollWidth).toBeLessThanOrEqual(320);
		expect(await getRightEdge(popup)).toBeLessThanOrEqual(320);
	});
});
