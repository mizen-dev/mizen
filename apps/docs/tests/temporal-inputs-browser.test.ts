import { type Browser, chromium, type Page } from "playwright";
import { expect as expectLocator } from "playwright/test";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
	setDocsTheme,
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const errors: string[] = [];
let handle: TestServerHandle;
let browser: Browser;
let page: Page;

describe("native temporal inputs", { timeout: 30_000 }, () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		page.on("pageerror", (error) => errors.push(error.message));
	}, 120_000);
	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
		expect(errors).toEqual([]);
	});
	it("validates native bounds and step, submits local values, and restores defaults", async () => {
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		const form = page.getByRole("form", { name: "Schedule a review" });
		const time = form.getByLabel("Meeting time", { exact: true });
		const date = form.getByLabel("Scheduled at", { exact: true });
		const status = form.getByTestId("schedule-status");
		await expectLocator(time).toHaveAccessibleDescription(
			"Between 09:00 and 18:00, in 15-minute intervals."
		);
		await time.fill("08:30");
		expect(
			await time.evaluate(
				(input: HTMLInputElement) => input.validity.rangeUnderflow
			)
		).toBe(true);
		await form.getByRole("button", { name: "Save schedule" }).click();
		await expectLocator(status).toHaveText("No schedule submitted.");
		await time.fill("10:01");
		expect(
			await time.evaluate(
				(input: HTMLInputElement) => input.validity.stepMismatch
			)
		).toBe(true);
		await time.fill("10:15");
		await date.fill("2026-11-01T10:00");
		expect(
			await date.evaluate(
				(input: HTMLInputElement) => input.validity.rangeOverflow
			)
		).toBe(true);
		await date.fill("2026-10-09T11:30");
		await form.getByRole("button", { name: "Save schedule" }).click();
		await expectLocator(status).toHaveText("Saved: 10:15 · 2026-10-09T11:30");
		await date.fill("");
		expect(
			await date.evaluate(
				(input: HTMLInputElement) => input.validity.valueMissing
			)
		).toBe(true);
		await form.getByRole("button", { name: "Reset schedule" }).click();
		await expectLocator(time).toHaveValue("09:30");
		await expectLocator(date).toHaveValue("2026-10-07T10:00");
		await expectLocator(status).toHaveText("No schedule submitted.");
		await expectLocator(
			page.getByLabel("Managed time", { exact: true })
		).toBeDisabled();
		await expectLocator(
			page.getByLabel("Read-only date-time", { exact: true })
		).toHaveAttribute("readonly", "");
	});
	it.each(["light", "dark"] as const)(
		"preserves sizing and narrow layouts with enlarged text in %s",
		async (theme) => {
			await page.goto(`${handle.url}/internal/specimens`, {
				waitUntil: "networkidle",
			});
			const small = page.getByLabel("Small time input", { exact: true });
			const large = page.getByLabel("Large time input", { exact: true });
			const height = (input: HTMLInputElement) =>
				input.getBoundingClientRect().height;
			expect(await small.evaluate(height)).toBeLessThan(
				await large.evaluate(height)
			);
			await page.setViewportSize({ height: 844, width: 390 });

			await setDocsTheme(page, theme);
			await page.addStyleTag({
				content:
					"html { font-size: 32px !important; } main p, main label { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }",
			});
			const overflow = await page
				.locator('section[aria-labelledby="temporal-inputs-heading"]')
				.evaluate((section) => {
					const rect = section.getBoundingClientRect();
					return [...section.querySelectorAll("input")].some(
						(input) => input.getBoundingClientRect().right > rect.right + 1
					);
				});
			expect(overflow).toBe(false);
			await page
				.getByRole("heading", { name: "Time and scheduling" })
				.scrollIntoViewIfNeeded();
			await page.screenshot({
				path: `/private/tmp/mizen-temporal-inputs-${theme}.png`,
			});
		}
	);
});
