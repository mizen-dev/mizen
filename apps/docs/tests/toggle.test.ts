import { type Browser, chromium, type Locator, type Page } from "playwright";
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
		throw new AggregateError(failures, "Failed to tear down the toggle test");
	}
}

async function focusWithKeyboard(locator: Locator): Promise<void> {
	await locator.focus();
	await page.keyboard.press("Shift+Tab");
	await page.keyboard.press("Tab");
	expect(
		await locator.evaluate(
			(element) =>
				document.activeElement === element && element.matches(":focus-visible")
		)
	).toBe(true);
}

describe("Toggle component route", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		// Settled focus rings: the ring grows in over 200ms otherwise.
		await page.emulateMedia({ reducedMotion: "reduce" });
		page.setDefaultTimeout(6000);
		await page.goto(`${handle.url}/components/toggle`, {
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

	it("renders Toggle states and focus ring", async () => {
		const standalone = page
			.getByRole("region", { exact: true, name: "Toggle preview" })
			.getByRole("button", {
				exact: true,
				name: "Subscribe",
			});
		expect(await standalone.getAttribute("aria-pressed")).toBe("true");
		await standalone.press("Space");
		expect(await standalone.getAttribute("aria-pressed")).toBe("false");

		expect(
			await page
				.getByRole("button", { exact: true, name: "Managed" })
				.isDisabled()
		).toBe(true);

		await focusWithKeyboard(standalone);
		expect(
			await standalone.evaluate((element) => {
				const style = getComputedStyle(element);
				return [style.outlineWidth, style.outlineOffset];
			})
		).toEqual(["3px", "0px"]);
	});
});
