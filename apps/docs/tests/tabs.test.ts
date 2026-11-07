import { type Browser, chromium, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
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
		throw new AggregateError(failures, "Failed to tear down the tabs test");
	}
}

describe("Tabs component route", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		page.setDefaultTimeout(6000);
		await page.goto(`${handle.url}/components/tabs`, {
			waitUntil: "networkidle",
		});
	}, 120_000);

	afterAll(async () => {
		const results = await Promise.allSettled([
			Promise.resolve().then(() => browser?.close()),
			Promise.resolve().then(() => teardownTestServer(handle)),
		]);
		throwTeardownFailures(results);
	}, 120_000);

	it("moves Tabs selection with the keyboard and preserves disabled state", async () => {
		const preview = page
			.getByRole("tablist", { exact: true, name: "Project views" })
			.locator("..");
		const overview = preview.getByRole("tab", {
			exact: true,
			name: "Overview",
		});
		const activity = preview.getByRole("tab", {
			exact: true,
			name: "Activity",
		});
		const archive = preview.getByRole("tab", { exact: true, name: "Archive" });
		expect(await overview.getAttribute("aria-selected")).toBe("true");
		await overview.focus();
		await overview.press("ArrowRight");
		await activity.press("Enter");
		expect(await activity.getAttribute("aria-selected")).toBe("true");
		expect(
			await preview
				.getByRole("tabpanel")
				.filter({ hasText: "Recent project activity" })
				.isVisible()
		).toBe(true);
		expect(await archive.isDisabled()).toBe(true);
		expect(
			await page
				.locator("[data-slot='tabs-indicator']")
				.first()
				.getAttribute("hidden")
		).toBeNull();
	});

	it("keeps large-text tabs within their host and keyboard scrolls the list", async () => {
		await page.setViewportSize({ height: 900, width: 375 });
		await page.goto(`${handle.url}/components/tabs`, {
			waitUntil: "networkidle",
		});
		await page.evaluate(() => {
			document.documentElement.style.fontSize = "200%";
		});

		const root = page
			.getByRole("region", { exact: true, name: "Tabs preview" })
			.locator('[data-slot="tabs"]')
			.first();
		const list = root.locator('[data-slot="tabs-list"]');
		const overview = root.getByRole("tab", { exact: true, name: "Overview" });
		const activity = root.getByRole("tab", { exact: true, name: "Activity" });
		await overview.focus();
		await overview.press("ArrowRight");
		await activity.press("Enter");

		const layout = await page.evaluate(() => ({
			documentWidth: document.documentElement.scrollWidth,
			viewportWidth: window.innerWidth,
		}));
		expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth);
		expect(await activity.getAttribute("aria-selected")).toBe("true");
		expect(
			await list.evaluate(
				(element) => element.scrollWidth > element.clientWidth
			)
		).toBe(true);
		expect(
			await list.evaluate((element) => element.scrollLeft)
		).toBeGreaterThan(0);
		await page.waitForTimeout(160);
		const activeBox = await activity.boundingBox();
		const indicatorBox = await root
			.locator('[data-slot="tabs-indicator"]:visible')
			.boundingBox();
		expect(activeBox).not.toBeNull();
		expect(indicatorBox).not.toBeNull();
		expect(Math.abs((activeBox?.x ?? 0) - (indicatorBox?.x ?? 0))).toBeLessThan(
			4
		);
	});

	it("keeps the underline tab focus ring visible while its list scrolls", async () => {
		await page.setViewportSize({ height: 900, width: 375 });
		await page.goto(`${handle.url}/components/tabs`, {
			waitUntil: "networkidle",
		});
		await page.evaluate(() => {
			document.documentElement.style.fontSize = "200%";
		});

		const root = page
			.getByRole("tablist", { exact: true, name: "Record sections" })
			.locator("..");
		const list = root.locator('[data-slot="tabs-list"]');
		const details = root.getByRole("tab", { exact: true, name: "Details" });
		const comments = root.getByRole("tab", { exact: true, name: "Comments" });
		await details.focus();
		await details.press("ArrowRight");
		await comments.press("Enter");

		const visibleFocus = await page.evaluate(() => {
			const tab = document.activeElement;
			const listElement = tab?.closest('[data-slot="tabs-list"]');
			if (!(tab instanceof HTMLElement && listElement instanceof HTMLElement)) {
				return false;
			}
			const tabRect = tab.getBoundingClientRect();
			const listRect = listElement.getBoundingClientRect();
			const styles = getComputedStyle(tab);
			const focusExtent =
				Number.parseFloat(styles.outlineWidth) +
				Number.parseFloat(styles.outlineOffset);
			return (
				tabRect.left - focusExtent >= listRect.left &&
				tabRect.right + focusExtent <= listRect.right &&
				tabRect.top - focusExtent >= listRect.top &&
				tabRect.bottom + focusExtent <= listRect.bottom
			);
		});
		await page.waitForTimeout(250);
		const activeBox = await comments.boundingBox();
		const indicatorBox = await root
			.locator('[data-slot="tabs-indicator"]:visible')
			.boundingBox();

		expect(await comments.getAttribute("aria-selected")).toBe("true");
		expect(visibleFocus).toBe(true);
		expect(
			await list.evaluate(
				(element) => element.scrollWidth > element.clientWidth
			)
		).toBe(true);
		expect(
			await list.evaluate((element) => element.scrollLeft)
		).toBeGreaterThan(0);
		expect(activeBox).not.toBeNull();
		expect(indicatorBox).not.toBeNull();
		if (!(activeBox && indicatorBox)) {
			throw new Error("Active tab and indicator bounds are required");
		}
		expect(Math.abs(activeBox.x - indicatorBox.x)).toBeLessThan(4);
		await expect
			.poll(() =>
				root.evaluate((element) => {
					const tab = element.querySelector(
						'[role="tab"][aria-selected="true"]'
					);
					const indicator = element.querySelector(
						'[data-slot="tabs-indicator"]'
					);
					if (!(tab && indicator)) {
						throw new Error("Active tab and indicator are required");
					}
					return Math.abs(
						tab.getBoundingClientRect().bottom -
							indicator.getBoundingClientRect().bottom
					);
				})
			)
			.toBeLessThan(4);
	});

	it("wraps vertical tab panels below their list at large text sizes", async () => {
		const verifyAtWidth = async (width: number) => {
			await page.setViewportSize({ height: 900, width });
			await page.goto(`${handle.url}/components/tabs`, {
				waitUntil: "networkidle",
			});
			await page.evaluate(() => {
				document.documentElement.style.fontSize = "200%";
			});

			const root = page
				.getByRole("tablist", { exact: true, name: "Account sections" })
				.locator("..");
			const list = root.locator('[data-slot="tabs-list"]');
			const panel = root.getByRole("tabpanel").first();
			const layout = await page.evaluate(() => ({
				documentWidth: document.documentElement.scrollWidth,
				viewportWidth: window.innerWidth,
			}));
			const listBox = await list.boundingBox();
			const panelBox = await panel.boundingBox();

			expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth);
			expect(listBox).not.toBeNull();
			expect(panelBox).not.toBeNull();
			expect(panelBox?.y ?? 0).toBeGreaterThanOrEqual(
				(listBox?.y ?? 0) + (listBox?.height ?? 0)
			);
		};

		await verifyAtWidth(375);
		await verifyAtWidth(320);
	});
});
