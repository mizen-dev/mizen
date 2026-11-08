import { type Browser, chromium, type Locator, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import {
	componentCategories,
	componentDocs,
	getComponentDoc,
	groupedComponentDocs,
} from "../app/docs-registry";
import { EXPECTED_GROUPS } from "./component-navigation-fixtures";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
let handle: TestServerHandle;
let browser: Browser;
let page: Page;

function throwTeardownFailures(
	results: readonly PromiseSettledResult<unknown>[]
): void {
	const failures = results
		.filter(
			(result): result is PromiseRejectedResult => result.status === "rejected"
		)
		.map(({ reason }) => reason);
	if (failures.length === 1) {
		throw failures[0];
	}
	if (failures.length > 1) {
		throw new AggregateError(
			failures,
			"Failed to tear down the component navigation test"
		);
	}
}

async function extractNavGroups(navLocator: Locator) {
	const sections = navLocator.locator("section");
	const count = await sections.count();
	return Promise.all(
		Array.from({ length: count }, async (_, i) => {
			const section = sections.nth(i);
			const [rawHeading, items] = await Promise.all([
				section.locator("h2").textContent(),
				section
					.locator("a")
					.evaluateAll((elements) =>
						elements.map((el) => (el.firstChild?.textContent ?? "").trim())
					),
			]);
			return { heading: rawHeading?.trim() ?? "", items };
		})
	);
}

describe("Component navigation", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		page.setDefaultTimeout(6000);
		page.setDefaultNavigationTimeout(30_000);
	}, 120_000);

	afterAll(async () => {
		const results = await Promise.allSettled([
			Promise.resolve().then(() => browser?.close()),
			Promise.resolve().then(() => teardownTestServer(handle)),
		]);
		throwTeardownFailures(results);
	}, 120_000);

	it("preserves flat registry and exports derived groups in taxonomy order", () => {
		expect(componentDocs.length).toBe(127);
		expect(
			componentDocs.some((component) => component.slug === "side-navigation")
		).toBe(false);
		expect(componentCategories).toEqual(
			EXPECTED_GROUPS.map((group) => group.heading)
		);
		expect(
			groupedComponentDocs.map((group) => ({
				heading: group.category,
				items: group.components.map((component) => component.name),
			}))
		).toEqual(EXPECTED_GROUPS);
		const allSlugs = new Set<string>();
		for (const group of groupedComponentDocs) {
			for (const component of group.components) {
				expect(allSlugs.has(component.slug)).toBe(false);
				allSlugs.add(component.slug);
				expect(getComponentDoc(component.slug)).toBe(component);
			}
		}
		expect(allSlugs.size).toBe(componentDocs.length);
	});

	it("renders twelve semantic groups with exact alphabetical links in desktop sidebar", async () => {
		await page.setViewportSize({ height: 900, width: 1280 });
		const response = await page.goto(`${handle.url}/components/button`, {
			waitUntil: "networkidle",
		});
		expect(response?.status()).toBe(200);
		const desktopSidebar = page.locator('[data-slot="desktop-sidebar"]');
		const nav = desktopSidebar.getByRole("navigation", {
			name: "Component index",
		});
		expect(await nav.isVisible()).toBe(true);
		// Group headings label the list; no extra "Components" caption.
		expect(await nav.locator("p").count()).toBe(0);
		const groups = await extractNavGroups(nav);
		expect(groups).toEqual(EXPECTED_GROUPS);
		const buttonLink = nav.locator('a[href="/docs/components/button"]');
		expect(await buttonLink.getAttribute("aria-current")).toBe("page");
		// Navigation labels stay plain; component status belongs on its docs page.
		expect(await nav.getByText("Preview", { exact: true }).count()).toBe(0);
	});

	it("renders the same twelve labeled groups, single title, and containment in mobile browse navigation", async () => {
		await page.setViewportSize({ height: 812, width: 375 });
		await page.goto(`${handle.url}/components/button`, {
			waitUntil: "networkidle",
		});
		expect(
			await page.locator('[data-slot="desktop-sidebar"]').isVisible()
		).toBe(false);
		await page.getByRole("button", { name: "Browse" }).click();
		const mobilePopup = page.locator('[data-slot="popover-popup"]');
		await mobilePopup.waitFor({ state: "visible" });
		const mobileNav = mobilePopup.getByRole("navigation", {
			name: "Component index",
		});
		await mobileNav.waitFor({ state: "visible" });
		expect(await mobileNav.isVisible()).toBe(true);
		const componentsTitles = mobilePopup.getByText("Components", {
			exact: true,
		});
		expect(await componentsTitles.count()).toBe(1);
		expect(await componentsTitles.isVisible()).toBe(true);
		const groups = await extractNavGroups(mobileNav);
		expect(groups).toEqual(EXPECTED_GROUPS);
		const activeLink = mobileNav.locator('a[href="/docs/components/button"]');
		expect(await activeLink.getAttribute("aria-current")).toBe("page");

		const containment = await mobilePopup.evaluate((popup) => {
			const panel = popup.firstElementChild;
			const nav = popup.querySelector("nav");
			return {
				navClientWidth: nav?.clientWidth ?? 0,
				navScrollWidth: nav?.scrollWidth ?? 0,
				panelClientWidth: panel?.clientWidth ?? 0,
				panelScrollWidth: panel?.scrollWidth ?? 0,
			};
		});
		expect(containment.panelScrollWidth).toBeLessThanOrEqual(
			containment.panelClientWidth
		);
		expect(containment.navScrollWidth).toBeLessThanOrEqual(
			containment.navClientWidth
		);
		const popupBox = await mobilePopup.boundingBox();
		const activeBox = await activeLink.boundingBox();
		expect(popupBox).not.toBeNull();
		expect(activeBox).not.toBeNull();
		if (popupBox && activeBox) {
			expect(activeBox.x).toBeGreaterThanOrEqual(popupBox.x);
			expect(activeBox.x + activeBox.width).toBeLessThanOrEqual(
				popupBox.x + popupBox.width
			);
		}
	}, 15_000);

	it("renders no duplicate IDs across the entire document", async () => {
		await page.setViewportSize({ height: 900, width: 1280 });
		await page.goto(`${handle.url}/components/button`, {
			waitUntil: "networkidle",
		});
		const duplicateIds = await page.evaluate(() => {
			const ids = Array.from(document.querySelectorAll("[id]")).map(
				(el) => el.id
			);
			const seen = new Set<string>();
			return ids.filter((id) => {
				const has = seen.has(id);
				seen.add(id);
				return has;
			});
		});
		expect(duplicateIds).toEqual([]);
	});
});
