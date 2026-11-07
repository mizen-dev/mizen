import { type Browser, chromium } from "playwright";
import { expect as expectLocator } from "playwright/test";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const errors: string[] = [];
let browser: Browser;
let handle: TestServerHandle;

describe("agent selector recipe", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
	}, 120_000);

	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
		expect(errors).toEqual([]);
	}, 120_000);

	it("selects an available agent by keyboard and keeps its details in sync", async () => {
		const context = await browser.newContext({
			viewport: { height: 900, width: 1280 },
		});
		const page = await context.newPage();
		page.setDefaultTimeout(6000);
		page.on("pageerror", (error) => errors.push(error.message));
		page.on("console", (message) => {
			if (message.type() === "error") {
				errors.push(message.text());
			}
		});

		try {
			await page.goto(`${handle.url}/internal/specimens`, {
				waitUntil: "load",
			});
			const section = page.getByTestId("agent-selector-example");
			const trigger = section.getByRole("combobox", { name: "Agent" });
			const details = section.locator("#agent-selector-details");

			await expectLocator(trigger).toContainText("Research");
			await expectLocator(details).toHaveText(
				"Finds and summarizes source material. Status: Available."
			);
			await section.screenshot({
				caret: "initial",
				path: "/private/tmp/mizen-agent-selector-light.png",
			});

			await trigger.focus();
			await page.keyboard.press("ArrowDown");
			const planning = page.getByRole("option", {
				name: "Planning",
			});
			const writing = page.getByRole("option", {
				name: "Writing · Offline",
			});
			await expectLocator(planning).toBeVisible();
			await expectLocator(writing).toHaveAttribute("aria-disabled", "true");

			await page.keyboard.press("ArrowDown");
			await page.keyboard.press("Enter");
			await expectLocator(trigger).toContainText("Planning");
			await expectLocator(details).toHaveText(
				"Organizes steps and tracks decisions. Status: Available."
			);
		} finally {
			await context.close();
		}
	}, 30_000);

	it("captures the recipe in dark mode and at narrow enlarged text", async () => {
		const context = await browser.newContext({
			viewport: { height: 900, width: 1280 },
		});
		await context.addInitScript(() => {
			window.localStorage.setItem("mizen-theme", "dark");
		});
		const page = await context.newPage();
		page.setDefaultTimeout(6000);
		page.on("pageerror", (error) => errors.push(error.message));
		try {
			await page.goto(`${handle.url}/internal/specimens`, {
				waitUntil: "load",
			});
			const section = page.getByTestId("agent-selector-example");
			await expectLocator(
				section.getByRole("combobox", { name: "Agent" })
			).toBeVisible();
			await section.screenshot({
				caret: "initial",
				path: "/private/tmp/mizen-agent-selector-dark.png",
			});

			await page.setViewportSize({ height: 900, width: 390 });
			const fitsViewport = () =>
				page.evaluate(() => {
					const root = document.documentElement;
					const target = document.querySelector(
						'[data-testid="agent-selector-example"]'
					);
					return (
						root.scrollWidth <= root.clientWidth &&
						target !== null &&
						target.scrollWidth <= target.clientWidth + 1
					);
				});
			expect(await fitsViewport()).toBe(true);
			await page.addStyleTag({
				content:
					"html { font-size: 32px !important; } * { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }",
			});
			expect(await fitsViewport()).toBe(true);
			await page.addStyleTag({
				content:
					'header:has(a[aria-label="Mizen UI home"]), a[href="#docs-content"] { visibility: hidden !important; }',
			});
			await section.scrollIntoViewIfNeeded();
			await section.screenshot({
				caret: "initial",
				path: "/private/tmp/mizen-agent-selector-narrow-dark-large-text.png",
			});
		} finally {
			await context.close();
		}
	}, 30_000);
});
