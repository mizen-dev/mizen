import { type Browser, chromium, type Page } from "playwright";
import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from "vite-plus/test";
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

describe("Navigation Menu browser states", { timeout: 20_000 }, () => {
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
		await page.goto(`${handle.url}/components/navigation-menu`, {
			waitUntil: "networkidle",
		});
	});
	afterEach(() => expect(errors).toEqual([]));
	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
	});
	it.each(["light", "dark"] as const)(
		"aligns icons and preserves current and disabled states in %s",
		async (theme) => {
			await page.emulateMedia({ colorScheme: theme });
			const nav = page.getByRole("navigation", { name: "Resource navigation" });
			await nav.scrollIntoViewIfNeeded();
			const trigger = nav.getByRole("button", {
				exact: true,
				name: "Resources",
			});
			expect((await trigger.boundingBox())?.height).toBe(32);
			expect(
				await trigger.evaluate((el) => getComputedStyle(el).fontSize)
			).toBe("14px");
			const icon = await trigger.locator(":scope > svg").boundingBox();
			const text = await trigger.locator(":scope > span").first().boundingBox();
			expect(icon?.width).toBe(16);
			expect(
				icon &&
					text &&
					Math.abs(icon.y + icon.height / 2 - text.y - text.height / 2) < 1
			).toBe(true);
			const active = nav.getByRole("link", {
				exact: true,
				name: "Current section",
			});
			expect(await active.getAttribute("aria-current")).toBe("page");
			expect(
				await active.evaluate((el) => getComputedStyle(el).backgroundColor)
			).not.toBe("rgba(0, 0, 0, 0)");
			const disabled = nav.getByRole("button", {
				exact: true,
				name: "Support",
			});
			await disabled.hover();
			expect(
				await disabled.evaluate((el) => getComputedStyle(el).opacity)
			).toBe("0.55");
			expect(
				await disabled.evaluate((el) => getComputedStyle(el).backgroundColor)
			).toBe("rgba(0, 0, 0, 0)");
			await disabled.evaluate((el) => (el as HTMLButtonElement).click());
			expect(
				await page
					.locator('[data-slot="navigation-menu-popup"][data-open]')
					.count()
			).toBe(0);
			await trigger.focus();
			await page.keyboard.press("ArrowRight");
			expect(
				await nav
					.getByRole("button", { exact: true, name: "All guides" })
					.evaluate((el) => getComputedStyle(el).outlineColor)
			).not.toBe("rgba(0, 0, 0, 0)");
			await nav.screenshot({
				path: `/private/tmp/mizen-navigation-menu-${theme}.png`,
			});
		}
	);

	it.each(["light", "dark"] as const)(
		"opens by keyboard, transfers focus, and dismisses in %s",
		async (theme) => {
			await page.emulateMedia({ colorScheme: theme });
			const nav = page.getByRole("navigation", { name: "Resource navigation" });
			const trigger = nav.getByRole("button", {
				exact: true,
				name: "Resources",
			});
			await trigger.focus();
			await page.keyboard.press("Enter");
			const popup = page.locator(
				'[data-slot="navigation-menu-popup"][data-open]'
			);
			await popup.waitFor({ state: "visible" });
			await expect
				.poll(() => popup.evaluate((el) => getComputedStyle(el).transform))
				.toBe("none");
			expect(await popup.evaluate((el) => getComputedStyle(el).padding)).toBe(
				"12px"
			);
			await page.keyboard.press("Tab");
			expect(
				await popup
					.getByRole("link", { exact: true, name: "Button guide" })
					.evaluate((el) => document.activeElement === el)
			).toBe(true);
			await page.keyboard.press("Escape");
			await popup.waitFor({ state: "hidden" });
			await expect
				.poll(() => trigger.evaluate((el) => document.activeElement === el))
				.toBe(true);
			await page.getByText("Panel: closed", { exact: true }).waitFor();
		}
	);

	it.each(["light", "dark"] as const)(
		"preserves hover travel and panel resizing in %s",
		async (theme) => {
			await page.emulateMedia({ colorScheme: theme });
			const nav = page.getByRole("navigation", { name: "Resource navigation" });
			await nav.getByRole("button", { exact: true, name: "Resources" }).hover();
			const popup = page.locator(
				'[data-slot="navigation-menu-popup"][data-open]'
			);
			await popup.waitFor({ state: "visible" });
			await expect
				.poll(() => popup.evaluate((el) => getComputedStyle(el).transform))
				.toBe("none");
			await popup.hover();
			expect(await popup.isVisible()).toBe(true);
			const small = (await popup.boundingBox())?.height ?? 0;
			await nav
				.getByRole("button", { exact: true, name: "All guides" })
				.hover();
			await popup
				.getByRole("link", { exact: true, name: "navigation-menu" })
				.waitFor();
			await expect
				.poll(async () => (await popup.boundingBox())?.height ?? 0)
				.toBeGreaterThan(small);
			await page.mouse.move(0, 0);
			await popup.waitFor({ state: "hidden" });
		}
	);

	it("keeps long content scrollable on mobile with reduced motion", async () => {
		await page.setViewportSize({ height: 600, width: 320 });
		await page.emulateMedia({ reducedMotion: "reduce" });
		const nav = page.getByRole("navigation", { name: "Resource navigation" });
		await nav.getByRole("button", { exact: true, name: "All guides" }).click();
		const popup = page.locator(
			'[data-slot="navigation-menu-popup"][data-open]'
		);
		await popup.waitFor({ state: "visible" });
		expect(
			await popup.evaluate((el) => getComputedStyle(el).transitionDuration)
		).toBe("0s");
		const box = await popup.boundingBox();
		expect(
			box &&
				box.x >= 0 &&
				box.y >= 0 &&
				box.x + box.width <= 320 &&
				box.y + box.height <= 600
		).toBe(true);
		const content = popup.locator(
			'[data-slot="navigation-menu-content"][data-open]'
		);
		expect(await content.evaluate((el) => getComputedStyle(el).overflowY)).toBe(
			"auto"
		);
		await popup
			.getByRole("link", { exact: true, name: "navigation-menu" })
			.scrollIntoViewIfNeeded();
		expect(await content.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
	});

	it("preserves framework link navigation", async () => {
		await page
			.getByRole("navigation", { name: "Resource navigation" })
			.getByRole("button", { exact: true, name: "Resources" })
			.click();
		await page.getByRole("link", { exact: true, name: "Button guide" }).click();
		await page.waitForURL("**/docs/components/button");
	});
});
