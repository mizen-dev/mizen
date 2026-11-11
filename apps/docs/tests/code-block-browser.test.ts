import { type Browser, chromium, type Page } from "playwright";
import { expect as expectLocator } from "playwright/test";
import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from "vite-plus/test";
import { workspaceSettingsSource } from "../src/entities/documentation/ui/compositions/code-block-source";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

declare global {
	interface Window {
		__codeBlockClipboardReject?: boolean;
		__codeBlockClipboardText?: string;
	}
}

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
let handle: TestServerHandle;
let browser: Browser;
let page: Page;
const browserErrors: string[] = [];

describe("Code Block browser behavior", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage({ viewport: { height: 900, width: 1280 } });
		page.setDefaultTimeout(8000);
		page.on("pageerror", (error) => browserErrors.push(error.message));
		page.on("console", (message) => {
			if (message.type() === "error") {
				browserErrors.push(message.text());
			}
		});
		await page.addInitScript(() => {
			const state = window as Window;
			Object.defineProperty(navigator, "clipboard", {
				configurable: true,
				value: {
					writeText: (text: string) => {
						if (state.__codeBlockClipboardReject) {
							return Promise.reject(new Error("Clipboard write rejected"));
						}
						state.__codeBlockClipboardText = text;
						return Promise.resolve();
					},
				},
			});
		});
	}, 120_000);

	beforeEach(async () => {
		browserErrors.length = 0;
		await page.setViewportSize({ height: 900, width: 1280 });
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
	});

	afterEach(() => {
		expect(browserErrors).toEqual([]);
	});

	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
	});

	it("preserves source text and supports named keyboard scrolling and copy feedback", async () => {
		const example = page.getByTestId("code-block-example");
		const content = example.locator('[data-slot="code-block-content"]');
		const code = content.locator("code");
		const copy = example.getByRole("button", { name: "Copy code" });
		const status = example.locator('[data-slot="code-block-copy-status"]');

		expect(await code.textContent()).toBe(workspaceSettingsSource);
		expect(await code.locator("main").count()).toBe(0);
		expect(await code.textContent()).toContain("<main>ready</main>");
		await expectLocator(
			page.getByRole("region", { name: "Workspace settings source" })
		).toBeVisible();
		await expectLocator(content).toHaveAttribute(
			"aria-label",
			"Workspace settings source"
		);
		await expectLocator(content).toHaveAttribute("tabindex", "0");

		await page.setViewportSize({ height: 900, width: 390 });
		expect(
			await content.evaluate(
				(element) => element.scrollWidth > element.clientWidth
			)
		).toBe(true);
		await content.focus();
		await page.keyboard.press("ArrowRight");
		await page.keyboard.press("ArrowRight");
		await page.waitForFunction(
			(element) => element.scrollLeft > 0,
			await content.elementHandle()
		);

		await copy.click();
		await expectLocator(status).toHaveText("Copied");
		expect(await page.evaluate(() => window.__codeBlockClipboardText)).toBe(
			workspaceSettingsSource
		);

		await page.evaluate(() => {
			window.__codeBlockClipboardReject = true;
		});
		await copy.click();
		await expectLocator(status).toHaveText(
			"Could not copy. Select the code to copy it."
		);
	});

	it("captures light and dark appearances and contains the example at narrow zoomed text sizes", async () => {
		const example = page.getByTestId("code-block-example");
		const surface = example.locator('[data-slot="code-block"]');

		async function captureTheme(theme: "light" | "dark") {
			await page.evaluate((nextTheme) => {
				localStorage.setItem("mizen-theme", nextTheme);
			}, theme);
			await page.reload({ waitUntil: "networkidle" });
			await expectLocator(surface).toBeVisible();
			await expectLocator(page.locator("html")).toHaveAttribute(
				"data-theme",
				theme
			);
			await example.screenshot({
				animations: "disabled",
				caret: "initial",
				path: `/private/tmp/mizen-code-block-${theme}.png`,
			});
		}
		await captureTheme("light");
		await captureTheme("dark");

		await page.setViewportSize({ height: 900, width: 390 });
		await page.addStyleTag({
			content:
				"html {font-size:32px !important} * {line-height:1.5 !important;letter-spacing:0.12em !important;word-spacing:0.16em !important}",
		});
		expect(
			await page.evaluate(
				() => document.documentElement.scrollWidth <= window.innerWidth
			)
		).toBe(true);
		expect(
			await surface.evaluate(
				(element) => element.scrollWidth <= element.clientWidth
			)
		).toBe(true);
		await expectLocator(
			example.locator('[data-slot="code-block-content"]')
		).toBeVisible();
	});
});
