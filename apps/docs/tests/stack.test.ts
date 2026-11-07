import type { StackProps } from "@mizen-labs/ui/stack";
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

type StackPropsAcceptsRole = "role" extends keyof StackProps ? true : false;

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
		throw new AggregateError(failures, "Failed to tear down the stack test");
	}
}

describe("Stack component and docs specimen", () => {
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

	it("resolves root and stack subpath exports with a closed prop contract", () => {
		expect(import.meta.resolve("@mizen-labs/ui")).toContain(
			"packages/ui/dist/index.js"
		);
		expect(import.meta.resolve("@mizen-labs/ui/stack")).toContain(
			"packages/ui/dist/components/stack/stack.js"
		);
		const acceptsRole = false satisfies StackPropsAcceptsRole;
		expect(acceptsRole).toBe(false);
	});

	it("renders the Stack docs route", async () => {
		const response = await page.goto(`${handle.url}/components/stack`, {
			waitUntil: "networkidle",
		});
		expect(response?.status()).toBe(200);
		expect(
			await page
				.getByRole("heading", { exact: true, level: 1, name: "Stack" })
				.isVisible()
		).toBe(true);
	});

	it("renders one role-free native div with ordered content", async () => {
		// The Stack holds the four check rows.
		const stack = page
			.locator('[data-slot="component-preview"] [data-slot="stack"]')
			.first();
		expect(await stack.evaluate((node) => node.tagName)).toBe("DIV");
		expect(await stack.getAttribute("role")).toBeNull();
		expect(await stack.locator(":scope > *").count()).toBe(4);
	});

	it("uses the system-owned vertical layout and spacing", async () => {
		const style = await page
			.locator('[data-slot="component-preview"] [data-slot="stack"]')
			.first()
			.evaluate((node) => {
				const computed = getComputedStyle(node);
				return [
					computed.display,
					computed.flexDirection,
					computed.gap,
					computed.minWidth,
				];
			});
		expect(style).toEqual(["flex", "column", "12px", "0px"]);
	});

	it("fits the mobile viewport without horizontal overflow", async () => {
		await page.setViewportSize({ height: 812, width: 375 });
		await page.goto(`${handle.url}/components/stack`, {
			waitUntil: "networkidle",
		});
		const widths = await page.evaluate(() => [
			document.body.scrollWidth,
			document.body.clientWidth,
		]);
		expect(widths[0]).toBe(widths[1]);
	});
});
