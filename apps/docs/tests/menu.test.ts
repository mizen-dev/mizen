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
		throw new AggregateError(failures, "Failed to tear down the menu test");
	}
}

describe("Menu component route", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		page.setDefaultTimeout(6000);
		await page.goto(`${handle.url}/components/menu`, {
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

	it("supports Menu navigation, selection, and submenus", async () => {
		const trigger = page.getByRole("button", {
			exact: true,
			name: "Project actions",
		});
		await trigger.click();
		const rootMenu = page.getByRole("menu").first();
		await rootMenu.waitFor({ state: "visible" });
		expect(await rootMenu.isVisible()).toBe(true);

		const openItem = page
			.getByRole("menuitem")
			.filter({ hasText: "Open project" });
		await openItem.focus();
		const duplicateItem = page.getByRole("menuitem", {
			exact: true,
			name: "Duplicate project",
		});
		expect(await duplicateItem.getAttribute("aria-disabled")).toBe("true");
		await openItem.press("ArrowDown");
		await expect
			.poll(() =>
				duplicateItem.evaluate((element) => document.activeElement === element)
			)
			.toBe(true);
		await duplicateItem.press("Enter");
		expect(await rootMenu.isVisible()).toBe(true);
		await duplicateItem.press("ArrowDown");
		const linkItem = page.getByRole("menuitem", {
			exact: true,
			name: "Go to fields",
		});
		await expect
			.poll(() =>
				linkItem.evaluate((element) => document.activeElement === element)
			)
			.toBe(true);
		expect(
			await linkItem.evaluate((element) => document.activeElement === element)
		).toBe(true);

		const archived = page.getByRole("menuitemcheckbox", {
			exact: true,
			name: "Show archived",
		});
		expect(await archived.getAttribute("aria-checked")).toBe("true");
		expect(
			await archived
				.locator("[data-checked]")
				.evaluate((element) => getComputedStyle(element).color)
		).not.toBe(
			await archived.evaluate((element) => getComputedStyle(element).color)
		);
		await archived.click();
		expect(await archived.getAttribute("aria-checked")).toBe("false");

		const compact = page.getByRole("menuitemradio", {
			exact: true,
			name: "Compact",
		});
		await compact.click();
		expect(await compact.getAttribute("aria-checked")).toBe("true");
		expect(
			await compact
				.locator("[data-checked]")
				.evaluate((element) => getComputedStyle(element).color)
		).not.toBe(
			await compact.evaluate((element) => getComputedStyle(element).color)
		);

		const compactView = page.getByRole("menuitemcheckbox", {
			exact: true,
			name: "Compact view",
		});
		const switchIndicator = compactView.locator("[data-unchecked]");
		const uncheckedThumbColor = await switchIndicator
			.locator(":scope > span")
			.evaluate((element) => getComputedStyle(element).backgroundColor);
		const uncheckedTrackColor = await switchIndicator.evaluate(
			(element) => getComputedStyle(element).backgroundColor
		);
		expect(uncheckedThumbColor).not.toBe(uncheckedTrackColor);
		await compactView.click();
		const checkedIndicator = compactView.locator("[data-checked]");
		const [checkedTrackColor, checkedThumbColor] = await Promise.all([
			checkedIndicator.evaluate(
				(element) => getComputedStyle(element).backgroundColor
			),
			checkedIndicator
				.locator(":scope > span")
				.evaluate((element) => getComputedStyle(element).backgroundColor),
		]);
		expect(checkedTrackColor).not.toBe(checkedThumbColor);

		const submenuTrigger = page.getByRole("menuitem", {
			exact: true,
			name: "Move to",
		});
		await submenuTrigger.focus();
		await submenuTrigger.press("ArrowRight");
		const submenuItem = page.getByRole("menuitem", {
			exact: true,
			name: "Personal",
		});
		await submenuItem.waitFor({ state: "visible" });
		expect(await submenuItem.isVisible()).toBe(true);
		await page.keyboard.press("Escape");
		await page.keyboard.press("Escape");
		await rootMenu.waitFor({ state: "detached" });
		expect(await rootMenu.count()).toBe(0);
		expect(
			await trigger.evaluate((element) => document.activeElement === element)
		).toBe(true);
	});
});
