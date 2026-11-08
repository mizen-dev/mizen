import { type Browser, chromium } from "playwright";
import { expect as expectLocator } from "playwright/test";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
const errors: string[] = [];
let handle: TestServerHandle;
let browser: Browser;

describe("Menubar, filters, and Attachment browser behavior", () => {
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

	async function openWithTheme(theme: "dark" | "light", width = 1280) {
		const context = await browser.newContext({
			viewport: { height: 900, width },
		});
		await context.addInitScript((preference) => {
			window.localStorage.setItem("mizen-theme", preference);
		}, theme);
		const page = await context.newPage();
		page.on("pageerror", (error) => errors.push(error.message));
		page.on("console", (message) => {
			if (message.type() === "error") {
				errors.push(message.text());
			}
		});
		await page.goto(`${handle.url}/internal/specimens`, { waitUntil: "load" });
		await expectLocator(page.locator("html")).toHaveAttribute(
			"data-theme",
			theme
		);
		return { context, page };
	}

	it.each(["light", "dark"] as const)(
		"supports named menu actions and native content semantics in %s mode",
		async (theme) => {
			const { context, page } = await openWithTheme(theme);
			try {
				const menubar = page
					.getByTestId("menubar-example")
					.getByRole("menubar", { name: "Workspace actions" });
				const fileTrigger = menubar.getByRole("menuitem", {
					exact: true,
					name: "File",
				});
				const editTrigger = menubar.getByRole("menuitem", {
					exact: true,
					name: "Edit",
				});
				const helpTrigger = menubar.getByRole("menuitem", {
					exact: true,
					name: "Help",
				});
				await expectLocator(menubar).toBeVisible();
				await expectLocator(helpTrigger).toBeDisabled();

				const section = page.getByTestId("action-content-example");
				await section.screenshot({
					caret: "initial",
					path: `/private/tmp/mizen-action-content-${theme}.png`,
				});

				await fileTrigger.focus();
				await fileTrigger.press("ArrowDown");
				const newWorkspace = page.getByRole("menuitem", {
					exact: true,
					name: "New workspace",
				});
				const disabledAction = page.getByRole("menuitem", {
					exact: true,
					name: "Archive workspace",
				});
				await expectLocator(newWorkspace).toBeVisible();
				await expectLocator(disabledAction).toHaveAttribute(
					"aria-disabled",
					"true"
				);
				await newWorkspace.press("ArrowRight");
				const renameWorkspace = page.getByRole("menuitem", {
					exact: true,
					name: "Rename workspace",
				});
				await expectLocator(renameWorkspace).toBeVisible();
				await expectLocator(newWorkspace).toBeHidden();
				await page.keyboard.press("Escape");
				await expectLocator(editTrigger).toBeFocused();

				const vertical = page
					.getByTestId("menubar-example")
					.getByRole("menubar", { name: "Vertical actions" });
				const navigateTrigger = vertical.getByRole("menuitem", {
					exact: true,
					name: "Navigate",
				});
				await navigateTrigger.focus();
				await navigateTrigger.press("ArrowDown");
				const viewTrigger = vertical.getByRole("menuitem", {
					exact: true,
					name: "View",
				});
				await expectLocator(viewTrigger).toBeFocused();
				await viewTrigger.press("Enter");
				await expectLocator(
					page.getByRole("menuitem", { exact: true, name: "Show panel" })
				).toBeVisible();
				await page.keyboard.press("Escape");
				await expectLocator(viewTrigger).toBeFocused();

				const filterExample = page.getByTestId("filter-example");
				const tokens = filterExample.getByRole("button");
				await expectLocator(tokens).toHaveCount(2);
				await expectLocator(tokens.first()).toContainText("Needs review");
				await expectLocator(tokens.first()).toHaveAttribute("type", "button");
				await filterExample
					.getByRole("button", { name: "Remove Needs review filter" })
					.click();
				await expectLocator(
					filterExample.getByText("Needs review filter removed")
				).toBeVisible();
				await expectLocator(
					filterExample.getByRole("button", {
						name: "Remove Published filter",
					})
				).toBeDisabled();

				const attachment = page
					.getByTestId("attachment-example")
					.locator('[data-slot="attachment"]');
				await expectLocator(attachment).toBeVisible();
				await expectLocator(
					attachment.locator('[data-slot="attachment-name"]')
				).toHaveText("lavender-valensole.jpg");
				await expectLocator(
					attachment.locator('[data-slot="attachment-description"]')
				).toHaveText("JPEG image · 271 KB");
				await expectLocator(
					attachment.getByRole("img", {
						name: "Rows of lavender under a pink evening sky",
					})
				).toBeVisible();
				const detailsLink = attachment.getByRole("link", {
					name: "View file details",
				});
				await expectLocator(detailsLink).toHaveAttribute(
					"href",
					"/components/attachment"
				);
				const attachmentSemantics = await attachment.evaluate((element) => ({
					hasClickHandler: element.hasAttribute("onclick"),
					hasNestedInteractive: Array.from(
						element.querySelectorAll("a, button")
					).some(
						(interactive) => interactive.querySelector("a, button") !== null
					),
					tagName: element.tagName,
				}));
				expect(attachmentSemantics).toEqual({
					hasClickHandler: false,
					hasNestedInteractive: false,
					tagName: "DIV",
				});
			} finally {
				await context.close();
			}
		}
	);

	it("contains the three examples at 390px with enlarged text and spacing", async () => {
		const { context, page } = await openWithTheme("light", 390);
		try {
			await page.addStyleTag({
				content:
					"html { font-size: 32px !important; } * { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }",
			});
			const bounds = await Promise.all(
				["menubar-example", "filter-example", "attachment-example"].map(
					async (testId) => {
						const section = page.getByTestId(testId);
						await expectLocator(section).toBeVisible();
						return section.evaluate((element) => {
							const rect = element.getBoundingClientRect();
							return {
								right: rect.right,
								scrollWidth: element.scrollWidth,
								width: element.clientWidth,
								x: rect.left,
							};
						});
					}
				)
			);
			for (const section of bounds) {
				expect(section.x).toBeGreaterThanOrEqual(0);
				expect(section.right).toBeLessThanOrEqual(390);
				expect(section.scrollWidth).toBeLessThanOrEqual(section.width);
			}
			const attachment = page.getByTestId("attachment-example");
			const textAndAction = await Promise.all([
				attachment.locator('[data-slot="attachment-name"]').boundingBox(),
				attachment
					.getByRole("link", { name: "View file details" })
					.boundingBox(),
			]);
			for (const box of textAndAction) {
				expect(box).not.toBeNull();
				if (box) {
					expect(box.x).toBeGreaterThanOrEqual(0);
					expect(box.x + box.width).toBeLessThanOrEqual(390);
				}
			}
			await page.getByTestId("action-content-example").screenshot({
				caret: "initial",
				path: "/private/tmp/mizen-action-content-narrow.png",
			});
		} finally {
			await context.close();
		}
	});
});
