import type { GroupProps } from "@mizen/ui/group";
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

type GroupPropsAcceptsRole = "role" extends keyof GroupProps ? true : false;

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
		throw new AggregateError(failures, "Failed to tear down the group test");
	}
}

describe("Group component and docs specimen", () => {
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

	it("resolves root and group subpath exports with a closed prop contract", () => {
		expect(import.meta.resolve("@mizen/ui")).toContain(
			"packages/ui/dist/index.js"
		);
		expect(import.meta.resolve("@mizen/ui/group")).toContain(
			"packages/ui/dist/components/group/group.js"
		);
		const acceptsRole = false satisfies GroupPropsAcceptsRole;
		expect(acceptsRole).toBe(false);
	});

	it("renders the Group docs route", async () => {
		const response = await page.goto(`${handle.url}/components/group`, {
			waitUntil: "networkidle",
		});
		expect(response?.status()).toBe(200);
		expect(
			await page
				.getByRole("heading", { exact: true, level: 1, name: "Group" })
				.isVisible()
		).toBe(true);
	});

	it("renders one role-free native div with ordered content", async () => {
		// The Group holds the four tags.
		const group = page
			.locator('[data-slot="component-preview"] [data-slot="group"]')
			.first();
		expect(await group.evaluate((node) => node.tagName)).toBe("DIV");
		expect(await group.getAttribute("role")).toBeNull();
		expect(await group.locator(":scope > *").count()).toBe(4);
	});

	it("uses the system-owned horizontal wrapping layout and spacing", async () => {
		const style = await page
			.locator('[data-slot="component-preview"] [data-slot="group"]')
			.first()
			.evaluate((node) => {
				const computed = getComputedStyle(node);
				return [
					computed.display,
					computed.flexDirection,
					computed.alignItems,
					computed.flexWrap,
					computed.gap,
					computed.minWidth,
				];
			});
		expect(style).toEqual(["flex", "row", "center", "wrap", "8px", "0px"]);
	});

	it("fits the mobile viewport without horizontal overflow", async () => {
		await page.setViewportSize({ height: 812, width: 375 });
		await page.goto(`${handle.url}/components/group`, {
			waitUntil: "networkidle",
		});
		const widths = await page.evaluate(() => [
			document.body.scrollWidth,
			document.body.clientWidth,
		]);
		expect(widths[0]).toBe(widths[1]);
	});
});
