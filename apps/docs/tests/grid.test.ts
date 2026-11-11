import type { GridProps } from "@mizen-labs/ui/grid";
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

type GridPropsAcceptsRole = "role" extends keyof GridProps ? true : false;

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

const PREVIEW_GRID = '[data-slot="component-preview"] [data-slot="grid"]';

// The track's computed column widths, in px.
function readColumns(selector = '[data-slot="grid"]') {
	return page
		.locator(`${selector} > [data-slot="grid-track"]`)
		.first()
		.evaluate((track) =>
			getComputedStyle(track)
				.gridTemplateColumns.split(" ")
				.map(Number.parseFloat)
		);
}

async function openExample(name: string, width: number): Promise<void> {
	await page.setViewportSize({ height: 900, width });
	const response = await page.goto(`${handle.url}/docs/examples/${name}`, {
		waitUntil: "networkidle",
	});
	expect(response?.status()).toBe(200);
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

	it("renders a role-free container around one track of four items", async () => {
		const grid = page.locator(PREVIEW_GRID);
		expect(await grid.evaluate((node) => node.tagName)).toBe("DIV");
		expect(await grid.getAttribute("role")).toBeNull();
		expect(await grid.getAttribute("data-columns")).toBe("4");
		expect(await grid.locator(":scope > *").count()).toBe(1);
		expect(
			await grid.locator(':scope > [data-slot="grid-track"] > *').count()
		).toBe(4);
	});

	it("uses the system-owned grid layout and spacing tokens", async () => {
		const style = await page.locator(PREVIEW_GRID).evaluate((node) => {
			const container = getComputedStyle(node);
			const track = getComputedStyle(node.firstElementChild as Element);
			return [container.containerType, track.display, track.gap];
		});
		expect(style).toEqual(["inline-size", "grid", "16px"]);
	});

	// The docs stage is about 700px wide on a desktop: room for two of the
	// four columns, not for four.
	it.each([
		{ columns: 2, width: 1280 },
		{ columns: 1, width: 375 },
	])(
		"steps the preview to $columns columns at a $width px window",
		async ({ columns, width }) => {
			await page.setViewportSize({ height: 900, width });
			await page.goto(`${handle.url}/components/grid`, {
				waitUntil: "networkidle",
			});
			expect(await readColumns(PREVIEW_GRID)).toHaveLength(columns);
		}
	);

	it.each([
		{ columns: 4, width: 1280 },
		{ columns: 2, width: 800 },
		{ columns: 1, width: 375 },
	])(
		"steps four columns to $columns in a $width px window",
		async ({ columns, width }) => {
			await openExample("SummaryGrid", width);
			const widths = await readColumns();
			expect(widths).toHaveLength(columns);
			expect(new Set(widths.map(Math.round)).size).toBe(1);
		}
	);

	it("puts a main column beside a narrower one, and stacks them when narrow", async () => {
		await openExample("GridMainAsideExample2", 1280);
		const [main, aside] = await readColumns();
		expect((main ?? 0) / (aside ?? 1)).toBeGreaterThan(1.8);
		expect((main ?? 0) / (aside ?? 1)).toBeLessThan(2.2);
		await openExample("GridMainAsideExample2", 600);
		expect(await readColumns()).toHaveLength(1);
	});

	it("fits as many 16rem columns as the width allows", async () => {
		await openExample("GridYourProjectsExample1", 1280);
		const wide = await readColumns();
		expect(wide.length).toBeGreaterThan(2);
		expect(Math.min(...wide)).toBeGreaterThanOrEqual(256);
		await openExample("GridYourProjectsExample1", 375);
		expect(await readColumns()).toHaveLength(1);
	});

	it("follows its own width, not the window's", async () => {
		await openExample("SummaryGrid", 1280);
		const columns = await page
			.locator('[data-slot="grid"]')
			.evaluate((grid) => {
				const panel = document.createElement("div");
				panel.style.width = "20rem";
				grid.replaceWith(panel);
				panel.append(grid);
				return getComputedStyle(
					grid.firstElementChild as Element
				).gridTemplateColumns.split(" ").length;
			});
		expect(columns).toBe(1);
	});

	it("is one 16rem column in a parent that takes its width from its content", async () => {
		await openExample("SummaryGrid", 1280);
		const width = await page.locator('[data-slot="grid"]').evaluate((grid) => {
			const parent = document.createElement("div");
			parent.style.display = "inline-block";
			grid.replaceWith(parent);
			parent.append(grid);
			return grid.getBoundingClientRect().width;
		});
		expect(width).toBe(256);
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
