import { type Browser, chromium, type Locator, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
let browser: Browser;
let page: Page;
let handle: TestServerHandle;

async function requireBox(locator: Locator) {
	const box = await locator.boundingBox();
	if (!box) {
		throw new Error("Activity Feed element has no layout box");
	}
	return box;
}

async function verifySourceCharacters() {
	const sources = await page
		.locator(
			'[data-slot="activity-feed-item"]:has([data-slot="avatar-character"])'
		)
		.evaluateAll((items) =>
			items.map((item) => {
				const character = item.querySelector('[data-slot="avatar-character"]');
				return {
					author: item.querySelector("strong")?.textContent ?? "",
					color: character ? getComputedStyle(character).color : "",
					geometry: character?.innerHTML,
				};
			})
		);
	const charactersByAuthor = new Map<string, string>();
	for (const source of sources) {
		const identity = `${source.color}:${source.geometry}`;
		const previous = charactersByAuthor.get(source.author);
		if (previous) {
			expect(identity).toBe(previous);
		}
		charactersByAuthor.set(source.author, identity);
	}
	expect(charactersByAuthor.size).toBe(4);
	expect(new Set(charactersByAuthor.values()).size).toBe(4);
	expect(
		await page
			.locator(
				'[data-slot="activity-feed-media"] [data-slot="avatar-fallback"]'
			)
			.count()
	).toBe(0);
	const tags = page
		.getByRole("list", { name: "Northstar activity" })
		.locator(":scope > li")
		.nth(2)
		.locator('[data-slot="token"]');
	const first = await requireBox(tags.nth(0));
	const second = await requireBox(tags.nth(1));
	expect(second.x - first.x - first.width).toBeCloseTo(4, 0);
}

async function verifyActivityFilters() {
	const feed = page.getByRole("list", { name: "Northstar activity" });
	const mentions = page.getByRole("switch", { name: "Mentions only" });
	await mentions.click();
	expect(await feed.locator(":scope > li").count()).toBe(1);
	expect(await feed.textContent()).toContain("mentioned you");
	await page
		.getByRole("button", { exact: true, name: "Filter activity" })
		.click();
	await page
		.getByRole("menuitemradio", { exact: true, name: "Updates" })
		.click();
	expect(
		await page
			.getByRole("heading", { exact: true, name: "No matching activity" })
			.count()
	).toBe(1);
	await page
		.getByRole("button", { exact: true, name: "Clear filters" })
		.click();
	expect(await feed.locator(":scope > li").count()).toBe(6);
	expect(
		await feed
			.getByRole("link", { name: "input-state-review.csv" })
			.getAttribute("download")
	).not.toBeNull();
}

describe("Activity Feed review", { timeout: 30_000 }, () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage({ viewport: { height: 1600, width: 1440 } });
		page.setDefaultTimeout(8000);
	}, 120_000);
	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
	});
	it.each(["light", "dark"] as const)(
		"aligns rich events and supports actions and states in %s",
		async (theme) => {
			await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
			await page.setViewportSize({ height: 1600, width: 1440 });
			await page.goto(`${handle.url}/components/activity-feed`, {
				waitUntil: "networkidle",
			});
			const feed = page.getByRole("list", { name: "Northstar activity" });
			await feed.waitFor();
			expect(await feed.locator(":scope > li").count()).toBe(6);
			const item = feed.locator(":scope > li").first();
			const media = item.locator('[data-slot="activity-feed-media"]');
			const content = item.locator('[data-slot="activity-feed-content"]');
			const time = item.locator("time");
			const boxes = await Promise.all([
				requireBox(media),
				requireBox(content),
				requireBox(time),
			]);
			expect(boxes[0].width).toBe(36);
			expect(Math.abs(boxes[0].y - boxes[1].y)).toBeLessThan(1);
			expect(boxes[2].x).toBeGreaterThan(boxes[1].x);
			expect(
				await item.evaluate((el) => getComputedStyle(el, "::before").content)
			).toBe('""');
			expect(
				await feed
					.locator(":scope > li")
					.last()
					.evaluate((el) => getComputedStyle(el, "::before").content)
			).toBe("none");
			expect(
				await item
					.locator('[data-slot="activity-feed-summary"]')
					.evaluate((el) => getComputedStyle(el).fontSize)
			).toBe("14px");
			expect(await time.getAttribute("datetime")).toBe("2026-10-13T09:42:00Z");
			expect(await time.evaluate((el) => getComputedStyle(el).fontSize)).toBe(
				"14px"
			);
			const comment = feed.locator(":scope > li").nth(1);
			const payload = await comment
				.locator('[data-slot="activity-feed-details"]')
				.boundingBox();
			const header = await comment
				.locator('[data-slot="activity-feed-header"]')
				.boundingBox();
			expect(payload?.width).toBe(header?.width);
			expect(
				await comment
					.locator('[data-slot="activity-feed-details"]')
					.evaluate((el) => getComputedStyle(el).borderWidth)
			).toBe("0px");

			await page
				.getByRole("region", { name: "Project activity" })
				.locator("xpath=ancestor::section[1]")
				.screenshot({ path: `/private/tmp/mizen-activity-feed-${theme}.png` });
			await verifySourceCharacters();
			await verifyActivityFilters();
			await page
				.getByRole("button", { exact: true, name: "Try again" })
				.click();
			expect(
				await page.getByRole("list", { name: "Compact activity" }).count()
			).toBe(2);
			const review = page.getByRole("list", { name: "Review activity" });
			const acknowledge = review.getByRole("button", {
				exact: true,
				name: "Acknowledge",
			});
			await page.keyboard.press("Tab");
			await acknowledge.focus();
			expect(
				await acknowledge.evaluate((el) => getComputedStyle(el).outlineColor)
			).not.toBe("rgba(0, 0, 0, 0)");
			await acknowledge.press("Enter");
			await expect
				.poll(() =>
					review
						.getByRole("button", { exact: true, name: "Acknowledged" })
						.evaluate((el) => (el as HTMLButtonElement).disabled)
				)
				.toBe(true);
			expect(
				await page.getByText("No activity yet", { exact: true }).count()
			).toBe(1);
			expect(
				await page
					.getByRole("status", { name: "Loading activity" })
					.getAttribute("aria-busy")
			).toBe("true");
		}
	);
	it.each([16, 32])(
		"wraps rich content and moves timestamps below summaries at narrow widths with %ipx text",
		async (fontSize) => {
			await page.setViewportSize({ height: 900, width: 320 });
			await page.goto(`${handle.url}/components/activity-feed`, {
				waitUntil: "networkidle",
			});
			await page.evaluate((textSize) => {
				document.documentElement.style.fontSize = `${textSize}px`;
			}, fontSize);
			const feed = page.getByRole("list", { name: "Northstar activity" });
			await feed.waitFor();
			const size = await feed.evaluate((el) => ({
				client: el.clientWidth,
				scroll: el.scrollWidth,
				width: el.getBoundingClientRect().width,
			}));
			expect(size.width).toBeLessThanOrEqual(320);
			expect(size.scroll).toBeLessThanOrEqual(size.client + 1);
			const item = feed.locator(":scope > li").first();
			const content = await item
				.locator('[data-slot="activity-feed-summary"]')
				.boundingBox();
			const time = await item.locator("time").boundingBox();
			expect(time?.y).toBeGreaterThanOrEqual(
				(content?.y ?? 0) + (content?.height ?? 0)
			);
			expect(time?.x).toBe(content?.x);
		}
	);
});
