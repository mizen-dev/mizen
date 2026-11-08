import { type Browser, chromium, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import docs from "../src/entities/documentation/model/docs-registry-data.json" with {
	type: "json",
};
import { checkPreviewLayout } from "./preview-layout-checks";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

// Every preview, at desktop and phone width, must paint something, stay in
// its frame, sit near the center of its stage, and keep short labels on one
// line. These are the regressions visual review kept finding by hand.
const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
const slugs = docs.map(({ slug }) => slug);
let handle: TestServerHandle;
let browser: Browser;

describe.each([
	{ height: 900, width: 1440 },
	{ height: 812, width: 375 },
])("preview layout at $width px", (viewport) => {
	let page: Page;

	beforeAll(async () => {
		handle ??= await setupTestServer(docsRoot);
		browser ??= await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage({ viewport });
	}, 120_000);

	afterAll(async () => {
		await page?.close();
	});

	it.each(slugs)("%s", async (slug) => {
		await page.goto(`${handle.url}/docs/components/${slug}`, {
			waitUntil: "networkidle",
		});
		// A demo that streams fills its reserved column as it plays; measure
		// the layout once it rests.
		await page.waitForFunction(
			() => !document.querySelector("main [data-status='streaming']"),
			undefined,
			{ timeout: 20_000 }
		);
		expect(await page.evaluate(checkPreviewLayout)).toEqual([]);
	});
});

afterAll(async () => {
	try {
		await browser?.close();
	} finally {
		await teardownTestServer(handle);
	}
});
