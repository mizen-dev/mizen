import type { CodeProps } from "@mizen/ui/code";
import { type Browser, chromium, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const BEFORE_REVIEW_EXAMPLE = '[aria-label="Code: Before the review example"]';
let handle: TestServerHandle;
let browser: Browser;
let page: Page;

type CodePropsAcceptsRole = "role" extends keyof CodeProps ? true : false;

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
		throw new AggregateError(failures, "Failed to tear down the code test");
	}
}

describe("Code component and docs specimen", () => {
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

	it("resolves root and code subpath exports with a closed prop contract", () => {
		expect(import.meta.resolve("@mizen/ui")).toContain(
			"packages/ui/dist/index.js"
		);
		expect(import.meta.resolve("@mizen/ui/code")).toContain(
			"packages/ui/dist/components/code/code.js"
		);
		const acceptsRole = false satisfies CodePropsAcceptsRole;
		expect(acceptsRole).toBe(false);
	});

	it("renders the Code docs route", async () => {
		const response = await page.goto(`${handle.url}/components/code`, {
			waitUntil: "networkidle",
		});
		expect(response?.status()).toBe(200);
		expect(
			await page
				.getByRole("heading", { exact: true, level: 1, name: "Code" })
				.isVisible()
		).toBe(true);
	});

	it("renders native role-free code elements", async () => {
		await page.goto(`${handle.url}/components/code`, {
			waitUntil: "networkidle",
		});
		const elements = page.locator(
			`${BEFORE_REVIEW_EXAMPLE} [data-slot="code"]`
		);
		expect(
			await elements.evaluateAll((nodes) => nodes.map((node) => node.tagName))
		).toEqual(["CODE", "CODE", "CODE"]);
		expect(
			await elements.evaluateAll((nodes) =>
				nodes.map((node) => node.getAttribute("role"))
			)
		).toEqual([null, null, null]);
	});

	it("scales inline code with its text and uses inline surface tokens", async () => {
		const element = page
			.locator('[data-slot="component-preview"] [data-slot="code"]')
			.first();
		const style = await element.evaluate((node) => {
			const computed = getComputedStyle(node);
			return {
				backgroundColor: computed.backgroundColor,
				borderRadius: computed.borderRadius,
				fontFamily: computed.fontFamily,
				fontSize: computed.fontSize,
				lineHeight: computed.lineHeight,
				paddingInline: computed.paddingInline,
			};
		});
		expect(style.fontFamily).toContain("ui-monospace");
		expect(style).toMatchObject({
			borderRadius: "6px",
			fontSize: "14.4px",
			lineHeight: "24px",
			paddingInline: "4px",
		});
		expect(style.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
	});

	it("wraps long inline code without horizontal overflow", async () => {
		await page.setViewportSize({ height: 812, width: 375 });
		await page.goto(`${handle.url}/components/code`, {
			waitUntil: "networkidle",
		});
		const metrics = await page.evaluate(() => ({
			clientWidth: document.body.clientWidth,
			scrollWidth: document.body.scrollWidth,
		}));
		expect(metrics.scrollWidth).toBe(metrics.clientWidth);
	});
});
