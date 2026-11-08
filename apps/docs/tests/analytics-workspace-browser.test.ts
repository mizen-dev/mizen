import { type Browser, chromium, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import {
	setDocsTheme,
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
const INVALID_SVG_PATH = /NaN|Infinity|undefined/u;
const dashboardSelector = "[data-testid='analytics-workspace-example']";
let handle: TestServerHandle;
let browser: Browser;
let page: Page;
const consoleErrors: string[] = [];
const pageErrors: string[] = [];

async function metric(testId: string): Promise<string> {
	return (await page.getByTestId(testId).textContent())?.trim() ?? "";
}

async function choose(label: string, option: string): Promise<void> {
	if (label === "Preview state") {
		const trigger = page
			.locator(dashboardSelector)
			.getByRole("button", { exact: true, name: "Data state" });
		if ((await trigger.getAttribute("aria-expanded")) !== "true") {
			await trigger.click();
		}
	}
	await page.getByRole("combobox", { name: label }).click();
	await page.getByRole("option", { exact: true, name: option }).click();
}

async function expectMetrics(
	requests: string,
	errors: string,
	errorRate: string,
	latency: string
): Promise<void> {
	expect(await metric("analytics-workspace-total-requests")).toBe(requests);
	expect(await metric("analytics-workspace-total-errors")).toBe(errors);
	expect(await metric("analytics-workspace-error-rate")).toBe(errorRate);
	expect(await metric("analytics-workspace-mean-latency")).toBe(latency);
}

async function expectNoPageOverflow(): Promise<void> {
	const overflow = await page.evaluate(() => ({
		client: document.documentElement.clientWidth,
		elements: [...document.querySelectorAll("*")]
			.filter((element) => {
				const rect = element.getBoundingClientRect();
				return rect.right > window.innerWidth + 1 || rect.left < -1;
			})
			.map((element) => ({
				left: Math.round(element.getBoundingClientRect().left),
				right: Math.round(element.getBoundingClientRect().right),
				slot: element.getAttribute("data-slot"),
				tag: element.tagName,
				testId: element.getAttribute("data-testid"),
				text: element.textContent?.trim().slice(0, 48),
			}))
			.slice(0, 12),
		scroll: document.documentElement.scrollWidth,
	}));
	expect(
		overflow.scroll,
		JSON.stringify(overflow.elements)
	).toBeLessThanOrEqual(overflow.client);
}

describe("Analytics workspace browser integration", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		page.setDefaultTimeout(8000);
		page.on("console", (message) => {
			if (message.type() === "error") {
				consoleErrors.push(message.text());
			}
		});
		page.on("pageerror", (error) => pageErrors.push(error.message));
	}, 120_000);

	afterAll(async () => {
		const results = await Promise.allSettled([
			Promise.resolve().then(() => browser?.close()),
			Promise.resolve().then(() => teardownTestServer(handle)),
		]);
		const failures = results
			.filter(
				(result): result is PromiseRejectedResult =>
					result.status === "rejected"
			)
			.map(({ reason }) => reason);
		if (failures.length) {
			throw new AggregateError(failures, "Analytics browser teardown failed");
		}
		expect(consoleErrors).toEqual([]);
		expect(pageErrors).toEqual([]);
	}, 120_000);

	it("uses named controls and keeps independently known totals in sync", async () => {
		await page.setViewportSize({ height: 900, width: 1280 });
		const response = await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		expect(response?.status()).toBe(200);
		expect(consoleErrors, "console errors on initial hydration").toEqual([]);
		const workspace = page.locator(dashboardSelector);
		expect(
			await workspace
				.getByRole("combobox", { name: "Report period" })
				.isVisible()
		).toBe(true);
		expect(
			await workspace.getByRole("combobox", { name: "Environment" }).isVisible()
		).toBe(true);
		expect(
			await workspace
				.getByRole("textbox", { name: "Search resources" })
				.isVisible()
		).toBe(true);

		const controls = workspace.getByTestId("analytics-workspace-clear-filters");
		expect(
			await controls.evaluate(
				(element) =>
					getComputedStyle(
						element.parentElement as HTMLElement
					).gridTemplateColumns.split(" ").length
			)
		).toBe(2);
		await expectMetrics("3,075", "61", "1.98%", "165 ms");
		const quota = workspace.getByText("43,200 of 50,000 credits", {
			exact: true,
		});
		expect(await quota.isVisible()).toBe(true);

		const tableRegion = workspace.getByRole("region", {
			name: "Resource activity records",
		});
		const table = tableRegion.getByRole("table");
		expect(await table.isVisible()).toBe(true);
		expect(await table.getByRole("row").count()).toBe(7);
		const requests = await table
			.locator("tbody tr td:nth-child(3)")
			.allInnerTexts();
		expect(
			requests.reduce(
				(sum, value) => sum + Number(value.replaceAll(",", "")),
				0
			)
		).toBe(3075);
		expect(await table.getByRole("rowheader").count()).toBe(6);
		expect(await table.getByRole("grid").count()).toBe(0);

		await choose("Report period", "Last 7 days");
		await expectMetrics("1,572", "30", "1.91%", "165 ms");
		expect(
			await workspace
				.getByRole("button", { name: "Clear filters" })
				.isDisabled()
		).toBe(false);
		await choose("Environment", "Production");
		await expectMetrics("792", "15", "1.89%", "163 ms");
		expect(await table.locator("tbody tr").count()).toBe(3);
		const productionRequests = await table
			.locator("tbody tr td:nth-child(3)")
			.allInnerTexts();
		expect(
			productionRequests.reduce(
				(sum, value) => sum + Number(value.replaceAll(",", "")),
				0
			)
		).toBe(792);
		expect(
			await table.locator("tbody tr td:nth-child(2)").allInnerTexts()
		).toEqual(["Production", "Production", "Production"]);
		expect(await quota.isVisible()).toBe(true);

		const search = workspace.getByRole("textbox", { name: "Search resources" });
		await search.fill("API Gateway");
		await expectMetrics("265", "9", "3.40%", "189 ms");
		expect(await table.locator("tbody tr").count()).toBe(1);
		expect(await table.locator("tbody tr").textContent()).toContain(
			"API Gateway"
		);
		expect(await table.locator("tbody tr td:nth-child(3)").textContent()).toBe(
			"265"
		);
		const chart = workspace.getByRole("img", { name: "Daily API requests" });
		await chart.focus();
		await page.keyboard.press("ArrowRight");
		expect(
			await workspace.locator("[data-slot='chart-tooltip-value']").textContent()
		).toBe("35");

		await search.fill("no matching resource");
		expect(await workspace.getByText("No matching records").isVisible()).toBe(
			true
		);
		await expectMetrics("0", "0", "—", "—");
		expect(await workspace.getByRole("table").count()).toBe(0);
		expect(
			await workspace.getByText("No observations available.").isVisible()
		).toBe(true);

		const clear = workspace.getByRole("button", { name: "Clear filters" });
		await clear.focus();
		await clear.click();
		await expectMetrics("3,075", "61", "1.98%", "165 ms");
		expect(
			await workspace
				.getByRole("combobox", { name: "Report period" })
				.textContent()
		).toContain("Last 14 days");
		expect(
			await workspace
				.getByRole("combobox", { name: "Environment" })
				.textContent()
		).toContain("All environments");
		expect(await search.inputValue()).toBe("");
		expect(await clear.count()).toBe(1);
		expect(await clear.isDisabled()).toBe(true);
		expect(await table.locator("tbody tr").count()).toBe(6);
		expect(
			await page.evaluate(() => document.activeElement !== document.body)
		).toBe(true);
		expect(await quota.isVisible()).toBe(true);
		expect(consoleErrors).toEqual([]);
		expect(pageErrors).toEqual([]);
	});

	it("shows loading, error, empty, and disabled analytics states", async () => {
		await page.setViewportSize({ height: 900, width: 1280 });
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		const workspace = page.locator(dashboardSelector);
		const previewTrigger = workspace.getByRole("button", {
			exact: true,
			name: "Data state",
		});
		await previewTrigger.focus();
		await page.keyboard.press("Enter");
		expect(await previewTrigger.getAttribute("aria-expanded")).toBe("true");
		await choose("Report period", "Last 7 days");
		await choose("Environment", "Production");
		await workspace
			.getByRole("textbox", { name: "Search resources" })
			.fill("API Gateway");
		await expectMetrics("265", "9", "3.40%", "189 ms");

		await choose("Preview state", "Loading");
		expect(
			await workspace
				.getByRole("status", { name: "Loading analytics preview" })
				.isVisible()
		).toBe(true);
		expect(
			await workspace
				.getByRole("combobox", { name: "Report period" })
				.isDisabled()
		).toBe(true);
		expect(
			await workspace
				.getByRole("combobox", { name: "Environment" })
				.isDisabled()
		).toBe(true);
		expect(
			await workspace
				.getByRole("textbox", { name: "Search resources" })
				.isDisabled()
		).toBe(true);
		expect(
			await workspace
				.getByRole("button", { name: "Clear filters" })
				.isDisabled()
		).toBe(true);

		await choose("Preview state", "Error");
		const errorState = workspace.getByRole("region", {
			name: "Could not load analytics",
		});
		expect(await errorState.isVisible()).toBe(true);
		await errorState.getByRole("button", { name: "Retry" }).click();
		await expectMetrics("265", "9", "3.40%", "189 ms");
		expect(
			await workspace
				.getByRole("textbox", { name: "Search resources" })
				.inputValue()
		).toBe("API Gateway");

		await choose("Preview state", "Empty collection");
		expect(await workspace.getByText("No analytics records").isVisible()).toBe(
			true
		);
		expect(await workspace.getByRole("table").count()).toBe(0);
	});

	it("supports keyboard chart inspection and valid plotted geometry", async () => {
		await page.setViewportSize({ height: 900, width: 1280 });
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		const chart = page
			.locator(dashboardSelector)
			.getByRole("img", { name: "Daily API requests" });
		expect(await chart.isVisible()).toBe(true);
		await chart.focus();
		await page.keyboard.press("ArrowRight");
		const tooltip = page
			.locator(dashboardSelector)
			.locator("[data-slot='chart-tooltip']");
		expect(await tooltip.isVisible()).toBe(true);
		expect(
			await tooltip.locator("[data-slot='chart-tooltip-term']").textContent()
		).toBe("Requests");
		expect(["189", "231"]).toContain(
			await tooltip.locator("[data-slot='chart-tooltip-value']").textContent()
		);

		const geometry = await page
			.locator("[data-testid='analytics-workspace-trend'] svg")
			.evaluate((svg, pattern) => {
				const box = svg.getBoundingClientRect();
				const paths = [...svg.querySelectorAll("path[d]")];
				const invalidPathPattern = new RegExp(pattern, "u");
				const invalidPath = paths.some((path) =>
					invalidPathPattern.test(path.getAttribute("d") ?? "")
				);
				const mark = paths.some(
					(path) => (path.getAttribute("d") ?? "").length > 12
				);
				return { height: box.height, invalidPath, mark, width: box.width };
			}, INVALID_SVG_PATH.source);
		expect(geometry.width).toBeGreaterThan(0);
		expect(geometry.height).toBeGreaterThan(0);
		expect(geometry.invalidPath).toBe(false);
		expect(geometry.mark).toBe(true);
	});

	async function checkTextWidth(width: number, theme: string): Promise<void> {
		await page.setViewportSize({ height: 900, width });
		await page.evaluate(() => {
			document.documentElement.style.fontSize = "32px";
			document.documentElement.dir = "ltr";
		});
		const workspace = page.locator(dashboardSelector);
		expect(
			await workspace
				.getByRole("combobox", { name: "Report period" })
				.isVisible()
		).toBe(true);
		expect(
			await workspace.getByRole("combobox", { name: "Environment" }).isVisible()
		).toBe(true);
		expect(
			await workspace
				.getByRole("textbox", { name: "Search resources" })
				.isVisible()
		).toBe(true);
		await expectNoPageOverflow();
		await workspace.screenshot({
			path: `/private/tmp/mizen-analytics-${theme}-${width}-text200.png`,
			style: "header:not([data-slot]) { display: none !important; }",
		});
	}

	async function captureTheme(theme: "light" | "dark"): Promise<void> {
		await page.setViewportSize({ height: 900, width: 1280 });
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		await setDocsTheme(page, theme);
		expect(await page.locator("html").getAttribute("data-theme")).toBe(theme);
		const workspace = page.locator(dashboardSelector);
		await workspace.locator("tbody tr").first().waitFor();
		expect(
			await workspace.evaluate(
				(element) => element.getBoundingClientRect().width
			)
		).toBeGreaterThan(500);
		await workspace.screenshot({
			path: `/private/tmp/mizen-analytics-${theme}-1280-normal.png`,
			style: "header:not([data-slot]) { display: none !important; }",
		});
		await page.setViewportSize({ height: 900, width: 390 });
		await workspace.screenshot({
			path: `/private/tmp/mizen-analytics-${theme}-390-normal.png`,
			style: "header:not([data-slot]) { display: none !important; }",
		});
		await checkTextWidth(1280, theme);
		await checkTextWidth(390, theme);
		await checkTextWidth(320, theme);
	}

	it("fits narrow and 200% text layouts in both themes, with reduced motion and RTL", async () => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		await captureTheme("light");
		await captureTheme("dark");
		await page.setViewportSize({ height: 900, width: 320 });
		await page.evaluate(() => {
			document.documentElement.dir = "rtl";
			document.documentElement.style.fontSize = "32px";
		});
		await expectNoPageOverflow();
		expect(await page.locator("html").getAttribute("dir")).toBe("rtl");
		const tableScroll = await page
			.locator(`${dashboardSelector} [data-slot='table-container']`)
			.evaluate((element) => ({
				clientWidth: element.clientWidth,
				label: element.getAttribute("aria-label"),
				scrollWidth: element.scrollWidth,
				tabIndex: (element as HTMLElement).tabIndex,
			}));
		expect(tableScroll.scrollWidth).toBeGreaterThan(tableScroll.clientWidth);
		expect(tableScroll.tabIndex).toBe(0);
		expect(tableScroll.label).toBe("Resource activity records");
		const metricValues = page
			.locator(dashboardSelector)
			.locator('[data-slot="metric-value"]');
		const metricColumns = await metricValues.first().evaluate((element) => {
			const metricElement = element.closest('[data-slot="metric"]');
			if (!metricElement?.parentElement) {
				throw new Error("Analytics metric row is missing");
			}
			return getComputedStyle(
				metricElement.parentElement
			).gridTemplateColumns.split(" ").length;
		});
		expect(metricColumns).toBe(1);
		const singleLineValues = await metricValues.evaluateAll((elements) =>
			elements.map((element) => {
				const lineHeight = Number.parseFloat(
					getComputedStyle(element).lineHeight
				);
				return element.getBoundingClientRect().height <= lineHeight + 1;
			})
		);
		expect(singleLineValues).toEqual([true, true, true, true]);
		await page.locator(dashboardSelector).screenshot({
			path: "/private/tmp/mizen-analytics-rtl-320.png",
			style: "header:not([data-slot]) { display: none !important; }",
		});
	});
});
