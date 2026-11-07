import { type Browser, chromium, type Page } from "playwright";
import { expect as expectLocator } from "playwright/test";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const errors: string[] = [];
const budgetHeader = /Budget/;
const noResults = /No/;
let handle: TestServerHandle;
let browser: Browser;
let page: Page;

describe("Data Table", { timeout: 30_000 }, () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage({ viewport: { height: 900, width: 1280 } });
		page.on("pageerror", (error) => errors.push(error.message));
		page.on("console", (message) => {
			if (message.type() === "error") {
				errors.push(message.text());
			}
		});
	}, 120_000);
	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
		expect(errors).toEqual([]);
	});

	it("pages records and preserves boundaries", async () => {
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		const example = page.getByTestId("data-table-example");
		await expectLocator(
			example.getByRole("combobox", { name: "Department" })
		).toContainText("All departments");
		await expectLocator(
			example.locator("tbody tr:not([aria-hidden='true'])")
		).toHaveCount(25);
		await expectLocator(
			example.getByRole("button", { exact: true, name: "Previous page" })
		).toBeDisabled();
		await expectLocator(
			example.getByText("BUD-00001", { exact: true })
		).toBeVisible();
		await example
			.getByRole("button", { exact: true, name: "Last page" })
			.click();
		await expectLocator(
			example.getByText("BUD-10000", { exact: true })
		).toBeVisible();
		await expectLocator(
			example.getByRole("button", { exact: true, name: "Next page" })
		).toBeDisabled();
		await example
			.getByRole("button", { exact: true, name: "First page" })
			.click();
		await example
			.getByRole("button", { exact: true, name: "Next page" })
			.click();
		await expectLocator(
			example.getByText("BUD-00026", { exact: true })
		).toBeVisible();
		await expectLocator(
			example.getByText("BUD-00001", { exact: true })
		).toHaveCount(0);
		await example
			.getByRole("button", { exact: true, name: "Previous page" })
			.click();
		await expectLocator(
			example.getByText("BUD-00001", { exact: true })
		).toBeVisible();
	});

	it("hydrates with stable number formatting in a Russian browser locale", async () => {
		const serverContext = await browser.newContext({
			javaScriptEnabled: false,
			locale: "ru-RU",
			viewport: { height: 900, width: 1280 },
		});
		const serverPage = await serverContext.newPage();
		await serverPage.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		const serverCount = serverPage.getByText("10,000 matching records", {
			exact: true,
		});
		await expectLocator(serverCount).toBeVisible();
		await serverContext.close();

		const hydratedContext = await browser.newContext({
			locale: "ru-RU",
			viewport: { height: 900, width: 1280 },
		});
		const localizedPage = await hydratedContext.newPage();
		const hydrationErrors: string[] = [];
		localizedPage.on("pageerror", (error) =>
			hydrationErrors.push(error.message)
		);
		localizedPage.on("console", (message) => {
			if (message.type() === "error") {
				hydrationErrors.push(message.text());
			}
		});
		await localizedPage.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		const count = localizedPage.getByText("10,000 matching records", {
			exact: true,
		});
		await expectLocator(count).toBeVisible();
		expect(hydrationErrors).toEqual([]);
		await hydratedContext.close();
	});

	it("sorts figures through keyboard-accessible column headers", async () => {
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		const example = page.getByTestId("data-table-example");
		const header = example.getByRole("columnheader", { name: budgetHeader });
		await header.getByRole("button").focus();
		await page.keyboard.press("Enter");
		await expectLocator(header).toHaveAttribute("aria-sort", "descending");
		await page.keyboard.press("Enter");
		await expectLocator(header).toHaveAttribute("aria-sort", "ascending");
		const budgetColumnIndex = await example
			.getByRole("columnheader")
			.evaluateAll((headers) =>
				headers.findIndex((headerCell) =>
					headerCell.textContent?.includes("Budget")
				)
			);
		const figures = await example
			.locator("tbody tr:not([aria-hidden='true'])")
			.evaluateAll(
				(rows, columnIndex) =>
					rows.map((row) =>
						Number(
							row.children[columnIndex].textContent?.replace(/[^\d.-]/g, "")
						)
					),
				budgetColumnIndex
			);
		expect(figures).toEqual([...figures].sort((a, b) => a - b));
	});

	it("keeps one tab stop and focuses visible selection checkboxes", async () => {
		await page.goto(`${handle.url}/components/data-table`, {
			waitUntil: "networkidle",
		});
		const table = page.locator("table:has([role=checkbox])").first();
		const stops = table.locator('[tabindex="0"]');
		await expectLocator(stops).toHaveCount(1);
		await stops.first().focus();
		await page.keyboard.press("Home");
		await page.keyboard.press("ArrowDown");
		const focused = page.locator(":focus");
		await expectLocator(focused).toHaveAttribute("role", "checkbox");
		await expectLocator(focused).toBeVisible();
		await page.keyboard.press("Space");
		await expectLocator(focused).toHaveAttribute("aria-checked", "true");
	});

	it("searches the full dataset, resets the page, and recovers from no results", async () => {
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		const example = page.getByTestId("data-table-example");
		await example
			.getByRole("button", { exact: true, name: "Next page" })
			.click();
		await page.getByTestId("data-table-search").fill("BUD-10000");
		await expectLocator(
			example.getByText("BUD-10000", { exact: true })
		).toBeVisible();
		await expectLocator(
			example.getByRole("button", { exact: true, name: "Next page" })
		).toBeDisabled();
		await page.getByTestId("data-table-search").fill("no-record-matches-this");
		await expectLocator(example.locator("tbody")).toContainText(noResults);
		await page.getByTestId("data-table-search").fill("");
		await expectLocator(
			example.getByText("BUD-00001", { exact: true })
		).toBeVisible();
	});

	it("virtualizes 10,000 records and reaches the final row without mounting them all", async () => {
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		const example = page.getByTestId("data-table-example");
		await example
			.getByRole("button", { exact: true, name: "Virtualized" })
			.click();
		const viewport = example.locator('[data-slot="table-container"]');
		await viewport.scrollIntoViewIfNeeded();
		await expectLocator
			.poll(() => example.locator("tbody tr:not([aria-hidden='true'])").count())
			.toBeGreaterThan(0);
		expect(
			await example.locator("tbody tr:not([aria-hidden='true'])").count()
		).toBeLessThan(80);
		await viewport.evaluate((element) => {
			element.scrollTop = element.scrollHeight;
		});
		await expectLocator(
			example.getByText("BUD-10000", { exact: true })
		).toBeVisible();
		expect(
			await example.locator("tbody tr:not([aria-hidden='true'])").count()
		).toBeLessThan(80);
		await page.getByTestId("data-table-search").fill("BUD-00001");
		await expectLocator(
			example.getByText("BUD-00001", { exact: true })
		).toBeVisible();
	});

	for (const theme of ["light", "dark"] as const) {
		it(`keeps ${theme} data reachable with enlarged text`, async () => {
			await page.setViewportSize({ height: 900, width: 1280 });
			await page.emulateMedia({ reducedMotion: "reduce" });
			await page.addInitScript(
				(preference) => localStorage.setItem("mizen-theme", preference),
				theme
			);
			await page.goto(`${handle.url}/internal/specimens`, {
				waitUntil: "networkidle",
			});
			const example = page.getByTestId("data-table-example");
			await example.screenshot({
				path: `/private/tmp/mizen-data-table-${theme}.png`,
			});
			await page.setViewportSize({ height: 900, width: 390 });
			await page.addStyleTag({
				content:
					"html {font-size:32px !important} * {line-height:1.5 !important;letter-spacing:0.12em !important;word-spacing:0.16em !important}",
			});
			expect(
				await page.evaluate(
					() => document.documentElement.scrollWidth <= innerWidth
				)
			).toBe(true);
			const nextPage = example.getByRole("button", {
				exact: true,
				name: "Next page",
			});
			await nextPage.scrollIntoViewIfNeeded();
			await expectLocator(nextPage).toBeInViewport();
			await nextPage.click();
			await expectLocator(
				example.getByText("BUD-00026", { exact: true })
			).toBeAttached();
			await example
				.getByRole("button", { exact: true, name: "Virtualized" })
				.click();
			const viewport = example.locator('[data-slot="table-container"]');
			await viewport.scrollIntoViewIfNeeded();
			await viewport.evaluate((element) => {
				element.scrollTop = element.scrollHeight;
				element.scrollLeft = element.scrollWidth;
			});
			await expectLocator(
				example.getByText("BUD-10000", { exact: true })
			).toBeAttached();
			const lastVisibleCell = example
				.locator("tbody tr:not([aria-hidden='true'])")
				.last()
				.locator("td")
				.last();
			await lastVisibleCell.scrollIntoViewIfNeeded();
			await expectLocator(lastVisibleCell).toBeInViewport();
		});
	}
});
