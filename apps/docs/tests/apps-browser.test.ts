import { type Browser, chromium, type Page } from "playwright";
import { expect as expectLocator } from "playwright/test";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import { appDocs } from "../src/entities/documentation/model/apps";
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

async function openPreview(width: number, theme: "dark" | "light" = "light") {
	await page.setViewportSize({ height: 900, width });
	await page.addInitScript(
		(value) => localStorage.setItem("mizen-theme", value),
		theme
	);
	await page.goto(`${handle.url}/apps/dashboard/preview`, {
		waitUntil: "networkidle",
	});
}

const token = (name: string) =>
	page.evaluate(
		(property) =>
			getComputedStyle(document.documentElement).getPropertyValue(property),
		name
	);

describe("Apps", { timeout: 30_000 }, () => {
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

	it("lists every app in the site index and in llms.txt", async () => {
		await page.goto(`${handle.url}/apps`, { waitUntil: "networkidle" });
		await expectLocator(
			page
				.getByRole("navigation", { name: "Site navigation" })
				.getByRole("link", { exact: true, name: "Apps" })
		).toHaveAttribute("aria-current", "page");
		const llms = await (
			await page.request.get(`${handle.url}/llms.txt`)
		).text();
		const links = page.getByRole("main").getByRole("link");
		await expectLocator(links).toHaveText(appDocs.map((app) => app.title));
		expect(
			await links.evaluateAll((anchors) =>
				anchors.map((anchor) => anchor.getAttribute("href"))
			)
		).toEqual(appDocs.map((app) => `/apps/${app.slug}`));
		for (const app of appDocs) {
			expect(llms).toContain(
				`- [${app.title}](/apps/${app.slug}/markdown): ${app.description}`
			);
		}
	});

	it("serves an app's set up and sources as Markdown", async () => {
		const response = await page.request.get(
			`${handle.url}/apps/dashboard/markdown`
		);
		expect(response.status()).toBe(200);
		expect(response.headers()["content-type"]).toContain("text/markdown");
		const markdown = await response.text();
		expect(markdown).toContain("init --preset vivid");
		for (const source of [
			"### src/app.tsx",
			"export function Home()",
			"export function AppShell(",
			"export const shellStyles = create({",
			"export const orders",
		]) {
			expect(markdown).toContain(source);
		}
		const missing = await Promise.all(
			["markdown", "preview", ""].map((path) =>
				page.request.get(`${handle.url}/apps/unknown/${path}`)
			)
		);
		expect(missing.map((entry) => entry.status())).toEqual([404, 404, 404]);
	});

	it("frames the live app above its set up and files", async () => {
		await page.setViewportSize({ height: 900, width: 1440 });
		await page.goto(`${handle.url}/apps/dashboard`, {
			waitUntil: "networkidle",
		});
		await expectLocator(
			page.getByRole("heading", { level: 1, name: "Dashboard" })
		).toBeVisible();
		await expectLocator(
			page
				.frameLocator('iframe[title="Dashboard preview"]')
				.getByRole("heading", { level: 1, name: "Home" })
		).toBeVisible();
		await expectLocator(
			page.locator('a[href="/apps/dashboard/preview"]')
		).toHaveText("Open full screen");
		const titles = page.locator('#files [data-slot="code-block-title"]');
		await expectLocator(titles).toHaveText([
			"src/app.tsx",
			"src/home.tsx",
			"src/app-shell.tsx",
			"src/app-shell.styles.ts",
			"src/data.ts",
		]);
		expect(
			await page.evaluate(() => document.documentElement.scrollWidth)
		).toBeLessThanOrEqual(1440);
	});

	it.each(["light", "dark"] as const)(
		"runs the dashboard in the Vivid theme in %s mode",
		async (theme) => {
			await openPreview(1280, theme);
			await expectLocator(page.locator("html")).toHaveAttribute(
				"data-theme",
				theme
			);
			// Vivid fills the primary action with the accent.
			expect(await token("--mizen-color-primary")).toBe(
				await token("--mizen-color-accent")
			);
			const sidebar = page.getByRole("complementary");
			await expectLocator(
				sidebar.getByRole("link", { name: "Home" })
			).toHaveAttribute("aria-current", "page");
			await expectLocator(
				page.getByRole("button", { name: "Open navigation" })
			).toBeHidden();
			// The window does not scroll; the pane does.
			expect(
				await page.evaluate(() => [
					document.documentElement.scrollWidth,
					document.documentElement.scrollHeight,
				])
			).toEqual([1280, 900]);
		}
	);

	it("selects orders one by one and all at once", async () => {
		await openPreview(1280);
		const table = page.getByRole("table");
		const all = table.getByRole("checkbox", { name: "Select all orders" });
		const selected = table.locator('tbody tr[data-selected="true"]');
		await expectLocator(all).toHaveAttribute("aria-checked", "mixed");
		await expectLocator(selected).toHaveCount(2);
		await table.getByRole("checkbox", { name: "Select ORD-1045" }).click();
		await expectLocator(selected).toHaveCount(3);
		await all.click();
		await expectLocator(selected).toHaveCount(7);
		await expectLocator(all).toBeChecked();
		await all.click();
		await expectLocator(selected).toHaveCount(0);
	});

	it("moves the navigation into a drawer on a narrow screen", async () => {
		await openPreview(375);
		await expectLocator(page.getByRole("complementary")).toBeHidden();
		expect(
			await page.evaluate(() => document.documentElement.scrollWidth)
		).toBe(375);
		await page.getByRole("button", { name: "Open navigation" }).click();
		const drawer = page.getByRole("dialog", { name: "Northstar" });
		const orders = drawer.getByRole("link", { name: "Orders" });
		await expectLocator(orders).toBeVisible();
		// The drawer sets the same text size as the sidebar.
		await expectLocator(orders).toHaveCSS("font-size", "14px");
		await orders.click();
		await expectLocator(drawer).toBeHidden();
	});
});
