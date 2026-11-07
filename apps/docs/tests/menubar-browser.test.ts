import { type Browser, chromium, type Page } from "playwright";
import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from "vitest";
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

describe("Menubar browser states", { timeout: 20_000 }, () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		page.setDefaultTimeout(8000);
		page.on("pageerror", (error) => errors.push(error.message));
		page.on("console", (message) => {
			if (message.type() === "error") {
				errors.push(message.text());
			}
		});
	}, 120_000);
	beforeEach(async () => {
		errors.length = 0;
		await page.setViewportSize({ height: 900, width: 1280 });
		await page.goto(`${handle.url}/components/menubar`, {
			waitUntil: "networkidle",
		});
	});
	afterEach(() => expect(errors).toEqual([]));
	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
	});
	it.each(["light", "dark"] as const)(
		"aligns triggers and keeps disabled controls quiet in %s",
		async (theme) => {
			await page.emulateMedia({ colorScheme: theme });
			const bar = page.getByRole("menubar", { name: "Document settings" });
			await bar.scrollIntoViewIfNeeded();
			const trigger = bar.getByRole("menuitem", {
				exact: true,
				name: "Document",
			});
			const box = await trigger.boundingBox();
			expect(box?.height).toBe(32);
			expect(
				await trigger.evaluate((el) => getComputedStyle(el).fontSize)
			).toBe("14px");
			const icon = await trigger.locator("svg").boundingBox();
			const text = await trigger.locator("span").boundingBox();
			expect(icon?.width).toBe(16);
			expect(
				icon &&
					text &&
					Math.abs(icon.y + icon.height / 2 - text.y - text.height / 2) < 1
			).toBe(true);
			await trigger.focus();
			await page.keyboard.press("ArrowRight");
			await page.keyboard.press("ArrowLeft");
			expect(
				await trigger.evaluate((el) => getComputedStyle(el).outlineColor)
			).not.toBe("rgba(0, 0, 0, 0)");
			await bar.screenshot({ path: `/private/tmp/mizen-menubar-${theme}.png` });
			const disabled = page
				.getByRole("menubar", { name: "Disabled commands" })
				.getByRole("menuitem", { name: "File unavailable" });
			await disabled.hover();
			expect(await disabled.getAttribute("data-disabled")).not.toBeNull();
			expect(
				await disabled.evaluate((el) => getComputedStyle(el).backgroundColor)
			).toBe("rgba(0, 0, 0, 0)");
			await disabled.evaluate((el) => (el as HTMLButtonElement).click());
			expect(await page.getByRole("menu").count()).toBe(0);
		}
	);

	it.each(["light", "dark"] as const)(
		"navigates menus, executes commands, and restores focus in %s",
		async (theme) => {
			await page.emulateMedia({ colorScheme: theme });
			const bar = page.getByRole("menubar", { name: "Editor menu" });
			const file = bar.getByRole("menuitem", { exact: true, name: "File" });
			await file.focus();
			await page.keyboard.press("ArrowDown");
			await page
				.getByRole("menuitem", { exact: true, name: "New document" })
				.waitFor();
			// ArrowRight moves through Edit to View.
			await page.keyboard.press("ArrowRight");
			await page.getByRole("menuitem", { exact: true, name: "Undo" }).waitFor();
			await page.keyboard.press("ArrowRight");
			const showOutline = page.getByRole("menuitem", {
				exact: true,
				name: "Show outline",
			});
			await showOutline.waitFor();
			// Focus enters the opened menu after it renders; keys sent before
			// that land on the menubar.
			await expect
				.poll(() =>
					showOutline.evaluate((item) =>
						item.closest('[role="menu"]')?.contains(document.activeElement)
					)
				)
				.toBe(true);
			await page.keyboard.press("ArrowDown");
			await page.keyboard.press("Enter");
			// Running a command closes the menu.
			await expect.poll(() => page.getByRole("menu").count()).toBe(0);
			const view = bar.getByRole("menuitem", { exact: true, name: "View" });
			// Focus returns to the trigger once the menu finishes closing, which
			// can trail the menu closing.
			await expect
				.poll(() => view.evaluate((el) => document.activeElement === el))
				.toBe(true);
			await page.keyboard.press("ArrowRight");
			expect(await file.evaluate((el) => document.activeElement === el)).toBe(
				true
			);
			await file.click();
			await bar.getByRole("menuitem", { exact: true, name: "View" }).hover();
			await page
				.getByRole("menuitem", { exact: true, name: "Show outline" })
				.waitFor();
			await page.keyboard.press("Escape");
			await page.getByRole("menu").waitFor({ state: "hidden" });
		}
	);

	it.each(["light", "dark"] as const)(
		"keeps preferences and nested menus functional in %s",
		async (theme) => {
			await page.emulateMedia({ colorScheme: theme });
			const bar = page.getByRole("menubar", { name: "Document settings" });
			await bar
				.getByRole("menuitem", { exact: true, name: "Preferences" })
				.click();
			const check = page.getByRole("menuitemcheckbox", {
				exact: true,
				name: "Autosave",
			});
			expect(await check.getAttribute("aria-checked")).toBe("true");
			await check.click();
			await page
				.getByText("Autosave off. Density: comfortable.", { exact: true })
				.waitFor();
			await page
				.getByRole("menuitemradio", { exact: true, name: "Compact" })
				.click();
			await page
				.getByText("Autosave off. Density: compact.", { exact: true })
				.waitFor();
			await page.keyboard.press("Escape");
			await page.getByRole("menu").waitFor({ state: "hidden" });
			await bar
				.getByRole("menuitem", { exact: true, name: "Document" })
				.click();
			expect(
				await page
					.getByRole("menuitem", { exact: true, name: "Export document" })
					.getAttribute("aria-disabled")
			).toBe("true");
			await expect
				.poll(() =>
					page
						.getByRole("menu")
						.evaluate((el) => getComputedStyle(el).transform)
				)
				.toBe("none");
			await page
				.getByRole("menuitem", { exact: true, name: "Recent documents" })
				.hover();
			await page
				.getByRole("menuitem", { exact: true, name: "Release notes" })
				.waitFor();
			expect(await page.getByRole("menu").count()).toBe(2);
			await page.keyboard.press("Escape");
			await page.keyboard.press("Escape");
		}
	);

	it("supports vertical navigation and narrow layouts with reduced motion", async () => {
		await page.setViewportSize({ height: 800, width: 320 });
		await page.emulateMedia({ reducedMotion: "reduce" });
		const bar = page.getByRole("menubar", { name: "Vertical actions" });
		await bar.getByRole("menuitem", { exact: true, name: "Navigate" }).focus();
		await page.keyboard.press("ArrowDown");
		const view = bar.getByRole("menuitem", { exact: true, name: "View" });
		expect(await view.evaluate((el) => document.activeElement === el)).toBe(
			true
		);
		await page.keyboard.press("Enter");
		await page
			.getByRole("menuitem", { exact: true, name: "Show panel" })
			.waitFor();
		expect(
			await view.evaluate((el) => getComputedStyle(el).transitionDuration)
		).toBe("0s");
		expect(await bar.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
			true
		);
	});
});
