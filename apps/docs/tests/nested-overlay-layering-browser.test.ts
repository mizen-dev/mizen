import { type Browser, chromium, type Locator, type Page } from "playwright";
import { expect as expectLocator } from "playwright/test";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
let handle: TestServerHandle;
let browser: Browser;
let page: Page;

describe("nested popup layering", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage({ viewport: { height: 800, width: 1280 } });
		page.setDefaultTimeout(8000);
	}, 120_000);

	beforeEach(async () => {
		await page.goto(`${handle.url}/components/dialog`, {
			waitUntil: "networkidle",
		});
	});

	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
	}, 120_000);

	it("keeps menu and submenu popup items above the dialog hit area", async () => {
		await page.getByRole("button", { name: "Edit project details" }).click();
		const dialog = page.getByRole("dialog", { name: "Edit project" });
		await dialog.waitFor({ state: "visible" });

		const menuTrigger = dialog.getByRole("button", { name: "More actions" });
		await menuTrigger.click();

		const duplicate = page.getByRole("menuitem", { name: "Duplicate project" });
		await duplicate.waitFor({ state: "visible" });
		expect(await receivesPointer(duplicate)).toBe(true);
		await duplicate.click();

		await menuTrigger.click();
		const submenuTrigger = page.getByRole("menuitem", {
			name: "Export project",
		});
		await submenuTrigger.hover();

		const download = page.getByRole("menuitem", { name: "Download archive" });
		await download.waitFor({ state: "visible" });
		expect(await receivesPointer(download)).toBe(true);
		await download.click();
		expect(await dialog.isVisible()).toBe(true);
	});

	it.each(["light", "dark"] as const)(
		"hides the parent and restores its draft and focus in %s",
		async (theme) => {
			await page.evaluate(
				(value) => localStorage.setItem("mizen-theme", value),
				theme
			);
			await page.reload({ waitUntil: "networkidle" });
			await page
				.getByRole("button", { exact: true, name: "Edit project details" })
				.click();
			const parent = page.locator('[data-slot="dialog-popup"]').first();
			const title = parent.locator('[data-slot="dialog-header"] h2');
			expect(
				await title.evaluate((element) => getComputedStyle(element).fontSize)
			).toBe("20px");
			expect(
				await parent
					.locator('[data-slot="dialog-header"] p')
					.evaluate((element) => getComputedStyle(element).fontSize)
			).toBe("14px");
			const footer = parent.locator('[data-slot="dialog-footer"]');
			expect(
				await footer.evaluate(
					(element) => getComputedStyle(element).backgroundColor
				)
			).not.toBe(
				await parent.evaluate(
					(element) => getComputedStyle(element).backgroundColor
				)
			);
			const name = parent.getByRole("textbox", {
				exact: true,
				name: "Project name",
			});
			await name.fill("Draft project");
			const trigger = parent.getByRole("button", {
				exact: true,
				name: "Open nested dialog",
			});
			await trigger.click();
			const child = page.getByRole("dialog", {
				exact: true,
				name: "Nested permissions",
			});
			await expectLocator(child).toBeVisible();
			await expect
				.poll(() =>
					parent.evaluate((element) => getComputedStyle(element).opacity)
				)
				.toBe("0");
			await expect
				.poll(() =>
					child.evaluate((element) => getComputedStyle(element).opacity)
				)
				.toBe("1");
			await page.screenshot({
				path: `/private/tmp/mizen-dialog-nested-${theme}.png`,
			});
			await page.keyboard.press("Escape");
			await expectLocator(child).toHaveCount(0);
			await expect
				.poll(() =>
					parent.evaluate((element) => getComputedStyle(element).opacity)
				)
				.toBe("1");
			await expectLocator(trigger).toBeFocused();
			await expectLocator(name).toHaveValue("Draft project");
			await page.setViewportSize({ height: 740, width: 375 });
			await page.emulateMedia({ reducedMotion: "reduce" });
			await trigger.click();
			await expect
				.poll(() =>
					parent.evaluate((element) => getComputedStyle(element).opacity)
				)
				.toBe("0");
			expect(
				await child.evaluate(
					(element) => getComputedStyle(element).transitionDuration
				)
			).toBe("0s");
			await page.keyboard.press("Escape");
			await expectLocator(child).toHaveCount(0);
			await page.screenshot({
				path: `/private/tmp/mizen-dialog-parent-narrow-${theme}.png`,
			});
			await page.keyboard.press("Escape");
			await expectLocator(parent).toHaveCount(0);
			await page.emulateMedia({ reducedMotion: "no-preference" });
			await page.setViewportSize({ height: 800, width: 1280 });
		}
	);

	it("keeps an older dialog popup below a later nested dialog", async () => {
		await page.getByRole("button", { name: "Edit project details" }).click();
		const dialog = page.getByRole("dialog", { name: "Edit project" });
		await dialog.waitFor({ state: "visible" });
		await dialog.getByRole("button", { name: "More actions" }).click();

		const duplicate = page.getByRole("menuitem", { name: "Duplicate project" });
		await duplicate.waitFor({ state: "visible" });
		const point = await duplicate.evaluate((element) => {
			const rect = element.getBoundingClientRect();
			return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
		});

		await dialog
			.getByRole("button", { name: "Open nested dialog" })
			.evaluate((element) => (element as HTMLButtonElement).click());
		const nestedDialog = page.getByRole("dialog", {
			name: "Nested permissions",
		});
		await nestedDialog.waitFor({ state: "visible" });

		const nestedViewport = page.locator('[data-slot="dialog-viewport"]').nth(1);
		expect(
			await nestedViewport.evaluate(
				(element, coordinates) =>
					element.contains(
						document.elementFromPoint(coordinates.x, coordinates.y)
					),
				point
			)
		).toBe(true);
	});
});

function receivesPointer(target: Locator) {
	return target.evaluate((element) => {
		const rect = element.getBoundingClientRect();
		const hit = document.elementFromPoint(
			rect.left + rect.width / 2,
			rect.top + rect.height / 2
		);
		return hit !== null && element.contains(hit);
	});
}
