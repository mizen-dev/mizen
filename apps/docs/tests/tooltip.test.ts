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
		throw new AggregateError(failures, "Failed to tear down the tooltip test");
	}
}

describe("Tooltip component route", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		page.setDefaultTimeout(6000);
		await page.goto(`${handle.url}/components/tooltip`, {
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

	it("opens grouped Tooltips on hover and focus", async () => {
		const create = page.getByRole("button", {
			exact: true,
			name: "Create item",
		});
		await create.hover();
		const createTooltip = page
			.locator("[data-slot='tooltip-popup']")
			.filter({ hasText: "Create item" });
		await createTooltip.waitFor({ state: "visible" });
		expect(await createTooltip.isVisible()).toBe(true);
		const [triggerBox, tooltipBox] = await Promise.all([
			create.boundingBox(),
			createTooltip.boundingBox(),
		]);
		expect(
			triggerBox &&
				tooltipBox &&
				tooltipBox.y + tooltipBox.height <= triggerBox.y
		).toBe(true);
		await page.keyboard.press("Escape");

		const preview = page.getByRole("button", { exact: true, name: "Preview" });
		await preview.focus();
		const previewTooltip = page
			.locator("[data-slot='tooltip-popup']")
			.filter({ hasText: "Preview details" });
		await previewTooltip.waitFor({ state: "visible" });
		expect(await previewTooltip.isVisible()).toBe(true);
		expect(
			await previewTooltip.evaluate(
				(element) => getComputedStyle(element).fontSize
			)
		).toBe("12px");
		const previewBox = await previewTooltip.boundingBox();
		// Keep the label on one line with room for the softer surface padding.
		expect(previewBox && previewBox.height <= 32).toBe(true);
	});
});
