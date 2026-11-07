import { type Browser, chromium, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
	setDocsTheme,
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

interface ThemeMutation {
	readonly attr: string;
	readonly oldVal: string | null;
	readonly val: string | null;
}

declare global {
	interface Window {
		__themeMutations?: ThemeMutation[];
	}
}

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
let handle: TestServerHandle;
let browser: Browser;

const getRootTheme = (p: Page) =>
	p.evaluate(() => document.documentElement.getAttribute("data-theme"));
const getStorageTheme = (p: Page) =>
	p.evaluate(() => localStorage.getItem("mizen-theme"));

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
		throw new AggregateError(failures, "Failed to tear down the theme test");
	}
}

describe("Theme browser integration and first-paint behavior", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
	}, 120_000);

	afterAll(async () => {
		const results = await Promise.allSettled([
			Promise.resolve().then(() => browser?.close()),
			Promise.resolve().then(() => teardownTestServer(handle)),
		]);
		throwTeardownFailures(results);
	}, 120_000);

	it("applies persisted dark mode on first navigation before paint and renders dark tokens", async () => {
		const lightContext = await browser.newContext();
		await lightContext.addInitScript(() => {
			localStorage.setItem("mizen-theme", "light");
		});
		const lightPage = await lightContext.newPage();
		await lightPage.goto(`${handle.url}/components/dialog`, {
			waitUntil: "domcontentloaded",
		});
		const lightHeaderBg = await lightPage.evaluate(() => {
			const header = document.querySelector("header > div");
			return header ? window.getComputedStyle(header).backgroundColor : "";
		});
		await lightContext.close();

		const darkContext = await browser.newContext();
		await darkContext.addInitScript(() => {
			localStorage.setItem("mizen-theme", "dark");
		});
		const darkPage = await darkContext.newPage();
		await darkPage.goto(`${handle.url}/components/dialog`, {
			waitUntil: "domcontentloaded",
		});

		const [themeAttr, colorScheme, darkHeaderBg] = await darkPage.evaluate(
			() => {
				const header = document.querySelector("header > div");
				return [
					document.documentElement.getAttribute("data-theme"),
					document.documentElement.style.colorScheme,
					header ? window.getComputedStyle(header).backgroundColor : "",
				];
			}
		);

		expect(themeAttr).toBe("dark");
		expect(colorScheme).toBe("dark");
		expect(darkHeaderBg).not.toBe("rgba(0, 0, 0, 0)");
		expect(darkHeaderBg).not.toBe("transparent");
		expect(lightHeaderBg).not.toBe("rgba(0, 0, 0, 0)");
		expect(lightHeaderBg).not.toBe("transparent");
		expect(darkHeaderBg).not.toBe(lightHeaderBg);

		await darkContext.close();
	});

	it("never mutates root data-theme or colorScheme to light during persisted dark hydration", async () => {
		const context = await browser.newContext();
		await context.addInitScript(() => {
			localStorage.setItem("mizen-theme", "dark");
			const log: ThemeMutation[] = [];
			Reflect.set(window, "__themeMutations", log);
			const obs = new MutationObserver((records) => {
				for (const r of records) {
					if (r.target === document.documentElement) {
						if (r.attributeName === "data-theme") {
							log.push({
								attr: "data-theme",
								oldVal: r.oldValue,
								val: document.documentElement.getAttribute("data-theme"),
							});
						} else if (r.attributeName === "style") {
							log.push({
								attr: "style",
								oldVal: r.oldValue,
								val: document.documentElement.style.colorScheme,
							});
						}
					}
				}
			});
			obs.observe(document, {
				attributeFilter: ["data-theme", "style"],
				attributeOldValue: true,
				attributes: true,
				subtree: true,
			});
		});

		const page = await context.newPage();
		await page.goto(`${handle.url}/components/dialog`, {
			waitUntil: "networkidle",
		});
		// Already dark, so this only waits for hydration.
		await setDocsTheme(page, "dark");

		const log = await page.evaluate(() => window.__themeMutations ?? []);
		expect(log.length).toBeGreaterThan(0);
		const lightTransitions = log.filter((entry) => {
			if (entry.attr === "data-theme") {
				return entry.val === "light" || entry.oldVal === "light";
			}
			const hasLightVal =
				typeof entry.val === "string" && entry.val.includes("light");
			const hasLightOld =
				typeof entry.oldVal === "string" && entry.oldVal.includes("light");
			return hasLightVal || hasLightOld;
		});
		expect(lightTransitions).toEqual([]);
		await context.close();
	});

	it("cycles the theme toggle and persists each choice", async () => {
		const page = await browser.newPage();
		await page.goto(`${handle.url}/components/dialog`, {
			waitUntil: "networkidle",
		});

		await setDocsTheme(page, "light");
		expect(await getRootTheme(page)).toBe("light");
		expect(await getStorageTheme(page)).toBe("light");

		await setDocsTheme(page, "dark");
		expect(await getRootTheme(page)).toBe("dark");
		expect(await getStorageTheme(page)).toBe("dark");

		await setDocsTheme(page, "system");
		expect(await getStorageTheme(page)).toBe("system");

		await page.close();
	});

	it("responds to emulated system color scheme when preference is system", async () => {
		const page = await browser.newPage();
		await page.goto(`${handle.url}/components/dialog`, {
			waitUntil: "networkidle",
		});

		await setDocsTheme(page, "system");

		await page.emulateMedia({ colorScheme: "dark" });
		await page.waitForFunction(
			() => document.documentElement.getAttribute("data-theme") === "dark"
		);
		expect(await getRootTheme(page)).toBe("dark");

		await page.emulateMedia({ colorScheme: "light" });
		await page.waitForFunction(
			() => document.documentElement.getAttribute("data-theme") === "light"
		);
		expect(await getRootTheme(page)).toBe("light");

		await page.close();
	});

	it("inherits dark mode styles in body dialog portal and differs from light mode", async () => {
		const page = await browser.newPage();
		await page.goto(`${handle.url}/components/dialog`, {
			waitUntil: "networkidle",
		});

		const trigger = page.getByRole("button", {
			exact: true,
			name: "Edit project details",
		});
		const popup = page.getByRole("dialog");

		await setDocsTheme(page, "light");
		await trigger.click();
		await popup.waitFor({ state: "visible" });
		const lightPopupBg = await popup.evaluate(
			(el) => window.getComputedStyle(el).backgroundColor
		);
		expect(lightPopupBg).not.toBe("rgba(0, 0, 0, 0)");
		expect(lightPopupBg).not.toBe("transparent");

		await page.keyboard.press("Escape");
		await popup.waitFor({ state: "hidden" });

		await setDocsTheme(page, "dark");
		await trigger.click();
		await popup.waitFor({ state: "visible" });
		const darkPopupBg = await popup.evaluate(
			(el) => window.getComputedStyle(el).backgroundColor
		);
		expect(darkPopupBg).not.toBe("rgba(0, 0, 0, 0)");
		expect(darkPopupBg).not.toBe("transparent");

		expect(darkPopupBg).not.toBe(lightPopupBg);

		await page.close();
	});

	it("switches theme atomically while dialog is open with immediate settled token colors and active spatial motion", async () => {
		const page = await browser.newPage();
		await page.goto(`${handle.url}/components/dialog`, {
			waitUntil: "networkidle",
		});

		await setDocsTheme(page, "light");

		const trigger = page.getByRole("button", {
			exact: true,
			name: "Edit project details",
		});
		await trigger.click();

		const popup = page.getByRole("dialog");
		await popup.waitFor({ state: "visible" });

		await page.waitForFunction(() => {
			const el = document.querySelector('[role="dialog"]');
			return (
				el !== null &&
				!el.hasAttribute("data-starting-style") &&
				window.getComputedStyle(el).opacity === "1"
			);
		});

		const lightColors = await page.evaluate(() => {
			const dialog = document.querySelector('[role="dialog"]');
			if (!dialog) {
				throw new Error("Dialog not found");
			}
			const buttons = Array.from(dialog.querySelectorAll("button"));
			const cancel = buttons.find((b) => b.textContent?.includes("Cancel"));
			const save = buttons.find((b) => b.textContent?.includes("Save changes"));
			const input = dialog.querySelector("input");
			if (cancel === undefined || save === undefined || input === null) {
				throw new Error("Descendants not found");
			}
			return {
				cancelBorder: window.getComputedStyle(cancel).borderColor,
				cancelColor: window.getComputedStyle(cancel).color,
				inputBg: window.getComputedStyle(input).backgroundColor,
				// Press surfaces paint their fill on ::before.
				saveBg: window.getComputedStyle(save, "::before").backgroundColor,
			};
		});

		const immediateDarkSample = await page.evaluate(() => {
			// A discrete click from light, so React commits dark before this returns.
			const toggle = document.querySelector<HTMLButtonElement>(
				'button[aria-label^="Theme:"]'
			);
			if (!toggle) {
				throw new Error("Theme toggle not found");
			}
			toggle.click();

			const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
			if (!dialog) {
				throw new Error("Dialog not found");
			}
			const buttons = Array.from(dialog.querySelectorAll("button"));
			const cancel = buttons.find((b) => b.textContent?.includes("Cancel"));
			const save = buttons.find((b) => b.textContent?.includes("Save changes"));
			const input = dialog.querySelector("input");
			if (cancel === undefined || save === undefined || input === null) {
				throw new Error("Descendants not found");
			}

			const cancelStyle = window.getComputedStyle(cancel);
			const saveStyle = window.getComputedStyle(save, "::before");
			const inputStyle = window.getComputedStyle(input);
			const popupStyle = window.getComputedStyle(dialog);

			return {
				cancelBorder: cancelStyle.borderColor,
				cancelColor: cancelStyle.color,
				inputBg: inputStyle.backgroundColor,
				popupTransitionProperty: popupStyle.transitionProperty,
				popupVisible:
					popupStyle.display !== "none" &&
					popupStyle.visibility !== "hidden" &&
					popupStyle.opacity === "1",
				saveBg: saveStyle.backgroundColor,
			};
		});

		await page.waitForFunction(
			() => document.getElementById("mizen-theme-transition-guard") === null
		);

		const settledDarkColors = await page.evaluate(() => {
			const dialog = document.querySelector('[role="dialog"]');
			if (!dialog) {
				throw new Error("Dialog not found");
			}
			const buttons = Array.from(dialog.querySelectorAll("button"));
			const cancel = buttons.find((b) => b.textContent?.includes("Cancel"));
			const save = buttons.find((b) => b.textContent?.includes("Save changes"));
			const input = dialog.querySelector("input");
			if (cancel === undefined || save === undefined || input === null) {
				throw new Error("Descendants not found");
			}
			return {
				cancelBorder: window.getComputedStyle(cancel).borderColor,
				cancelColor: window.getComputedStyle(cancel).color,
				inputBg: window.getComputedStyle(input).backgroundColor,
				// Press surfaces paint their fill on ::before.
				saveBg: window.getComputedStyle(save, "::before").backgroundColor,
			};
		});

		expect(lightColors.cancelColor).not.toBe(settledDarkColors.cancelColor);
		expect(lightColors.inputBg).not.toBe(settledDarkColors.inputBg);
		expect(lightColors.saveBg).not.toBe(settledDarkColors.saveBg);

		expect(immediateDarkSample.cancelColor).toBe(settledDarkColors.cancelColor);
		expect(immediateDarkSample.cancelBorder).toBe(
			settledDarkColors.cancelBorder
		);
		expect(immediateDarkSample.inputBg).toBe(settledDarkColors.inputBg);
		expect(immediateDarkSample.saveBg).toBe(settledDarkColors.saveBg);

		expect(immediateDarkSample.popupVisible).toBe(true);
		expect(
			immediateDarkSample.popupTransitionProperty.includes("transform") ||
				immediateDarkSample.popupTransitionProperty.includes("opacity")
		).toBe(true);

		await page.close();
	});
});
