import { type Browser, chromium, type Page } from "playwright";
import { expect as expectLocator } from "playwright/test";
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
const errors: string[] = [];

describe("contextual component previews", { timeout: 30_000 }, () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage({ viewport: { height: 900, width: 1280 } });
		page.on("pageerror", (error) => errors.push(error.message));
	}, 120_000);
	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
		expect(errors).toEqual([]);
	});

	it("saves and resets the project form", async () => {
		await page.goto(`${handle.url}/components/input`, {
			waitUntil: "networkidle",
		});
		const preview = page.locator("#InputForm");
		await preview
			.getByRole("textbox", { exact: true, name: "Project name" })
			.fill("Field notes");
		await preview
			.getByRole("button", { exact: true, name: "Save project" })
			.click();
		await expectLocator(
			preview.getByText("Saved Field notes in this preview.")
		).toBeVisible();
		await preview.getByRole("button", { exact: true, name: "Reset" }).click();
		await expectLocator(
			preview.getByRole("textbox", { exact: true, name: "Project name" })
		).toHaveValue("");
		await expectLocator(
			preview.getByText("Changes stay in this preview.")
		).toBeVisible();
	});

	it("changes visible documents when paging", async () => {
		await page.goto(`${handle.url}/components/pagination`, {
			waitUntil: "networkidle",
		});
		const preview = page.getByRole("region", {
			exact: true,
			name: "Pagination: Project documents example",
		});
		await expectLocator(
			preview.getByRole("cell", { exact: true, name: "Release note 01" })
		).toBeVisible();
		await preview.getByRole("link", { exact: true, name: "Page 2" }).click();
		await expectLocator(
			preview.getByRole("cell", { exact: true, name: "Release note 11" })
		).toBeVisible();
		await expectLocator(
			preview.getByRole("cell", { exact: true, name: "Release note 01" })
		).toHaveCount(0);
	});

	it("preserves project details and invitations between steps", async () => {
		await page.goto(`${handle.url}/components/stepper`, {
			waitUntil: "networkidle",
		});
		const preview = page.getByRole("region", {
			exact: true,
			name: "Stepper: Create a project example",
		});
		await preview
			.getByRole("textbox", { exact: true, name: "Project name" })
			.fill("Field notes");
		await preview
			.getByRole("button", { exact: true, name: "Continue" })
			.click();
		await preview
			.getByRole("textbox", { exact: true, name: "Invite by email" })
			.fill("nadia@example.com");
		await preview
			.getByRole("button", { exact: true, name: "Continue" })
			.click();
		await expectLocator(
			preview.getByText(
				"Field notes will be created in the Product team workspace."
			)
		).toBeVisible();
		await expectLocator(
			preview.getByText("Invite nadia@example.com to this project.")
		).toBeVisible();
		await preview.getByRole("button", { exact: true, name: "Back" }).click();
		await expectLocator(
			preview.getByRole("textbox", { exact: true, name: "Invite by email" })
		).toHaveValue("nadia@example.com");
	});

	it("applies paragraph alignment to its content", async () => {
		await page.goto(`${handle.url}/components/toggle-group`, {
			waitUntil: "networkidle",
		});
		const preview = page.locator("#examples");
		await preview.getByRole("button", { exact: true, name: "Center" }).click();
		const paragraph = preview.getByText(
			"Keep projects, conversations, and decisions together. Give everyday work a little more room.",
			{ exact: true }
		);
		expect(
			await paragraph.evaluate((element) => getComputedStyle(element).textAlign)
		).toBe("center");
	});

	it.each(["light", "dark"])(
		"keeps the card status readable at 320px in %s",
		async (theme) => {
			await page.setViewportSize({ height: 900, width: 320 });
			await page.goto(`${handle.url}/components/card`, {
				waitUntil: "networkidle",
			});
			await page.evaluate(
				(value) => localStorage.setItem("mizen-theme", value),
				theme
			);
			await page.reload({ waitUntil: "networkidle" });
			const card = page.getByTestId("card-static");
			const badge = card.getByText("Active", { exact: true });
			const lines = await badge.evaluate((element) => {
				const range = document.createRange();
				range.selectNodeContents(element);
				return range.getClientRects().length;
			});
			expect(lines).toBe(1);
			const titleBounds = await card
				.locator("[data-slot=card-title]")
				.boundingBox();
			const badgeBounds = await badge.boundingBox();
			expect(titleBounds && badgeBounds).toBeTruthy();
			expect(
				(titleBounds?.x ?? 0) + (titleBounds?.width ?? 0)
			).toBeLessThanOrEqual(badgeBounds?.x ?? 0);
		}
	);
});
