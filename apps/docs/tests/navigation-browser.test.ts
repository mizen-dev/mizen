import { type Browser, chromium, type Page } from "playwright";
import { expect as expectLocator } from "playwright/test";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const errors: string[] = [];
let handle: TestServerHandle;
let browser: Browser;
let page: Page;

describe("navigation and progress", { timeout: 30_000 }, () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage({ viewport: { height: 900, width: 1280 } });
		// Settled focus rings: the ring grows in over 200ms otherwise.
		await page.emulateMedia({ reducedMotion: "reduce" });
		page.on("pageerror", (error) => errors.push(error.message));
		page.on("console", (message) => {
			if (message.type() === "error") {
				errors.push(message.text());
			}
		});
	}, 120_000);

	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
		expect(errors).toEqual([]);
	});

	it("preserves native links and current-page semantics in Breadcrumb", async () => {
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		const breadcrumb = page.getByRole("navigation", {
			name: "Project location",
		});
		await expectLocator(breadcrumb.getByRole("listitem")).toHaveCount(3);
		await expectLocator(breadcrumb.locator('[aria-current="page"]')).toHaveText(
			"Navigation and progress"
		);
		const home = breadcrumb.getByRole("link", { exact: true, name: "Home" });
		const components = breadcrumb.getByRole("link", {
			exact: true,
			name: "Components",
		});
		await home.focus();
		await page.keyboard.press("Tab");
		await expectLocator(components).toBeFocused();
		expect(
			await components.evaluate(
				(element) => getComputedStyle(element).outlineWidth
			)
		).toBe("3px");
		await components.click();
		await expectLocator(page).toHaveURL(`${handle.url}/docs`);
	});

	it("changes pages and removes unavailable navigation from Tab order", async () => {
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		const pagination = page.getByRole("navigation", { name: "Record pages" });
		const previous = pagination.locator('[aria-label="Go to previous page"]');
		const next = pagination.locator('[aria-label="Go to next page"]');
		await expectLocator(previous).toHaveAttribute("aria-disabled", "true");
		await expectLocator(previous).not.toHaveAttribute("href");
		const disabledBackground = await previous.evaluate(
			(element) => getComputedStyle(element).backgroundColor
		);
		await previous.hover();
		expect(
			await previous.evaluate(
				(element) => getComputedStyle(element).backgroundColor
			)
		).toBe(disabledBackground);
		const current = pagination.getByRole("link", {
			exact: true,
			name: "Page 1",
		});
		const selectedFill = await current.evaluate(
			(element) => getComputedStyle(element).backgroundColor
		);
		await current.hover();
		await current.evaluate(async (element) => {
			await Promise.allSettled(
				element.getAnimations().map((animation) => animation.finished)
			);
		});
		expect(
			await current.evaluate(
				(element) => getComputedStyle(element).backgroundColor
			)
		).toBe(selectedFill);
		await current.focus();
		await page.keyboard.press("Shift+Tab");
		await expectLocator(previous).not.toBeFocused();
		await next.click();
		await expectLocator(
			pagination.getByRole("link", { exact: true, name: "Page 2" })
		).toHaveAttribute("aria-current", "page");
		await expectLocator(page.getByTestId("pagination-status")).toHaveText(
			"Showing records 11–20 of 30"
		);
		await expectLocator(previous).toHaveAttribute("href", "?page=1");
		await next.click();
		await expectLocator(next).toHaveAttribute("aria-disabled", "true");
		await expectLocator(next).not.toHaveAttribute("href");
		await next.click();
		await expectLocator(page.getByTestId("pagination-status")).toHaveText(
			"Showing records 21–30 of 30"
		);
		await previous.click();
		await expectLocator(page.getByTestId("pagination-status")).toHaveText(
			"Showing records 11–20 of 30"
		);
	});

	it("updates progress without turning steps into interactive controls", async () => {
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		const stepper = page.getByRole("list", { name: "Project setup" });
		const section = page.locator(
			'section[aria-labelledby="navigation-heading"]'
		);
		await expectLocator(stepper.getByRole("listitem")).toHaveCount(3);
		await expectLocator(stepper.getByRole("button")).toHaveCount(0);
		await expectLocator(stepper.locator('[aria-current="step"]')).toContainText(
			"Details"
		);
		await section
			.getByRole("button", { exact: true, name: "Continue" })
			.click();
		await expectLocator(stepper.locator('[aria-current="step"]')).toContainText(
			"Members"
		);
		await expectLocator(
			stepper.locator('[data-status="complete"]')
		).toContainText("Details");
		await section
			.getByRole("button", { exact: true, name: "Continue" })
			.click();
		await expectLocator(
			section.getByRole("button", { exact: true, name: "Continue" })
		).toBeDisabled();
		await section.getByRole("button", { exact: true, name: "Back" }).click();
		await expectLocator(page.getByTestId("stepper-status")).toHaveText(
			"Step 2 of 3: Members"
		);
	});

	for (const theme of ["light", "dark"] as const) {
		it(`keeps enlarged ${theme} navigation readable on narrow screens`, async () => {
			await page.setViewportSize({ height: 900, width: 390 });
			await page.emulateMedia({ reducedMotion: "reduce" });
			await page.addInitScript(
				(preference) => localStorage.setItem("mizen-theme", preference),
				theme
			);
			await page.goto(`${handle.url}/internal/specimens`, {
				waitUntil: "networkidle",
			});
			await page.addStyleTag({
				content:
					"html {font-size:32px !important} * {line-height:1.5 !important;letter-spacing:0.12em !important;word-spacing:0.16em !important}",
			});
			const section = page.locator(
				'section[aria-labelledby="navigation-heading"]'
			);
			expect(
				await page.evaluate(
					() => document.documentElement.scrollWidth <= window.innerWidth
				)
			).toBe(true);
			const items = section.locator('[data-slot="stepper-item"]');
			const positions = await items.evaluateAll((elements) =>
				elements.map((element) => element.getBoundingClientRect().top)
			);
			// Narrow steppers collapse into one compact track row.
			expect(new Set(positions).size).toBe(1);
			await section.getByRole("link", { exact: true, name: "Page 3" }).focus();
			await expectLocator(
				section.getByRole("link", { exact: true, name: "Page 3" })
			).toBeFocused();
			await section.screenshot({
				mask: [page.locator("header")],
				path: `/private/tmp/mizen-navigation-${theme}.png`,
			});
		});
	}
});
