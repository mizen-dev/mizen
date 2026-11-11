import { type Browser, chromium, type Page } from "playwright";
import { expect as expectLocator } from "playwright/test";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
const errors: string[] = [];
let handle: TestServerHandle;
let browser: Browser;
let page: Page;

describe("Media and quoted content", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage({ viewport: { height: 900, width: 1280 } });
		page.setDefaultTimeout(8000);
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

	it("reserves image proportions and keeps attribution outside the quotation", async () => {
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		await page.getByTestId("code-block-example").screenshot({
			caret: "initial",
			path: "/private/tmp/mizen-current-review/code-block.png",
		});
		const frame = page
			.getByTestId("aspect-ratio-example")
			.locator('[data-slot="aspect-ratio"]');
		const bounds = await frame.boundingBox();
		if (!bounds) {
			throw new Error("The ratio frame must have rendered bounds.");
		}
		expect(bounds.width / bounds.height).toBeCloseTo(16 / 9, 3);
		const image = frame.getByRole("img");
		await image.scrollIntoViewIfNeeded();
		await expectLocator(image).toBeVisible();
		await expectLocator
			.poll(() =>
				image.evaluate((element: HTMLImageElement) => element.naturalWidth)
			)
			.toBe(1200);
		const figure = page.getByTestId("blockquote-example").locator("figure");
		await expectLocator(figure.locator(":scope > blockquote")).toHaveCount(1);
		await expectLocator(figure.locator(":scope > figcaption")).toHaveCount(1);
		await expectLocator(figure.locator("blockquote figcaption")).toHaveCount(0);
		const citation = figure.locator("figcaption cite");
		expect(
			await citation.evaluate((element) => getComputedStyle(element).fontSize)
		).toBe(
			await figure
				.locator("figcaption")
				.evaluate((element) => getComputedStyle(element).fontSize)
		);
		expect(
			await figure.evaluate(
				(element) => getComputedStyle(element).marginInlineStart
			)
		).toBe("0px");
		const carousel = page.getByTestId("carousel-example");
		await carousel.getByRole("button", { name: "Next slide" }).click();
		await expectLocator(
			carousel.getByRole("group", { name: "Project Beta" })
		).toBeVisible();
		await page.waitForFunction(() => {
			const viewport = document.querySelector(
				'[data-testid="carousel-example"] [data-slot="carousel-viewport"]'
			);
			const target = document.querySelector(
				'[data-testid="carousel-example"] [aria-label="Project Beta"]'
			);
			if (!(viewport && target)) {
				return false;
			}
			return (
				Math.abs(
					target.getBoundingClientRect().left -
						viewport.getBoundingClientRect().left
				) < 2
			);
		});
		await carousel.screenshot({
			caret: "initial",
			path: "/private/tmp/mizen-current-review/media-carousel-open.png",
		});
		await page
			.getByTestId("lightbox-example")
			.getByRole("button", { name: "Open image preview" })
			.click();
		const dialog = page.getByRole("dialog", { name: "Lavender study" });
		await expectLocator(dialog).toBeVisible();
		await expectLocator(
			dialog.getByRole("img", {
				name: "Rows of lavender under a pink evening sky",
			})
		).toBeVisible();
		await dialog.screenshot({
			caret: "initial",
			path: "/private/tmp/mizen-current-review/lightbox-open.png",
		});
		await page.keyboard.press("Escape");
		await expectLocator(dialog).toBeHidden();
	});

	describe.each(["light", "dark"] as const)("%s theme", (theme) => {
		it(`keeps ${theme} content readable at narrow widths and enlarged text`, async () => {
			await page.setViewportSize({ height: 900, width: 1280 });
			await page.addInitScript(
				(preference) => localStorage.setItem("mizen-theme", preference),
				theme
			);
			await page.goto(`${handle.url}/internal/specimens`, {
				waitUntil: "networkidle",
			});
			await expectLocator(
				page
					.getByTestId("carousel-example")
					.getByRole("button", { name: "Next slide" })
			).toBeEnabled();
			await page.getByTestId("aspect-ratio-example").screenshot({
				caret: "initial",
				path: `/private/tmp/mizen-media-${theme}.png`,
			});
			await page.getByTestId("blockquote-example").screenshot({
				caret: "initial",
				path: `/private/tmp/mizen-quote-${theme}.png`,
			});
			await page.setViewportSize({ height: 900, width: 390 });
			await page.addStyleTag({
				content:
					"html {font-size:32px !important} * {line-height:1.5 !important;letter-spacing:0.12em !important;word-spacing:0.16em !important}",
			});
			const sections = page.locator(
				'[data-testid="aspect-ratio-example"], [data-testid="carousel-example"], [data-testid="lightbox-example"], [data-testid="blockquote-example"], [data-testid="citation-example"]'
			);
			expect(
				await sections.evaluateAll((elements) =>
					elements.every(
						(element) => element.scrollWidth <= element.clientWidth + 1
					)
				)
			).toBe(true);
			await expectLocator(
				page.getByTestId("citation-example").locator("cite")
			).toBeVisible();
			await expectLocator(
				page
					.getByTestId("carousel-example")
					.getByRole("button", { name: "Next slide" })
			).toBeVisible();
		});
	});
});
