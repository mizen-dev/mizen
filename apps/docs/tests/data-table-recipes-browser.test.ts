import { type Browser, chromium, type Page } from "playwright";
import { expect as expectLocator } from "playwright/test";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import {
	setDocsTheme,
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
const errors: string[] = [];
const matchingRecords = /matching records/u;
const readOnlyVirtualizedView = /read-only virtualized view/u;
const FILTERS_LIGHT_SCREENSHOT =
	"/private/tmp/mizen-data-table-filters-light.png";
const FILTERS_DARK_SCREENSHOT =
	"/private/tmp/mizen-data-table-filters-dark.png";
const FILTERS_NARROW_SCREENSHOT =
	"/private/tmp/mizen-data-table-filters-narrow-dark-large-text.png";
let handle: TestServerHandle;
let browser: Browser;
let page: Page;

async function prepareSelectionScreenshot(
	theme: "dark" | "light"
): Promise<Page> {
	const capturePage = await browser.newPage({
		colorScheme: theme,
		viewport: { height: 900, width: 1280 },
	});
	capturePage.on("pageerror", (error) => errors.push(error.message));
	capturePage.on("console", (message) => {
		if (message.type() === "error") {
			errors.push(message.text());
		}
	});
	await capturePage.goto(`${handle.url}/internal/specimens`, {
		waitUntil: "networkidle",
	});
	await setDocsTheme(capturePage, theme);
	await expectLocator(capturePage.locator("html")).toHaveAttribute(
		"data-theme",
		theme
	);
	const example = capturePage.getByTestId("data-table-example");
	await example.getByRole("combobox", { name: "Department" }).click();
	await capturePage
		.getByRole("option", { exact: true, name: "Design" })
		.click();
	await example
		.getByRole("checkbox", { name: "Select all rows on this page" })
		.click();
	await example.getByTestId("data-table-mark-reviewed").click();
	await expectLocator(
		example.getByText("25 selected", { exact: true })
	).toBeVisible();
	await expectLocator(
		example.getByTestId("data-table-review-feedback")
	).toContainText("Reviewed records: 25");
	return capturePage;
}

describe("Data Table search and bulk selection recipes", {
	timeout: 30_000,
}, () => {
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

	it("filters by search and department, removes filter buttons, and clears filters", async () => {
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		const example = page.getByTestId("data-table-example");
		await example
			.getByRole("button", { exact: true, name: "Next page" })
			.click();
		await page.getByTestId("data-table-search").fill("BUD-10000");
		await expectLocator(example.getByText("1 matching records")).toBeVisible();
		await expectLocator(
			example.getByText("BUD-10000", { exact: true })
		).toBeVisible();
		await expectLocator(
			example.getByRole("button", { name: "Next page" })
		).toBeDisabled();
		await example
			.getByRole("button", { name: "Remove search filter BUD-10000" })
			.click();
		await expectLocator(
			example.getByText("10,000 matching records")
		).toBeVisible();

		await example.getByRole("combobox", { name: "Department" }).click();
		await page.getByRole("option", { exact: true, name: "Design" }).click();
		await expectLocator(example.getByText("Department: Design")).toBeVisible();
		await expectLocator(example.getByText(matchingRecords)).toContainText(
			"1,668"
		);
		await example.getByTestId("data-table-clear-filters").click();
		await expectLocator(
			example.getByText("10,000 matching records")
		).toBeVisible();
		await expectLocator(example.getByText("Department: Design")).toHaveCount(0);
	});

	it("selects a page or all filtered matches, then clears across scopes", async () => {
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		const example = page.getByTestId("data-table-example");
		const firstRowCheckbox = example.getByRole("checkbox", {
			name: "Select BUD-00001",
		});
		await firstRowCheckbox.click();
		// A selected record carries the Table selection band.
		await expectLocator(
			example.locator('tbody tr[data-selected="true"]')
		).toHaveCount(1);
		const pageCheckbox = example.getByRole("checkbox", {
			name: "Select all rows on this page",
		});
		await expectLocator(pageCheckbox).toHaveAttribute("aria-checked", "mixed");
		await pageCheckbox.click();
		await expectLocator(
			example.getByText("25 selected", { exact: true })
		).toBeVisible();

		await example.getByTestId("data-table-clear-selection").click();
		await page.getByTestId("data-table-search").fill("BUD-10000");
		await example.getByTestId("data-table-select-all-matching").click();
		await expectLocator(
			example.getByText("1 selected", { exact: true })
		).toBeVisible();
		await expectLocator(
			example.getByRole("checkbox", { name: "Select BUD-10000" })
		).toBeChecked();
		await example.getByTestId("data-table-clear-selection").click();
		await expectLocator(
			example.getByText("0 selected", { exact: true })
		).toBeVisible();
	});

	it("undoes the local review action and hides selection in the read-only virtual view", async () => {
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		const example = page.getByTestId("data-table-example");
		await example.getByRole("checkbox", { name: "Select BUD-00001" }).click();
		await example.getByTestId("data-table-mark-reviewed").click();
		await expectLocator(
			example.getByTestId("data-table-review-feedback")
		).toContainText("Marked 1 selected records");
		await expectLocator(
			example.getByTestId("data-table-review-feedback")
		).toContainText("Reviewed records: 1");
		await example.getByRole("button", { exact: true, name: "Undo" }).click();
		await expectLocator(
			example.getByTestId("data-table-review-feedback")
		).toContainText("Reviewed records: 0");

		await example
			.getByRole("button", { exact: true, name: "Virtualized" })
			.click();
		await expectLocator(
			example.getByTestId("data-table-bulk-actions")
		).toHaveCount(0);
		await expectLocator(
			example.getByRole("checkbox", { name: "Select BUD-00001" })
		).toHaveCount(0);
		await expectLocator(
			example.getByText(readOnlyVirtualizedView)
		).toBeVisible();
	});

	it("keeps the filtered bulk workflow usable at large text and captures both themes", async () => {
		const lightPage = await prepareSelectionScreenshot("light");
		const lightExample = lightPage.getByTestId("data-table-example");
		await lightExample.scrollIntoViewIfNeeded();
		const searchLabelBottom = await lightExample
			.getByText("Search records", { exact: true })
			.evaluate((element) => element.getBoundingClientRect().bottom);
		const departmentLabelBottom = await lightExample
			.getByText("Department", { exact: true })
			.first()
			.evaluate((element) => element.getBoundingClientRect().bottom);
		const searchTop = await lightExample
			.getByTestId("data-table-search")
			.evaluate((element) => element.getBoundingClientRect().top);
		const departmentTop = await lightExample
			.getByRole("combobox", { name: "Department" })
			.evaluate((element) => element.getBoundingClientRect().top);
		const controlSpacing = Math.abs(
			searchTop - searchLabelBottom - (departmentTop - departmentLabelBottom)
		);
		expect(controlSpacing).toBeLessThan(2);
		const lightButtonBackground = await lightExample
			.getByTestId("data-table-mark-reviewed")
			.evaluate(
				(element) => getComputedStyle(element, "::before").backgroundColor
			);
		await lightExample.screenshot({
			caret: "initial",
			path: FILTERS_LIGHT_SCREENSHOT,
		});

		const darkPage = await prepareSelectionScreenshot("dark");
		const darkExample = darkPage.getByTestId("data-table-example");
		await darkExample.scrollIntoViewIfNeeded();
		const darkButtonBackground = await darkExample
			.getByTestId("data-table-mark-reviewed")
			.evaluate(
				(element) => getComputedStyle(element, "::before").backgroundColor
			);
		expect(darkButtonBackground).not.toBe(lightButtonBackground);
		await darkExample.screenshot({
			caret: "initial",
			path: FILTERS_DARK_SCREENSHOT,
		});

		await darkPage.setViewportSize({ height: 900, width: 390 });
		await darkPage.evaluate(() => {
			document.documentElement.style.fontSize = "32px";
		});
		const pageWidth = await darkPage.evaluate(() => ({
			clientWidth: document.documentElement.clientWidth,
			scrollWidth: document.documentElement.scrollWidth,
		}));
		expect(pageWidth.scrollWidth).toBeLessThanOrEqual(
			pageWidth.clientWidth + 1
		);
		await darkPage.addStyleTag({
			content:
				'header, a[href="#docs-content"], nextjs-portal { display: none !important; }',
		});
		await darkExample.screenshot({
			caret: "initial",
			path: FILTERS_NARROW_SCREENSHOT,
		});
		await lightPage.close();
		await darkPage.close();
	});
});
