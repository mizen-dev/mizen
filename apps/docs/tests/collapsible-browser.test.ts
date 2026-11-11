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

describe("Collapsible layout and states", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({ headless: true });
	}, 120_000);
	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
	});
	it.each(["light", "dark"] as const)(
		"keeps body spacing inside the animated panel in %s",
		async (theme) => {
			const context = await browser.newContext({
				viewport: { height: 1000, width: 1440 },
			});
			await context.addInitScript(
				(value) => localStorage.setItem("mizen-theme", value),
				theme
			);
			const page = await context.newPage();
			try {
				await page.goto(`${handle.url}/components/collapsible`, {
					waitUntil: "networkidle",
				});
				const example = page.locator("#CollapsibleDefaultDisclosureExample1");
				const trigger = example.getByRole("button", {
					exact: true,
					name: "Deployment parameters",
				});
				const panel = example.locator('[data-slot="collapsible-panel"]');
				await trigger.scrollIntoViewIfNeeded();
				await expectLocator(trigger).toHaveAttribute("aria-expanded", "true");
				expect(
					await example.evaluate((element) => {
						const button = element.querySelector(
							'[data-slot="collapsible-trigger"]'
						);
						const content = element.querySelector(
							'[data-slot="collapsible-content"] > *'
						);
						if (!(button && content)) {
							throw new Error("Missing disclosure content");
						}
						return (
							content.getBoundingClientRect().top -
							button.getBoundingClientRect().bottom
						);
					})
				).toBe(8);
				await example.screenshot({
					path: `/private/tmp/mizen-collapsible-${theme}.png`,
				});
				await trigger.focus();
				await trigger.press("Enter");
				await expectLocator(trigger).toHaveAttribute("aria-expanded", "false");
				await expectLocator(panel).toHaveCount(0);
				await trigger.press("Space");
				await expectLocator(trigger).toHaveAttribute("aria-expanded", "true");
				await trigger.press("Enter");
				await expectLocator(panel).toHaveCount(0);
				const controlled = page.locator(
					"#CollapsibleControlledDisclosureExample2"
				);
				await controlled
					.getByRole("button", { exact: true, name: "Expand audit log" })
					.click();
				await expectLocator(
					controlled.getByRole("button", {
						exact: true,
						name: "Hide audit records",
					})
				).toHaveAttribute("aria-expanded", "true");
				const disabled = page
					.locator("#CollapsibleDisabledStateExample3")
					.getByRole("button", {
						exact: true,
						name: "Restricted telemetry data",
					});
				await expectLocator(disabled).toBeDisabled();
				await expectLocator(disabled).toHaveAttribute("aria-expanded", "false");
				await page.setViewportSize({ height: 900, width: 375 });
				await page.emulateMedia({ reducedMotion: "reduce" });
				await trigger.click();
				expect(
					await panel.evaluate(
						(element) => getComputedStyle(element).transitionDuration
					)
				).toBe("0s");
				await example.screenshot({
					path: `/private/tmp/mizen-collapsible-narrow-${theme}.png`,
				});
				expect(
					await example.evaluate(
						(element) => element.scrollWidth <= element.clientWidth
					)
				).toBe(true);
				// The main preview starts open so the revealed policy is in view.
				const basic = page.locator("#BasicCollapsible");
				const policy = basic.getByRole("button", {
					exact: true,
					name: "View retention policy",
				});
				await expectLocator(policy).toHaveAttribute("aria-expanded", "true");
				await expectLocator(basic).toContainText("Restore window");
				await policy.click();
				await expectLocator(policy).toHaveAttribute("aria-expanded", "false");
			} finally {
				await context.close();
			}
		},
		30_000
	);

	it("starts the content under the trigger with gap 0 and keeps the height transition", async () => {
		const page = await browser.newPage({
			viewport: { height: 1000, width: 1440 },
		});
		try {
			await page.goto(`${handle.url}/components/collapsible`, {
				waitUntil: "networkidle",
			});
			const example = page.locator("#CollapsibleCompactNavigationExample5");
			await example.scrollIntoViewIfNeeded();
			expect(
				await example.evaluate((element) => {
					const button = element.querySelector(
						'[data-slot="collapsible-trigger"]'
					);
					const panel = element.querySelector(
						'[data-slot="collapsible-panel"]'
					);
					const content = element.querySelector(
						'[data-slot="collapsible-content"] > *'
					);
					if (!(button && panel && content)) {
						throw new Error("Missing disclosure content");
					}
					return [
						content.getBoundingClientRect().top -
							button.getBoundingClientRect().bottom,
						getComputedStyle(panel).transitionProperty,
					];
				})
			).toEqual([0, "height"]);
		} finally {
			await page.close();
		}
	});
});
