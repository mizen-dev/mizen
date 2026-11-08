import { type Browser, chromium, type Locator, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const PERCEPTUAL_COLOR = /^(?:oklch|oklab|lab)\(/u;

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
const TRANSPARENT_COLOR_REGEX =
	/transparent|rgba\(0, 0, 0, 0\)|oklab\(0 0 0 \/ 0\)/u;
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
		throw new AggregateError(failures, "Failed to tear down the field test");
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

describe("Field component route", () => {
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
		await page.goto(`${handle.url}/components/field`, {
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

	it("keeps Field associations and native states accessible", async () => {
		const email = page.getByRole("textbox", { exact: true, name: "Email" });
		const emailLabel = page.getByText("Email", { exact: true });
		expect(await email.getAttribute("aria-describedby")).toBeTruthy();
		expect(
			await emailLabel.evaluate((element) => {
				const style = getComputedStyle(element);
				return [style.fontSize, style.fontWeight, style.lineHeight];
			})
		).toEqual(["14px", "500", "20px"]);
		expect(
			await page.getByText("We only use this for account updates.").count()
		).toBe(1);

		const project = page
			.locator("#InvalidField")
			.getByRole("textbox", { exact: true, name: "Project name" });
		expect(await project.getAttribute("aria-invalid")).toBe("true");
		expect(await project.getAttribute("data-invalid")).not.toBeNull();
		await page.mouse.move(0, 0);
		await project.and(page.locator(":not([data-hovered])")).waitFor();
		const invalidColors = await project.evaluate((element) => {
			const style = getComputedStyle(element);
			return [style.borderColor, style.backgroundColor, style.boxShadow];
		});
		expect(invalidColors[1]).toBe(
			await page
				.getByRole("textbox", { exact: true, name: "Email" })
				.evaluate((element) => getComputedStyle(element).backgroundColor)
		);
		expect(invalidColors[0]).not.toMatch(TRANSPARENT_COLOR_REGEX);
		expect(invalidColors[2]).toBe(
			await email.evaluate((element) => getComputedStyle(element).boxShadow)
		);

		await focusWithKeyboard(email);
		await expect
			.poll(() =>
				email.evaluate((element) => getComputedStyle(element).outlineColor)
			)
			.not.toMatch(TRANSPARENT_COLOR_REGEX);
		await focusWithKeyboard(project);
		await expect
			.poll(() =>
				project.evaluate((element) => getComputedStyle(element).outlineColor)
			)
			.not.toMatch(TRANSPARENT_COLOR_REGEX);
		const invalidFocus = await project.evaluate((element) => {
			const style = getComputedStyle(element);
			return [style.outlineWidth, style.outlineOffset];
		});
		expect(invalidFocus).toEqual(["3px", "0px"]);
		expect(await page.getByText("Enter a project name.").count()).toBe(1);

		const compact = page.getByRole("textbox", { name: "Compact control" });
		expect(await compact.getAttribute("aria-labelledby")).toBeTruthy();
		expect(await compact.isEditable()).toBe(false);
		expect(
			await compact.evaluate((element) => getComputedStyle(element).height)
		).toBe("32px");

		const workspace = page.getByRole("textbox", { name: "Workspace" });
		expect(await workspace.isDisabled()).toBe(true);
		const disabledRest = await workspace.evaluate((element) => {
			const style = getComputedStyle(element);
			return [style.borderColor, style.boxShadow];
		});
		const disabledInvalid = await workspace.evaluate((element) => {
			element.setAttribute("aria-invalid", "true");
			element.setAttribute("data-invalid", "");
			const style = getComputedStyle(element);
			return [style.borderColor, style.boxShadow];
		});
		expect(disabledInvalid).toEqual(disabledRest);

		const reference = page.getByRole("textbox", { name: "Reference" });
		expect(await reference.isEditable()).toBe(false);
		await reference.focus();
		expect(
			await reference.evaluate((element) => document.activeElement === element)
		).toBe(true);

		expect(await page.getByRole("textbox", { name: "Small" }).count()).toBe(1);
		expect(await page.getByRole("textbox", { name: "Large" }).count()).toBe(1);
		await page.goto(`${handle.url}/internal/theme-fixtures`, {
			waitUntil: "networkidle",
		});
		const darkField = page.getByRole("textbox", { name: "Dark field" });
		const darkColors = await darkField.evaluate((element) => {
			const style = getComputedStyle(element);
			return [style.backgroundColor, style.color];
		});
		expect(darkColors[1]).toMatch(PERCEPTUAL_COLOR);
		const darkPanel = darkField.locator("../..");
		const darkPanelColor = await darkPanel.evaluate(
			(element) => getComputedStyle(element).backgroundColor
		);
		expect(darkPanelColor).toMatch(PERCEPTUAL_COLOR);
		expect(darkPanelColor).not.toBe(
			await page.evaluate(
				() =>
					getComputedStyle(document.querySelector("main") ?? document.body)
						.backgroundColor
			)
		);
	});
});
