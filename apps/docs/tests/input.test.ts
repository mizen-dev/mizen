import { type Browser, chromium, type Locator, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

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
		throw new AggregateError(failures, "Failed to tear down the input test");
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

function fieldPreview(): Locator {
	return page.getByRole("region", { exact: true, name: "Field preview" });
}

function fieldExample(title: string): Locator {
	return page.getByRole("region", {
		exact: true,
		name: `Field: ${title} example`,
	});
}

describe("Input component contracts", () => {
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

	it("keeps Input geometry stable and small text readable across viewports", async () => {
		const sizeInputs: Record<string, Locator> = {
			Default: fieldPreview().getByPlaceholder("you@example.com"),
			Large: fieldExample("Large").getByPlaceholder("Large"),
			Small: fieldExample("Small").getByPlaceholder("Small"),
		};
		const assertSizes = async (
			sizes: readonly (readonly [string, string, string, string])[]
		) => {
			const actual = await Promise.all(
				sizes.map(([size]) => {
					const input = sizeInputs[size];
					return input.evaluate((element) => {
						const style = getComputedStyle(element);
						return [style.height, style.borderStartStartRadius, style.fontSize];
					});
				})
			);
			expect(actual).toEqual(
				sizes.map(([, height, radius, fontSize]) => [height, radius, fontSize])
			);
		};
		await page.setViewportSize({ height: 800, width: 320 });
		await assertSizes([
			["Small", "32px", "12px", "16px"],
			["Default", "36px", "16px", "16px"],
			["Large", "40px", "16px", "16px"],
		]);
		await page.setViewportSize({ height: 800, width: 1024 });
		await assertSizes([
			["Small", "32px", "12px", "14px"],
			["Default", "36px", "16px", "16px"],
			["Large", "40px", "16px", "16px"],
		]);
		const email = fieldPreview().getByRole("textbox", { name: "Email" });
		await focusWithKeyboard(email);
		expect(
			await email.evaluate((element) => getComputedStyle(element).outlineWidth)
		).toBe("3px");
		expect(
			await email.evaluate((element) => getComputedStyle(element).outlineOffset)
		).toBe("0px");
	});

	it("gives inputs quiet surface and state feedback", async () => {
		const email = fieldPreview().getByRole("textbox", { name: "Email" });
		await email.evaluate((element) => element.blur());
		await page.mouse.move(0, 0);
		await email.and(page.locator(":not([data-hovered])")).waitFor();
		const rest = await email.evaluate((element) => {
			const style = getComputedStyle(element);
			return [style.backgroundColor, style.borderColor, style.boxShadow];
		});
		expect(rest[1]).toMatch(transparentColor);
		expect(rest[2]).not.toBe("none");
		await email.hover();
		await email.and(page.locator("[data-hovered='true']")).waitFor();
		await expect
			.poll(() =>
				email.evaluate((element) => getComputedStyle(element).borderColor)
			)
			.not.toBe(rest[1]);
		const inputHoverState = await email.evaluate((element) => {
			const style = getComputedStyle(element);
			return [style.backgroundColor, style.boxShadow];
		});
		expect(inputHoverState).toEqual([rest[0], rest[2]]);
		await page.mouse.move(0, 0);
		await email.and(page.locator(":not([data-hovered])")).waitFor();
		await expect
			.poll(() =>
				email.evaluate((element) => getComputedStyle(element).borderColor)
			)
			.toBe(rest[1]);
		await fieldPreview().getByText("Email", { exact: true }).hover();
		expect(await email.getAttribute("data-hovered")).toBeNull();
		const labelHoverState = await email.evaluate((element) => {
			const style = getComputedStyle(element);
			return [style.borderColor, style.boxShadow];
		});
		expect(labelHoverState).toEqual(rest.slice(1));

		const workspace = fieldExample("Workspace").getByRole("textbox", {
			name: "Workspace",
		});
		const disabledRest = await workspace.evaluate((element) => {
			const style = getComputedStyle(element);
			return [style.backgroundColor, style.borderColor, style.boxShadow];
		});
		await workspace.hover();
		expect(
			await workspace.evaluate((element) => {
				const style = getComputedStyle(element);
				return [style.backgroundColor, style.borderColor, style.boxShadow];
			})
		).toEqual(disabledRest);

		const reference = fieldExample("Reference").getByRole("textbox", {
			name: "Reference",
		});
		const readOnlyRest = await reference.evaluate((element) => {
			const style = getComputedStyle(element);
			return [style.backgroundColor, style.borderColor, style.boxShadow];
		});
		expect(readOnlyRest[0]).toBe(rest[0]);
		await reference.hover();
		expect(
			await reference.evaluate((element) => {
				const style = getComputedStyle(element);
				return [style.backgroundColor, style.borderColor, style.boxShadow];
			})
		).toEqual(readOnlyRest);
		await reference.focus();
		expect(
			await reference.evaluate((element) => document.activeElement === element)
		).toBe(true);
	});

	it("retains the error border on hover and styles inherited disabled fields", async () => {
		const invalid = fieldExample("Validation error").getByRole("textbox", {
			name: "Project name",
		});
		await page.mouse.move(0, 0);
		const border = await invalid.evaluate(
			(el) => getComputedStyle(el).borderColor
		);
		await invalid.hover();
		await invalid.evaluate(async (element) => {
			await Promise.allSettled(
				element.getAnimations().map((animation) => animation.finished)
			);
		});
		await expect
			.poll(() => invalid.evaluate((el) => getComputedStyle(el).borderColor))
			.toBe(border);
		await page.goto(`${handle.url}/docs/components/input`, {
			waitUntil: "networkidle",
		});
		const disabled = page
			.getByRole("region", { exact: true, name: "Input: Disabled example" })
			.getByRole("textbox", { exact: true, name: "Managed owner" });
		const disabledStyle = await disabled.evaluate((el) => {
			const style = getComputedStyle(el);
			return [style.backgroundColor, style.color, style.boxShadow];
		});
		expect(disabledStyle[2]).toBe("none");
		await page.goto(`${handle.url}/docs/components/fieldset`, {
			waitUntil: "networkidle",
		});
		const inherited = page
			.getByRole("region", {
				exact: true,
				name: "Fieldset: Managed billing example",
			})
			.getByRole("textbox", { name: "Tax identifier" });
		expect(await inherited.isDisabled()).toBe(true);
		expect(
			await inherited.evaluate((el) => {
				const style = getComputedStyle(el);
				return [style.backgroundColor, style.color, style.boxShadow];
			})
		).toEqual(disabledStyle);
	});
});
