import { type Browser, chromium } from "playwright";
import { expect as expectLocator } from "playwright/test";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

// Run against a production preview; development intentionally keeps loaders fresh.
describe.skipIf(process.env.MIZEN_DOCS_PERFORMANCE !== "1")(
	"production docs performance",
	() => {
		let handle: TestServerHandle;
		let browser: Browser;
		beforeAll(async () => {
			handle = await setupTestServer(new URL("..", import.meta.url).pathname);
			browser = await chromium.launch({ headless: true });
		});
		afterAll(async () => {
			await browser?.close();
			await teardownTestServer(handle);
		});
		it("preloads an intended component and reuses its data through history", async () => {
			const page = await browser.newPage();
			try {
				await page.goto(`${handle.url}/docs/components/button`, {
					waitUntil: "networkidle",
				});
				const requests: string[] = [];
				page.on("request", (request) => {
					if (request.url().includes("/_serverFn/")) {
						requests.push(request.url());
					}
				});
				const inputLink = page
					.locator('[data-slot="desktop-sidebar"]')
					.getByRole("link", { exact: true, name: "Input" });
				const [preloaded] = await Promise.all([
					page.waitForResponse(
						(response) =>
							response.url().includes("/_serverFn/") && response.ok()
					),
					inputLink.hover(),
				]);
				await inputLink.click();
				await expectLocator(
					page.getByRole("heading", { exact: true, level: 1, name: "Input" })
				).toBeVisible();
				await page.goBack();
				await expectLocator(
					page.getByRole("heading", { exact: true, level: 1, name: "Button" })
				).toBeVisible();
				await inputLink.click();
				await expectLocator(
					page.getByRole("heading", { exact: true, level: 1, name: "Input" })
				).toBeVisible();
				await page.waitForLoadState("networkidle");
				// The original prerendered page may have aged out of the Router cache.
				expect(requests.filter((url) => url === preloaded.url())).toHaveLength(
					1
				);
			} finally {
				await page.close();
			}
		});

		it.each([
			{ maximumBytes: 1_100_000, path: "/" },
			{ maximumBytes: 800_000, path: "/docs" },
			{ maximumBytes: 900_000, path: "/docs/installation" },
			{ maximumBytes: 1_200_000, path: "/docs/components/button" },
		])(
			"keeps $path within its JavaScript budget",
			async ({ path, maximumBytes }) => {
				const page = await browser.newPage();
				const errors: string[] = [];
				page.on("pageerror", (error) => errors.push(error.message));
				try {
					const response = await page.goto(`${handle.url}${path}`, {
						waitUntil: "networkidle",
					});
					expect(response?.status()).toBe(200);
					await page.waitForFunction(() => Boolean(window.__TSR_ROUTER__));
					const font = await page.evaluate(async () => {
						await document.fonts.ready;
						const preloads = Array.from(
							document.querySelectorAll<HTMLLinkElement>('link[as="font"]')
						);
						const [preload] = preloads;
						return {
							count: preloads.length,
							crossOrigin: preload?.crossOrigin,
							loaded: document.fonts.check(
								'400 16px "Wix Madefor Text Variable"'
							),
							requests: performance
								.getEntriesByName(preload?.href ?? "")
								.map(
									(entry) => (entry as PerformanceResourceTiming).initiatorType
								),
						};
					});
					expect(font).toEqual({
						count: 1,
						crossOrigin: "anonymous",
						loaded: true,
						requests: ["link"],
					});
					const scripts = await page.evaluate(() =>
						performance
							.getEntriesByType("resource")
							.filter(
								(entry): entry is PerformanceResourceTiming =>
									entry instanceof PerformanceResourceTiming &&
									entry.name.includes("/assets/") &&
									entry.name.endsWith(".js")
							)
							.map((entry) => ({
								bytes: entry.decodedBodySize,
								path: new URL(entry.name).pathname,
							}))
					);
					expect(scripts.length).toBeGreaterThan(0);
					// Decoded sizes measure downloaded code independently of transport compression.
					expect(
						scripts.reduce((sum, script) => sum + script.bytes, 0),
						JSON.stringify(scripts)
					).toBeLessThan(maximumBytes);
					expect(errors).toEqual([]);
				} finally {
					await page.close();
				}
			}
		);
	}
);
