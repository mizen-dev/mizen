import { type Browser, chromium, type Page } from "playwright";
import { expect as expectLocator } from "playwright/test";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
const mentionedReadButton = /Mark “Mentioned you in/u;
let handle: TestServerHandle;
let browser: Browser;
let page: Page;

async function expectNotificationCenterFits(currentPage: Page) {
	const example = currentPage.getByTestId("notification-center-example");
	const widths = await example.evaluate((element) => [
		element.scrollWidth,
		element.clientWidth,
	]);
	expect(widths[0]).toBeLessThanOrEqual(widths[1]);
	expect(
		await example.getByRole("button", { name: "Mark all read" }).isVisible()
	).toBe(true);
}

describe("Notification Center composition", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		page.setDefaultTimeout(6000);
	}, 120_000);

	afterAll(async () => {
		await Promise.all([browser?.close(), teardownTestServer(handle)]);
	}, 120_000);

	it("filters unread notifications and updates counts after reading all", async () => {
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		const example = page.getByTestId("notification-center-example");
		expect(
			await example
				.getByRole("heading", {
					exact: true,
					name: "Notification center",
				})
				.isVisible()
		).toBe(true);
		expect(
			await example
				.getByRole("list", { name: "Notifications" })
				.getByRole("listitem")
				.count()
		).toBe(3);

		await example.getByRole("tab", { name: "Unread 2" }).click();
		const unreadPanel = example.getByRole("tabpanel", { name: "Unread" });
		expect(await unreadPanel.getByRole("listitem").count()).toBe(2);

		await example.getByRole("button", { name: "Mark all read" }).click();
		expect(
			await example.getByRole("tab", { name: "Unread 0" }).isVisible()
		).toBe(true);
		expect(await example.getByText("You’re all caught up").isVisible()).toBe(
			true
		);
		expect(
			await example
				.getByText("No unread notifications in this example.")
				.isVisible()
		).toBe(true);
		expect(
			await example.getByText("2 notifications marked as read.").isVisible()
		).toBe(true);
	});

	it("marks one item read and returns focus to the selected filter", async () => {
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		const example = page.getByTestId("notification-center-example");
		await example.getByRole("tab", { name: "Unread 2" }).click();
		const unreadPanel = example.getByRole("tabpanel", { name: "Unread" });
		await unreadPanel
			.getByRole("button", { name: mentionedReadButton })
			.click();

		await expectLocator(
			example.getByRole("tab", { name: "Unread 1" })
		).toBeFocused();
		expect(await unreadPanel.getByRole("listitem").count()).toBe(1);
		expect(
			await example
				.getByText("Marked “Mentioned you in “Homepage review”” as read.")
				.isVisible()
		).toBe(true);
	});

	it("keeps notification rows horizontal on a desktop viewport", async () => {
		await page.setViewportSize({ height: 900, width: 1280 });
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		const item = page
			.getByTestId("notification-center-example")
			.getByRole("listitem")
			.first();
		const positions = await item.evaluate((element) => {
			const avatar = element.querySelector('[data-slot="activity-feed-media"]');
			const content = element.querySelector(
				'[data-slot="activity-feed-content"]'
			);
			const actions = element.querySelector('[data-slot="list-actions"]');
			if (!(avatar && content && actions)) {
				throw new Error("Notification row anatomy is incomplete.");
			}
			const avatarRect = avatar.getBoundingClientRect();
			const contentRect = content.getBoundingClientRect();
			const actionsRect = actions.getBoundingClientRect();
			return {
				actionsLeft: actionsRect.left,
				avatarRight: avatarRect.right,
				avatarTop: avatarRect.top,
				contentLeft: contentRect.left,
				contentRight: contentRect.right,
				contentTop: contentRect.top,
			};
		});

		expect(positions.avatarRight).toBeLessThanOrEqual(positions.contentLeft);
		expect(positions.contentRight).toBeLessThanOrEqual(positions.actionsLeft);
		expect(Math.abs(positions.avatarTop - positions.contentTop)).toBeLessThan(
			2
		);
	});

	it("fits a narrow viewport in light and dark color schemes", async () => {
		await page.setViewportSize({ height: 844, width: 390 });
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		await page.emulateMedia({ colorScheme: "light" });
		await expectNotificationCenterFits(page);
		await page.emulateMedia({ colorScheme: "dark" });
		await expectNotificationCenterFits(page);
	});
});
