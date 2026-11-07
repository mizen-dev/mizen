import { type Browser, chromium, type Locator, type Page } from "playwright";
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

async function open(path: string): Promise<Page> {
	const page = await browser.newPage({
		viewport: { height: 1000, width: 1280 },
	});
	page.on("pageerror", (error) => errors.push(error.message));
	await page.goto(`${handle.url}${path}`, { waitUntil: "networkidle" });
	return page;
}

function viewportOf(example: Locator) {
	return example.locator('[data-slot="message-scroller-viewport"]');
}

function distanceToEnd(viewport: Locator) {
	return viewport.evaluate((el) =>
		Math.round(el.scrollHeight - el.scrollTop - el.clientHeight)
	);
}

describe("Conversation and Message Scroller", () => {
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

	it("plays the thread by itself and settles each sent turn near the top", async () => {
		const page = await open("/docs/components/conversation");
		const example = page.locator("#AgentConversation");
		await example.scrollIntoViewIfNeeded();
		const viewport = viewportOf(example);
		// The script types the first prompt, sends it, and the agent works.
		await expectLocator(
			example.locator('[data-slot="message"][data-from="user"]').first()
		).toContainText("Add a dark mode toggle", { timeout: 10_000 });
		await expectLocator(example.locator('[data-slot="terminal"]')).toBeVisible({
			timeout: 15_000,
		});
		// The second prompt settles 64px below the top while its reply grows.
		const second = example
			.locator('[data-slot="message"][data-from="user"]')
			.nth(1);
		await expectLocator(second).toBeAttached({ timeout: 20_000 });
		const offset = () =>
			second.evaluate((el) => {
				const view = el.closest('[data-slot="message-scroller-viewport"]');
				return view
					? Math.round(
							el.getBoundingClientRect().top - view.getBoundingClientRect().top
						)
					: null;
			});
		await expectLocator.poll(offset, { timeout: 5000 }).toBe(64);
		await page.waitForTimeout(800);
		expect(await offset()).toBe(64);
		// At the end, Replay starts it over from the empty state.
		const replay = example.getByRole("button", { name: "Replay" });
		await expectLocator(replay).toBeVisible({ timeout: 20_000 });
		await replay.click();
		await expectLocator(
			example.getByRole("heading", { name: "What should we build?" })
		).toBeVisible();
		expect(await distanceToEnd(viewport)).toBeLessThan(2);
		await page.close();
	}, 60_000);

	it("follows new messages at the end and holds still once scrolled up", async () => {
		const page = await open("/docs/components/message-scroller");
		const example = page.locator("#TeamChat");
		await example.scrollIntoViewIfNeeded();
		const viewport = viewportOf(example);
		const count = () => viewport.locator("[data-message-id]").count();
		const before = await count();
		await expectLocator.poll(count, { timeout: 5000 }).toBeGreaterThan(before);
		expect(await distanceToEnd(viewport)).toBeLessThan(2);
		await viewport.hover();
		await page.mouse.wheel(0, -200);
		await expectLocator
			.poll(() => distanceToEnd(viewport))
			.toBeGreaterThan(100);
		const top = await viewport.evaluate((el) => el.scrollTop);
		const grown = await count();
		await expectLocator.poll(count, { timeout: 5000 }).toBeGreaterThan(grown);
		expect(await viewport.evaluate((el) => el.scrollTop)).toBe(top);
		await expectLocator(
			example.getByRole("button", { name: "Jump to latest" })
		).toHaveAttribute("data-active", "");
		// New rows stay inside the scroller; the page around it never grows.
		expect(
			await viewport.evaluate((el) => {
				const frame = el.closest('[data-slot="component-preview"]');
				return frame ? frame.scrollHeight <= frame.clientHeight + 1 : false;
			})
		).toBe(true);
		await page.close();
	});

	it("keeps the reader's place when earlier messages load above", async () => {
		const page = await open("/docs/components/message-scroller");
		const example = page.locator("#MessageScrollerHistory");
		await example.scrollIntoViewIfNeeded();
		const viewport = viewportOf(example);
		await viewport.hover();
		for (let step = 0; step < 8; step += 1) {
			// biome-ignore lint/performance/noAwaitInLoops: wheel steps are one gesture, in order.
			await page.mouse.wheel(0, -400);
		}
		await expectLocator
			.poll(() => viewport.evaluate((el) => el.scrollTop))
			.toBe(0);
		const offset = () =>
			viewport.evaluate((el) => {
				const item = el.querySelector('[data-message-id="archive-24"]');
				return item
					? Math.round(
							item.getBoundingClientRect().top - el.getBoundingClientRect().top
						)
					: null;
			});
		const before = await offset();
		await example
			.getByRole("button", { name: "Load earlier messages" })
			.click();
		await expectLocator(
			viewport.locator('[data-message-id="archive-18"]')
		).toBeAttached();
		expect(await offset()).toBe(before);
		await page.close();
	});

	it("lists each question on the rail and jumps to it", async () => {
		const page = await open("/docs/components/conversation");
		const example = page.locator("#ConversationNavigation");
		await example.scrollIntoViewIfNeeded();
		const rail = example.getByRole("navigation", { name: "Turns" });
		const marks = rail.getByRole("button");
		await expectLocator(marks).toHaveCount(8);
		await marks.nth(1).click();
		await expectLocator(marks.nth(1)).toHaveAttribute("aria-current", "true");
		await expectLocator(marks.nth(1)).toHaveAccessibleName(
			"Turn 2 of 8: Move it to container queries."
		);
		// Hover grows the tick under the pointer and previews its turn.
		await marks.nth(4).hover();
		await expectLocator(marks.nth(4)).toHaveAttribute("data-near", "0");
		await expectLocator(marks.nth(3)).toHaveAttribute("data-near", "1");
		const preview = page.locator('[data-slot="tooltip-popup"]');
		await expectLocator(preview).toContainText("Does the grid still line up?");
		await expectLocator(preview).toContainText(
			"Done. I checked grid.styles.ts"
		);
		await page.close();
	});

	it("sends a starter from the empty state", async () => {
		const page = await open("/docs/components/conversation");
		const example = page.locator("#ConversationStart");
		await example.scrollIntoViewIfNeeded();
		await expectLocator(
			example.getByRole("heading", { name: "What should we build?" })
		).toBeVisible();
		await example
			.getByRole("button", { name: "Fix the failing build" })
			.click();
		await expectLocator(
			example.getByRole("heading", { name: "What should we build?" })
		).toHaveCount(0);
		await expectLocator(
			example.locator('[data-slot="message"][data-from="user"]')
		).toContainText("Fix the failing build");
		expect(
			await page.evaluate(
				() => document.documentElement.scrollWidth <= window.innerWidth
			)
		).toBe(true);
		await page.close();
	});
});
