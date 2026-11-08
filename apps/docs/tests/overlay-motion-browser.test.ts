import { type Browser, chromium } from "playwright";
import { expect as expectLocator } from "playwright/test";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
let handle: TestServerHandle;
let browser: Browser;
const examples = [
	["command", "ProjectCommand", "Find a project", "command-dialog"],
	["dialog", "BasicDialog", "About this workspace", "dialog"],
	["alert-dialog", "ConfirmDiscard", "Discard draft", "alert-dialog"],
	[
		"lightbox",
		"PhotoGallery",
		"Rows of lavender running to the horizon in Valensole",
		"lightbox",
	],
	["drawer", "ActivityDrawer", "Review project activity", "drawer"],
	["sheet", "ProjectSheet", "Review project details", "sheet"],
] as const;

describe("Shared overlay motion", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({ headless: true });
	}, 120_000);
	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
	});
	it.each(
		examples.flatMap((example) =>
			["light", "dark"].map((theme) => [...example, theme] as const)
		)
	)(
		"animates and blurs %s (%s, %s, %s) in %s",
		async (slug, example, name, slot, theme) => {
			const context = await browser.newContext({
				viewport: { height: 900, width: 1280 },
			});
			await context.addInitScript(
				(value) => localStorage.setItem("mizen-theme", value),
				theme
			);
			const page = await context.newPage();
			try {
				await page.emulateMedia({ reducedMotion: "no-preference" });
				await page.goto(`${handle.url}/components/${slug}`, {
					waitUntil: "networkidle",
				});
				const trigger = page
					.locator(`#${example}`)
					.getByRole("button", { exact: true, name });
				await trigger.click();
				const popup = page.locator(`[data-slot="${slot}-popup"]`);
				const backdrop = page.locator(`[data-slot="${slot}-backdrop"]`);
				await expectLocator(popup).toBeVisible();
				expect(
					await backdrop.evaluate(
						(element) => getComputedStyle(element).backdropFilter
					)
				).toBe("blur(4px)");
				expect(
					await popup.evaluate(
						(element) => getComputedStyle(element).transitionDuration
					)
				).toBe("0.28s");
				await expect
					.poll(() =>
						backdrop.evaluate((element) => getComputedStyle(element).opacity)
					)
					.toBe("1");
				await page.screenshot({
					path: `/private/tmp/mizen-${slug}-blur-${theme}.png`,
				});
				await page.keyboard.press("Escape");
				await expectLocator(popup).toHaveCount(0);
				await expectLocator(trigger).toBeFocused();
				// Reopen after closing, then reverse the opening transition immediately.
				await trigger.click();
				await page.keyboard.press("Escape");
				await expectLocator(popup).toHaveCount(0);
				await expectLocator(trigger).toBeFocused();
				await page.emulateMedia({ reducedMotion: "reduce" });
				await trigger.click();
				expect(
					await popup.evaluate(
						(element) => getComputedStyle(element).transitionDuration
					)
				).toBe("0s");
				expect(
					await backdrop.evaluate(
						(element) => getComputedStyle(element).transitionDuration
					)
				).toBe("0s");
				await page.keyboard.press("Escape");
				await expectLocator(popup).toHaveCount(0);
			} finally {
				await context.close();
			}
		},
		60_000
	);
});
