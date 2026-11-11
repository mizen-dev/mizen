import type { InlineProps } from "@mizen-labs/ui/inline";
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

type InlinePropsAcceptsRole = "role" extends keyof InlineProps ? true : false;

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
		throw new AggregateError(failures, "Failed to tear down the inline test");
	}
}

describe("Inline component and docs specimen", () => {
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

	it("resolves root and inline subpath exports with a closed prop contract", () => {
		expect(import.meta.resolve("@mizen-labs/ui")).toContain(
			"packages/ui/dist/index.js"
		);
		expect(import.meta.resolve("@mizen-labs/ui/inline")).toContain(
			"packages/ui/dist/components/inline/inline.js"
		);
		const acceptsRole = false satisfies InlinePropsAcceptsRole;
		expect(acceptsRole).toBe(false);
	});

	it("renders the Inline docs route", async () => {
		const response = await page.goto(`${handle.url}/components/inline`, {
			waitUntil: "networkidle",
		});
		expect(response?.status()).toBe(200);
		expect(
			await page
				.getByRole("heading", { exact: true, level: 1, name: "Inline" })
				.isVisible()
		).toBe(true);
	});

	it("renders one role-free native div with ordered content", async () => {
		const inline = page.locator(
			'[data-slot="component-preview"] [data-slot="inline"]'
		);
		expect(await inline.evaluate((node) => node.tagName)).toBe("DIV");
		expect(await inline.getAttribute("role")).toBeNull();
		// The author, the date, the read time, and the tag.
		expect(await inline.locator(":scope > *").count()).toBe(4);
	});

	it("uses the system-owned horizontal wrapping layout and spacing", async () => {
		const style = await page
			.locator('[data-slot="component-preview"] [data-slot="inline"]')
			.evaluate((node) => {
				const computed = getComputedStyle(node);
				return [
					computed.display,
					computed.flexDirection,
					computed.flexWrap,
					computed.gap,
					computed.minWidth,
				];
			});
		expect(style).toEqual(["flex", "row", "wrap", "12px", "0px"]);
	});

	it("pushes two ends apart with justify between", async () => {
		const row = page
			.getByRole("region", { name: "Inline: Two ends example" })
			.locator('[data-slot="inline"]')
			.first();
		expect(
			await row.evaluate((node) => getComputedStyle(node).justifyContent)
		).toBe("space-between");
		const boxes = await row
			.locator(":scope > *")
			.evaluateAll((items) =>
				items.map((item) => item.getBoundingClientRect().toJSON())
			);
		const container = await row.boundingBox();
		expect(boxes).toHaveLength(2);
		expect(boxes[0]?.left).toBeCloseTo(container?.x ?? Number.NaN, 0);
		expect(boxes[1]?.right).toBeCloseTo(
			(container?.x ?? Number.NaN) + (container?.width ?? Number.NaN),
			0
		);
	});

	it("aligns text of different sizes on one baseline", async () => {
		const row = page
			.getByRole("region", { name: "Inline: Baseline example" })
			.locator('[data-slot="inline"]');
		expect(
			await row.evaluate((node) => getComputedStyle(node).alignItems)
		).toBe("baseline");
	});

	it("centers the actions of an empty state", async () => {
		await page.goto(`${handle.url}/components/empty`, {
			waitUntil: "networkidle",
		});
		const row = page
			.getByRole("region", { name: "Empty: Composed actions example" })
			.locator('[data-slot="inline"]');
		expect(
			await row.evaluate((node) => getComputedStyle(node).justifyContent)
		).toBe("center");
		expect(await row.getByRole("button").count()).toBe(2);
	});

	it("fits the mobile viewport without horizontal overflow", async () => {
		await page.setViewportSize({ height: 812, width: 375 });
		await page.goto(`${handle.url}/components/inline`, {
			waitUntil: "networkidle",
		});
		const widths = await page.evaluate(() => [
			document.body.scrollWidth,
			document.body.clientWidth,
		]);
		expect(widths[0]).toBe(widths[1]);
	});
});
