import { type Browser, chromium, type Page } from "playwright";
import { expect as expectLocator } from "playwright/test";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";

const docsUrl = process.env.MIZEN_DOCS_TEST_URL ?? "http://127.0.0.1:3001";
const errors: string[] = [];
let browser: Browser;
let page: Page;

describe("Lightbox browser behavior", { timeout: 30_000 }, () => {
	beforeAll(async () => {
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage({ viewport: { height: 800, width: 1100 } });
		page.on("pageerror", (error) => errors.push(error.message));
	}, 30_000);

	afterAll(async () => {
		await browser?.close();
		expect(errors).toEqual([]);
	});

	it("opens a named modal, fits its image, and restores focus on close", async () => {
		await page.goto(`${docsUrl}/internal/specimens`, { waitUntil: "load" });
		const example = page.getByTestId("lightbox-example");
		const trigger = example.getByRole("button", { name: "Open image preview" });
		await trigger.scrollIntoViewIfNeeded();
		await trigger.click();

		const popup = page.getByRole("dialog", { name: "Lavender study" });
		await expectLocator(popup).toBeVisible();
		await expectLocator(popup).toContainText(
			"Lavender rows in Valensole, France, at dusk."
		);
		const image = popup.getByRole("img", {
			name: "Rows of lavender under a pink evening sky",
		});
		await expectLocator(image).toBeVisible();
		const imageBox = await image.boundingBox();
		const popupBox = await popup.boundingBox();
		if (!(imageBox && popupBox)) {
			throw new Error("The image and popup must have rendered bounds.");
		}
		expect(imageBox.width).toBeLessThanOrEqual(popupBox.width);
		expect(imageBox.height).toBeLessThanOrEqual(popupBox.height);
		expect(
			await image.evaluate((element) => getComputedStyle(element).objectFit)
		).toBe("contain");

		await page.keyboard.press("Escape");
		await expectLocator(popup).not.toBeVisible();
		await expectLocator(trigger).toBeFocused();
	});

	it("pages a gallery with buttons and arrow keys, wrapping at the ends", async () => {
		await page.goto(`${docsUrl}/docs/components/lightbox`, {
			waitUntil: "load",
		});
		const gallery = page.getByRole("list", { name: "Lavender study" });
		const thumbnail = gallery.getByRole("button", {
			name: "A bee on a lavender flower",
		});
		await thumbnail.scrollIntoViewIfNeeded();
		await thumbnail.click();

		const popup = page.getByRole("dialog", { name: "Lavender study" });
		await expectLocator(popup).toContainText("3 of 4");
		await expectLocator(popup.locator(":focus")).toHaveCount(1);
		await expectLocator(
			popup.getByRole("img", { name: "A bee on a lavender flower" })
		).toBeVisible();
		await page.keyboard.press("ArrowRight");
		await expectLocator(popup).toContainText("4 of 4");
		await popup.evaluate((element) =>
			Promise.all(
				element.getAnimations().map((animation) => animation.finished)
			)
		);
		const pill = await popup
			.locator("[data-slot=lightbox-gallery-controls]")
			.boundingBox();
		await page.keyboard.press("ArrowRight");
		await expectLocator(popup).toContainText("1 of 4");
		await popup.getByRole("button", { name: "Previous image" }).click();
		await expectLocator(popup).toContainText("4 of 4");
		// The tabular counter keeps the pill one width while paging.
		expect(
			await popup.locator("[data-slot=lightbox-gallery-controls]").boundingBox()
		).toEqual(pill);

		await page.keyboard.press("Escape");
		await expectLocator(popup).not.toBeVisible();
		await expectLocator(thumbnail).toBeFocused();
	});

	it("keeps enlarged media content within a narrow viewport", async () => {
		await page.setViewportSize({ height: 740, width: 390 });
		await page.goto(`${docsUrl}/internal/specimens`, { waitUntil: "load" });
		await page.addStyleTag({
			content:
				"html {font-size:32px !important} * {line-height:1.5 !important;letter-spacing:0.12em !important;word-spacing:0.16em !important}",
		});
		const trigger = page
			.getByTestId("lightbox-example")
			.getByRole("button", { name: "Open image preview" });
		await trigger.scrollIntoViewIfNeeded();
		await trigger.click();

		const popup = page.getByRole("dialog", { name: "Lavender study" });
		await expectLocator(popup).toBeVisible();
		await expectLocator(
			popup.getByRole("heading", { name: "Lavender study" })
		).toBeVisible();
		await expectLocator(
			popup.getByText("Lavender rows in Valensole, France, at dusk.")
		).toBeVisible();
		const bounds = await popup.boundingBox();
		if (!bounds) {
			throw new Error("The popup must have rendered bounds.");
		}
		expect(bounds.x).toBeGreaterThanOrEqual(0);
		expect(bounds.y).toBeGreaterThanOrEqual(0);
		expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
		expect(bounds.y + bounds.height).toBeLessThanOrEqual(740);
	});
});
