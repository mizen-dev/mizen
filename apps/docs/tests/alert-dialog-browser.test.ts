import { type Browser, chromium, type Locator } from "playwright";
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

function style(locator: Locator, property: string) {
	return locator.evaluate(
		(element, name) => getComputedStyle(element).getPropertyValue(name),
		property
	);
}

async function bounds(locator: Locator) {
	const result = await locator.boundingBox();
	if (!result) {
		throw new Error("Alert Dialog element has no bounds");
	}
	return result;
}

describe("Alert Dialog design and states", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({ headless: true });
	}, 120_000);
	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
	});
	it.each(["light", "dark"] as const)(
		"reviews typography, focus, confirmation and narrow layouts in %s",
		async (theme) => {
			const context = await browser.newContext({
				viewport: { height: 900, width: 1440 },
			});
			await context.addInitScript(
				(value) => localStorage.setItem("mizen-theme", value),
				theme
			);
			const page = await context.newPage();
			const errors: string[] = [];
			page.on("pageerror", (error) => errors.push(error.message));
			try {
				await page.goto(`${handle.url}/components/alert-dialog`, {
					waitUntil: "networkidle",
				});
				const example = page.locator("#ConfirmDiscard");
				const trigger = example.getByRole("button", {
					exact: true,
					name: "Discard draft",
				});
				await trigger.click();
				const dialog = page.getByRole("alertdialog");
				const title = dialog.locator('[data-slot="alert-dialog-title"]');
				const description = dialog.locator(
					'[data-slot="alert-dialog-description"]'
				);
				const footer = dialog.locator('[data-slot="alert-dialog-footer"]');
				const cancel = dialog.getByRole("button", {
					exact: true,
					name: "Keep draft",
				});
				const confirm = dialog.getByRole("button", {
					exact: true,
					name: "Discard",
				});
				await expectLocator(cancel).toBeFocused();
				await expectLocator(dialog).toHaveAccessibleName("Discard this draft?");
				expect(await style(title, "font-size")).toBe("16px");
				expect(await style(title, "font-weight")).toBe("600");
				expect(await style(description, "font-size")).toBe("14px");
				expect(await style(description, "line-height")).toBe("20px");
				expect(await style(title, "color")).not.toBe(
					await style(description, "color")
				);
				expect(await style(footer, "background-color")).not.toBe(
					await style(dialog, "background-color")
				);
				expect(
					await dialog.evaluate((element) => {
						const heading = element.querySelector(
							'[data-slot="alert-dialog-title"]'
						);
						const body = element.querySelector(
							'[data-slot="alert-dialog-description"]'
						);
						if (!(heading && body)) {
							throw new Error("Missing dialog text");
						}
						return (
							heading.getBoundingClientRect().x - body.getBoundingClientRect().x
						);
					})
				).toBe(0);
				await page.keyboard.press("Tab");
				await expectLocator(confirm).toBeFocused();
				await page.keyboard.press("Tab");
				await expectLocator(cancel).toBeFocused();
				await page.mouse.click(2, 2);
				await expectLocator(dialog).toBeVisible();
				await confirm.hover();
				await dialog.screenshot({
					path: `/private/tmp/mizen-alert-dialog-${theme}.png`,
				});
				await cancel.click();
				await expectLocator(dialog).toHaveCount(0);
				await expectLocator(trigger).toBeFocused();
				await trigger.click();
				await page.keyboard.press("Escape");
				await expectLocator(dialog).toHaveCount(0);
				await expectLocator(trigger).toBeFocused();
				await trigger.click();
				await confirm.click();
				await expectLocator(dialog).toHaveCount(0);
				await expectLocator(trigger).toBeFocused();
				await page.setViewportSize({ height: 500, width: 375 });
				await page.emulateMedia({ reducedMotion: "reduce" });
				await trigger.click();
				expect(await style(dialog, "transition-duration")).toBe("0s");
				// Stress wrapping and body scrolling with consumer-provided long content.
				await description.evaluate((element) => {
					element.textContent =
						"Your unsaved project changes will be lost. ".repeat(60);
				});
				const header = dialog.locator('[data-slot="alert-dialog-header"]');
				expect(
					await header.evaluate(
						(element) => element.scrollHeight > element.clientHeight
					)
				).toBe(true);
				expect(
					await dialog.evaluate(
						(element) => element.scrollWidth <= element.clientWidth
					)
				).toBe(true);
				expect(
					(await bounds(footer)).y + (await bounds(footer)).height
				).toBeLessThanOrEqual(500);
				await expectLocator(cancel).toBeVisible();
				await cancel.click();
				await expectLocator(dialog).toHaveCount(0);
				await trigger.click();
				await dialog.screenshot({
					path: `/private/tmp/mizen-alert-dialog-narrow-${theme}.png`,
				});
				expect(errors).toEqual([]);
			} finally {
				await context.close();
			}
		},
		30_000
	);
});
