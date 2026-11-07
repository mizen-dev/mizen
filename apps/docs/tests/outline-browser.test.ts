import { type Browser, chromium, type Page } from "playwright";
import { expect as expectLocator } from "playwright/test";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
	setDocsTheme,
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const STRUCTURE_HASH = /#outline-structure$/;
const LIGHT_SCREENSHOT = "/private/tmp/mizen-outline-light-narrow.png";
const DARK_SCREENSHOT = "/private/tmp/mizen-outline-dark-narrow.png";
const LIGHT_STRESS_SCREENSHOT = "/private/tmp/mizen-outline-light-stress.png";
const DARK_STRESS_SCREENSHOT = "/private/tmp/mizen-outline-dark-stress.png";
let handle: TestServerHandle;
let browser: Browser;
let page: Page;
const errors: string[] = [];

describe("Page outline recipe", { timeout: 30_000 }, () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage({ viewport: { height: 900, width: 1280 } });
		page.on("pageerror", (error) => errors.push(error.message));
		page.on("console", (message) => {
			if (message.type() === "error") {
				errors.push(message.text());
			}
		});
		await page.goto(`${handle.url}/internal/specimens`, { waitUntil: "load" });
	}, 120_000);

	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
		expect(errors).toEqual([]);
	}, 30_000);

	it("links by native fragments to unique, named sections and wraps at narrow widths", async () => {
		const example = page.getByTestId("outline-example");
		const nav = example.getByRole("navigation", { name: "Guide sections" });
		const links = nav.getByRole("link");
		await expectLocator(links).toHaveCount(3);

		await Promise.all(
			(
				[
					["#outline-overview", "Overview"],
					["#outline-structure", "Page structure"],
					["#outline-keyboard", "Keyboard and screen-reader considerations"],
				] as const
			).map(([href, heading]) => {
				const link = nav.getByRole("link", { name: heading });
				const section = page.locator(href);
				return Promise.all([
					expectLocator(link).toHaveAttribute("href", href),
					expectLocator(section).toHaveCount(1),
					expectLocator(section).toHaveAttribute(
						"aria-labelledby",
						`${href.slice(1)}-heading`
					),
				]);
			})
		);

		const structureLink = nav.getByRole("link", { name: "Page structure" });
		await structureLink.focus();
		await page.keyboard.press("Enter");
		await expectLocator(page).toHaveURL(STRUCTURE_HASH);
		const target = page.locator("#outline-structure");
		await expectLocator(target).toBeFocused();
		const targetTop = await target.evaluate(
			(element) => element.getBoundingClientRect().top
		);
		const headerBottom = await page
			.locator("header")
			.first()
			.evaluate((element) => element.getBoundingClientRect().bottom);
		expect(targetTop).toBeGreaterThanOrEqual(headerBottom);

		await page.setViewportSize({ height: 900, width: 320 });
		await page.evaluate(() => {
			document.documentElement.style.fontSize = "32px";
		});
		await page.addStyleTag({
			content:
				'[data-testid="outline-example"], [data-testid="outline-example"] * { letter-spacing: .12em !important; line-height: 1.5 !important; word-spacing: .16em !important; } [data-testid="outline-example"] p { margin-block-end: 2em !important; }',
		});
		const longLink = nav.getByRole("link", {
			name: "Keyboard and screen-reader considerations",
		});
		await expectLocator(longLink).toBeVisible();
		const bounds = await example.evaluate((element) => ({
			clientWidth: element.clientWidth,
			scrollWidth: element.scrollWidth,
		}));
		expect(bounds.scrollWidth).toBeLessThanOrEqual(bounds.clientWidth + 1);
		expect(
			await page.evaluate(
				() => document.documentElement.scrollWidth <= window.innerWidth
			)
		).toBe(true);
		expect(
			await longLink.evaluate((element) => getComputedStyle(element).whiteSpace)
		).toBe("normal");
		expect(
			await longLink.evaluate((element) => {
				const range = document.createRange();
				range.selectNodeContents(element);
				return range.getClientRects().length;
			})
		).toBeGreaterThan(1);
		await setDocsTheme(page, "light");
		await expectLocator(page.locator("html")).toHaveAttribute(
			"data-theme",
			"light"
		);
		const lightHeadingColor = await example
			.locator("h2")
			.evaluate((element) => getComputedStyle(element).color);
		const lightChromeStyle = await page.addStyleTag({
			content: "header, a[href='#docs-content'] { display: none !important; }",
		});
		await example.screenshot({ caret: "initial", path: LIGHT_SCREENSHOT });
		await example.screenshot({
			caret: "initial",
			path: LIGHT_STRESS_SCREENSHOT,
		});
		await lightChromeStyle.evaluate((element) =>
			element.parentNode?.removeChild(element)
		);
		await setDocsTheme(page, "dark");
		await expectLocator(page.locator("html")).toHaveAttribute(
			"data-theme",
			"dark"
		);
		expect(
			await example
				.locator("h2")
				.evaluate((element) => getComputedStyle(element).color)
		).not.toBe(lightHeadingColor);
		await page.addStyleTag({
			content: "header, a[href='#docs-content'] { display: none !important; }",
		});
		await example.screenshot({ caret: "initial", path: DARK_SCREENSHOT });
		await example.screenshot({
			caret: "initial",
			path: DARK_STRESS_SCREENSHOT,
		});
	});
});
