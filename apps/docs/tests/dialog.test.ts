import { type Browser, chromium, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import {
	setDocsTheme,
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
let handle: TestServerHandle;
let browser: Browser;
let page: Page;

function throwTeardownFailures(
	results: readonly PromiseSettledResult<unknown>[]
): void {
	const failures = results
		.filter(
			(result): result is PromiseRejectedResult => result.status === "rejected"
		)
		.map(({ reason }) => reason);
	if (failures.length === 1) {
		throw failures[0];
	}
	if (failures.length > 1) {
		throw new AggregateError(failures, "Failed to tear down the dialog test");
	}
}

describe("Dialog component route", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		page.setDefaultTimeout(6000);
		await page.goto(`${handle.url}/components/dialog`, {
			waitUntil: "networkidle",
		});
	}, 120_000);

	afterAll(async () => {
		const results = await Promise.allSettled([
			Promise.resolve().then(() => browser?.close()),
			Promise.resolve().then(() => teardownTestServer(handle)),
		]);
		throwTeardownFailures(results);
	}, 120_000);

	it("opens Dialog with safe layout, traps focus, and closes by Escape or backdrop", async () => {
		await page.setViewportSize({ height: 800, width: 1024 });
		const trigger = page.getByRole("button", {
			exact: true,
			name: "Edit project details",
		});
		await trigger.click();
		const popup = page.getByRole("dialog");
		await popup.waitFor({ state: "visible" });
		expect(await popup.isVisible()).toBe(true);
		const popupBox = await popup.boundingBox();
		expect(
			popupBox &&
				popupBox.x > 0 &&
				popupBox.y > 0 &&
				popupBox.x + popupBox.width < 1024 &&
				popupBox.y + popupBox.height < 800
		).toBe(true);

		const projectName = page.getByRole("textbox", { name: "Project name" });
		await projectName.focus();
		await projectName.press("Tab");
		expect(
			await popup.evaluate((element) =>
				element.contains(document.activeElement)
			)
		).toBe(true);

		await page.keyboard.press("Escape");
		await popup.waitFor({ state: "detached" });
		expect(await popup.count()).toBe(0);
		expect(
			await trigger.evaluate((element) => document.activeElement === element)
		).toBe(true);

		await trigger.click();
		await popup.waitFor({ state: "visible" });
		expect(await popup.isVisible()).toBe(true);
		await page
			.locator('[data-slot="dialog-viewport"]')
			.click({ position: { x: 2, y: 2 } });
		await popup.waitFor({ state: "detached" });
		expect(await popup.count()).toBe(0);
		expect(
			await trigger.evaluate((element) => document.activeElement === element)
		).toBe(true);
	});

	it("raises popup contrast and removes close motion when requested", async () => {
		await page.goto(`${handle.url}/components/dialog`, {
			waitUntil: "networkidle",
		});
		const trigger = page.getByRole("button", {
			exact: true,
			name: "Edit project details",
		});
		await trigger.click();
		const popup = page.getByRole("dialog");
		await popup.waitFor({ state: "visible" });
		const normalBorder = await popup.evaluate(
			(element) => getComputedStyle(element).borderColor
		);
		await page.keyboard.press("Escape");
		await popup.waitFor({ state: "detached" });
		const session = await page.context().newCDPSession(page);
		await session.send("Emulation.setEmulatedMedia", {
			features: [
				{ name: "prefers-contrast", value: "more" },
				{ name: "prefers-reduced-motion", value: "reduce" },
			],
		});
		await trigger.click();
		await popup.waitFor({ state: "visible" });
		const popupBorder = await popup.evaluate(
			(element) => getComputedStyle(element).borderColor
		);
		const preferences = await page.evaluate(() => ({
			contrast: matchMedia("(prefers-contrast: more)").matches,
			reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
		}));
		const close = page.locator('[data-slot="dialog-default-close"]');
		const closeBox = await close.boundingBox();
		if (!closeBox) {
			throw new Error("Dialog close button bounding box not found");
		}
		await page.mouse.move(
			closeBox.x + closeBox.width / 2,
			closeBox.y + closeBox.height / 2
		);
		await page.mouse.down();
		const closeStyle = await close.evaluate((element) => {
			const style = getComputedStyle(element);
			return {
				duration: style.transitionDuration,
				transform: style.transform,
			};
		});
		await page.mouse.up();
		await popup.waitFor({ state: "detached" });
		await session.detach();

		await setDocsTheme(page, "dark");
		await page.waitForFunction(
			() => document.documentElement.dataset.theme === "dark"
		);
		await trigger.click();
		await popup.waitFor({ state: "visible" });
		const darkNormalBorder = await popup.evaluate(
			(element) => getComputedStyle(element).borderColor
		);
		await page.keyboard.press("Escape");
		await popup.waitFor({ state: "detached" });
		const darkSession = await page.context().newCDPSession(page);
		await darkSession.send("Emulation.setEmulatedMedia", {
			features: [{ name: "prefers-contrast", value: "more" }],
		});
		await trigger.click();
		await popup.waitFor({ state: "visible" });
		const darkPopupBorder = await popup.evaluate(
			(element) => getComputedStyle(element).borderColor
		);
		await page.keyboard.press("Escape");
		await popup.waitFor({ state: "detached" });
		await darkSession.detach();

		expect(preferences).toEqual({ contrast: true, reducedMotion: true });
		expect(popupBorder).not.toBe(normalBorder);
		expect(darkPopupBorder).not.toBe(darkNormalBorder);
		expect(closeStyle.duration).toBe("0s");
		expect(closeStyle.transform).toBe("none");
	});
});
