import type { GridProps } from "@mizen-labs/ui/grid";
import { type Browser, chromium, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
const WHITESPACE_REGEX = /\s+/u;
let handle: TestServerHandle;
let browser: Browser;
let page: Page;

type GridPropsAcceptsRole = "role" extends keyof GridProps ? true : false;

interface Point {
	readonly x: number;
	readonly y: number;
}

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
		throw new AggregateError(failures, "Failed to tear down the grid test");
	}
}

function expectOneColumnLayout(boxes: readonly Point[]): void {
	const [c0, c1, c2] = boxes;
	if (!(c0 && c1 && c2)) {
		throw new Error("Expected three child bounding boxes");
	}
	expect(c1.x).toBeCloseTo(c0.x, 1);
	expect(c2.x).toBeCloseTo(c0.x, 1);
	expect(c1.y).toBeGreaterThan(c0.y);
	expect(c2.y).toBeGreaterThan(c1.y);
}

function expectTwoColumnLayout(boxes: readonly Point[]): void {
	const [c0, c1, c2] = boxes;
	if (!(c0 && c1 && c2)) {
		throw new Error("Expected three child bounding boxes");
	}
	expect(c0.y).toBeCloseTo(c1.y, 1);
	expect(c1.x).toBeGreaterThan(c0.x);
	expect(c2.y).toBeGreaterThan(c0.y);
	expect(c2.x).toBeCloseTo(c0.x, 1);
}

describe("Grid component and docs specimen", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		page.setDefaultTimeout(6000);
	}, 120_000);

	afterAll(async () => {
		const results = await Promise.allSettled([
			Promise.resolve().then(() => browser?.close()),
			Promise.resolve().then(() => teardownTestServer(handle)),
		]);
		throwTeardownFailures(results);
	}, 120_000);

	it("resolves root and grid subpath exports with a closed prop contract", () => {
		expect(import.meta.resolve("@mizen-labs/ui")).toContain(
			"packages/ui/dist/index.js"
		);
		expect(import.meta.resolve("@mizen-labs/ui/grid")).toContain(
			"packages/ui/dist/components/grid/grid.js"
		);
		const acceptsRole = false satisfies GridPropsAcceptsRole;
		expect(acceptsRole).toBe(false);
	});

	it("renders the Grid docs route", async () => {
		const response = await page.goto(`${handle.url}/components/grid`, {
			waitUntil: "networkidle",
		});
		expect(response?.status()).toBe(200);
		expect(
			await page
				.getByRole("heading", { exact: true, level: 1, name: "Grid" })
				.isVisible()
		).toBe(true);
	});

	it("renders the four-card public Grid preview", async () => {
		const grid = page.locator(
			'[data-slot="component-preview"] [data-slot="grid"]'
		);
		expect(await grid.evaluate((node) => node.tagName)).toBe("DIV");
		expect(await grid.getAttribute("role")).toBeNull();
		expect(await grid.locator(":scope > *").count()).toBe(4);
	});

	it("uses the system-owned grid layout and spacing tokens", async () => {
		const style = await page
			.locator('[data-slot="component-preview"] [data-slot="grid"]')
			.evaluate((node) => {
				const computed = getComputedStyle(node);
				return [computed.display, computed.gap, computed.minWidth];
			});
		expect(style).toEqual(["grid", "12px", "0px"]);
	});

	it("renders one-column geometry at 375px viewport", async () => {
		await page.setViewportSize({ height: 812, width: 375 });
		await page.goto(`${handle.url}/components/grid`, {
			waitUntil: "networkidle",
		});
		const grid = page.locator(
			'[data-slot="component-preview"] [data-slot="grid"]'
		);
		const templateColumns = await grid.evaluate(
			(node) => getComputedStyle(node).gridTemplateColumns
		);
		const columns = templateColumns.trim().split(WHITESPACE_REGEX);
		expect(columns).toHaveLength(1);

		const childBoxes = await grid
			.locator(":scope > *")
			.evaluateAll((elements) =>
				elements.map((el) => {
					const rect = el.getBoundingClientRect();
					return { x: rect.x, y: rect.y };
				})
			);
		expectOneColumnLayout(childBoxes);
	});

	it("renders two-column geometry at 768px viewport", async () => {
		await page.setViewportSize({ height: 900, width: 768 });
		await page.goto(`${handle.url}/components/grid`, {
			waitUntil: "networkidle",
		});
		const grid = page.locator(
			'[data-slot="component-preview"] [data-slot="grid"]'
		);
		const templateColumns = await grid.evaluate(
			(node) => getComputedStyle(node).gridTemplateColumns
		);
		const columns = templateColumns.trim().split(WHITESPACE_REGEX);
		expect(columns).toHaveLength(2);

		const childBoxes = await grid
			.locator(":scope > *")
			.evaluateAll((elements) =>
				elements.map((el) => {
					const rect = el.getBoundingClientRect();
					return { x: rect.x, y: rect.y };
				})
			);
		expectTwoColumnLayout(childBoxes);
	});

	it("renders two-column geometry at 1280px viewport", async () => {
		await page.setViewportSize({ height: 900, width: 1280 });
		await page.goto(`${handle.url}/components/grid`, {
			waitUntil: "networkidle",
		});
		const grid = page.locator(
			'[data-slot="component-preview"] [data-slot="grid"]'
		);
		const templateColumns = await grid.evaluate(
			(node) => getComputedStyle(node).gridTemplateColumns
		);
		const columns = templateColumns.trim().split(WHITESPACE_REGEX);
		expect(columns).toHaveLength(2);

		const childBoxes = await grid
			.locator(":scope > *")
			.evaluateAll((elements) =>
				elements.map((el) => {
					const rect = el.getBoundingClientRect();
					return { x: rect.x, y: rect.y };
				})
			);
		expectTwoColumnLayout(childBoxes);
	});

	it("fits the mobile viewport without horizontal overflow", async () => {
		await page.setViewportSize({ height: 812, width: 375 });
		await page.goto(`${handle.url}/components/grid`, {
			waitUntil: "networkidle",
		});
		const widths = await page.evaluate(() => [
			document.body.scrollWidth,
			document.body.clientWidth,
		]);
		expect(widths[0]).toBe(widths[1]);
	});
});
