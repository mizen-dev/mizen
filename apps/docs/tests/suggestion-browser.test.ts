import { type Browser, chromium } from "playwright";
import { expect as expectLocator } from "playwright/test";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
const errors: string[] = [];
let handle: TestServerHandle;
let browser: Browser;

describe("Suggestion browser behavior", () => {
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

	it("sends a suggestion and waits while the agent works", async () => {
		const page = await browser.newPage();
		page.on("pageerror", (error) => errors.push(error.message));
		await page.goto(`${handle.url}/docs/components/suggestion`, {
			waitUntil: "networkidle",
		});
		const example = page.locator("#SuggestionStarters");
		const suggestion = example.getByRole("button", {
			name: "Fix the failing build",
		});
		await expectLocator(suggestion).toBeVisible();
		await suggestion.click();
		await expectLocator(
			example.locator('[data-slot="composer"]')
		).toHaveAttribute("data-working", "");
		await expectLocator(suggestion).toBeDisabled();
		await example.getByRole("button", { name: "Stop" }).click();
		await expectLocator(suggestion).toBeEnabled();
		await page.close();
	});

	it("stays one line at a narrow width, scrolls sideways, and fades", async () => {
		const page = await browser.newPage({
			viewport: { height: 800, width: 360 },
		});
		page.on("pageerror", (error) => errors.push(error.message));
		await page.goto(`${handle.url}/docs/components/suggestion`, {
			waitUntil: "networkidle",
		});
		const row = page.locator('#SuggestionStarters [data-slot="suggestions"]');
		const pills = row.getByRole("button");
		const tops = await pills.evaluateAll((buttons) =>
			buttons.map((button) => Math.round(button.getBoundingClientRect().top))
		);
		expect(new Set(tops).size).toBe(1);
		// The scroll viewport is the row's parent.
		const viewport = row.locator("xpath=..");
		const sizes = await viewport.evaluate((el) => ({
			client: el.clientWidth,
			clientHeight: el.clientHeight,
			mask: getComputedStyle(el).maskImage,
			scroll: el.scrollWidth,
			scrollHeight: el.scrollHeight,
		}));
		expect(sizes.scroll).toBeGreaterThan(sizes.client);
		// Sideways only: the row never scrolls up and down.
		expect(sizes.scrollHeight).toBe(sizes.clientHeight);
		// A mouse gets a horizontal thumb, shown on hover.
		await expectLocator(
			page.locator(
				'#SuggestionStarters [data-orientation="horizontal"][aria-hidden="true"]'
			)
		).toHaveCount(1);
		expect(sizes.mask).toContain("linear-gradient");
		// Keyboard focus brings a hidden pill into view.
		await pills.last().focus();
		await expectLocator(pills.last()).toBeInViewport();
		expect(
			await page.evaluate(
				() => document.documentElement.scrollWidth <= window.innerWidth
			)
		).toBe(true);
		await page.close();
	});
});
