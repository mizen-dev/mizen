import { type Browser, chromium, type Page } from "playwright";
import { expect as expectLocator } from "playwright/test";
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
			"Failed to tear down the date range form test"
		);
	}
}

describe("DateRangePicker native form validation", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		page.setDefaultTimeout(8000);
		await page.goto(`${handle.url}/components/date-range-picker`, {
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

	it("blocks invalid and empty ranges, then submits a valid named range", async () => {
		const form = page.getByTestId("date-range-picker-native-form");
		const input = form.locator('input[name="dateRange"]');
		const submit = page.getByTestId("date-range-picker-form-submit");
		const status = page.getByTestId("date-range-picker-form-status");
		const initialStatus = await status.textContent();

		const expectBlockedRange = async (invalidRange: string) => {
			await input.fill(invalidRange);
			await submit.click();
			expect(
				await input.evaluate((node: HTMLInputElement) => node.validity.valid)
			).toBe(false);
			expect(await input.inputValue()).toBe(invalidRange);
			expect(await status.textContent()).toBe(initialStatus);
		};

		await expectBlockedRange("2026-02-30 – 2026-03-02");
		await expectBlockedRange("2026-10-14 – 2026-10-10");

		await input.fill("2026-10-10 – 2026-10-14");
		await submit.click();
		expect(await status.textContent()).toContain(
			"Submitted: 2026-10-10 – 2026-10-14"
		);

		await input.fill("");
		await submit.click();
		expect(
			await input.evaluate(
				(node: HTMLInputElement) => node.validity.valueMissing
			)
		).toBe(true);
		expect(await status.textContent()).toContain(
			"Submitted: 2026-10-10 – 2026-10-14"
		);
	});

	it("blocks a pending start date and restores the default range on reset", async () => {
		const form = page.getByTestId("date-range-picker-native-form");
		const input = form.locator('input[name="dateRange"]');
		const submit = page.getByTestId("date-range-picker-form-submit");
		const initialStatus = await page
			.getByTestId("date-range-picker-form-status")
			.textContent();

		await input.fill("2026-10-11");
		expect(
			await input.evaluate((node: HTMLInputElement) => node.validity.valid)
		).toBe(false);
		await submit.click();
		expect(
			await page.getByTestId("date-range-picker-form-status").textContent()
		).toBe(initialStatus);

		await input.fill("2026-10-11 – 2026-10-15");
		await input.press("Tab");
		expect(await input.inputValue()).toBe("2026-10-11 – 2026-10-15");
		await form.evaluate((node: HTMLFormElement) => {
			node.addEventListener("reset", (event) => event.preventDefault(), {
				once: true,
			});
			node.reset();
		});
		expect(await input.inputValue()).toBe("2026-10-11 – 2026-10-15");
		await form.evaluate((node: HTMLFormElement) => node.reset());
		await expectLocator(input).toHaveValue("2026-10-10 – 2026-10-14");
	});

	it("keeps a controlled range in sync after typed input loses focus", async () => {
		const panel = page.getByTestId("date-range-picker-presets");
		const input = panel.locator("input");
		await input.fill("2026-10-11 – 2026-10-15");
		await input.press("Tab");
		expect(await input.inputValue()).toBe("2026-10-11 – 2026-10-15");
		expect(
			await page.getByTestId("date-range-picker-controlled-value").textContent()
		).toContain("Selected: 2026-10-11 – 2026-10-15");
	});
});
