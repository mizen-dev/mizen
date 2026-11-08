import { type Browser, chromium, type Page } from "playwright";
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

describe("Generated avatar characters", { timeout: 30_000 }, () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage({ viewport: { height: 1000, width: 1440 } });
	}, 120_000);
	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
	});
	it.each(["light", "dark"] as const)(
		"keeps clear, persistent characters in %s",
		async (theme) => {
			const errors: string[] = [];
			page.on("pageerror", (error) => errors.push(error.message));
			await page.emulateMedia({ colorScheme: theme });
			await page.goto(`${handle.url}/components/avatar`, {
				waitUntil: "networkidle",
			});
			const example = page.locator("#AvatarCharactersExample");
			const generated = example.locator('[data-slot="avatar-character"]');
			await generated.first().waitFor();
			expect(await generated.count()).toBe(11);
			const input = example.getByRole("textbox", { name: "Identity seed" });
			const face = example.getByRole("img", {
				exact: true,
				name: "Generated character",
			});
			const original = await face.innerHTML();
			await input.fill("user:2048");
			expect(await face.innerHTML()).not.toBe(original);
			await input.fill("member:maya");
			expect(await face.innerHTML()).toBe(original);
			const sizes = await generated.evaluateAll((els) =>
				els.slice(8).map((el) => el.getBoundingClientRect().width)
			);
			expect(sizes).toEqual([24, 32, 40]);
			const fallback = page.locator(
				'#AvatarCharacterFallbackExample [data-slot="avatar-character"]'
			);
			await fallback.waitFor();
			expect(await fallback.getAttribute("aria-label")).toBe("Maya Chen");
			await example.locator("xpath=ancestor::section[1]").screenshot({
				path: `/private/tmp/mizen-avatar-characters-${theme}.png`,
			});
			await page.reload();
			expect(await face.innerHTML()).toBe(original);
			expect(errors).toEqual([]);
		}
	);
});
