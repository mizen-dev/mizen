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
		throw new AggregateError(failures, "Failed to tear down the toast test");
	}
}

describe("Toast real browser F6 and hover focus indicator", () => {
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
		await page.goto(`${handle.url}/components/toast`, {
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

	it("shows focus ring under F6 keyboard focus and none under pointer-only hover for stacked toast", async () => {
		await page.getByRole("button", { name: "Add stack notice" }).click();
		const root = page.locator('[data-slot="toast-root"]');
		await root.waitFor();

		// Pointer hover alone
		await root.hover();
		const hoverColor = await root.evaluate(
			(el) => window.getComputedStyle(el).outlineColor
		);
		expect(
			hoverColor === "transparent" ||
				hoverColor === "rgba(0, 0, 0, 0)" ||
				hoverColor === ""
		).toBe(true);

		// F6 keyboard focus
		await page.keyboard.press("F6");
		await page.waitForTimeout(100);

		const focusedColor = await root.evaluate(
			(el) => window.getComputedStyle(el).outlineColor
		);
		const focusedWidth = await root.evaluate(
			(el) => window.getComputedStyle(el).outlineWidth
		);
		const focusedStyle = await root.evaluate(
			(el) => window.getComputedStyle(el).outlineStyle
		);

		expect(focusedStyle).toBe("solid");
		expect(focusedWidth).toBe("3px");
		expect(focusedColor).not.toBe("transparent");
		expect(focusedColor).not.toBe("rgba(0, 0, 0, 0)");
	});

	it("shows focus ring under F6 keyboard focus and none under pointer-only hover for anchored toast", async () => {
		await page.getByRole("button", { name: "Show manifest details" }).click();
		const popup = page.locator('[data-slot="toast-popup"]');
		await popup.waitFor();

		// Pointer hover alone
		await popup.hover();
		const hoverColor = await popup.evaluate(
			(el) => window.getComputedStyle(el).outlineColor
		);
		expect(
			hoverColor === "transparent" ||
				hoverColor === "rgba(0, 0, 0, 0)" ||
				hoverColor === ""
		).toBe(true);

		// F6 keyboard focus
		await page.keyboard.press("F6");
		await page.waitForTimeout(100);

		const focusedColor = await popup.evaluate(
			(el) => window.getComputedStyle(el).outlineColor
		);
		const focusedWidth = await popup.evaluate(
			(el) => window.getComputedStyle(el).outlineWidth
		);
		const focusedStyle = await popup.evaluate(
			(el) => window.getComputedStyle(el).outlineStyle
		);

		expect(focusedStyle).toBe("solid");
		expect(focusedWidth).toBe("3px");
		expect(focusedColor).not.toBe("transparent");
		expect(focusedColor).not.toBe("rgba(0, 0, 0, 0)");
	});
});
