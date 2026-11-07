import type { TextProps } from "@mizen-labs/ui/text";
import { type Browser, chromium, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const releaseNotesExample = '[aria-label="Text: Release notes example"]';
let handle: TestServerHandle;
let browser: Browser;
let page: Page;

type TextPropsAcceptsRole = "role" extends keyof TextProps ? true : false;

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
		throw new AggregateError(failures, "Failed to tear down the text test");
	}
}

describe("Text component and docs specimen", () => {
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

	it("given @mizen-labs/ui and @mizen-labs/ui/text, resolves export targets and type contracts", () => {
		// Given: package exports configured in packages/ui/package.json
		// When: resolving the package root and subpath export targets
		const rootPath = import.meta.resolve("@mizen-labs/ui");
		const subpath = import.meta.resolve("@mizen-labs/ui/text");

		// Then: both point to their built distribution entrypoints
		expect(rootPath).toContain("packages/ui/dist/index.js");
		expect(subpath).toContain("packages/ui/dist/components/text/text.js");

		// And: typecheck verifies @mizen-labs/ui/text exports TextProps without runtime JSX import
		const sampleProps = { size: "body" } as const satisfies TextProps;
		const textPropsAcceptsRole = false satisfies TextPropsAcceptsRole;
		expect(sampleProps.size).toBe("body");
		expect(textPropsAcceptsRole).toBe(false);
	});

	it("given /components/text, renders the docs text page", async () => {
		// Given: a browser session navigated to the text docs route
		const response = await page.goto(`${handle.url}/components/text`, {
			waitUntil: "networkidle",
		});

		// When: verifying HTTP response and main page title
		expect(response?.status()).toBe(200);
		const pageTitle = page.getByRole("heading", {
			exact: true,
			level: 1,
			name: "Text",
		});

		// Then: the page title heading is visible
		expect(await pageTitle.isVisible()).toBe(true);
	});

	it("given text examples, renders the exact native tag and size sequence with no aria roles", async () => {
		// Given: the text component docs page is loaded
		await page.goto(`${handle.url}/components/text`, {
			waitUntil: "networkidle",
		});

		// Then: the main preview shows metadata, body, and a footnote
		const previewSizes = await page
			.locator('[data-slot="component-preview"] [data-slot="text"]')
			.evaluateAll((elements) =>
				elements.map((el) => [el.tagName, el.getAttribute("data-size")])
			);
		expect(previewSizes).toEqual([
			["P", "ui"],
			["P", "body"],
			["P", "caption"],
		]);

		// When: querying the release notes example text elements
		const textElements = page.locator(
			`${releaseNotesExample} [data-slot="text"]`
		);

		// Then: the exact tag name sequence is five native <p> elements
		const tagNames = await textElements.evaluateAll((elements) =>
			elements.map((el) => el.tagName)
		);
		expect(tagNames).toEqual(["P", "P", "P", "P", "P"]);

		// And: the exact size sequence matches default body, explicit body, ui, caption, and body
		const sizes = await textElements.evaluateAll((elements) =>
			elements.map((el) => el.getAttribute("data-size"))
		);
		expect(sizes).toEqual(["body", "body", "ui", "caption", "body"]);

		// And: supporting ui text and captions are muted; body text is not
		const tones = await textElements.evaluateAll((elements) =>
			elements.map((el) => el.getAttribute("data-tone"))
		);
		expect(tones).toEqual(["default", "default", "muted", "muted", "default"]);

		// And: no native paragraph has an ARIA role attribute
		const roles = await textElements.evaluateAll((elements) =>
			elements.map((el) => el.getAttribute("role"))
		);
		expect(roles.every((role) => role === null)).toBe(true);
	});

	it("given text examples, renders distinct visual sizes matching typographyStyles tokens", async () => {
		// Given: the text component docs page is loaded
		await page.goto(`${handle.url}/components/text`, {
			waitUntil: "networkidle",
		});

		const body = page
			.locator(`${releaseNotesExample} [data-slot="text"][data-size="body"]`)
			.first();
		const supporting = page
			.locator(
				`${releaseNotesExample} [data-slot="text"][data-size="ui"][data-tone="muted"]`
			)
			.first();
		const caption = page
			.locator(`${releaseNotesExample} [data-slot="text"][data-size="caption"]`)
			.first();

		// When: inspecting computed typography for each size
		const bodyStyle = await body.evaluate((el) => {
			const s = getComputedStyle(el);
			return [s.fontSize, s.fontWeight, s.lineHeight, s.textWrap];
		});
		const supportingStyle = await supporting.evaluate((el) => {
			const s = getComputedStyle(el);
			return [s.fontSize, s.fontWeight, s.lineHeight, s.textWrap];
		});
		const captionStyle = await caption.evaluate((el) => {
			const s = getComputedStyle(el);
			return [s.fontSize, s.fontWeight, s.lineHeight];
		});

		// Then: computed typography matches design tokens
		expect(bodyStyle).toEqual(["16px", "400", "24px", "pretty"]);
		expect(supportingStyle).toEqual(["14px", "400", "20px", "pretty"]);
		expect(captionStyle).toEqual(["12px", "400", "16px"]);
	});

	it("given default text invocation, defaults to body size and renders realistic text wrapping", async () => {
		// Given: the text component docs page is loaded
		await page.goto(`${handle.url}/components/text`, {
			waitUntil: "networkidle",
		});

		// When: locating the default text element and multi-line body paragraph
		const defaultText = page
			.locator(`${releaseNotesExample} [data-slot="text"]`)
			.first();
		const multiLineText = page
			.locator(`${releaseNotesExample} [data-slot="text"][data-size="body"]`)
			.last();

		// Then: default text has data-size="body" and 16px font size
		expect(await defaultText.getAttribute("data-size")).toBe("body");

		// And: multi-line paragraph wraps to multiple lines
		const lineMetrics = await multiLineText.evaluate((el) => {
			const rect = el.getBoundingClientRect();
			const s = getComputedStyle(el);
			const computedLineHeight = Number.parseFloat(s.lineHeight);
			return {
				height: rect.height,
				lineHeight: computedLineHeight,
			};
		});
		expect(lineMetrics.height).toBeGreaterThan(lineMetrics.lineHeight);
	});
});
