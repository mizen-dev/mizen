import { type Browser, chromium, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import registry from "../src/entities/documentation/model/docs-registry-data.json" with {
	type: "json",
};
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
let handle: TestServerHandle;
let browser: Browser;
let page: Page;

function findUnpairedText() {
	const pairs: Record<number, number> = {
		12: 16,
		13: 20,
		14: 20,
		16: 24,
		20: 28,
		28: 32,
		32: 36,
		40: 44,
	};
	return [...document.querySelectorAll("main *")].flatMap((element) => {
		const hasText = [...element.childNodes].some(
			(node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()
		);
		if (
			!hasText ||
			element.closest("pre, code, svg, script, style, template")
		) {
			return [];
		}
		const style = getComputedStyle(element);
		const size = Number.parseFloat(style.fontSize);
		const line = Number.parseFloat(style.lineHeight);
		const paired = pairs[size];
		const singleLine = Math.abs(line - size) < 0.5;
		if (!paired || Number.isNaN(line) || line === paired || singleLine) {
			return [];
		}
		return [`${size}/${line} ${element.textContent?.trim().slice(0, 40)}`];
	});
}

describe("type role pairing", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage({ viewport: { height: 900, width: 1280 } });
	}, 120_000);

	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
	}, 120_000);

	// Line heights are absolute, so text that sets a size without its paired
	// line height inherits the parent's pixels. Every rendered size must pair.
	it("renders every text size with its role line height on every page", async () => {
		const routes = [
			"/internal/specimens",
			...registry.map(({ slug }) => `/docs/components/${slug}`),
		];
		const mismatches: string[] = [];
		for (const route of routes) {
			// biome-ignore lint/performance/noAwaitInLoops: one page visits each route in turn.
			await page.goto(`${handle.url}${route}`, { waitUntil: "load" });
			const found = await page.evaluate(findUnpairedText);
			mismatches.push(...found.map((entry) => `${route}: ${entry}`));
		}
		expect(mismatches).toEqual([]);
	}, 300_000);

	// Interface content is 14px and supporting text 13px; only prose is 16px.
	it("sets interface content at 14px and lets a timestamp take its text's size", async () => {
		await page.goto(`${handle.url}/internal/specimens`, { waitUntil: "load" });
		const sizes = await page.evaluate(() => {
			const read = (selector: string) => {
				const element = document.querySelector(selector);
				const style = element ? getComputedStyle(element) : null;
				return style ? `${style.fontSize}/${style.lineHeight}` : "missing";
			};
			return {
				attachmentDescription: read('[data-slot="attachment-description"]'),
				attachmentName: read('[data-slot="attachment-name"]'),
				meterLabel: read('[data-slot="meter-label"]'),
				meterValue: read('[data-slot="meter-value"]'),
				propertyValue: read('[data-slot="property-list-value"]'),
				timestamp: read(
					'[data-testid="notification-center-example"] [data-slot="timestamp"]'
				),
			};
		});
		expect(sizes).toEqual({
			attachmentDescription: "13px/20px",
			attachmentName: "14px/20px",
			meterLabel: "14px/20px",
			meterValue: "14px/20px",
			propertyValue: "14px/20px",
			timestamp: "14px/20px",
		});
	});

	// A font with code ligatures would draw `=>` and `===` as other glyphs.
	it("shows code as typed, without ligatures", async () => {
		await page.goto(`${handle.url}/internal/specimens`, { waitUntil: "load" });
		const ligatures = await page.evaluate(() =>
			["code-block-content", "code-block-title", "code"].map((slot) => {
				const element = document.querySelector(`[data-slot="${slot}"]`);
				return element
					? getComputedStyle(element).fontVariantLigatures
					: `${slot} is missing`;
			})
		);
		expect(ligatures).toEqual(["none", "none", "none"]);
	});
});
