import { type Browser, chromium } from "playwright";
import { expect as expectLocator } from "playwright/test";
import { afterAll, beforeAll, it } from "vite-plus/test";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

let handle: TestServerHandle;
let browser: Browser;
beforeAll(async () => {
	handle = await setupTestServer(new URL("..", import.meta.url).pathname);
	browser = await chromium.launch({
		executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
		headless: true,
	});
});
afterAll(async () => {
	await browser?.close();
	await teardownTestServer(handle);
});

it("opens the agent guide from the footer and returns through history", async () => {
	const page = await browser.newPage();
	try {
		await page.goto(handle.url, { waitUntil: "networkidle" });
		await page.getByRole("link", { exact: true, name: "For agents" }).click();
		await expectLocator(page).toHaveURL(`${handle.url}/docs/for-agents`);
		await expectLocator(page).toHaveTitle("For agents");
		await expectLocator(
			page.getByRole("heading", { exact: true, level: 1, name: "For agents" })
		).toBeVisible();
		await page.goBack();
		await expectLocator(page).toHaveURL(`${handle.url}/`);
	} finally {
		await page.close();
	}
});

it("retains query strings and fragments in client-side legacy redirects", async () => {
	const page = await browser.newPage();
	try {
		await page.goto(`${handle.url}/docs`, { waitUntil: "networkidle" });
		// A full document navigation would let the browser preserve the fragment.
		await page.evaluate(() => {
			const router = window.__TSR_ROUTER__;
			if (!router) {
				throw new Error("The docs router has not hydrated");
			}
			return router.navigate({
				href: "/components/button?source=legacy#api",
			});
		});
		await expectLocator(page).toHaveURL(
			`${handle.url}/docs/components/button?source=legacy#api`
		);
		await expectLocator(page.locator("#api")).toHaveCount(1);
	} finally {
		await page.close();
	}
});
