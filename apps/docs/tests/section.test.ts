import type { SectionProps } from "@mizen-labs/ui/section";
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

type SectionPropsAcceptsRole = "role" extends keyof SectionProps ? true : false;

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
		throw new AggregateError(failures, "Failed to tear down the section test");
	}
}

describe("Section component and docs specimen", () => {
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

	it("resolves root and section subpath exports with a closed prop contract", () => {
		expect(import.meta.resolve("@mizen-labs/ui")).toContain(
			"packages/ui/dist/index.js"
		);
		expect(import.meta.resolve("@mizen-labs/ui/section")).toContain(
			"packages/ui/dist/components/section/section.js"
		);
		const acceptsRole = false satisfies SectionPropsAcceptsRole;
		expect(acceptsRole).toBe(false);
	});

	it("renders the Section docs route", async () => {
		const response = await page.goto(`${handle.url}/components/section`, {
			waitUntil: "networkidle",
		});
		expect(response?.status()).toBe(200);
		expect(
			await page
				.getByRole("heading", { exact: true, level: 1, name: "Section" })
				.isVisible()
		).toBe(true);
	});

	it("renders one role-free native section with ordered content and named region semantics", async () => {
		// The first Section is Notifications: its heading block and its switches.
		const section = page
			.locator('[data-slot="component-preview"] [data-slot="section"]')
			.first();
		expect(await section.evaluate((node) => node.tagName)).toBe("SECTION");
		expect(await section.getAttribute("role")).toBeNull();
		expect(await section.locator(":scope > *").count()).toBe(2);
		expect(
			await page
				.getByRole("region", { exact: true, name: "Section preview" })
				.getByRole("region", { name: "Notifications" })
				.isVisible()
		).toBe(true);
	});

	it("uses the system-owned vertical layout and spacing", async () => {
		const style = await page
			.locator('[data-slot="component-preview"] [data-slot="section"]')
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
		expect(style).toEqual(["flex", "column", "16px", "0px"]);
	});

	it("fits the mobile viewport without horizontal overflow", async () => {
		await page.setViewportSize({ height: 812, width: 375 });
		await page.goto(`${handle.url}/components/section`, {
			waitUntil: "networkidle",
		});
		const widths = await page.evaluate(() => [
			document.body.scrollWidth,
			document.body.clientWidth,
		]);
		expect(widths[0]).toBe(widths[1]);
	});
});
