import { type Browser, chromium, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
let handle: TestServerHandle;
let browser: Browser;
let page: Page;

describe("Toolbar review", { timeout: 30_000 }, () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		// Settled focus rings: the ring grows in over 200ms otherwise.
		await page.emulateMedia({ reducedMotion: "reduce" });
		page.setDefaultTimeout(8000);
	}, 120_000);
	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
	});

	it.each(["light", "dark"] as const)(
		"aligns composed controls and preserves focus, selection, menus, and tooltips in %s",
		async (theme) => {
			await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
			await page.setViewportSize({ height: 900, width: 1280 });
			await page.goto(`${handle.url}/components/toolbar`, {
				waitUntil: "networkidle",
			});
			const toolbar = page.getByRole("toolbar", {
				exact: true,
				name: "Formatting tools",
			});
			const controls = await toolbar.locator("button, a").evaluateAll((els) =>
				els.map((el) => {
					const box = el.getBoundingClientRect();
					return { center: box.y + box.height / 2, height: box.height };
				})
			);
			expect(controls.map((control) => control.height)).toEqual([
				32, 32, 32, 32,
			]);
			expect(
				Math.max(...controls.map((control) => control.center)) -
					Math.min(...controls.map((control) => control.center))
			).toBeLessThan(1);
			const group = toolbar.getByRole("group", {
				exact: true,
				name: "Formatting",
			});
			expect(await group.evaluate((el) => getComputedStyle(el).padding)).toBe(
				"0px"
			);
			expect(await group.evaluate((el) => getComputedStyle(el).overflow)).toBe(
				"visible"
			);
			const bold = toolbar.getByRole("button", { exact: true, name: "Bold" });
			await bold.focus();
			await page.keyboard.press("ArrowRight");
			const italic = toolbar.getByRole("button", {
				exact: true,
				name: "Italic",
			});
			expect(await italic.evaluate((el) => el === document.activeElement)).toBe(
				true
			);
			await page.keyboard.press("Space");
			expect(await italic.getAttribute("aria-pressed")).toBe("true");
			await page.keyboard.press("Escape");
			await page.keyboard.press("ArrowRight");
			expect(
				await toolbar
					.getByRole("button", { exact: true, name: "Copy formatting" })
					.evaluate((el) => el === document.activeElement)
			).toBe(true);
			await page.keyboard.press("ArrowRight");
			const link = toolbar.getByRole("link", {
				exact: true,
				name: "Formatting guide",
			});
			expect(await link.evaluate((el) => el === document.activeElement)).toBe(
				true
			);
			expect(
				await link.evaluate((el) => getComputedStyle(el).outlineOffset)
			).toBe("2px");
			await page.keyboard.press("ArrowRight");
			expect(await bold.evaluate((el) => el === document.activeElement)).toBe(
				true
			);
			await italic.hover();
			const tooltip = page.locator('[data-slot="tooltip-popup"][data-open]');
			await tooltip.waitFor();
			expect(await tooltip.textContent()).toContain("Italic");
			await page.keyboard.press("Escape");
			await toolbar
				.locator("xpath=ancestor::section[1]")
				.screenshot({ path: `/private/tmp/mizen-toolbar-${theme}.png` });
			const draft = page.getByRole("toolbar", {
				exact: true,
				name: "Draft tools",
			});
			await draft
				.getByRole("button", { exact: true, name: "More draft actions" })
				.click();
			await page
				.getByRole("menuitem", { exact: true, name: "Export draft" })
				.click();
			expect(
				await page.getByTestId("draft-action-status").textContent()
			).toContain("Exported");
		}
	);

	it.each(["light", "dark"] as const)(
		"keeps loading, disabled discovery, and vertical groups correct in %s",
		async (theme) => {
			await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
			await page.goto(`${handle.url}/components/toolbar`, {
				waitUntil: "networkidle",
			});
			const states = page.getByRole("toolbar", {
				exact: true,
				name: "Action states",
			});
			expect(
				await states
					.getByRole("button", { exact: true, name: "Saving draft" })
					.getAttribute("aria-busy")
			).toBe("true");
			const unavailable = states.getByRole("button", {
				exact: true,
				name: "Undo unavailable",
			});
			await unavailable.focus();
			expect(
				await unavailable.evaluate((el) => el === document.activeElement)
			).toBe(true);
			expect(await unavailable.getAttribute("aria-disabled")).toBe("true");
			const disabled = page.getByRole("toolbar", {
				exact: true,
				name: "Disabled actions",
			});
			expect(
				await disabled
					.locator('[aria-disabled="true"], button:disabled')
					.count()
			).toBe(2);
			const vertical = page.getByRole("toolbar", {
				exact: true,
				name: "Vertical formatting",
			});
			expect(
				await vertical
					.locator('[data-slot="toggle-group"]')
					.getAttribute("data-orientation")
			).toBe("vertical");
			expect(
				await vertical
					.locator('[data-slot="toolbar-group"]')
					.evaluate((el) => getComputedStyle(el).flexDirection)
			).toBe("column");
			const bold = vertical.getByRole("button", { exact: true, name: "Bold" });
			await bold.focus();
			await page.keyboard.press("ArrowDown");
			expect(
				await vertical
					.getByRole("button", { exact: true, name: "Italic" })
					.evaluate((el) => el === document.activeElement)
			).toBe(true);
			await page.keyboard.press("ArrowDown");
			expect(
				await vertical
					.getByRole("button", { exact: true, name: "Copy" })
					.evaluate((el) => el === document.activeElement)
			).toBe(true);
			await page.keyboard.press("ArrowDown");
			expect(await bold.evaluate((el) => el === document.activeElement)).toBe(
				true
			);
			const separator = vertical.locator('[data-slot="toolbar-separator"]');
			expect(await separator.getAttribute("aria-orientation")).toBe(
				"horizontal"
			);
			expect((await separator.boundingBox())?.width).toBe(24);
		}
	);

	it("scrolls a narrow toolbar without shrinking controls", async () => {
		await page.setViewportSize({ height: 900, width: 320 });
		await page.goto(`${handle.url}/components/toolbar`, {
			waitUntil: "networkidle",
		});
		const toolbar = page.getByRole("toolbar", {
			exact: true,
			name: "Formatting tools",
		});
		const layout = await toolbar.evaluate((el) => ({
			client: el.clientWidth,
			scroll: el.scrollWidth,
			width: el.getBoundingClientRect().width,
		}));
		expect(layout.width).toBeLessThanOrEqual(320);
		expect(layout.scroll).toBeGreaterThan(layout.client);
		await toolbar.getByRole("button", { exact: true, name: "Bold" }).focus();
		await page.keyboard.press("ArrowRight");
		await page.keyboard.press("ArrowRight");
		await page.keyboard.press("ArrowRight");
		expect(
			await toolbar
				.getByRole("link", { exact: true, name: "Formatting guide" })
				.evaluate((el) => el === document.activeElement)
		).toBe(true);
		await expect
			.poll(() => toolbar.evaluate((el) => el.scrollLeft))
			.toBeGreaterThan(0);
	});

	it("keeps text editing inside ToolbarInput and supports native input refs and values", async () => {
		await page.setViewportSize({ height: 900, width: 1280 });
		// Wait for hydration: the toolbar selects input text on focus, and a focus
		// replayed after hydration would select the filled text.
		await page.goto(`${handle.url}/components/toolbar`, {
			waitUntil: "networkidle",
		});
		const toolbar = page.getByRole("toolbar", {
			exact: true,
			name: "Document search",
		});
		const input = toolbar.getByRole("textbox", {
			exact: true,
			name: "Find in document",
		});
		await input.fill("Find this phrase");
		expect(await input.inputValue()).toBe("Find this phrase");
		await input.press("ControlOrMeta+ArrowRight");
		await input.press("ArrowLeft");
		expect(await input.evaluate((el) => el === document.activeElement)).toBe(
			true
		);
		expect(
			await input.evaluate((el) => (el as HTMLInputElement).selectionStart)
		).toBe(15);
		expect(await input.evaluate((el) => getComputedStyle(el).height)).toBe(
			"32px"
		);
	});
});
