import { type Browser, chromium, type Page } from "playwright";
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
let page: Page;
const errors: string[] = [];

async function setTheme(theme: "light" | "dark") {
	await page.goto(`${handle.url}/components/context-menu`, {
		waitUntil: "networkidle",
	});
	await page.evaluate(
		(value) => localStorage.setItem("mizen-theme", value),
		theme
	);
	await page.reload({ waitUntil: "networkidle" });
}
async function openMenu(name: string) {
	const trigger = page.getByRole("button", { exact: true, name });
	await trigger.scrollIntoViewIfNeeded();
	await trigger.focus();
	await trigger.click({ button: "right" });
	const menu = page.locator('[data-slot="context-menu-popup"]');
	await expectLocator(menu).toBeVisible();
	await expect
		.poll(() => menu.evaluate((el) => getComputedStyle(el).transform))
		.toBe("none");
	return menu;
}
async function closeMenu() {
	await page.keyboard.press("Escape");
	await expectLocator(page.getByRole("menu")).toHaveCount(0);
}

describe("Context Menu states in both themes", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage({
			hasTouch: true,
			viewport: { height: 900, width: 1280 },
		});
		page.on("pageerror", (error) => errors.push(error.message));
	}, 120_000);
	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
	}, 120_000);

	it.each(["light", "dark"] as const)(
		"aligns icons, shortcuts, and submenu labels in %s",
		async (theme) => {
			await setTheme(theme);
			const targetName = "Project file asset: schema.config.json";
			const menu = await openMenu(targetName);
			const edit = menu.getByRole("menuitem").filter({ hasText: "Edit file" });
			const geometry = await edit.evaluate((el) => {
				const icon = el.querySelector(":scope > svg"),
					label = el.querySelector(":scope > span");
				if (!(icon && label)) {
					throw new Error("Action icon or label missing");
				}
				const i = icon.getBoundingClientRect(),
					l = label.getBoundingClientRect();
				return {
					height: el.getBoundingClientRect().height,
					offset: Math.abs(i.top + i.height / 2 - l.top - l.height / 2),
					size: getComputedStyle(el).fontSize,
				};
			});
			expect(geometry.offset).toBeLessThanOrEqual(1);
			expect(geometry.size).toBe("14px");
			expect(geometry.height).toBe(32);
			// Shortcuts are plain text that reads left to right.
			const editShortcut = edit.locator('[data-slot="context-menu-shortcut"]');
			expect(await editShortcut.textContent()).toBe("⌘E");
			expect(await editShortcut.getAttribute("dir")).toBe("ltr");
			await expectLocator(
				menu.getByRole("menuitem", { name: "Revert to commit" })
			).toHaveAttribute("aria-disabled", "true");
			const remove = menu
				.getByRole("menuitem")
				.filter({ hasText: "Delete file" });
			await remove.hover();
			expect(
				await remove.evaluate((el) => getComputedStyle(el).color)
			).not.toBe(await edit.evaluate((el) => getComputedStyle(el).color));
			await menu.screenshot({
				path: `/private/tmp/mizen-context-menu-actions-${theme}.png`,
			});
			const sub = menu.getByRole("menuitem", {
				exact: true,
				name: "Export as",
			});
			await sub.focus();
			await sub.press("ArrowRight");
			const child = page.locator('[data-slot="context-menu-sub-content"]');
			await expectLocator(child).toBeVisible();
			expect(
				await sub.evaluate((el) => getComputedStyle(el).backgroundColor)
			).not.toBe("rgba(0, 0, 0, 0)");
			const offset = await sub.evaluate((el) => {
				const label = el.querySelector(":scope > span"),
					icon = el.querySelector("svg");
				if (!(label && icon)) {
					throw new Error("Submenu label missing");
				}
				const l = label.getBoundingClientRect(),
					i = icon.getBoundingClientRect();
				return Math.abs(l.top + l.height / 2 - i.top - i.height / 2);
			});
			expect(offset).toBeLessThanOrEqual(1);
			await page.keyboard.press("ArrowLeft");
			await expectLocator(child).toHaveCount(0);
			await expectLocator(sub).toBeFocused();
			await closeMenu();
			await expectLocator(
				page.getByRole("button", { name: targetName })
			).toBeFocused();
		},
		30_000
	);

	it.each(["light", "dark"] as const)(
		"preserves controlled selection and transfers dialog focus in %s",
		async (theme) => {
			await setTheme(theme);
			let menu = await openMenu("Right-click file preferences");
			let tracked = menu.getByRole("menuitemcheckbox", {
				name: "Track changes",
			});
			await expectLocator(tracked).toBeChecked();
			await tracked.click();
			await expectLocator(tracked).not.toBeChecked();
			await expectLocator(
				menu.getByRole("menuitemcheckbox", { name: "Sync protected files" })
			).toHaveAttribute("aria-disabled", "true");
			await closeMenu();
			menu = await openMenu("Right-click file preferences");
			tracked = menu.getByRole("menuitemcheckbox", { name: "Track changes" });
			await expectLocator(tracked).not.toBeChecked();
			await closeMenu();
			menu = await openMenu("Right-click editor preferences");
			const save = menu.getByRole("menuitemcheckbox", { name: "Auto save" });
			await expectLocator(save).toBeChecked();
			await save.click();
			await expectLocator(save).not.toBeChecked();
			await closeMenu();
			menu = await openMenu("Right-click file order");
			const modified = menu.getByRole("menuitemradio", {
				name: "Last modified",
			});
			await modified.click();
			await expectLocator(modified).toBeChecked();
			await expectLocator(
				menu.getByRole("menuitemradio", { exact: true, name: "Name" })
			).not.toBeChecked();
			await closeMenu();
			menu = await openMenu("Right-click quick actions");
			await menu.getByRole("menuitem", { name: "Keep this menu open" }).click();
			await expectLocator(menu).toBeVisible();
			await menu
				.getByRole("menuitem", { exact: true, name: "New file" })
				.click();
			await expectLocator(menu).toHaveCount(0);
			menu = await openMenu("Right-click file settings");
			await menu.getByRole("menuitem", { name: "Open file settings" }).click();
			const dialog = page.getByRole("dialog", {
				exact: true,
				name: "File settings",
			});
			await expectLocator(dialog).toBeVisible();
			await expect
				.poll(() =>
					dialog.evaluate((el) => el.contains(document.activeElement))
				)
				.toBe(true);
			await page.keyboard.press("Escape");
			await expectLocator(dialog).toHaveCount(0);
			await expectLocator(
				page.getByRole("button", { name: "Right-click file settings" })
			).toBeFocused();
		},
		30_000
	);

	it.each(["light", "dark"] as const)(
		"opens from the keyboard and handles nested navigation in %s",
		async (theme) => {
			await setTheme(theme);
			const target = page.getByRole("button", {
				name: "Right-click export options",
			});
			await target.scrollIntoViewIfNeeded();
			await target.focus();
			await page.keyboard.press("Shift+F10");
			const menu = page.locator('[data-slot="context-menu-popup"]');
			await expectLocator(menu).toBeVisible();
			const format = menu.getByRole("menuitem", {
				exact: true,
				name: "Export format",
			});
			await format.focus();
			await format.press("ArrowRight");
			const image = page.getByRole("menuitem", { exact: true, name: "Image" });
			await expectLocator(image).toBeVisible();
			await image.focus();
			await image.press("ArrowRight");
			await expectLocator(
				page.getByRole("menuitem", { name: "PNG image" })
			).toBeVisible();
			await expect
				.poll(() =>
					page
						.locator('[data-slot="context-menu-sub-content"]')
						.last()
						.evaluate((el) => getComputedStyle(el).opacity)
				)
				.toBe("1");
			await page.screenshot({
				path: `/private/tmp/mizen-context-menu-nested-${theme}.png`,
			});
			await page.keyboard.press("Escape");
			await expectLocator(image).toBeFocused();
			await page.keyboard.press("Escape");
			await expectLocator(format).toBeFocused();
			await closeMenu();
			await expectLocator(target).toBeFocused();
		},
		30_000
	);

	it.each(["light", "dark"] as const)(
		"supports touch, narrow scrolling, render and styling callbacks in %s",
		async (theme) => {
			await setTheme(theme);
			await page.setViewportSize({ height: 600, width: 375 });
			await page.emulateMedia({ reducedMotion: "reduce" });
			const target = page.getByRole("button", {
				name: "Right-click recent files",
			});
			await target.scrollIntoViewIfNeeded();
			const box = await target.boundingBox();
			if (!box) {
				throw new Error("Touch target missing");
			}
			const session = await page.context().newCDPSession(page);
			await session.send("Input.dispatchTouchEvent", {
				touchPoints: [{ x: box.x + box.width / 2, y: box.y + box.height / 2 }],
				type: "touchStart",
			});
			const menu = page.locator('[data-slot="context-menu-popup"]');
			await expectLocator(menu).toBeVisible();
			await session.send("Input.dispatchTouchEvent", {
				touchPoints: [],
				type: "touchEnd",
			});
			await session.detach();
			expect(await menu.evaluate((el) => el.tagName)).toBe("SECTION");
			expect(
				await menu.evaluate((el) => getComputedStyle(el).transitionDuration)
			).toBe("0s");
			expect(
				await menu.evaluate((el) => {
					// The rows scroll inside the popup's scroll area.
					const view = el.querySelector('[data-slot="scroll-area-viewport"]');
					return view ? view.scrollHeight > view.clientHeight : false;
				})
			).toBe(true);
			await menu.evaluate((el) => {
				const view = el.querySelector('[data-slot="scroll-area-viewport"]');
				if (view) {
					view.scrollTop = view.scrollHeight;
				}
			});
			const geometry = await menu.evaluate((el) => {
				const last = Array.from(
					el.querySelectorAll('[data-slot="context-menu-item"]')
				).at(-1);
				if (!last) {
					throw new Error("Final row missing");
				}
				const r = el.getBoundingClientRect(),
					row = last.getBoundingClientRect();
				return {
					gap: r.bottom - row.bottom,
					height: row.height,
					left: r.left,
					overflow: el.scrollWidth > el.clientWidth,
					right: r.right,
				};
			});
			expect(geometry.left).toBeGreaterThanOrEqual(0);
			expect(geometry.right).toBeLessThanOrEqual(375);
			expect(geometry.overflow).toBe(false);
			expect(geometry.gap).toBeGreaterThanOrEqual(8);
			expect(geometry.height).toBeGreaterThan(32);
			await menu.screenshot({
				path: `/private/tmp/mizen-context-menu-narrow-${theme}.png`,
			});
			await closeMenu();
			await page.emulateMedia({ reducedMotion: "no-preference" });
			await page.setViewportSize({ height: 900, width: 1280 });
			expect(errors).toEqual([]);
		},
		30_000
	);
});
