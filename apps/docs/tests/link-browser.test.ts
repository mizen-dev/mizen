import { type Browser, chromium, type Page } from "playwright";
import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from "vitest";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
let handle: TestServerHandle;
let browser: Browser;
let page: Page;
const errors: string[] = [];

describe("Link browser states", { timeout: 20_000 }, () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		// Settled focus rings: the ring grows in over 200ms otherwise.
		await page.emulateMedia({ reducedMotion: "reduce" });
		page.setDefaultTimeout(8000);
		page.on("pageerror", (error) => errors.push(error.message));
		page.on("console", (message) => {
			if (message.type() === "error") {
				errors.push(message.text());
			}
		});
	}, 120_000);
	beforeEach(async () => {
		errors.length = 0;
		await page.setViewportSize({ height: 900, width: 1280 });
		await page.goto(`${handle.url}/components/link`, {
			waitUntil: "networkidle",
		});
	});
	afterEach(() => expect(errors).toEqual([]));
	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
	});
	it.each(["light", "dark"] as const)(
		"keeps inline alignment and interaction feedback in %s",
		async (theme) => {
			await page.emulateMedia({ colorScheme: theme });
			const link = page.getByRole("link", {
				exact: true,
				name: "component index",
			});
			await link.scrollIntoViewIfNeeded();
			expect(await link.evaluate((el) => getComputedStyle(el).display)).toBe(
				"inline"
			);
			const normal = await link.evaluate((el) =>
				Number.parseFloat(getComputedStyle(el).textDecorationThickness)
			);
			await link.hover();
			const hover = await link.evaluate((el) =>
				Number.parseFloat(getComputedStyle(el).textDecorationThickness)
			);
			expect(hover).toBeGreaterThan(normal);
			await page.mouse.down();
			const active = await link.evaluate((el) =>
				Number.parseFloat(getComputedStyle(el).textDecorationThickness)
			);
			expect(active).toBeGreaterThan(hover);
			await page.mouse.move(0, 0);
			await page.mouse.up();
			await link.focus();
			await page.keyboard.press("Tab");
			await page.keyboard.press("Shift+Tab");
			expect(
				await link.evaluate((el) => getComputedStyle(el).outlineWidth)
			).toBe("3px");
			expect(
				await link.evaluate((el) => getComputedStyle(el).outlineColor)
			).not.toBe("rgba(0, 0, 0, 0)");
			await link
				.locator("..")
				.screenshot({ path: `/private/tmp/mizen-link-${theme}.png` });
			const external = page.getByRole("link", {
				exact: true,
				name: "Open external website",
			});
			expect(await external.getAttribute("target")).toBe("_blank");
			expect(await external.getAttribute("rel")).toBe("noreferrer");
		}
	);

	it("preserves Next.js client navigation", async () => {
		await page.evaluate(() => {
			document.documentElement.dataset.linkNavigation = "preserved";
		});
		await page
			.getByRole("link", { exact: true, name: "Open Button documentation" })
			.focus();
		await page.keyboard.press("Enter");
		await page.waitForURL("**/docs/components/button");
		expect(
			await page.evaluate(() => document.documentElement.dataset.linkNavigation)
		).toBe("preserved");
	});

	it("lets React Router own the destination without changing the docs URL", async () => {
		const url = page.url();
		const link = page.getByRole("link", { exact: true, name: "Open projects" });
		expect(await link.getAttribute("href")).toBe("/projects");
		await link.click();
		await page
			.getByText("Projects opened with React Router.", { exact: true })
			.waitFor();
		expect(page.url()).toBe(url);
		await page
			.getByRole("link", { exact: true, name: "Back to workspace" })
			.click();
		await link.waitFor({ state: "visible" });
	});

	it("wraps long inline destinations on mobile", async () => {
		await page.setViewportSize({ height: 800, width: 320 });
		const link = page.getByRole("link", {
			exact: true,
			name: "workspace_permissions_production_europe_west_revision_1842",
		});
		await link.scrollIntoViewIfNeeded();
		expect(
			await link
				.locator("..")
				.evaluate((el) => el.scrollWidth <= el.clientWidth)
		).toBe(true);
		expect(await link.evaluate((el) => getComputedStyle(el).overflowWrap)).toBe(
			"anywhere"
		);
	});
});
