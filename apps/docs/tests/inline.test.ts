import type { InlineProps } from "@mizen/ui/inline";
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
		expect(import.meta.resolve("@mizen/ui")).toContain(
			"packages/ui/dist/index.js"
		);
		expect(import.meta.resolve("@mizen/ui/inline")).toContain(
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
