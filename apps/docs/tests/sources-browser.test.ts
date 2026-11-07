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

describe("Sources browser behavior", () => {
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

	it("opens and closes the list, keeping one link per page", async () => {
		const page = await browser.newPage();
		page.on("pageerror", (error) => errors.push(error.message));
		await page.goto(`${handle.url}/docs/components/sources`, {
			waitUntil: "domcontentloaded",
		});
		const sources = page.locator('[data-slot="sources"]').first();
		const trigger = sources.getByRole("button", { name: "Used 3 sources" });
		await expectLocator(trigger).toHaveAttribute("aria-expanded", "true");
		const links = sources
			.getByRole("list", { name: "Sources" })
			.getByRole("link");
		await expectLocator(links).toHaveCount(3);
		await expectLocator(links.first()).toHaveAttribute(
			"rel",
			"noopener noreferrer"
		);
		await expectLocator(async () => {
			await trigger.click({ timeout: 1000 });
			await expectLocator(trigger).toHaveAttribute("aria-expanded", "false", {
				timeout: 500,
			});
		}).toPass({ timeout: 10_000 });
		await expectLocator(
			sources.getByRole("list", { name: "Sources" })
		).toBeHidden();
		await page.close();
	}, 30_000);
});
