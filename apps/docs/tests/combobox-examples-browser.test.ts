// biome-ignore-all lint/performance/noAwaitInLoops: Actions share one page and must run in order.
import { type Browser, chromium } from "playwright";
import { expect as expectLocator } from "playwright/test";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
let handle: TestServerHandle;
let browser: Browser;

describe("Combobox reference examples", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({ headless: true });
	}, 120_000);
	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
	});
	it.each(["light", "dark"] as const)(
		"supports reference compositions in %s",
		async (theme) => {
			const context = await browser.newContext({
				viewport: { height: 900, width: 1280 },
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
				await page.goto(`${handle.url}/docs/components/combobox`, {
					waitUntil: "networkidle",
				});
				await expectLocator(page.locator("html")).toHaveAttribute(
					"data-theme",
					theme
				);
				await expectLocator(
					page.locator("#ComboboxDisabled input[role=combobox]")
				).toBeDisabled();
				const small = page.locator("#ComboboxSmall input[role=combobox]");
				const large = page.locator("#ComboboxLarge input[role=combobox]");
				expect(
					await small.evaluate((el) => el.getBoundingClientRect().height)
				).toBeLessThan(
					await large.evaluate((el) => el.getBoundingClientRect().height)
				);
				const highlighted = page.locator(
					"#ComboboxAutoHighlight input[role=combobox]"
				);
				await highlighted.fill("Sve");
				await highlighted.press("Enter");
				await expectLocator(highlighted).toHaveValue("Svelte");
				const groups = page.locator("#ComboboxGroups input[role=combobox]");
				await groups.fill("Nuxt");
				await expectLocator(
					page.getByRole("option", { exact: true, name: "Nuxt" })
				).toBeVisible();
				await page.getByRole("option", { exact: true, name: "Nuxt" }).click();
				await expectLocator(groups).toHaveValue("Nuxt");
				const primitive = page.locator(
					"#ComboboxPrimitiveValues input[role=combobox]"
				);
				await expectLocator(primitive).toHaveValue("Maya Chen");
				for (const [sectionId, triggerLabel, inputLabel] of [
					[
						"ComboboxPopupInput",
						"Choose framework in popup",
						"Search inside popup",
					],
					[
						"ComboboxSelectButtonExample",
						"Select-like framework",
						"Search select options",
					],
				]) {
					const section = page.locator(`#${sectionId}`);
					const trigger = section.getByRole("combobox", { name: triggerLabel });
					await trigger.scrollIntoViewIfNeeded();
					expect(
						await trigger.evaluate((el) => getComputedStyle(el).position)
					).not.toBe("absolute");
					await trigger.click();
					const input = page.getByRole("combobox", { name: inputLabel });
					await input.fill("Astro");
					await page
						.getByRole("option", { exact: true, name: "Astro" })
						.click();
					await expectLocator(trigger).toContainText("Astro");
					await section.screenshot({
						path: `/private/tmp/combobox-${sectionId}-${theme}.png`,
					});
				}
				const single = page.locator("#ComboboxFormSingle");
				await single
					.getByRole("button", { exact: true, name: "Save framework" })
					.click();
				await expectLocator(single.locator("[aria-live=polite]")).toHaveCount(
					0
				);
				await single.getByRole("combobox").fill("Vue");
				await page.getByRole("option", { exact: true, name: "Vue" }).click();
				await single
					.getByRole("button", { exact: true, name: "Save framework" })
					.click();
				await expectLocator(single.getByText("Saved: Vue")).toBeVisible();
				const multiple = page.locator("#ComboboxFormMultiple");
				for (const value of ["React", "Vue"]) {
					await multiple.getByRole("combobox").fill(value);
					await page.getByRole("option", { exact: true, name: value }).click();
				}
				await multiple.getByRole("combobox").press("Escape");
				await multiple
					.getByRole("button", { exact: true, name: "Save frameworks" })
					.click();
				await expectLocator(
					multiple.getByText("Saved: React, Vue")
				).toBeVisible();
				await multiple
					.getByRole("button", { exact: true, name: "Remove React" })
					.click();
				await multiple
					.getByRole("button", { exact: true, name: "Save frameworks" })
					.click();
				await expectLocator(
					multiple.getByText("Saved: Vue", { exact: true })
				).toBeVisible();
				await multiple.screenshot({
					path: `/private/tmp/combobox-form-multiple-${theme}.png`,
				});
				expect(errors).toEqual([]);
			} finally {
				await context.close();
			}
		},
		60_000
	);
	it("exposes linked API sections and examples in rendered and Markdown docs", async () => {
		const page = await browser.newPage();
		try {
			await page.goto(`${handle.url}/docs/components/combobox`, {
				waitUntil: "networkidle",
			});
			const outline = page.getByRole("navigation", { name: "On this page" });
			await expectLocator(
				outline.getByRole("link", { exact: true, name: "ComboboxInput" })
			).toHaveAttribute("href", "#api-ComboboxInput");
			await expectLocator(page.locator("#api h3")).toHaveCount(24);
			await expectLocator(page.locator("#examples > section")).toHaveCount(18);
			const response = await page.request.get(
				`${handle.url}/docs/components/combobox/markdown`
			);
			const markdown = await response.text();
			expect(markdown).toContain("### ComboboxInput");
			expect(markdown).toContain("## Multiple Selection");
			expect(markdown).toContain("Form Integration - Multiple");
			await page.setViewportSize({ height: 812, width: 375 });
			expect(
				await page
					.locator("#docs-content")
					.evaluate((el) => el.scrollWidth <= el.clientWidth)
			).toBe(true);
		} finally {
			await page.close();
		}
	});
});
