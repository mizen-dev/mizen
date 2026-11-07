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
const THOUGHT_FOR = /^Thought for \d+s$/;
let handle: TestServerHandle;
let browser: Browser;

describe("AgentThinking browser behavior", () => {
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

	it("streams steps in a rolling window, then folds with the time spent", async () => {
		const page = await browser.newPage({
			viewport: { height: 900, width: 1280 },
		});
		page.on("pageerror", (error) => errors.push(error.message));
		await page.goto(`${handle.url}/docs/components/agent-thinking`, {
			waitUntil: "domcontentloaded",
		});
		const thinking = page.locator('[data-slot="agent-thinking"]').first();
		const stage = thinking.locator('[data-slot="agent-thinking-stage"]');
		const status = thinking.locator('[data-slot="agent-thinking-status"]');
		await expectLocator(status).toHaveAttribute("role", "status");
		await expectLocator(stage).toContainText("Reading the sources");
		await expectLocator(status).toHaveText("Checking browser support");
		// Older lines fade out once the reasoning outgrows the window.
		await expectLocator(
			thinking.locator('[data-slot="agent-thinking-content"]')
		).toHaveAttribute("data-overflowing", "", { timeout: 10_000 });

		await expectLocator(thinking).toHaveAttribute("data-status", "complete", {
			timeout: 15_000,
		});
		await expectLocator(status).toHaveText(THOUGHT_FOR);
		const toggle = thinking.getByRole("button", { name: THOUGHT_FOR });
		await expectLocator(toggle).toHaveAttribute("aria-expanded", "false");
		await toggle.click();
		await expectLocator(toggle).toHaveAttribute("aria-expanded", "true");
		await expectLocator(
			thinking.locator('[data-slot="agent-thinking-reasoning"]')
		).toContainText("Support matters more than syntax.");
		await page.close();
	}, 30_000);

	it("holds the step label still under reduced motion", async () => {
		const page = await browser.newPage({ reducedMotion: "reduce" });
		await page.goto(`${handle.url}/docs/components/agent-thinking`, {
			waitUntil: "domcontentloaded",
		});
		const label = page
			.locator('[data-slot="agent-thinking-stage"] > span')
			.last();
		await expectLocator(label).toBeVisible();
		expect(
			await label.evaluate((node) => getComputedStyle(node).animationName)
		).toBe("none");
		await page.close();
	}, 30_000);
});
