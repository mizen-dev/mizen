import { type Browser, chromium, type Page } from "playwright";
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

function throwTeardownFailures(
	results: readonly PromiseSettledResult<unknown>[]
): void {
	const failures = results
		.filter((r): r is PromiseRejectedResult => r.status === "rejected")
		.map(({ reason }) => reason);
	if (failures.length === 1) {
		throw failures[0];
	}
	if (failures.length > 1) {
		throw new AggregateError(failures, "Failed to tear down form browser test");
	}
}

describe("Form documentation specimen browser integration", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		page.setDefaultTimeout(8000);
	}, 120_000);

	afterAll(async () => {
		const results = await Promise.allSettled([
			Promise.resolve().then(() => browser?.close()),
			Promise.resolve().then(() => teardownTestServer(handle)),
		]);
		throwTeardownFailures(results);
	}, 120_000);

	it("renders Form documentation route with title and specimen", async () => {
		await page.setViewportSize({ height: 900, width: 1280 });
		const response = await page.goto(`${handle.url}/components/form`, {
			waitUntil: "networkidle",
		});
		expect(response?.status()).toBe(200);

		const title = page.getByRole("heading", {
			exact: true,
			level: 1,
			name: "Form",
		});
		expect(await title.isVisible()).toBe(true);

		const form = page
			.getByRole("region", { exact: true, name: "Form preview" })
			.locator("form");
		expect(await form.isVisible()).toBe(true);
	}, 15_000);

	it("maintains stable responsive geometry across desktop and mobile viewports", async () => {
		const readGeometry = (formEl: HTMLFormElement) => {
			const stageEl = formEl.parentElement;
			if (!stageEl) {
				throw new Error("Stage element missing");
			}
			const formRect = formEl.getBoundingClientRect();
			const stageRect = stageEl.getBoundingClientRect();
			const formStyle = getComputedStyle(formEl);
			const stageStyle = getComputedStyle(stageEl);
			const padStart = Number.parseFloat(
				stageStyle.paddingInlineStart || stageStyle.paddingLeft
			);
			const padEnd = Number.parseFloat(
				stageStyle.paddingInlineEnd || stageStyle.paddingRight
			);
			return {
				formLeft: formRect.left,
				formWidth: formRect.width,
				maxInlineSize: formStyle.maxInlineSize || formStyle.maxWidth,
				stageContentWidth:
					stageRect.width -
					padStart -
					padEnd -
					Number.parseFloat(stageStyle.borderLeftWidth) -
					Number.parseFloat(stageStyle.borderRightWidth),
				stageLeft: stageRect.left,
				stagePaddingStart:
					padStart + Number.parseFloat(stageStyle.borderLeftWidth),
				stageWidth: stageRect.width,
			};
		};

		await page.setViewportSize({ height: 900, width: 1280 });
		await page.goto(`${handle.url}/components/form`, {
			waitUntil: "networkidle",
		});

		const form = page.locator("#FormCreateYourProfileExample1").locator("form");
		const desktop = await form.evaluate(readGeometry);
		expect(Number.parseFloat(desktop.maxInlineSize)).toBeCloseTo(352, -1);
		expect(desktop.formWidth).toBeCloseTo(352, -1);
		expect(desktop.formWidth).toBeLessThan(desktop.stageWidth * 0.8);
		expect(desktop.formLeft).toBeCloseTo(
			desktop.stageLeft +
				desktop.stagePaddingStart +
				(desktop.stageContentWidth - desktop.formWidth) / 2,
			0
		);

		await page.setViewportSize({ height: 800, width: 375 });
		const mobile = await form.evaluate(readGeometry);
		expect(mobile.formWidth).toBeCloseTo(mobile.stageContentWidth, 0);
		expect(mobile.formLeft).toBeCloseTo(
			mobile.stageLeft + mobile.stagePaddingStart,
			0
		);
	}, 15_000);

	it("validates untouched submission and focuses the first invalid control", async () => {
		await page.goto(`${handle.url}/components/form`, {
			waitUntil: "networkidle",
		});

		const submitButton = page.getByRole("button", { name: "Submit" });
		await submitButton.click();

		const username = page.getByRole("textbox", { name: "Username" });
		const usernameError = page.getByText("Username is required");
		await usernameError.waitFor({ state: "visible" });

		expect(await username.getAttribute("aria-invalid")).toBe("true");
		expect(await username.evaluate((el) => document.activeElement === el)).toBe(
			true
		);
	}, 15_000);

	it("preserves input values and updates field validation on change", async () => {
		await page.goto(`${handle.url}/components/form`, {
			waitUntil: "networkidle",
		});

		const username = page.getByRole("textbox", { name: "Username" });
		await username.fill("alex");
		await username.blur();

		expect(await username.inputValue()).toBe("alex");
		expect(await username.getAttribute("aria-invalid")).toBeNull();
	}, 15_000);

	it("displays form-level error when submission constraint is violated", async () => {
		await page.goto(`${handle.url}/components/form`, {
			waitUntil: "networkidle",
		});

		const username = page.getByRole("textbox", { name: "Username" });
		const email = page.getByRole("textbox", { name: "Email" });

		await username.fill("admin");
		await email.fill("admin@example.com");

		const submitButton = page.getByRole("button", { name: "Submit" });
		await submitButton.click();

		const formErrorAlert = page.locator(
			'[data-slot="alert"][data-variant="error"]'
		);
		await formErrorAlert.waitFor({ state: "visible" });
		expect(await formErrorAlert.isVisible()).toBe(true);
		expect(await formErrorAlert.textContent()).toContain(
			"Username 'admin' is reserved"
		);
	}, 15_000);

	it("handles async submission loading and displays success status with preserved values", async () => {
		await page.goto(`${handle.url}/components/form`, {
			waitUntil: "networkidle",
		});

		const username = page.getByRole("textbox", { name: "Username" });
		const email = page.getByRole("textbox", { name: "Email" });

		await username.fill("alexmorgan");
		await email.fill("alex@example.com");

		const submitButton = page.getByRole("button", { name: "Submit" });
		const inFlightButton = page.locator(
			'button[type="submit"][aria-busy="true"][data-loading]'
		);

		await submitButton.scrollIntoViewIfNeeded();
		await page.clock.install();
		await page.clock.pauseAt(new Date(Date.now() + 100));
		await submitButton.click();
		await inFlightButton.waitFor({ state: "attached" });

		expect(await submitButton.getAttribute("aria-busy")).toBe("true");
		expect(await submitButton.getAttribute("data-loading")).not.toBeNull();
		const inFlightTransitionProperties = (
			await submitButton.evaluate(
				(el) => getComputedStyle(el).transitionProperty
			)
		)
			.split(",")
			.map((property) => property.trim());
		expect(inFlightTransitionProperties).not.toContain("color");
		const surfaceTransitionProperties = (
			await submitButton.evaluate(
				(el) => getComputedStyle(el, "::before").transitionProperty
			)
		)
			.split(",")
			.map((property) => property.trim());
		expect(surfaceTransitionProperties).toContain("background-color");
		expect(surfaceTransitionProperties).toContain("inset");

		await page.clock.runFor(300);
		await page.clock.resume();
		const successAlert = page.locator(
			'[data-slot="alert"][data-variant="success"]'
		);
		await successAlert.waitFor({ state: "visible" });
		expect(await successAlert.isVisible()).toBe(true);
		expect(await successAlert.textContent()).toContain(
			"Form submitted successfully"
		);

		expect(await submitButton.getAttribute("aria-busy")).toBeNull();
		expect(await submitButton.getAttribute("data-loading")).toBeNull();
		const restTransitionProperties = (
			await submitButton.evaluate(
				(el) => getComputedStyle(el).transitionProperty
			)
		)
			.split(",")
			.map((property) => property.trim());
		expect(restTransitionProperties).not.toContain("color");
		expect(
			await submitButton.evaluate(
				(el) => getComputedStyle(el, "::before").transitionProperty
			)
		).toContain("background-color");
		expect(await username.inputValue()).toBe("alexmorgan");
		expect(await email.inputValue()).toBe("alex@example.com");
	}, 15_000);

	it("disables native validation and allows invalid email to reach TanStack validation", async () => {
		await page.goto(`${handle.url}/components/form`, {
			waitUntil: "networkidle",
		});

		const form = page.locator("#FormCreateYourProfileExample1").locator("form");
		expect(await form.getAttribute("novalidate")).not.toBeNull();
		expect(await form.evaluate((el: HTMLFormElement) => el.noValidate)).toBe(
			true
		);

		const username = page.getByRole("textbox", { name: "Username" });
		const email = page.getByRole("textbox", { name: "Email" });

		await username.fill("alex");
		await email.fill("not-an-email");

		const submitButton = page.getByRole("button", { name: "Submit" });
		await submitButton.click();

		const emailError = page.getByText("Enter a valid email address");
		await emailError.waitFor({ state: "visible" });
		expect(await emailError.isVisible()).toBe(true);
		expect(await email.getAttribute("aria-invalid")).toBe("true");
		expect(await email.evaluate((el) => document.activeElement === el)).toBe(
			true
		);
	}, 15_000);
});
