import { type Browser, chromium } from "playwright";
import { expect as expectLocator } from "playwright/test";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
const errors: string[] = [];
const DOCS_URL = /\/docs\/?$/u;
let handle: TestServerHandle;
let browser: Browser;

async function waitForClientReady(
	page: import("playwright").Page,
	theme: "dark" | "light"
): Promise<void> {
	const label = theme === "dark" ? "Theme: Dark" : "Theme: Light";
	await expectLocator(
		page.getByRole("button", { exact: true, name: label }).locator("svg")
	).toBeAttached();
}

describe("small primitive browser behavior", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
	}, 120_000);

	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
		expect(errors).toEqual([]);
	}, 120_000);

	async function openWithTheme(theme: "dark" | "light", width = 1280) {
		const context = await browser.newContext({
			viewport: { height: 900, width },
		});
		await context.addInitScript((preference) => {
			window.localStorage.setItem("mizen-theme", preference);
		}, theme);
		const page = await context.newPage();
		// Settled focus rings: the ring grows in over 200ms otherwise.
		await page.emulateMedia({ reducedMotion: "reduce" });
		page.on("pageerror", (error) => errors.push(error.message));
		page.on("console", (message) => {
			if (message.type() === "error") {
				errors.push(message.text());
			}
		});
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		await expectLocator(page.locator("html")).toHaveAttribute(
			"data-theme",
			theme
		);
		await waitForClientReady(page, theme);
		await page.addStyleTag({
			content: "* { caret-color: initial !important; }",
		});
		return { context, page };
	}

	it.each(["light", "dark"] as const)(
		"renders native link, visually hidden text, and named meter in %s mode",
		async (theme) => {
			const { context, page } = await openWithTheme(theme);
			try {
				const linkExample = page.getByTestId("link-example");
				const link = linkExample.getByRole("link", {
					exact: true,
					name: "component index",
				});
				await expectLocator(link).toHaveAttribute("href", "/docs");
				await link.focus();
				await link.press("Shift+Tab");
				await page.keyboard.press("Tab");
				await expectLocator(link).toBeFocused();
				const focusOutline = await link.evaluate((element) => {
					const styles = getComputedStyle(element);
					return { style: styles.outlineStyle, width: styles.outlineWidth };
				});
				expect(focusOutline.style).not.toBe("none");
				expect(Number.parseFloat(focusOutline.width)).toBeGreaterThan(0);
				await page.getByTestId("primitive-gap-example").screenshot({
					path: `/private/tmp/mizen-primitive-gaps-${theme}.png`,
				});

				const count = page.getByTestId("notification-count");
				await expectLocator(count).toContainText(
					"Inbox: 4 unread notifications"
				);
				const hiddenText = count.getByText("unread notifications");
				await expectLocator(hiddenText).toBeAttached();
				const hiddenStyles = await hiddenText.evaluate((element) => {
					const styles = getComputedStyle(element);
					return { clipPath: styles.clipPath, position: styles.position };
				});
				expect(hiddenStyles.position).toBe("absolute");
				expect(hiddenStyles.clipPath).toBe("inset(50%)");

				const meter = page.getByTestId("meter-example").getByRole("meter", {
					name: "Workspace storage",
				});
				await expectLocator(meter).toHaveAttribute("aria-valuenow", "72");
				await expectLocator(meter).toHaveAttribute("aria-valuemin", "0");
				await expectLocator(meter).toHaveAttribute("aria-valuemax", "100");
			} finally {
				await context.close();
			}
		}
	);

	it("keeps examples within a narrow viewport with enlarged text and activates links by keyboard", async () => {
		const { context, page } = await openWithTheme("light", 390);
		try {
			await page.addStyleTag({
				content:
					"html { font-size: 32px !important; } * { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }",
			});
			const link = page
				.getByTestId("link-example")
				.getByRole("link", { name: "component index" });
			await link.focus();
			await link.press("Enter");
			await expectLocator(page).toHaveURL(DOCS_URL);

			await page.goto(`${handle.url}/internal/specimens`, {
				waitUntil: "networkidle",
			});
			await expectLocator(page.locator("html")).toHaveAttribute(
				"data-theme",
				"light"
			);
			await waitForClientReady(page, "light");
			await page.addStyleTag({
				content:
					"html { font-size: 32px !important; } * { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }",
			});
			await page.addStyleTag({
				content: "* { caret-color: initial !important; }",
			});
			const sectionBounds = await Promise.all(
				["link-example", "visually-hidden-example", "meter-example"].map(
					async (sectionName) => {
						const section = page.getByTestId(sectionName);
						await expectLocator(section).toBeVisible();
						return section.evaluate((element) => {
							const rect = element.getBoundingClientRect();
							return {
								right: rect.right,
								scrollWidth: element.scrollWidth,
								width: element.clientWidth,
								x: rect.left,
							};
						});
					}
				)
			);
			for (const bounds of sectionBounds) {
				expect(bounds.x).toBeGreaterThanOrEqual(0);
				expect(bounds.right).toBeLessThanOrEqual(390);
				expect(bounds.scrollWidth).toBeLessThanOrEqual(bounds.width);
			}
			await page.getByTestId("primitive-gap-example").screenshot({
				path: "/private/tmp/mizen-primitive-gaps-narrow.png",
			});
		} finally {
			await context.close();
		}
	});
});
