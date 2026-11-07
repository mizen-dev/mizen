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
let handle: TestServerHandle;
let browser: Browser;

describe("StreamingText browser behavior", () => {
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

	it("resolves new words in staggered bursts, then opens the actions", async () => {
		const page = await browser.newPage({
			viewport: { height: 900, width: 1280 },
		});
		page.on("pageerror", (error) => errors.push(error.message));
		await page.goto(`${handle.url}/docs/components/streaming-text`, {
			waitUntil: "domcontentloaded",
		});
		const reply = page.locator('[data-slot="streaming-text"]').first();
		const actions = reply.locator('[data-slot="streaming-text-actions"]');

		await expectLocator(reply).toHaveAttribute("data-status", "streaming");
		await expectLocator(
			reply.locator('[data-slot="streaming-text-content"]')
		).toHaveAttribute("aria-busy", "true");
		await expectLocator(actions).toHaveAttribute("inert", "");
		// Words in the latest burst run the color trail, each a little after
		// the one before, and settle into the inherited text color.
		const words = reply.locator(
			'[data-slot="streaming-text-content"] > span:not([aria-hidden])'
		);
		await expect.poll(() => words.count()).toBeGreaterThan(2);
		const delays = await words.evaluateAll((spans) =>
			spans.map((span) => {
				const style = getComputedStyle(span);
				return [
					style.animationName !== "none",
					Number.parseFloat(style.animationDelay),
				];
			})
		);
		expect(delays.length).toBeGreaterThan(0);
		expect(delays.every(([animated]) => animated)).toBe(true);
		expect(
			Math.max(...delays.map(([, delay]) => Number(delay)))
		).toBeLessThanOrEqual(0.4);

		await expectLocator(reply).toHaveAttribute("data-status", "complete", {
			timeout: 15_000,
		});
		await expectLocator(
			reply.locator('[data-slot="streaming-text-content"]')
		).not.toHaveAttribute("aria-busy");
		await expectLocator(actions).not.toHaveAttribute("inert");
		const copy = reply.getByRole("button", { name: "Copy response" });
		await copy.focus();
		await expectLocator(copy).toBeFocused();

		const toggle = reply.getByRole("button", { name: "Used 2 sources" });
		await toggle.click();
		await expectLocator(toggle).toHaveAttribute("aria-expanded", "true");
		await expectLocator(
			reply.getByRole("list", { name: "Sources" }).getByRole("link")
		).toHaveCount(2);

		await reply.getByRole("button", { name: "Good response" }).click();
		await expectLocator(
			reply.getByRole("button", { name: "Good response" })
		).toHaveAttribute("aria-pressed", "true");
		await page.close();
	}, 30_000);

	it("shows words without motion under reduced motion", async () => {
		const page = await browser.newPage({ reducedMotion: "reduce" });
		await page.goto(`${handle.url}/docs/components/streaming-text`, {
			waitUntil: "domcontentloaded",
		});
		const reply = page.locator('[data-slot="streaming-text"]').first();
		await expectLocator(reply).toHaveAttribute("data-status", "complete", {
			timeout: 15_000,
		});
		const animations = await reply
			.locator('[data-slot="streaming-text-content"] > *')
			.evaluateAll((nodes) =>
				nodes.map((node) => getComputedStyle(node).animationDuration)
			);
		expect(new Set(animations)).toEqual(new Set(["0s"]));
		await page.close();
	}, 30_000);
});
