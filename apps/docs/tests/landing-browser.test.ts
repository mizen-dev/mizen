// biome-ignore-all lint/performance/noAwaitInLoops: Sequential browser checks keep memory use bounded.
import { type Browser, chromium, type Page } from "playwright";
import { expect as expectLocator } from "playwright/test";
import { afterAll, beforeAll, expect, it } from "vitest";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

let handle: TestServerHandle;
let browser: Browser;
let page: Page;
const errors: string[] = [];

beforeAll(async () => {
	handle = await setupTestServer(new URL("..", import.meta.url).pathname);
	browser = await chromium.launch({
		executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
		headless: true,
	});
	page = await browser.newPage();
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
});

it("updates dashboard data and supports keyboard chart exploration", async () => {
	await page.goto(handle.url, { waitUntil: "networkidle" });
	const preview = page.getByRole("region", {
		name: "Live analytics dashboard",
	});
	await expectLocator(
		preview.getByText("$160,890", { exact: true })
	).toHaveCount(2);
	const year = preview.getByRole("combobox", { name: "Reporting year" });
	await year.press("Enter");
	await page.getByRole("option", { exact: true, name: "2025" }).click();
	await expectLocator(
		preview.getByText("$121,500", { exact: true })
	).toHaveCount(2);
	const donut = preview.getByRole("img", {
		exact: true,
		name: "Customers by plan, June 2025",
	});
	await donut.press("Home");
	const tooltip = page.locator('[data-slot="chart-tooltip"]');
	await expectLocator(tooltip).toContainText("Pro");
	await expectLocator(tooltip).toContainText("516");
	await donut.press("ArrowRight");
	await expectLocator(tooltip).toContainText("Team");
	await expectLocator(tooltip).toContainText("420");
	await year.press("Enter");
	await page.getByRole("option", { exact: true, name: "2026" }).click();
	await expectLocator(
		preview.getByText("$160,890", { exact: true })
	).toHaveCount(2);
	await expectLocator(
		preview.getByRole("img", {
			exact: true,
			name: "Revenue by month, January to June 2026",
		})
	).toBeVisible();

	const hrefs = new Set(
		await page
			.locator("main a[href]")
			.evaluateAll((links) => links.map((link) => link.getAttribute("href")))
	);
	for (const href of hrefs) {
		expect((await page.request.get(`${handle.url}${href}`)).status()).toBe(200);
	}
	expect(errors).toEqual([]);
}, 60_000);

it("keeps content readable in both themes, narrow layouts, and enlarged text", async () => {
	for (const theme of ["light", "dark"]) {
		await page.addInitScript(
			(value) => localStorage.setItem("mizen-theme", value),
			theme
		);
		for (const width of [1440, 1024, 768, 320]) {
			await page.setViewportSize({ height: 1000, width });
			await page.goto(handle.url, { waitUntil: "networkidle" });
			await expectLocator(page.locator("html")).toHaveAttribute(
				"data-theme",
				theme
			);
			expect(
				await page.evaluate(
					() => document.documentElement.scrollWidth <= innerWidth
				)
			).toBe(true);
			await expectLocator(page.locator("h1")).toHaveCount(1);
			await expectLocator(
				page.getByRole("button", { exact: true, name: "Get started" })
			).toBeVisible();
			const donut = page.getByRole("img", {
				exact: true,
				name: "Customers by plan, June 2026",
			});
			const bounds = await donut.boundingBox();
			expect(bounds?.width).toBeGreaterThan(150);
			const arcs = donut.locator('[data-ts-key^="part-to-whole-arcs:"]');
			await expectLocator(arcs).toHaveCount(3);
			await page.screenshot({
				fullPage: true,
				path: `/private/tmp/mizen-dashboard-${theme}-${width}.png`,
			});
		}
	}
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.evaluate(() => {
		document.documentElement.style.fontSize = "32px";
	});
	await page.screenshot({
		fullPage: true,
		path: "/private/tmp/mizen-dashboard-large-text.png",
	});
	const overflow = await page.locator("main *").evaluateAll((elements) =>
		elements
			.filter((element) => element.getBoundingClientRect().right > innerWidth)
			.map((element) => ({
				tag: element.tagName,
				text: element.textContent?.slice(0, 70),
				width: element.getBoundingClientRect().width,
			}))
	);
	expect(
		await page.evaluate(
			() => document.documentElement.scrollWidth <= innerWidth
		),
		JSON.stringify(overflow)
	).toBe(true);
	await expectLocator(
		page.getByRole("combobox", { name: "Reporting year" })
	).toBeVisible();
	await page.screenshot({
		fullPage: true,
		path: "/private/tmp/mizen-dashboard-dark-320-large-text.png",
	});
	expect(errors).toEqual([]);
}, 60_000);
