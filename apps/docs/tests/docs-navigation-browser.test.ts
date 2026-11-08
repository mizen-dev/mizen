import { type Browser, chromium } from "playwright";
import { expect as expectLocator } from "playwright/test";
import { afterAll, beforeAll, expect, it } from "vite-plus/test";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const INPUT_SPECIMEN = /input-specimen.*\.(?:js|tsx)/u;

let handle: TestServerHandle;
let browser: Browser;
beforeAll(async () => {
	handle = await setupTestServer(new URL("..", import.meta.url).pathname);
	browser = await chromium.launch({
		executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
		headless: true,
	});
});
afterAll(async () => {
	await browser?.close();
	await teardownTestServer(handle);
});

it("opens the agent guide from the footer and returns through history", async () => {
	const page = await browser.newPage();
	try {
		await page.goto(handle.url, { waitUntil: "networkidle" });
		await page.getByRole("link", { exact: true, name: "For agents" }).click();
		await expectLocator(page).toHaveURL(`${handle.url}/docs/for-agents`);
		await expectLocator(page).toHaveTitle("For agents");
		await expectLocator(
			page.getByRole("heading", { exact: true, level: 1, name: "For agents" })
		).toBeVisible();
		await page.goBack();
		await expectLocator(page).toHaveURL(`${handle.url}/`);
	} finally {
		await page.close();
	}
});

it("retains query strings and fragments in client-side legacy redirects", async () => {
	const page = await browser.newPage();
	try {
		await page.goto(`${handle.url}/docs`, { waitUntil: "networkidle" });
		// A full document navigation would let the browser preserve the fragment.
		await page.evaluate(() => {
			const router = window.__TSR_ROUTER__;
			if (!router) {
				throw new Error("The docs router has not hydrated");
			}
			return router.navigate({
				href: "/components/button?source=legacy#api",
			});
		});
		await expectLocator(page).toHaveURL(
			`${handle.url}/docs/components/button?source=legacy#api`
		);
		await expectLocator(page.locator("#api")).toHaveCount(1);
	} finally {
		await page.close();
	}
});

it.each([
	{ name: "Input", path: "/docs/components/input" },
	{ name: "Installation", path: "/docs/installation" },
])("keeps the shell visible while $name loads", async ({ name, path }) => {
	const page = await browser.newPage();
	const gate = Promise.withResolvers<void>();
	const requested = Promise.withResolvers<void>();
	try {
		await page.goto(`${handle.url}/docs/components/button`, {
			waitUntil: "networkidle",
		});
		const shell = await page
			.locator('[data-slot="docs-shell"]')
			.elementHandle();
		const visibility = await page.evaluateHandle(() => {
			const shellElement = document.querySelector('[data-slot="docs-shell"]');
			const state = {
				blank: false,
				hidden: false,
				observer: new MutationObserver(() => {
					if (!shellElement?.checkVisibility()) {
						state.hidden = true;
					}
					if (!document.querySelector("main h1")?.checkVisibility()) {
						state.blank = true;
					}
				}),
			};
			state.observer.observe(document.body, {
				attributes: true,
				childList: true,
				subtree: true,
			});
			return state;
		});
		const documents: string[] = [];
		page.on("request", (request) => {
			if (request.isNavigationRequest()) {
				documents.push(request.url());
			}
		});
		await page.route("**/_serverFn/**", async (route) => {
			requested.resolve();
			await gate.promise;
			await route.continue();
		});
		await page
			.locator('[data-slot="desktop-sidebar"]')
			.getByRole("link", { exact: true, name })
			.click();
		await requested.promise;
		await expectLocator(
			page.getByRole("heading", { exact: true, level: 1, name: "Button" })
		).toBeVisible();
		await expectLocator(
			page.locator('[data-slot="navigation-progress"]')
		).toBeVisible();
		await expectLocator(
			page.locator('[data-slot="desktop-sidebar"]')
		).toBeVisible();
		await expectLocator(page.locator("header").first()).toBeVisible();
		expect(
			await shell?.evaluate(
				(element) => element.isConnected && element.checkVisibility()
			)
		).toBe(true);
		gate.resolve();
		await expectLocator(page).toHaveURL(`${handle.url}${path}`);
		await expectLocator(
			page.getByRole("heading", { exact: true, level: 1, name })
		).toBeVisible();
		expect(
			await shell?.evaluate(
				(element) =>
					element === document.querySelector('[data-slot="docs-shell"]')
			)
		).toBe(true);
		expect(
			await visibility.evaluate((state) => {
				state.observer.disconnect();
				return state.hidden || state.blank;
			})
		).toBe(false);
		await expectLocator(
			page.locator('[data-slot="navigation-progress"]')
		).toHaveCount(0);
		expect(documents).toEqual([]);
	} finally {
		gate.resolve();
		await page.close();
	}
});

it("retains the current document until the next page examples are ready", async () => {
	const page = await browser.newPage();
	const gate = Promise.withResolvers<void>();
	const requested = Promise.withResolvers<void>();
	try {
		await page.goto(`${handle.url}/docs/components/button`, {
			waitUntil: "networkidle",
		});
		await page.route(INPUT_SPECIMEN, async (route) => {
			requested.resolve();
			await gate.promise;
			await route.continue();
		});
		await page
			.locator('[data-slot="desktop-sidebar"]')
			.getByRole("link", { exact: true, name: "Input" })
			.click();
		await requested.promise;
		await expectLocator(
			page.locator('[data-slot="navigation-progress"]')
		).toBeVisible();
		await expectLocator(
			page.getByRole("heading", { exact: true, level: 1, name: "Button" })
		).toBeVisible();
		await expectLocator(page.getByText("Loading documentation…")).toHaveCount(
			0
		);
		gate.resolve();
		await expectLocator(
			page.getByRole("heading", { exact: true, level: 1, name: "Input" })
		).toBeVisible();
		await expectLocator(
			page.locator('[data-slot="navigation-progress"]')
		).toHaveCount(0);
	} finally {
		gate.resolve();
		await page.close();
	}
});

