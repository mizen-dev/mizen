import { type Browser, chromium, type Locator, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const transparentColor = /rgba\(0, 0, 0, 0\)|transparent/;
const checkboxLiftTransform = /matrix\(1, 0, 0, 1, 0, -1\)/;
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
		throw new AggregateError(failures, "Failed to tear down the checkbox test");
	}
}

async function focusWithKeyboard(locator: Locator): Promise<void> {
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

describe("Checkbox component route", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		// Settled focus rings: the ring grows in over 200ms otherwise.
		await page.emulateMedia({ reducedMotion: "reduce" });
		page.setDefaultTimeout(6000);
		await page.goto(`${handle.url}/components/checkbox`, {
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

	it("renders Checkbox with native form state and accessible feedback", async () => {
		const checked = page.getByRole("checkbox", {
			exact: true,
			name: "Product updates",
		});
		expect(await checked.getAttribute("data-checked")).not.toBeNull();
		expect(await checked.getAttribute("aria-checked")).toBe("true");
		const hiddenInput = page.locator(
			"input[type='checkbox'][name='product-updates']"
		);
		expect(await hiddenInput.count()).toBe(1);
		expect(await hiddenInput.isChecked()).toBe(true);
		expect(await hiddenInput.getAttribute("value")).toBe("yes");
		expect(
			await checked
				.locator("span")
				.evaluate((element) => getComputedStyle(element).transitionProperty)
		).toContain("transform");

		await checked.evaluate((element) => element.blur());
		await page.mouse.move(0, 0);
		await expect
			.poll(() =>
				checked.evaluate((element) => getComputedStyle(element).opacity)
			)
			.toBe("1");
		const rest = await checked.evaluate((element) => {
			const style = getComputedStyle(element);
			return [
				style.backgroundColor,
				style.borderColor,
				style.boxShadow,
				style.opacity,
			];
		});
		await checked.hover();
		await checked.evaluate(async (element) => {
			await Promise.allSettled(
				element.getAnimations().map((animation) => animation.finished)
			);
		});
		await expect
			.poll(() =>
				checked.evaluate((element) => getComputedStyle(element).opacity)
			)
			.toBe("1");
		expect(
			await checked.evaluate((element) => getComputedStyle(element).opacity)
		).toBe("1");
		expect(
			await checked.evaluate((element) => getComputedStyle(element).boxShadow)
		).toBe("none");
		expect(
			await checked.evaluate((element) => getComputedStyle(element).borderColor)
		).toBe(rest[1]);
		await checked.press("Space");
		expect(await checked.getAttribute("aria-checked")).toBe("false");
		await checked.locator("svg").waitFor({ state: "detached" });
		expect(await checked.locator("svg").count()).toBe(0);

		const mixed = page.getByRole("checkbox", {
			exact: true,
			name: "Team settings",
		});
		expect(await mixed.getAttribute("aria-checked")).toBe("mixed");
		expect(await mixed.locator("svg").getAttribute("aria-hidden")).toBe("true");

		const disabled = page.getByRole("checkbox", {
			exact: true,
			name: "Disabled option",
		});
		expect(await disabled.getAttribute("data-disabled")).not.toBeNull();
		expect(await disabled.getAttribute("aria-disabled")).toBe("true");
		const disabledOpacity = await disabled.evaluate(
			(element) => getComputedStyle(element).opacity
		);
		await disabled.hover();
		expect(
			await disabled.evaluate((element) => getComputedStyle(element).opacity)
		).toBe(disabledOpacity);
		const disabledInvalid = await disabled.evaluate((element) => {
			element.setAttribute("aria-invalid", "true");
			element.setAttribute("data-invalid", "");
			const style = getComputedStyle(element);
			return [style.borderColor, style.boxShadow];
		});
		expect(disabledInvalid[0]).toMatch(transparentColor);
		expect(disabledInvalid[1]).not.toContain("0px 0px 0px 1px");

		const invalid = page.getByRole("checkbox", {
			exact: true,
			name: "Invalid option",
		});
		expect(await invalid.getAttribute("aria-invalid")).toBe("true");
		expect(await invalid.getAttribute("data-invalid")).not.toBeNull();
		expect(
			await invalid.evaluate((element) => getComputedStyle(element).boxShadow)
		).toContain("0px 0px 0px 1px");
		const uncheckedInvalidBorder = await invalid.evaluate(
			(element) => getComputedStyle(element).borderColor
		);
		expect(uncheckedInvalidBorder).toContain("lab(");
		await invalid.click();
		await expect.poll(() => invalid.getAttribute("aria-checked")).toBe("true");
		expect(await invalid.getAttribute("aria-checked")).toBe("true");
		expect(
			await invalid.evaluate((element) => getComputedStyle(element).borderColor)
		).toBe(uncheckedInvalidBorder);

		expect(
			await page
				.getByRole("checkbox", { exact: true, name: "Small option" })
				.evaluate((element) => element.getBoundingClientRect().width)
		).toBe(16);
		expect(
			await page
				.getByRole("checkbox", { exact: true, name: "Large option" })
				.evaluate((element) => element.getBoundingClientRect().width)
		).toBe(20);
		const readOnly = page.getByRole("checkbox", {
			exact: true,
			name: "Read-only option",
		});
		expect(await readOnly.getAttribute("data-readonly")).not.toBeNull();
		await focusWithKeyboard(readOnly);
		await readOnly.press("Space");
		expect(await readOnly.getAttribute("aria-checked")).toBe("true");
		expect(
			await readOnly.evaluate((element) => getComputedStyle(element).transform)
		).toMatch(checkboxLiftTransform);
		const readOnlyOpacity = await readOnly.evaluate(
			(element) => getComputedStyle(element).opacity
		);
		await readOnly.hover();
		expect(
			await readOnly.evaluate((element) => getComputedStyle(element).opacity)
		).toBe(readOnlyOpacity);

		await focusWithKeyboard(checked);
		expect(
			await checked.evaluate((element) => {
				const style = getComputedStyle(element);
				return [style.outlineColor, style.outlineWidth, style.outlineOffset];
			})
		).toEqual([expect.stringContaining("lab("), "3px", "0px"]);
	});
	it.each(["light", "dark"] as const)(
		"uses stronger checked and mixed indicators in %s",
		async (theme) => {
			await page.emulateMedia({ colorScheme: theme });
			await page.goto(`${handle.url}/components/checkbox`, {
				waitUntil: "networkidle",
			});
			// The custom mark: a 2-unit stroke in a 16-unit box.
			const icons = page.locator('[role="checkbox"] svg path');
			const strokes = await icons.evaluateAll((elements) =>
				elements.map((element) => getComputedStyle(element).strokeWidth)
			);
			expect(strokes.length).toBeGreaterThanOrEqual(3);
			expect(strokes.every((stroke) => stroke === "2px")).toBe(true);
		}
	);
});
