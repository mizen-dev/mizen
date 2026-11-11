import { type Browser, chromium } from "playwright";
import { expect as expectLocator } from "playwright/test";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import {
	richContentDateTime,
	richContentImage,
} from "../src/entities/documentation/ui/compositions/rich-content-source";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
const errors: string[] = [];
let handle: TestServerHandle;
let browser: Browser;

describe("Rich content browser behavior", () => {
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
		return { context, page };
	}

	it.each(["light", "dark"] as const)(
		"renders semantic rich content with deterministic values in %s mode",
		async (theme) => {
			const { context, page } = await openWithTheme(theme);
			try {
				const markdown = page.getByTestId("markdown-example");
				await expectLocator(
					markdown.getByRole("heading", { name: "Release notes" })
				).toBeVisible();
				await expectLocator(
					markdown.locator('[data-slot="markdown-unordered-list"]')
				).toBeVisible();
				await expectLocator(markdown.locator("blockquote")).toBeVisible();
				await expectLocator(
					markdown.getByRole("region", { name: "Markdown table" })
				).toBeVisible();
				await expectLocator(markdown.locator("pre code")).toContainText(
					'releaseStatus = "ready"'
				);
				await expectLocator(
					markdown.getByRole("link", { name: "release guide" })
				).toHaveAttribute("href", "https://example.com/releases/2026-10");
				expect(await markdown.locator('a[href^="#"]').count()).toBeGreaterThan(
					0
				);

				const images = page
					.getByTestId("thumbnail-example")
					.locator('[data-slot="thumbnail"]');
				await expectLocator(images).toHaveCount(3);
				await expectLocator(images.first()).toHaveAttribute(
					"alt",
					richContentImage.alt
				);
				await images.last().scrollIntoViewIfNeeded();
				await images
					.last()
					.evaluate((image) => (image as HTMLImageElement).decode());
				const imageSizes = await images.evaluateAll((elements) =>
					elements.map((element) => {
						const image = element as HTMLImageElement;
						const rect = image.getBoundingClientRect();
						return {
							height: rect.height,
							naturalHeight: image.naturalHeight,
							objectFit: getComputedStyle(image).objectFit,
							width: rect.width,
						};
					})
				);
				expect(imageSizes.map(({ width }) => width)).toEqual([32, 48, 64]);
				for (const image of imageSizes) {
					expect(image.width).toBe(image.height);
					expect(image.naturalHeight).toBeGreaterThan(0);
					expect(image.objectFit).toBe("cover");
				}

				const timestamp = page.getByTestId("timestamp-example");
				const times = timestamp.locator("time");
				await expectLocator(times).toHaveCount(2);
				await expectLocator(times.first()).toHaveAttribute(
					"datetime",
					richContentDateTime
				);
				await expectLocator(times.first()).toContainText("Oct 7, 2026");
				await expectLocator(times.nth(1)).toContainText("Oct 7, 2026");
				await expectLocator(times.nth(1)).toContainText("UTC");

				await page.getByTestId("rich-content-example").screenshot({
					caret: "initial",
					path: `/private/tmp/mizen-rich-content-${theme}.png`,
				});
			} finally {
				await context.close();
			}
		}
	);

	it("puts a task's checkbox in place of the list marker", async () => {
		const { context, page } = await openWithTheme("dark");
		try {
			const task = page
				.getByTestId("markdown-example")
				.locator('[data-slot="markdown-task"]')
				.first();
			const fit = await task.evaluate((box) => {
				const item = box.closest("li") ?? box;
				const paragraph = item
					.closest('[data-slot="markdown"]')
					?.querySelector("p")
					?.getBoundingClientRect();
				return {
					boxInset: box.getBoundingClientRect().left - (paragraph?.left ?? 0),
					marker: getComputedStyle(item).listStyleType,
					textInset: item.getBoundingClientRect().left - (paragraph?.left ?? 0),
				};
			});
			expect(fit.marker).toBe("none");
			// The box starts at the text edge; the label keeps the list indent.
			expect(Math.abs(fit.boxInset)).toBeLessThan(1);
			expect(fit.textInset).toBe(16);
		} finally {
			await context.close();
		}
	});

	it("contains Markdown, Thumbnail, and Timestamp at 390px with enlarged text spacing", async () => {
		const { context, page } = await openWithTheme("light", 390);
		try {
			await page.addStyleTag({
				content:
					"html { font-size: 32px !important; } * { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }",
			});
			const codeRegion = page
				.getByTestId("markdown-example")
				.getByRole("region", { exact: true, name: "Code block" });
			await codeRegion.focus();
			await codeRegion.press("ArrowRight");
			await expectLocator
				.poll(() => codeRegion.evaluate((element) => element.scrollLeft), {
					timeout: 1000,
				})
				.toBeGreaterThan(0);
			const sectionBounds = await Promise.all(
				["markdown-example", "thumbnail-example", "timestamp-example"].map(
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
			await page.getByTestId("rich-content-example").screenshot({
				caret: "initial",
				path: "/private/tmp/mizen-rich-content-narrow.png",
			});
		} finally {
			await context.close();
		}
	});
});
