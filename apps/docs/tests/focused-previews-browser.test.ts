import { mkdir } from "node:fs/promises";
import { type Browser, chromium } from "playwright";
import { afterAll, beforeAll, expect, it } from "vitest";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

let browser: Browser;
let handle: TestServerHandle;
const cases = ["input", "textarea", "field", "select", "combobox"].flatMap(
	(slug) =>
		["light", "dark"].flatMap((theme) =>
			[320, 1280].map((width) => ({ slug, theme, width }))
		)
);
beforeAll(async () => {
	handle = await setupTestServer(new URL("..", import.meta.url).pathname);
	browser = await chromium.launch();
	await mkdir("/private/tmp/mizen-focused-previews", { recursive: true });
});
afterAll(async () => {
	await browser?.close();
	await teardownTestServer(handle);
});
it.each(cases)(
	"$slug has one focused preview in $theme at $width",
	async ({ slug, theme, width }) => {
		const page = await browser.newPage({ viewport: { height: 900, width } });
		await page.addInitScript(
			(value) => localStorage.setItem("mizen-theme", value),
			theme
		);
		const errors: string[] = [];
		page.on("pageerror", (error) => errors.push(error.message));
		await page.goto(`${handle.url}/docs/components/${slug}`, {
			waitUntil: "networkidle",
		});
		const preview = page.locator('[data-slot="component-preview"]');
		expect(
			await preview
				.locator(
					'input:not([type="hidden"]):not([aria-hidden="true"]),textarea,button[role="combobox"]'
				)
				.count()
		).toBe(1);
		expect(await preview.locator("h2,h3,form").count()).toBe(0);
		expect(
			await preview.evaluate((el) => el.scrollWidth <= el.clientWidth)
		).toBe(true);
		expect(
			await page.locator('[data-slot="usage-preview"]').count()
		).toBeGreaterThan(1);
		await preview.scrollIntoViewIfNeeded();
		await page.screenshot({
			path: `/private/tmp/mizen-focused-previews/${slug}-${theme}-${width}.png`,
		});
		await page.locator("#examples").scrollIntoViewIfNeeded();
		expect(
			await page
				.locator("#examples")
				.getByRole("tab", { exact: true, name: "Code" })
				.count()
		).toBeGreaterThan(1);
		expect(errors).toEqual([]);
		await page.close();
	}
);