it("recovers from a failed page request without replacing the shell", async () => {
	const page = await browser.newPage();
	try {
		await page.goto(`${handle.url}/docs/components/button`, {
			waitUntil: "networkidle",
		});
		const shell = await page
			.locator('[data-slot="docs-shell"]')
			.elementHandle();
		await page.route("**/_serverFn/**", (route) => route.abort("failed"));
		await page
			.locator('[data-slot="desktop-sidebar"]')
			.getByRole("link", { exact: true, name: "Installation" })
			.click();
		await expectLocator(
			page.getByRole("heading", { name: "Unable to load this page" })
		).toBeVisible();
		expect(
			await shell?.evaluate(
				(element) => element.isConnected && element.checkVisibility()
			)
		).toBe(true);
		await page.unroute("**/_serverFn/**");
		await page.getByRole("button", { exact: true, name: "Try again" }).click();
		await expectLocator(
			page.getByRole("heading", { exact: true, level: 1, name: "Installation" })
		).toBeVisible();
		await expectLocator(
			page.locator('[data-slot="navigation-progress"]')
		).toHaveCount(0);
	} finally {
		await page.close();
	}
});

it("offers reload recovery when an example chunk fails", async () => {
	const page = await browser.newPage();
	try {
		await page.goto(`${handle.url}/docs/components/button`, {
			waitUntil: "networkidle",
		});
		await page.route(INPUT_SPECIMEN, (route) => route.abort("failed"));
		await page
			.locator('[data-slot="desktop-sidebar"]')
			.getByRole("link", { exact: true, name: "Input" })
			.click();
		await expectLocator(
			page.getByRole("heading", { name: "Unable to load this page" })
		).toBeVisible();
		await expectLocator(
			page.locator('[data-slot="desktop-sidebar"]')
		).toBeVisible();
		await page.unroute(INPUT_SPECIMEN);
		await page
			.getByRole("button", { exact: true, name: "Reload page" })
			.click();
		await expectLocator(
			page.getByRole("heading", { exact: true, level: 1, name: "Input" })
		).toBeVisible();
	} finally {
		await page.close();
	}
});

it("updates component metadata and replaces canonicals during navigation", async () => {
	const page = await browser.newPage();
	try {
		await page.goto(`${handle.url}/docs/components/button?source=test`, {
			waitUntil: "networkidle",
		});
		await expectLocator(page).toHaveTitle("Button · Mizen UI");
		await expectLocator(page.locator('meta[name="description"]')).toHaveCount(
			1
		);
		await expectLocator(page.locator('link[rel="canonical"]')).toHaveAttribute(
			"href",
			"https://ui.mizen-labs.dev/docs/components/button/"
		);
		await page
			.locator('[data-slot="desktop-sidebar"]')
			.getByRole("link", { exact: true, name: "Installation" })
			.click();
		await expectLocator(page).toHaveTitle("Installation");
		await expectLocator(page.locator('link[rel="canonical"]')).toHaveCount(1);
		await expectLocator(page.locator('link[rel="canonical"]')).toHaveAttribute(
			"href",
			"https://ui.mizen-labs.dev/docs/installation/"
		);
	} finally {
		await page.close();
	}
});

it("restores document history without restoring the persistent sidebar", async () => {
	const page = await browser.newPage();
	try {
		await page.goto(`${handle.url}/docs/components/button`, {
			waitUntil: "networkidle",
		});
		await page.evaluate(() => {
			window.scrollTo({ behavior: "instant", top: 600 });
			const sidebar = document.querySelector(
				'[data-slot="desktop-sidebar"] [data-slot="scroll-area-viewport"]'
			);
			if (sidebar) {
				sidebar.scrollTop = 100;
			}
		});
		await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(600);
		await page.evaluate(() =>
			window.__TSR_ROUTER__?.navigate({
				params: { slug: "input" },
				to: "/docs/components/$slug",
			})
		);
		await expectLocator(
			page.getByRole("heading", { exact: true, level: 1, name: "Input" })
		).toBeVisible();
		await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
		await page.evaluate(() => {
			window.scrollTo({ behavior: "instant", top: 350 });
			const sidebar = document.querySelector(
				'[data-slot="desktop-sidebar"] [data-slot="scroll-area-viewport"]'
			);
			if (sidebar) {
				sidebar.scrollTop = 200;
			}
		});
		await page.goBack();
		await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(600);
		expect(
			await page
				.locator(
					'[data-slot="desktop-sidebar"] [data-slot="scroll-area-viewport"]'
				)
				.evaluate((element) => element.scrollTop)
		).toBe(200);
		await page.goForward();
		await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(350);
	} finally {
		await page.close();
	}
});

it("still scrolls new hash links to the requested section", async () => {
	const page = await browser.newPage();
	try {
		await page.goto(`${handle.url}/docs/components/button`, {
			waitUntil: "networkidle",
		});
		await page.evaluate(() =>
			window.__TSR_ROUTER__?.navigate({
				hash: "api",
				params: { slug: "input" },
				to: "/docs/components/$slug",
			})
		);
		await expect
			.poll(() =>
				page
					.locator("#api")
					.evaluate((element) => Math.abs(element.getBoundingClientRect().top))
			)
			.toBeLessThan(200);
	} finally {
		await page.close();
	}
});
