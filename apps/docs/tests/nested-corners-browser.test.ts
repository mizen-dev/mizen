import { type Browser, chromium, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
let handle: TestServerHandle;
let browser: Browser;
let page: Page;

// The gaps from `inner` to the nearest inline and block edges of the `outer`
// around it, and both corner radii.
function nestedFit(outer: string, inner: string) {
	return page
		.locator(`main ${outer}`)
		.first()
		.evaluate((host, selector) => {
			const part = host.querySelector(selector) ?? host;
			const hostBox = host.getBoundingClientRect();
			const partBox = part.getBoundingClientRect();
			return {
				block: Math.min(
					partBox.top - hostBox.top,
					hostBox.bottom - partBox.bottom
				),
				inline: Math.min(
					partBox.left - hostBox.left,
					hostBox.right - partBox.right
				),
				innerRadius: Number.parseFloat(
					getComputedStyle(part).borderTopLeftRadius
				),
				outerRadius: Number.parseFloat(
					getComputedStyle(host).borderTopLeftRadius
				),
			};
		}, inner);
}

function endInset(field: string, glyph: string) {
	return page
		.locator(`main ${field}`)
		.first()
		.evaluate(
			(host, selector) =>
				host.getBoundingClientRect().right -
				(
					host.parentElement?.querySelector(selector) ?? host
				).getBoundingClientRect().right,
			glyph
		);
}

describe("Nested corners", { timeout: 30_000 }, () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		await page.emulateMedia({ reducedMotion: "reduce" });
	}, 120_000);
	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
	});

	it.each([
		["menubar", '[data-slot="menubar"]', '[data-slot="menubar-trigger"]'],
		["toolbar", '[data-slot="toolbar"]', '[data-slot="toolbar-button"]'],
		[
			"token",
			'[data-slot="token"]:has([aria-label^="Remove"])',
			'[aria-label^="Remove"]',
		],
		[
			"input-group",
			'[data-slot="input-group"]:has(> [data-align="inline-end"] > [data-button])',
			"[data-button]",
		],
		[
			"combobox",
			'[data-slot="combobox-chips"]:has([data-slot="combobox-chip"])',
			'[data-slot="combobox-chip"]',
		],
		[
			"metric-trend",
			'[data-slot="metric-trend"]:has([data-slot="metric-trend-footer"])',
			'[data-slot="metric-trend-footer"]',
		],
	])(
		"keeps the %s inner part concentric with its container",
		async (slug, outer, inner) => {
			await page.goto(`${handle.url}/components/${slug}`, {
				waitUntil: "networkidle",
			});
			const fit = await nestedFit(outer, inner);
			expect(fit.inline).toBeGreaterThan(0);
			expect(fit.inline).toBeCloseTo(fit.block, 1);
			expect(
				Math.abs(fit.outerRadius - fit.block - fit.innerRadius)
			).toBeLessThanOrEqual(1);
		}
	);

	it("puts the Combobox chevron where Select puts its own", async () => {
		await page.goto(`${handle.url}/components/select`, {
			waitUntil: "networkidle",
		});
		const select = await endInset('button[role="combobox"]', "svg");
		await page.goto(`${handle.url}/components/combobox`, {
			waitUntil: "networkidle",
		});
		const combobox = await endInset(
			'[data-slot="combobox-input"]',
			'[data-slot="combobox-trigger"] svg'
		);
		expect(combobox).toBeCloseTo(select, 1);
	});
});
