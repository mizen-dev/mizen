import { type Browser, chromium, type Locator, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const PERCEPTUAL_COLOR = /^(?:oklch|oklab|lab)\(/u;

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
const transparentColor = /rgba\(0, 0, 0, 0\)|transparent/u;
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
		throw new AggregateError(failures, "Failed to tear down the textarea test");
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

function textareaExample(title: string): Locator {
	return page.getByRole("region", {
		exact: true,
		name: `Textarea: ${title} example`,
	});
}

describe("Textarea component route", () => {
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
		await page.goto(`${handle.url}/components/textarea`, {
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

	it("renders Textarea with native sizing and field states", async () => {
		const message = textareaExample("Project handoff").getByRole("textbox", {
			exact: true,
			name: "Message",
		});
		expect(
			await message.evaluate((element) => [
				element.tagName,
				getComputedStyle(element).minHeight,
				getComputedStyle(element).resize,
			])
		).toEqual(["TEXTAREA", "128px", "vertical"]);
		expect(await message.getAttribute("aria-labelledby")).toBeTruthy();
		expect(await message.getAttribute("aria-describedby")).toBeTruthy();

		await message.evaluate((element) => element.blur());
		await page.mouse.move(0, 0);
		await expect.poll(() => message.getAttribute("data-hovered")).toBeNull();
		const rest = await message.evaluate((element) => {
			const style = getComputedStyle(element);
			return [style.backgroundColor, style.borderColor, style.boxShadow];
		});
		await message.hover();
		await expect
			.poll(() =>
				message.evaluate((element) => getComputedStyle(element).borderColor)
			)
			.not.toBe(rest[1]);
		const hover = await message.evaluate((element) => {
			const style = getComputedStyle(element);
			return [style.backgroundColor, style.boxShadow];
		});
		expect(hover).toEqual([rest[0], rest[2]]);

		await page.mouse.move(0, 0);
		await textareaExample("Project handoff")
			.getByText("Message", { exact: true })
			.hover();
		await expect
			.poll(() =>
				message.evaluate((element) => {
					const style = getComputedStyle(element);
					return [style.backgroundColor, style.borderColor, style.boxShadow];
				})
			)
			.toEqual(rest);

		await focusWithKeyboard(message);
		expect(
			await message.evaluate((element) => {
				const style = getComputedStyle(element);
				return [style.outlineColor, style.outlineWidth, style.outlineOffset];
			})
		).toEqual([expect.stringMatching(PERCEPTUAL_COLOR), "1px", "-1px"]);

		const readOnly = textareaExample("Read-only note").getByRole("textbox");
		expect(await readOnly.isEditable()).toBe(false);
		expect(
			await readOnly.evaluate((element) => getComputedStyle(element).fontSize)
		).toBe("13px");
		await page.setViewportSize({ height: 800, width: 320 });
		expect(
			await readOnly.evaluate((element) => getComputedStyle(element).fontSize)
		).toBe("16px");
		expect(
			await readOnly.evaluate((element) => getComputedStyle(element).minHeight)
		).toBe("96px");
		const disabled = textareaExample("Disabled note").getByRole("textbox");
		expect(await disabled.isDisabled()).toBe(true);
		expect(
			await disabled.evaluate((el) => getComputedStyle(el).boxShadow)
		).toBe("none");

		const invalid = textareaExample("Message details").getByRole("textbox");
		expect(await invalid.getAttribute("aria-invalid")).toBe("true");
		expect(await invalid.getAttribute("data-invalid")).not.toBeNull();
		expect(await invalid.getAttribute("rows")).toBe("4");
		const invalidState = await invalid.evaluate((element) => {
			const style = getComputedStyle(element);
			return [style.minHeight, style.borderColor, style.boxShadow];
		});
		expect(invalidState[0]).toBe("160px");
		expect(invalidState[1]).not.toMatch(transparentColor);
		expect(invalidState[2]).toBe(rest[2]);
		await invalid.hover();
		await invalid.evaluate(async (element) => {
			await Promise.allSettled(
				element.getAnimations().map((animation) => animation.finished)
			);
		});
		await expect
			.poll(() => invalid.evaluate((el) => getComputedStyle(el).borderColor))
			.toBe(invalidState[1]);
	});
});
