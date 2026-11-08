// biome-ignore-all lint/performance/noAwaitInLoops: Drawer interactions must run sequentially in one browser page.
import { type Browser, chromium, type Page } from "playwright";
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
let page: Page;
const errors: string[] = [];

describe("Drawer states", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage({ viewport: { height: 800, width: 1280 } });
		page.on("pageerror", (error) => errors.push(error.message));
	}, 120_000);
	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
	}, 120_000);

	it.each(["light", "dark"] as const)(
		"aligns positions, variants, and scrolling in %s",
		async (theme) => {
			await page.goto(`${handle.url}/components/drawer`, {
				waitUntil: "networkidle",
			});
			await page.evaluate(
				(value) => localStorage.setItem("mizen-theme", value),
				theme
			);
			await page.reload({ waitUntil: "networkidle" });
			for (const variant of ["Inset", "Straight"]) {
				for (const position of ["bottom", "top", "left", "right"]) {
					const trigger = page.getByRole("button", {
						exact: true,
						name: `${variant} ${position}`,
					});
					await trigger.scrollIntoViewIfNeeded();
					await trigger.click();
					const popup = page.locator('[data-slot="drawer-popup"]');
					await expectLocator(popup).toBeVisible();
					await expect
						.poll(() => popup.evaluate((el) => getComputedStyle(el).transform))
						.toBe("matrix(1, 0, 0, 1, 0, 0)");
					await expect
						.poll(() =>
							popup.evaluate(
								(el) =>
									Math.round(el.getBoundingClientRect().bottom) <=
									window.innerHeight
							)
						)
						.toBe(true);
					const styles = await popup.evaluate((el) => {
						const title = el.querySelector('[data-slot="drawer-title"]');
						const description = el.querySelector(
							'[data-slot="drawer-description"]'
						);
						const footer = el.querySelector('[data-slot="drawer-footer"]');
						if (!(title && description && footer)) {
							throw new Error("Drawer anatomy missing");
						}
						return {
							description: getComputedStyle(description).fontSize,
							footer: getComputedStyle(footer).backgroundColor,
							radius: getComputedStyle(el).borderTopLeftRadius,
							title: getComputedStyle(title).fontSize,
						};
					});
					expect(styles.title).toBe("20px");
					expect(styles.description).toBe("14px");
					if (variant === "Straight") {
						expect(styles.radius).toBe("0px");
						expect(styles.footer).toBe("rgba(0, 0, 0, 0)");
					} else {
						expect(styles.footer).not.toBe("rgba(0, 0, 0, 0)");
					}
					await page.screenshot({
						path: `/private/tmp/mizen-drawer-${variant.toLowerCase()}-${position}-${theme}.png`,
					});
					await page.keyboard.press("Escape");
					await expectLocator(popup).toHaveCount(0);
					await expectLocator(trigger).toBeFocused();
				}
			}
			await page.setViewportSize({ height: 600, width: 375 });
			await page
				.getByRole("button", { name: "Review release history" })
				.click();
			const popup = page.locator('[data-slot="drawer-popup"]');
			const viewport = popup.locator('[data-slot="scroll-area-viewport"]');
			await expectLocator(popup).toBeVisible();
			await expect
				.poll(() => popup.evaluate((el) => getComputedStyle(el).transform))
				.toBe("matrix(1, 0, 0, 1, 0, 0)");
			expect(
				await viewport.evaluate((el) => el.scrollHeight > el.clientHeight)
			).toBe(true);
			await expectLocator(
				popup.getByRole("button", { name: "Restore release" })
			).toBeDisabled();
			await viewport.evaluate((el) => {
				el.scrollTop = el.scrollHeight;
			});
			await page.screenshot({
				path: `/private/tmp/mizen-drawer-scroll-${theme}.png`,
			});
			await page.keyboard.press("Escape");
			await expectLocator(popup).toHaveCount(0);
			await expectLocator(
				page.getByRole("button", { name: "Activity unavailable" })
			).toBeDisabled();
			await page.setViewportSize({ height: 800, width: 1280 });
		},
		60_000
	);

	it.each(["light", "dark"] as const)(
		"keeps menu state and restores a nested parent in %s",
		async (theme) => {
			await page.goto(`${handle.url}/components/drawer`, {
				waitUntil: "networkidle",
			});
			await page.evaluate(
				(value) => localStorage.setItem("mizen-theme", value),
				theme
			);
			await page.reload({ waitUntil: "networkidle" });
			await page.getByRole("button", { name: "Open project actions" }).click();
			const parent = page.locator('[data-slot="drawer-popup"]').first();
			await expectLocator(
				parent.getByRole("button", { name: "Archive project" })
			).toBeDisabled();
			const notifications = parent.getByRole("checkbox", {
				name: "Notifications",
			});
			await expectLocator(notifications).toBeChecked();
			await notifications.click();
			await expectLocator(notifications).not.toBeChecked();
			const autosave = parent.getByRole("checkbox", { name: "Auto save" });
			await autosave.click();
			await expectLocator(autosave).toBeChecked();
			const name = parent.getByRole("radio", { exact: true, name: "Name" });
			await name.click();
			await expectLocator(name).toBeChecked();
			const nestedTrigger = parent.getByRole("button", {
				name: "Move to workspace",
			});
			await nestedTrigger.click();
			const child = page.locator('[data-slot="drawer-popup"]').last();
			await expect
				.poll(() => parent.evaluate((el) => getComputedStyle(el).opacity))
				.toBe("0");
			await expect
				.poll(() => child.evaluate((el) => getComputedStyle(el).opacity))
				.toBe("1");
			await page.screenshot({
				path: `/private/tmp/mizen-drawer-nested-${theme}.png`,
			});
			await page.keyboard.press("Escape");
			await expectLocator(
				page.locator('[data-slot="drawer-popup"]')
			).toHaveCount(1);
			await expect
				.poll(() => parent.evaluate((el) => getComputedStyle(el).opacity))
				.toBe("1");
			await expectLocator(nestedTrigger).toBeFocused();
			await expectLocator(autosave).toBeChecked();
			await expectLocator(name).toBeChecked();
			await parent
				.getByRole("button", { exact: true, name: "Edit project" })
				.click();
			await expectLocator(parent).toHaveCount(0);
		},
		30_000
	);

	it.each(["light", "dark"] as const)(
		"preserves snap points and reduced motion in %s",
		async (theme) => {
			await page.emulateMedia({ reducedMotion: "reduce" });
			await page.goto(`${handle.url}/components/drawer`, {
				waitUntil: "networkidle",
			});
			await page.evaluate(
				(value) => localStorage.setItem("mizen-theme", value),
				theme
			);
			await page.reload({ waitUntil: "networkidle" });
			await page.getByRole("button", { name: "Explore snap points" }).click();
			const popup = page.locator('[data-slot="drawer-popup"]');
			await expectLocator(popup).toBeVisible();
			const state = await popup.evaluate((el) => ({
				duration: getComputedStyle(el).transitionDuration,
				offset: getComputedStyle(el).getPropertyValue(
					"--drawer-snap-point-offset"
				),
			}));
			expect(
				state.duration.split(",").every((value) => value.trim() === "0s")
			).toBe(true);
			expect(Number.parseFloat(state.offset)).toBeGreaterThan(0);
			const visibleHeight = () =>
				popup.evaluate(
					(el) => window.innerHeight - el.getBoundingClientRect().top
				);
			expect(await visibleHeight()).toBeCloseTo(320, 0);
			const footerBottom = await popup
				.locator('[data-slot="drawer-footer"]')
				.evaluate((el) => el.getBoundingClientRect().bottom);
			expect(footerBottom).toBeLessThanOrEqual(800);
			await page.screenshot({
				path: `/private/tmp/mizen-drawer-snap-peek-${theme}.png`,
			});
			const bar = await popup.locator('[data-slot="drawer-bar"]').boundingBox();
			if (!bar) {
				throw new Error("Drawer handle missing");
			}
			const x = bar.x + bar.width / 2;
			const y = bar.y + bar.height / 2;
			await page.mouse.move(x, y);
			await page.mouse.down();
			await page.mouse.move(x, y - 250, { steps: 80 });
			await page.mouse.up();
			await expect.poll(visibleHeight).toBeCloseTo(560, 0);
			await page.screenshot({
				path: `/private/tmp/mizen-drawer-snap-expanded-${theme}.png`,
			});

			await popup.evaluate((el) =>
				(el as HTMLElement).style.setProperty(
					"--drawer-keyboard-inset",
					"300px"
				)
			);
			const keyboardFooterBottom = await popup
				.locator('[data-slot="drawer-footer"]')
				.evaluate((el) => el.getBoundingClientRect().bottom);
			expect(keyboardFooterBottom).toBeLessThanOrEqual(500);

			await page.keyboard.press("Escape");
			await expectLocator(popup).toHaveCount(0);
			await page.emulateMedia({ reducedMotion: "no-preference" });
			expect(errors).toEqual([]);
		}
	);
});
