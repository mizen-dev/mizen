import type { SeparatorProps } from "@mizen-labs/ui/separator";
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

type SeparatorPropsAcceptsRole = "role" extends keyof SeparatorProps
	? true
	: false;
type SeparatorPropsAcceptsChildren = "children" extends keyof SeparatorProps
	? true
	: false;
type SeparatorPropsAcceptsAriaOrientation =
	"aria-orientation" extends keyof SeparatorProps ? true : false;

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
		throw new AggregateError(
			failures,
			"Failed to tear down the separator test"
		);
	}
}

describe("Separator component and docs specimen", () => {
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

	it("resolves root and separator subpath exports with a closed prop contract", () => {
		expect(import.meta.resolve("@mizen-labs/ui")).toContain(
			"packages/ui/dist/index.js"
		);
		expect(import.meta.resolve("@mizen-labs/ui/separator")).toContain(
			"packages/ui/dist/components/separator/separator.js"
		);
		const acceptsRole = false satisfies SeparatorPropsAcceptsRole;
		expect(acceptsRole).toBe(false);
		const acceptsChildren = false satisfies SeparatorPropsAcceptsChildren;
		expect(acceptsChildren).toBe(false);
		const acceptsAriaOrientation =
			false satisfies SeparatorPropsAcceptsAriaOrientation;
		expect(acceptsAriaOrientation).toBe(false);
	});

	it("renders the Separator docs route", async () => {
		const response = await page.goto(`${handle.url}/components/separator`, {
			waitUntil: "networkidle",
		});
		expect(response?.status()).toBe(200);
		expect(
			await page
				.getByRole("heading", { exact: true, level: 1, name: "Separator" })
				.isVisible()
		).toBe(true);
	});

	it("renders one role-free native hr with separator accessibility semantics", async () => {
		const separator = page.locator('[data-slot="separator"]').first();
		expect(await separator.evaluate((node) => node.tagName)).toBe("HR");
		expect(await separator.getAttribute("role")).toBeNull();
		expect(await separator.getAttribute("aria-orientation")).toBeNull();
		expect(await page.getByRole("separator").first().isVisible()).toBe(true);
	});

	it("resets native hr defaults to a system-owned rule", async () => {
		const style = await page
			.locator('[data-slot="separator"]')
			.first()
			.evaluate((node) => {
				const computed = getComputedStyle(node);
				return {
					backgroundColor: computed.backgroundColor,
					borderBottomWidth: computed.borderBottomWidth,
					borderLeftWidth: computed.borderLeftWidth,
					borderRightWidth: computed.borderRightWidth,
					borderStyle: computed.borderStyle || computed.borderTopStyle,
					borderTopWidth: computed.borderTopWidth,
					height: computed.height,
					marginBottom: computed.marginBottom,
					marginLeft: computed.marginLeft,
					marginRight: computed.marginRight,
					marginTop: computed.marginTop,
					width: computed.width,
				};
			});
		expect(style.borderStyle).toBe("none");
		expect(style.borderTopWidth).toBe("0px");
		expect(style.borderBottomWidth).toBe("0px");
		expect(style.borderLeftWidth).toBe("0px");
		expect(style.borderRightWidth).toBe("0px");
		expect(style.height).toBe("1px");
		expect(style.marginTop).toBe("0px");
		expect(style.marginBottom).toBe("0px");
		expect(style.marginLeft).toBe("0px");
		expect(style.marginRight).toBe("0px");
		expect(style.backgroundColor).not.toBe("");
		expect(style.backgroundColor).not.toBe("transparent");
		expect(Number.parseFloat(style.width)).toBeGreaterThan(0);
	});

	it.each([
		{ height: 812, width: 375 },
		{ height: 900, width: 768 },
		{ height: 900, width: 1280 },
	])(
		"fits the $width px viewport without horizontal overflow",
		async ({ height, width }) => {
			await page.setViewportSize({ height, width });
			await page.goto(`${handle.url}/components/separator`, {
				waitUntil: "networkidle",
			});
			const widths = await page.evaluate(() => [
				document.body.scrollWidth,
				document.body.clientWidth,
			]);
			expect(widths[0]).toBe(widths[1]);
		}
	);
});
