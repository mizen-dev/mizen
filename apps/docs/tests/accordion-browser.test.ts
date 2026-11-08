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

async function bounds(locator: Locator) {
	const result = await locator.boundingBox();
	if (!result) {
		throw new Error("Accordion element has no bounds");
	}
	return result;
}

describe("Accordion design and interaction", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({ headless: true });
	}, 120_000);
	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
	});
	it.each(["light", "dark"] as const)(
		"separates open rows and preserves typography and keyboard behavior in %s",
		async (theme) => {
			const context = await browser.newContext({
				viewport: { height: 1000, width: 1440 },
			});
			await context.addInitScript(
				(t) => localStorage.setItem("mizen-theme", t),
				theme
			);
			const page = await context.newPage();
			const errors: string[] = [];
			page.on("pageerror", (error) => errors.push(error.message));
			page.on("console", (message) => {
				if (message.type() === "error") {
					errors.push(message.text());
				}
			});
			try {
				await page.goto(`${handle.url}/components/accordion`, {
					waitUntil: "networkidle",
				});
				const preview = page.getByRole("region", {
					exact: true,
					name: "Accordion preview",
				});
				const accordion = preview.locator('[data-slot="accordion"]');
				const access = preview.getByRole("button", {
					exact: true,
					name: "Workspace access",
				});
				const notifications = preview.getByRole("button", {
					exact: true,
					name: "Notifications",
				});
				await expectLocator(notifications).toHaveAttribute(
					"aria-expanded",
					"true"
				);
				const openItem = notifications.locator("xpath=../..");
				await expect
					.poll(() =>
						openItem.evaluate(
							(element) => getComputedStyle(element).marginBlockEnd
						)
					)
					.toBe("8px");
				const closedItem = access.locator("xpath=../..");
				expect(
					await closedItem.evaluate(
						(element) => getComputedStyle(element).borderTopLeftRadius
					)
				).toBe("24px");
				const panel = openItem.locator('[data-slot="accordion-content"]');
				const title = notifications.locator('[data-slot="accordion-title"]');
				expect(
					await title.evaluate((el) => getComputedStyle(el).fontWeight)
				).toBe("500");
				expect(
					await panel.evaluate((el) => getComputedStyle(el).fontSize)
				).toBe("14px");
				expect(
					await panel.evaluate((el) => getComputedStyle(el).color)
				).not.toBe(await title.evaluate((el) => getComputedStyle(el).color));
				await notifications.hover();
				expect(
					await notifications.evaluate(
						(element) => getComputedStyle(element).borderTopLeftRadius
					)
				).toBe("19px");
				const itemBounds = await bounds(openItem);
				const triggerBounds = await bounds(notifications);
				expect(triggerBounds.x - itemBounds.x).toBe(5);
				expect(triggerBounds.y - itemBounds.y).toBe(5);
				await preview.screenshot({
					path: `/private/tmp/mizen-accordion-${theme}.png`,
				});
				await notifications.click();
				await expectLocator(notifications).toHaveAttribute(
					"aria-expanded",
					"false"
				);
				await expect
					.poll(() =>
						openItem.evaluate(
							(element) => getComputedStyle(element).marginBlockEnd
						)
					)
					.toBe("0px");
				await access.focus();
				await access.press("Tab");
				await expectLocator(notifications).toBeFocused();
				await notifications.press("Enter");
				await expectLocator(notifications).toHaveAttribute(
					"aria-expanded",
					"true"
				);
				// Reverse before the opening transition completes; input stays responsive.
				await notifications.press("Enter");
				await expectLocator(notifications).toHaveAttribute(
					"aria-expanded",
					"false"
				);
				await expect
					.poll(() =>
						openItem.evaluate(
							(element) => getComputedStyle(element).marginBlockEnd
						)
					)
					.toBe("0px");
				await page.emulateMedia({ reducedMotion: "reduce" });
				await notifications.click();
				expect(
					await openItem.evaluate(
						(element) => getComputedStyle(element).transitionDuration
					)
				).toBe("0s");
				expect(
					await openItem
						.locator('[data-slot="accordion-panel"]')
						.evaluate((element) => getComputedStyle(element).transitionDuration)
				).toBe("0s");
				const rich = page.locator("#AccordionRichHeadersExample");
				const memberTrigger = rich.getByRole("button", {
					exact: true,
					name: "Workspace access",
				});
				await expectLocator(memberTrigger).toHaveAccessibleDescription(
					"Members and guest permissions"
				);
				await memberTrigger.click();
				const updatesTrigger = rich.getByRole("button", {
					exact: true,
					name: "Notifications",
				});
				await updatesTrigger.click();
				const firstBounds = await bounds(memberTrigger.locator("xpath=../.."));
				const secondBounds = await bounds(
					updatesTrigger.locator("xpath=../..")
				);
				expect(secondBounds.y - firstBounds.y - firstBounds.height).toBe(8);
				const disabled = page
					.locator("#AccordionDisabledItemExample3")
					.getByRole("button", {
						exact: true,
						name: "Restricted audit stream",
					});
				await expectLocator(disabled).toBeDisabled();
				await expectLocator(disabled).toHaveAttribute("aria-expanded", "false");
				const defaultExample = page.locator(
					"#AccordionWorkspacePreferencesExample1"
				);
				const defaultItems = defaultExample.locator(
					'[data-slot="accordion-item"]'
				);
				const defaultTrigger = defaultExample.getByRole("button", {
					exact: true,
					name: "Notification channels",
				});
				await defaultTrigger.hover();
				const defaultFirst = await bounds(defaultItems.nth(0));
				const defaultSecond = await bounds(defaultItems.nth(1));
				const defaultButton = await bounds(defaultTrigger);
				expect(defaultSecond.y - defaultFirst.y - defaultFirst.height).toBe(8);
				expect(
					defaultSecond.y +
						defaultSecond.height -
						defaultButton.y -
						defaultButton.height
				).toBe(9);
				await defaultExample.screenshot({
					path: `/private/tmp/mizen-accordion-default-hover-${theme}.png`,
				});
				await page.setViewportSize({ height: 1000, width: 375 });
				await preview.scrollIntoViewIfNeeded();
				expect(
					await accordion.evaluate(
						(element) => element.scrollWidth <= element.clientWidth + 1
					)
				).toBe(true);
				await page.addStyleTag({
					content: "body {font-family: Georgia, serif !important;}",
				});
				expect(
					await access.evaluate(
						(element) => getComputedStyle(element).fontFamily
					)
				).toContain("Georgia");
				await preview.screenshot({
					path: `/private/tmp/mizen-accordion-narrow-${theme}.png`,
				});
				expect(errors).toEqual([]);
			} finally {
				await context.close();
			}
		},
		30_000
	);
});
