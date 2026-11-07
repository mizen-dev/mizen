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

async function openMenu(name: string) {
	const trigger = page.getByRole("button", { exact: true, name });
	await trigger.scrollIntoViewIfNeeded();
	await trigger.click();
	const menu = page.locator('[data-slot="menu-popup"]');
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

async function setTheme(theme: "light" | "dark") {
	await page.goto(`${handle.url}/components/menu`, {
		waitUntil: "networkidle",
	});
	await page.evaluate(
		(value) => localStorage.setItem("mizen-theme", value),
		theme
	);
	await page.reload({ waitUntil: "networkidle" });
}

describe("Menu visual and interaction states", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage({ viewport: { height: 900, width: 1280 } });
		page.on("pageerror", (error) => errors.push(error.message));
	}, 120_000);
	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
	}, 120_000);

	it.each(["light", "dark"] as const)(
		"aligns labels, icons, shortcuts, and submenu states in %s",
		async (theme) => {
			await setTheme(theme);
			const menu = await openMenu("Project actions");
			const open = menu
				.getByRole("menuitem")
				.filter({ hasText: "Open project" });
			const geometry = await open.evaluate((el) => {
				const icon = el.querySelector(":scope > svg");
				const label = el.querySelector(":scope > span");
				if (!(icon && label)) {
					throw new Error("Menu icon or label missing");
				}
				const i = icon.getBoundingClientRect(),
					l = label.getBoundingClientRect(),
					s = getComputedStyle(el);
				return {
					fontSize: s.fontSize,
					lineHeight: s.lineHeight,
					offset: Math.abs(i.top + i.height / 2 - l.top - l.height / 2),
					rowHeight: el.getBoundingClientRect().height,
				};
			});
			expect(geometry.offset).toBeLessThanOrEqual(1);
			expect(geometry.fontSize).toBe("14px");
			expect(geometry.lineHeight).toBe("20px");
			expect(geometry.rowHeight).toBe(32);
			expect(
				await menu.evaluate((el) => {
					// The rows' inset sits inside the scroll area, under the fade.
					const content = el.querySelector(
						'[data-slot="scroll-area-content"] > div'
					);
					return content ? getComputedStyle(content).paddingBottom : "";
				})
			).toBe("8px");
			const shortcut = open.locator('[data-slot="menu-shortcut"]');
			expect(await shortcut.evaluate((el) => el.tagName)).toBe("KBD");
			// Shortcuts are plain text that reads left to right.
			expect(await shortcut.textContent()).toBe("⌘O");
			expect(await shortcut.getAttribute("dir")).toBe("ltr");
			expect(
				await shortcut.evaluate((el) => getComputedStyle(el).fontFamily)
			).toBe(await open.evaluate((el) => getComputedStyle(el).fontFamily));
			const disabled = menu.getByRole("menuitem", {
				exact: true,
				name: "Duplicate project",
			});
			await expectLocator(disabled).toHaveAttribute("aria-disabled", "true");
			expect(
				Number(await disabled.evaluate((el) => getComputedStyle(el).opacity))
			).toBeLessThan(1);
			const remove = menu.getByRole("menuitem", {
				exact: true,
				name: "Delete project",
			});
			const normalInk = await open.evaluate((el) => getComputedStyle(el).color);
			expect(
				await remove.evaluate((el) => getComputedStyle(el).color)
			).not.toBe(normalInk);
			await remove.hover();
			expect(
				await remove.evaluate((el) => getComputedStyle(el).backgroundColor)
			).not.toBe("rgba(0, 0, 0, 0)");
			await menu.screenshot({
				path: `/private/tmp/mizen-menu-actions-${theme}.png`,
			});
			const move = menu.getByRole("menuitem", { exact: true, name: "Move to" });
			await move.focus();
			await move.press("ArrowRight");
			const child = page.locator('[data-slot="menu-sub-content"]');
			await expectLocator(child).toBeVisible();
			expect(
				await move.evaluate((el) => getComputedStyle(el).backgroundColor)
			).not.toBe("rgba(0, 0, 0, 0)");
			// Focus enters the submenu after it opens; ArrowLeft only closes it
			// from inside.
			await expectLocator(child.getByRole("menuitem").first()).toBeFocused();
			await page.keyboard.press("ArrowLeft");
			await expectLocator(child).toHaveCount(0);
			await expectLocator(move).toBeFocused();
			await closeMenu();
			await expectLocator(
				page.getByRole("button", { exact: true, name: "Project actions" })
			).toBeFocused();
		},
		30_000
	);

	it.each(["light", "dark"] as const)(
		"handles checked, disabled, hover, and dialog states in %s",
		async (theme) => {
			await setTheme(theme);
			let menu = await openMenu("Notification options");
			const notifications = menu.getByRole("menuitemcheckbox", {
				name: "Email notifications",
			});
			await expectLocator(notifications).toBeChecked();
			await notifications.click();
			await expectLocator(notifications).not.toBeChecked();
			await expectLocator(
				menu.getByRole("menuitemcheckbox", { name: "SMS notifications" })
			).toHaveAttribute("aria-disabled", "true");
			await closeMenu();
			menu = await openMenu("Notification options");
			await expectLocator(
				menu.getByRole("menuitemcheckbox", { name: "Email notifications" })
			).not.toBeChecked();
			await closeMenu();
			menu = await openMenu("Editor preferences");
			const save = menu.getByRole("menuitemcheckbox", { name: "Auto save" });
			await expectLocator(save).toBeChecked();
			await save.click();
			await expectLocator(save).not.toBeChecked();
			await menu.screenshot({
				path: `/private/tmp/mizen-menu-switch-${theme}.png`,
			});
			await closeMenu();
			menu = await openMenu("Sort projects");
			const name = menu.getByRole("menuitemradio", {
				exact: true,
				name: "Name",
			});
			await name.click();
			await expectLocator(name).toBeChecked();
			await expectLocator(
				menu.getByRole("menuitemradio", { name: "Most recent" })
			).not.toBeChecked();
			await closeMenu();
			await expectLocator(
				page.getByRole("button", { name: "Actions unavailable" })
			).toBeDisabled();
			const hover = page.getByRole("button", {
				name: "Hover for workspace actions",
			});
			await hover.scrollIntoViewIfNeeded();
			await hover.hover();
			await expectLocator(
				page.getByRole("menuitem", { name: "Invite members" })
			).toBeVisible();
			await page.mouse.move(5, 5);
			await expectLocator(page.getByRole("menu")).toHaveCount(0);
			menu = await openMenu("Quick actions");
			await menu.getByRole("menuitem", { name: "Keep this menu open" }).click();
			await expectLocator(menu).toBeVisible();
			await menu
				.getByRole("menuitem", { exact: true, name: "New document" })
				.click();
			await expectLocator(menu).toHaveCount(0);
			menu = await openMenu("Workspace settings menu");
			await menu
				.getByRole("menuitem", { name: "Open workspace settings" })
				.click();
			const dialog = page.getByRole("dialog", {
				exact: true,
				name: "Workspace settings",
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
				page.getByRole("button", { name: "Workspace settings menu" })
			).toBeFocused();
		},
		30_000
	);

	it.each(["light", "dark"] as const)(
		"centers submenus and restores focus across two levels in %s",
		async (theme) => {
			await setTheme(theme);
			await openMenu("Export project");
			const trigger = page.getByRole("menuitem", {
				exact: true,
				name: "Export format",
			});
			await trigger.focus();
			await trigger.press("ArrowRight");
			const child = page.locator('[data-slot="menu-sub-content"]').first();
			await expectLocator(child).toBeVisible();
			await expect
				.poll(() => child.evaluate((el) => getComputedStyle(el).transform))
				.toBe("none");
			const centers = await page.evaluate(() => {
				const anchor = document.querySelector('[data-slot="menu-sub-trigger"]');
				const popup = document.querySelector('[data-slot="menu-sub-content"]');
				if (!(anchor && popup)) {
					throw new Error("Submenu geometry missing");
				}
				const a = anchor.getBoundingClientRect(),
					p = popup.getBoundingClientRect();
				return Math.abs(a.top + a.height / 2 - p.top - p.height / 2);
			});
			expect(centers).toBeLessThanOrEqual(1);
			const image = child.getByRole("menuitem", { exact: true, name: "Image" });
			await image.focus();
			await image.press("ArrowRight");
			await expectLocator(
				page.getByRole("menuitem", { name: "PNG image" })
			).toBeVisible();
			await expect
				.poll(() =>
					page
						.locator('[data-slot="menu-sub-content"]')
						.last()
						.evaluate((el) => getComputedStyle(el).opacity)
				)
				.toBe("1");
			await page.screenshot({
				path: `/private/tmp/mizen-menu-nested-${theme}.png`,
			});
			await page.keyboard.press("Escape");
			await expectLocator(image).toBeFocused();
			await page.keyboard.press("Escape");
			await expectLocator(trigger).toBeFocused();
			await closeMenu();
			await expectLocator(
				page.getByRole("button", { exact: true, name: "Export project" })
			).toBeFocused();
		},
		30_000
	);

	it.each(["light", "dark"] as const)(
		"keeps long content readable at narrow widths with reduced motion in %s",
		async (theme) => {
			await setTheme(theme);
			await page.setViewportSize({ height: 600, width: 375 });
			await page.emulateMedia({ reducedMotion: "reduce" });
			const menu = await openMenu("Switch project");
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
				const r = el.getBoundingClientRect();
				const last = Array.from(
					el.querySelectorAll('[data-slot="menu-item"]')
				).at(-1);
				if (!last) {
					throw new Error("Last menu row missing");
				}
				const item = last.getBoundingClientRect();
				return {
					endGap: r.bottom - item.bottom,
					itemHeight: item.height,
					left: r.left,
					overflow: el.scrollWidth > el.clientWidth,
					right: r.right,
				};
			});
			expect(geometry.left).toBeGreaterThanOrEqual(0);
			expect(geometry.right).toBeLessThanOrEqual(375);
			expect(geometry.overflow).toBe(false);
			expect(geometry.endGap).toBeGreaterThanOrEqual(8);
			expect(geometry.itemHeight).toBeGreaterThan(32);
			await menu.screenshot({
				path: `/private/tmp/mizen-menu-narrow-${theme}.png`,
			});
			await closeMenu();
			await page.emulateMedia({ reducedMotion: "no-preference" });
			await page.setViewportSize({ height: 900, width: 1280 });
			expect(errors).toEqual([]);
		},
		30_000
	);
	it("rings the keyboard row and leaves the hovered row tinted", async () => {
		await setTheme("light");
		const trigger = page
			.locator('[data-slot="component-preview"]')
			.getByRole("button", { exact: true, name: "Actions" });
		await trigger.focus();
		await page.keyboard.press("Enter");
		await page.keyboard.press("ArrowDown");
		const row = page.locator('[role^="menuitem"]:focus');
		const outline = () =>
			row.evaluate((el) => getComputedStyle(el).outlineStyle);
		await expect.poll(outline).toBe("solid");
		await row.hover();
		await expect.poll(outline).toBe("none");
		await closeMenu();
	});
});
