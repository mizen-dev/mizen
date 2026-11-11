import { type Browser, chromium, type Locator, type Page } from "playwright";
import { expect as expectLocator } from "playwright/test";
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
		throw new AggregateError(failures, "Failed to tear down the select test");
	}
}

async function focusWithKeyboard(locator: Locator): Promise<void> {
	// A parked pointer must not highlight an option when the popup opens.
	await page.mouse.move(0, 0);
	await locator.focus();
	await page.keyboard.press("Shift+Tab");
	await page.keyboard.press("Tab");
	expect(
		await locator.evaluate(
			(element) =>
				document.activeElement === element && element.matches(":focus-visible")
		)
	).toBe(true);
}

function readPopupSurfaceBackground(list: HTMLElement): string {
	const surface = list.parentElement;
	if (!surface) {
		throw new Error("Select popup surface not found");
	}
	return getComputedStyle(surface).backgroundColor;
}

describe("Select component route", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
	}, 120_000);

	beforeEach(async () => {
		page = await browser.newPage();
		// Settled focus rings: the ring grows in over 200ms otherwise.
		await page.emulateMedia({ reducedMotion: "reduce" });
		page.setDefaultTimeout(6000);
		await page.goto(`${handle.url}/components/select`, {
			waitUntil: "networkidle",
		});
	}, 120_000);

	afterEach(() => page?.close());

	afterAll(async () => {
		const results = await Promise.allSettled([
			Promise.resolve().then(() => browser?.close()),
			Promise.resolve().then(() => teardownTestServer(handle)),
		]);
		throwTeardownFailures(results);
	}, 120_000);

	it("renders Select with native state, sizes, and keyboard selection", async () => {
		const preview = page.locator("#WorkspaceSelect");
		const workspace = preview.getByRole("combobox", {
			exact: true,
			name: "Workspace",
		});
		await page.emulateMedia({ reducedMotion: "reduce" });
		const invalid = page
			.locator("#SelectRequiredWorkspace")
			.getByRole("combobox", {
				exact: true,
				name: "Required workspace",
			});
		const invalidBorder = await invalid.evaluate(
			(element) => getComputedStyle(element).borderColor
		);
		expect(invalidBorder).not.toBe("rgba(0, 0, 0, 0)");
		await invalid.hover();
		expect(
			await invalid.evaluate((element) => getComputedStyle(element).borderColor)
		).toBe(invalidBorder);
		const managed = page.locator("#SelectManagedSelect").getByRole("combobox", {
			exact: true,
			name: "Managed select",
		});
		expect(await managed.isDisabled()).toBe(true);
		expect(
			await managed.evaluate((element) => getComputedStyle(element).cursor)
		).toBe("not-allowed");
		await page.emulateMedia({ reducedMotion: "no-preference" });
		const nativeInput = preview.locator("input[name='workspace']");
		expect(await workspace.textContent()).toContain("Personal");
		expect(await nativeInput.getAttribute("value")).toBe("personal");
		const selectedIcon = workspace.locator("svg");
		expect(await selectedIcon.count()).toBe(1);
		expect(
			await selectedIcon.evaluate((element) => {
				const bounds = element.getBoundingClientRect();
				return [
					bounds.width,
					bounds.height,
					getComputedStyle(element).flexShrink,
				];
			})
		).toEqual([16, 16, "0"]);

		await page.mouse.move(0, 0);
		await focusWithKeyboard(workspace);
		await expect
			.poll(() =>
				workspace.evaluate((element) => {
					const style = getComputedStyle(element);
					return [style.outlineWidth, style.outlineOffset];
				})
			)
			.toEqual(["1px", "-1px"]);
		await workspace.press("Enter");
		const listbox = page.getByRole("listbox");
		await listbox.waitFor({ state: "visible" });
		expect(await listbox.isVisible()).toBe(true);
		// Highlighting precedes focus transfer; wait until the selected option
		// receives keyboard input before navigating.
		await expectLocator(
			listbox.getByRole("option", { exact: true, name: "Personal" })
		).toBeFocused();
		await page.keyboard.press("Home");
		await page
			.locator('[role="option"][data-highlighted]', { hasText: "Personal" })
			.waitFor();
		await page.keyboard.press("ArrowDown");
		await page
			.locator('[role="option"][data-highlighted]', {
				hasText: "Product team",
			})
			.waitFor();
		await page.keyboard.press("Enter");
		await listbox.waitFor({ state: "hidden" });
		expect(await nativeInput.getAttribute("value")).toBe("team");
		expect(await workspace.textContent()).toContain("Product team");
		expect(await selectedIcon.count()).toBe(1);

		const readSizes = () =>
			Promise.all(
				["Workspace", "Small select", "Large select"].map((name) =>
					page
						.getByRole("combobox", { exact: true, name })
						.last()
						.evaluate((element) => element.getBoundingClientRect().height)
				)
			);
		await page.setViewportSize({ height: 800, width: 375 });
		const narrowSizes = await readSizes();
		await page.setViewportSize({ height: 800, width: 1024 });
		const wideSizes = await readSizes();
		expect(narrowSizes).toEqual([32, 28, 40]);
		expect(wideSizes).toEqual(narrowSizes);
		expect(
			await page
				.getByRole("combobox", { exact: true, name: "Managed select" })
				.isDisabled()
		).toBe(true);

		const readOnly = page.getByRole("combobox", {
			exact: true,
			name: "Read-only select",
		});
		const readOnlyInput = readOnly.locator("xpath=following-sibling::input[1]");
		expect(await readOnlyInput.inputValue()).toBe("");
		await readOnly.press("Enter");
		const readOnlyListbox = page.locator(
			'[role="listbox"][aria-readonly="true"]'
		);
		await readOnlyListbox.waitFor({ state: "visible" });
		expect(await readOnlyListbox.isVisible()).toBe(true);
		await page.keyboard.press("ArrowDown");
		await page.keyboard.press("Enter");
		expect(await readOnlyInput.inputValue()).toBe("");
		await page.keyboard.press("Escape");
		await readOnlyListbox.waitFor({ state: "hidden" });
	});

	it("keeps a locally themed portal scoped through root theme changes", async () => {
		await setDocsTheme(page, "light");
		const regularTrigger = page
			.getByRole("region", { exact: true, name: "Select preview" })
			.getByRole("combobox", {
				exact: true,
				name: "Workspace",
			});
		await regularTrigger.click();
		const regularPopup = page.getByRole("listbox");
		await regularPopup.waitFor({ state: "visible" });
		const lightPopupBackground = await regularPopup.evaluate(
			readPopupSurfaceBackground
		);
		expect(lightPopupBackground).not.toBe("rgba(0, 0, 0, 0)");
		await page.keyboard.press("Escape");
		await regularPopup.waitFor({ state: "hidden" });

		await page.goto(`${handle.url}/internal/theme-fixtures`, {
			waitUntil: "networkidle",
		});
		const scopedTrigger = page.getByRole("combobox", {
			exact: true,
			name: "Locally themed workspace",
		});
		await scopedTrigger.click();
		const scopedPopup = page.getByRole("listbox");
		await scopedPopup.waitFor({ state: "visible" });
		const scopedLightBackground = await scopedPopup.evaluate(
			readPopupSurfaceBackground
		);
		expect(scopedLightBackground).not.toBe("rgba(0, 0, 0, 0)");
		expect(scopedLightBackground).not.toBe(lightPopupBackground);
		expect(
			await page.evaluate(() =>
				document.documentElement.getAttribute("data-theme")
			)
		).toBe("light");
		expect(
			await scopedPopup.evaluate((popup) =>
				Boolean(popup.closest('[data-testid="select-local-dark-scope"]'))
			)
		).toBe(true);

		await page.evaluate(() => {
			// A discrete click from light, so React commits dark before this returns.
			const toggle = document.querySelector<HTMLButtonElement>(
				'button[aria-label^="Theme:"]'
			);
			if (!toggle) {
				throw new Error("Theme toggle not found");
			}
			toggle.click();
		});
		await page.waitForFunction(
			() => document.documentElement.getAttribute("data-theme") === "dark"
		);
		const scopedDarkBackground = await scopedPopup.evaluate(
			readPopupSurfaceBackground
		);
		expect(scopedDarkBackground).toBe(scopedLightBackground);

		await page.keyboard.press("Escape");
		await scopedPopup.waitFor({ state: "hidden" });
		expect(
			await scopedTrigger.evaluate(
				(element) => element === document.activeElement
			)
		).toBe(true);
	});
});
