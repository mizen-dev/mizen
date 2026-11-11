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

describe("Carousel browser behavior", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
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

	it("updates the named carousel controls at each boundary", async () => {
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		const section = page.getByTestId("carousel-example");
		const carousel = section.getByRole("region", { name: "Project studies" });
		const previous = carousel.getByRole("button", { name: "Previous slide" });
		const next = carousel.getByRole("button", { name: "Next slide" });
		const alpha = carousel.getByRole("group", { name: "Project Alpha" });
		const beta = carousel.getByRole("group", { name: "Project Beta" });
		const gamma = carousel.getByRole("group", { name: "Project Gamma" });

		await expectLocator(carousel).toHaveAttribute(
			"aria-roledescription",
			"carousel"
		);
		await expectLocator(alpha).toBeVisible();
		await expectLocator(previous).toBeDisabled();
		await expectLocator(next).toBeEnabled();

		await next.click();
		await expectLocator(beta).toBeInViewport();
		await expectLocator(previous).toBeEnabled();
		await next.click();
		await expectLocator(gamma).toBeInViewport();
		await expectLocator(next).toBeDisabled();

		await previous.click();
		await expectLocator(beta).toBeInViewport();
		await expectLocator(next).toBeEnabled();
		await expectLocator(
			carousel.locator('[data-slot="carousel-viewport"]')
		).toHaveCSS("scroll-snap-type", "x mandatory");
	});

	it("keeps controls accurate after native scrolling and viewport resize", async () => {
		await page.setViewportSize({ height: 900, width: 1280 });
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		const section = page.getByTestId("carousel-example");
		const carousel = section.getByRole("region", { name: "Project studies" });
		const previous = carousel.getByRole("button", { name: "Previous slide" });
		const next = carousel.getByRole("button", { name: "Next slide" });
		const viewport = carousel.locator('[data-slot="carousel-viewport"]');

		await expectLocator(next).toBeEnabled();
		await viewport.evaluate((element) => {
			element.scrollTo({ behavior: "instant", left: element.scrollWidth });
		});
		await expectLocator(next).toBeDisabled();
		await expectLocator(previous).toBeEnabled();

		await page.setViewportSize({ height: 900, width: 390 });
		await expectLocator(next).toBeDisabled();
		await expectLocator(previous).toBeEnabled();
		expect(
			await viewport.evaluate((element) => element.clientWidth)
		).toBeGreaterThan(0);
	});

	it("moves through slides in right-to-left direction", async () => {
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		const section = page.getByTestId("carousel-example");
		const carousel = section.getByRole("region", { name: "Project studies" });
		const previous = carousel.getByRole("button", { name: "Previous slide" });
		const next = carousel.getByRole("button", { name: "Next slide" });
		const beta = carousel.getByRole("group", { name: "Project Beta" });
		const viewport = carousel.locator('[data-slot="carousel-viewport"]');

		await expectLocator(next).toBeEnabled();
		await carousel.evaluate((element) => {
			element.setAttribute("dir", "rtl");
		});
		await viewport.evaluate((element) => {
			element.scrollTo({ behavior: "instant", left: 0 });
			element.dispatchEvent(new Event("scroll"));
		});
		await expectLocator(previous).toBeDisabled();
		await expectLocator(next).toBeEnabled();
		await next.click();
		await expectLocator(beta).toBeInViewport();
		await expectLocator(previous).toBeEnabled();
	});

	it("drags with a mouse, flicks one slide, and keeps clicks as clicks", async () => {
		await page.setViewportSize({ height: 800, width: 1100 });
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		const carousel = page
			.getByTestId("carousel-example")
			.getByRole("region", { name: "Project studies" });
		const viewport = carousel.locator("[data-slot=carousel-viewport]");
		const beta = carousel.getByRole("group", { name: "Project Beta" });
		const next = carousel.getByRole("button", { name: "Next slide" });
		await expectLocator(next).toBeEnabled();
		await viewport.scrollIntoViewIfNeeded();
		await viewport.evaluate((element) => {
			element.setAttribute("data-clicks", "0");
			element.firstElementChild?.addEventListener("click", () => {
				const clicks = Number(element.getAttribute("data-clicks")) + 1;
				element.setAttribute("data-clicks", String(clicks));
			});
		});
		const box = await viewport.boundingBox();
		if (!box) {
			throw new Error("The viewport must have rendered bounds.");
		}
		const y = box.y + box.height / 2;
		const x = box.x + box.width / 2;
		const scrollLeft = () =>
			viewport.evaluate((element) => Math.round(element.scrollLeft));

		// A slow drag past half a slide settles on the nearest slide.
		await page.mouse.move(x + 300, y);
		await page.mouse.down();
		for (let step = 1; step <= 30; step += 1) {
			// biome-ignore lint/performance/noAwaitInLoops: a drag is a timed sequence of moves; they cannot run in parallel.
			await page.mouse.move(x + 300 - step * 15, y);
			await page.waitForTimeout(30);
		}
		await expectLocator(viewport).toHaveAttribute("data-dragging", "");
		await page.waitForTimeout(200);
		await page.mouse.up();
		await expectLocator(viewport).not.toHaveAttribute("data-dragging");
		await expect.poll(scrollLeft).toBeGreaterThan(0);
		await expectLocator(beta).toBeInViewport({ ratio: 0.9 });

		// A short, fast flick moves one slide back.
		await page.mouse.move(x - 100, y);
		await page.mouse.down();
		for (let step = 1; step <= 4; step += 1) {
			// biome-ignore lint/performance/noAwaitInLoops: a flick is a sequence of moves; they cannot run in parallel.
			await page.mouse.move(x - 100 + step * 20, y);
		}
		await page.mouse.up();
		await expect.poll(scrollLeft).toBe(0);
		// Neither drag ended in a click.
		await expectLocator(viewport).toHaveAttribute("data-clicks", "0");

		// A click, even with a small wobble, stays a click and does not scroll.
		await page.mouse.move(x, y);
		await page.mouse.down();
		await page.mouse.move(x + 3, y);
		await page.mouse.up();
		await expectLocator(viewport).toHaveAttribute("data-clicks", "1");
		expect(await scrollLeft()).toBe(0);
	});
});
