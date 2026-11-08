import type { SpacerProps } from "@mizen-labs/ui/spacer";
import { type Browser, chromium, type Page } from "playwright";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it, vi } from "vite-plus/test";
import { Spacer } from "../../../packages/ui/src/components/spacer/spacer";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

vi.mock("@stylexjs/stylex", () => ({
	create: (styles: unknown) => styles,
	defineMarker: () => ({}),
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
let handle: TestServerHandle;
let browser: Browser;
let page: Page;

type SpacerPropsAcceptsChildren = "children" extends keyof SpacerProps
	? true
	: false;
type SpacerPropsAcceptsClassName = "className" extends keyof SpacerProps
	? true
	: false;
type SpacerPropsAcceptsDangerousHtml =
	"dangerouslySetInnerHTML" extends keyof SpacerProps ? true : false;
type SpacerPropsAcceptsRole = "role" extends keyof SpacerProps ? true : false;
type SpacerPropsAcceptsStyle = "style" extends keyof SpacerProps ? true : false;

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
		throw new AggregateError(failures, "Failed to tear down the spacer test");
	}
}

describe("Spacer component and docs specimen", () => {
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

	it("resolves root and spacer subpath exports with a closed prop contract", () => {
		expect(import.meta.resolve("@mizen-labs/ui")).toContain(
			"packages/ui/dist/index.js"
		);
		expect(import.meta.resolve("@mizen-labs/ui/spacer")).toContain(
			"packages/ui/dist/components/spacer/spacer.js"
		);
		const acceptsChildren = false satisfies SpacerPropsAcceptsChildren;
		expect(acceptsChildren).toBe(false);
		const acceptsClassName = false satisfies SpacerPropsAcceptsClassName;
		expect(acceptsClassName).toBe(false);
		const acceptsDangerousHtml =
			false satisfies SpacerPropsAcceptsDangerousHtml;
		expect(acceptsDangerousHtml).toBe(false);
		const acceptsRole = false satisfies SpacerPropsAcceptsRole;
		expect(acceptsRole).toBe(false);
		const acceptsStyle = false satisfies SpacerPropsAcceptsStyle;
		expect(acceptsStyle).toBe(false);
	});

	it("renders the Spacer docs route", async () => {
		const response = await page.goto(`${handle.url}/components/spacer`, {
			waitUntil: "networkidle",
		});
		expect(response?.status()).toBe(200);
		expect(
			await page
				.getByRole("heading", { exact: true, level: 1, name: "Spacer" })
				.isVisible()
		).toBe(true);
	});

	it("renders one role-free childless native div", async () => {
		const spacer = page.locator(
			'[data-slot="component-preview"] [data-slot="spacer"]'
		);
		expect(await spacer.count()).toBe(1);
		expect(await spacer.evaluate((node) => node.tagName)).toBe("DIV");
		expect(await spacer.getAttribute("role")).toBeNull();
		expect(await spacer.evaluate((node) => node.children.length)).toBe(0);
		expect(await spacer.evaluate((node) => node.childNodes.length)).toBe(0);
	});

	it("strips escaped child-bearing props at runtime", () => {
		const escapedProps = {
			children: "Injected child",
			dangerouslySetInnerHTML: { __html: "<span>Injected HTML</span>" },
			id: "escaped-spacer",
			role: "presentation",
		};
		const markup = renderToStaticMarkup(createElement(Spacer, escapedProps));
		expect(markup).toContain('id="escaped-spacer"');
		expect(markup).not.toContain("Injected");
		expect(markup).not.toContain("role=");
	});

	it("uses the exact system-owned flex styles", async () => {
		const styles = await page
			.locator('[data-slot="component-preview"] [data-slot="spacer"]')
			.evaluate((node) => {
				const computed = getComputedStyle(node);
				return {
					flexBasis: computed.flexBasis,
					flexGrow: computed.flexGrow,
					flexShrink: computed.flexShrink,
					minHeight: computed.minHeight,
					minWidth: computed.minWidth,
				};
			});
		expect(styles).toEqual({
			flexBasis: "0%",
			flexGrow: "1",
			flexShrink: "1",
			minHeight: "0px",
			minWidth: "0px",
		});
	});

	it("provides an actual positive filler width between peer controls in the specimen", async () => {
		const spacer = page.locator(
			'[data-slot="component-preview"] [data-slot="spacer"]'
		);
		const spacerBox = await spacer.boundingBox();
		expect(spacerBox).not.toBeNull();
		if (!spacerBox) {
			throw new Error("Expected spacer bounding box");
		}
		expect(spacerBox.width).toBeGreaterThan(0);

		const inline = page.locator(
			'[data-slot="component-preview"] [data-slot="inline"]'
		);
		// Delete on the left, then Cancel and Save on the right.
		const controls = inline.locator("button");
		expect(await controls.count()).toBe(3);

		const leadingBox = await controls.first().boundingBox();
		const trailingBox = await controls.last().boundingBox();
		expect(leadingBox).not.toBeNull();
		expect(trailingBox).not.toBeNull();
		if (leadingBox && trailingBox) {
			expect(spacerBox.x).toBeGreaterThanOrEqual(
				leadingBox.x + leadingBox.width
			);
			expect(trailingBox.x).toBeGreaterThanOrEqual(
				spacerBox.x + spacerBox.width
			);
		}
	});

	it("fits the mobile viewport at 375px without horizontal overflow", async () => {
		await page.setViewportSize({ height: 812, width: 375 });
		await page.goto(`${handle.url}/components/spacer`, {
			waitUntil: "networkidle",
		});
		const widths = await page.evaluate(() => [
			document.body.scrollWidth,
			document.body.clientWidth,
		]);
		expect(widths[0]).toBe(widths[1]);

		const spacer = page.locator(
			'[data-slot="component-preview"] [data-slot="spacer"]'
		);
		const spacerBox = await spacer.boundingBox();
		expect(spacerBox).not.toBeNull();
		if (spacerBox) {
			expect(spacerBox.width).toBeGreaterThan(0);
		}
	});
});
