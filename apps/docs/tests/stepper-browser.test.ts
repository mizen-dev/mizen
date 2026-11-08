import { type Browser, chromium, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
let handle: TestServerHandle;
let browser: Browser;
let page: Page;

describe("Stepper presentation", { timeout: 20_000 }, () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		page.setDefaultTimeout(8000);
	}, 120_000);
	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
	});
	it.each(["light", "dark"] as const)(
		"aligns the track and all status markers in %s",
		async (theme) => {
			await page.emulateMedia({ colorScheme: theme });
			await page.setViewportSize({ height: 900, width: 1280 });
			await page.goto(`${handle.url}/components/stepper`, {
				waitUntil: "networkidle",
			});
			const list = page.getByRole("list", {
				exact: true,
				name: "Workspace setup",
			});
			await list.scrollIntoViewIfNeeded();
			expect(
				await list.evaluate((el) => getComputedStyle(el).flexDirection)
			).toBe("row");
			const items = list.locator('[data-slot="stepper-item"]');
			expect(await items.count()).toBe(5);
			expect(await list.locator('[aria-current="step"]').count()).toBe(1);
			const geometry = await items.first().evaluate((el) => {
				const marker = el
					.querySelector('[data-slot="stepper-indicator"]')
					?.getBoundingClientRect();
				const title = el
					.querySelector('[data-slot="stepper-title"]')
					?.getBoundingClientRect();
				if (!(marker && title)) {
					throw new Error("Missing step anatomy");
				}
				return {
					bar: getComputedStyle(el, "::before").height,
					marker: marker.width,
					offset: Math.abs(
						marker.y + marker.height / 2 - title.y - title.height / 2
					),
				};
			});
			expect(geometry.marker).toBe(16);
			expect(geometry.offset).toBeLessThan(1);
			expect(geometry.bar).toBe("4px");
			expect(await items.first().locator("svg").isVisible()).toBe(true);
			expect(
				await items
					.nth(2)
					.locator('[data-slot="stepper-indicator"] > span')
					.first()
					.isVisible()
			).toBe(false);
			expect(
				await items
					.nth(3)
					.locator('[data-slot="stepper-indicator"] > span')
					.first()
					.isVisible()
			).toBe(true);
			await list.screenshot({
				path: `/private/tmp/mizen-stepper-${theme}.png`,
			});
			const numbered = page.getByRole("list", { name: "Numbered setup" });
			expect(
				await numbered
					.locator('[data-slot="stepper-indicator"] span')
					.first()
					.isVisible()
			).toBe(true);
			const vertical = page.getByRole("list", { name: "Deployment progress" });
			await vertical.scrollIntoViewIfNeeded();
			expect(
				await vertical.evaluate((el) => getComputedStyle(el).flexDirection)
			).toBe("column");
			expect(
				await vertical
					.locator("li")
					.last()
					.evaluate((el) => getComputedStyle(el, "::before").display)
			).toBe("none");
		}
	);
	it("keeps completed markers distinct in forced colors", async () => {
		await page.emulateMedia({ forcedColors: "active" });
		await page.goto(`${handle.url}/components/stepper`, {
			waitUntil: "networkidle",
		});
		const marker = page
			.getByRole("list", { exact: true, name: "Workspace setup" })
			.locator('[data-status="complete"] [data-slot="stepper-indicator"]')
			.first();
		expect(
			await marker.evaluate(
				(el) =>
					getComputedStyle(el).backgroundColor === getComputedStyle(el).color
			)
		).toBe(false);
		expect(await marker.locator("svg").isVisible()).toBe(true);
		await page.emulateMedia({ forcedColors: "none" });
	});

	it("collapses horizontal progress to its current label in narrow containers", async () => {
		await page.setViewportSize({ height: 800, width: 320 });
		await page.goto(`${handle.url}/components/stepper`, {
			waitUntil: "networkidle",
		});
		const list = page.getByRole("list", {
			exact: true,
			name: "Workspace setup",
		});
		await list.scrollIntoViewIfNeeded();
		expect(
			await list.evaluate((el) => getComputedStyle(el).flexDirection)
		).toBe("row");
		const box = await list.boundingBox();
		if (!box) {
			throw new Error("Missing progress list");
		}
		expect(box.x + box.width).toBeLessThanOrEqual(320);
		expect(
			await list.getByText("Integrations", { exact: true }).isVisible()
		).toBe(true);
	});
	it("keeps interactive headings separate from preserved input content", async () => {
		await page.setViewportSize({ height: 900, width: 1280 });
		await page.goto(`${handle.url}/components/stepper`, {
			waitUntil: "networkidle",
		});
		const list = page.getByRole("list", { name: "Editable setup" });
		const input = list.getByRole("textbox", { name: "Project name" });
		await input.fill("Changed project");
		expect(await input.evaluate((el) => el.closest("button"))).toBeNull();
		const first = list.getByRole("button", { name: "Go to Details" });
		await first.focus();
		await page.keyboard.press("Enter");
		expect(await list.locator('[aria-current="step"]').textContent()).toContain(
			"Details"
		);
		expect(await list.getByRole("textbox").inputValue()).toBe(
			"Changed project"
		);
		expect(
			await list.getByRole("button", { name: "Go to Review" }).isDisabled()
		).toBe(true);
	});

	it("preserves custom indicators and reserved empty marker space", async () => {
		await page.goto(`${handle.url}/components/stepper`, {
			waitUntil: "networkidle",
		});
		const list = page.getByRole("list", { name: "Indicator modes" });
		await list.scrollIntoViewIfNeeded();
		const custom = list.locator('[data-mode="custom"]');
		expect(await custom.locator("svg").count()).toBe(1);
		expect(await custom.locator("svg").isVisible()).toBe(true);
		const none = list.locator('[data-mode="none"]');
		expect(await none.evaluate((el) => getComputedStyle(el).visibility)).toBe(
			"hidden"
		);
		expect((await none.boundingBox())?.width).toBe(16);
	});

	it("aligns markers on a continuous horizontal rail", async () => {
		await page.setViewportSize({ height: 900, width: 1280 });
		await page.goto(`${handle.url}/components/stepper`, {
			waitUntil: "networkidle",
		});
		const list = page.getByRole("list", { name: "On-track setup" });
		await list.scrollIntoViewIfNeeded();
		const item = list.locator("li").first();
		const rail = await item.evaluate((el) => ({
			height: getComputedStyle(el, "::before").height,
			top: getComputedStyle(el, "::before").top,
		}));
		expect(rail).toEqual({ height: "2px", top: "7px" });
		await list.screenshot({ path: "/private/tmp/mizen-stepper-on-track.png" });
	});

	it("preserves application-owned forward and backward navigation", async () => {
		await page.goto(`${handle.url}/components/stepper`, {
			waitUntil: "networkidle",
		});
		const list = page.getByRole("list", { name: "Project setup" });
		const frame = list.locator("xpath=ancestor::section[1]");
		await frame.getByRole("button", { exact: true, name: "Continue" }).click();
		expect(await list.locator('[data-status="complete"]').count()).toBe(1);
		expect(await page.getByTestId("stepper-status").textContent()).toContain(
			"Step 2 of 3"
		);
		await frame.getByRole("button", { exact: true, name: "Back" }).click();
		expect(await list.locator('[data-status="complete"]').count()).toBe(0);
		expect(await page.getByTestId("stepper-status").textContent()).toContain(
			"Step 1 of 3"
		);
	});

	it.each(["light", "dark"] as const)(
		"keeps label ink and marker content centered in %s",
		async (theme) => {
			await page.emulateMedia({ colorScheme: theme, forcedColors: "none" });
			await page.setViewportSize({ height: 900, width: 1280 });
			await page.goto(`${handle.url}/components/stepper`, {
				waitUntil: "networkidle",
			});
			const list = page.getByRole("list", { name: "Indicator modes" });
			await list.scrollIntoViewIfNeeded();
			const offsets = await list
				.locator('[data-slot="stepper-indicator"]')
				.evaluateAll((markers) =>
					markers.map((marker) => {
						const content =
							marker.querySelector("svg") ?? marker.querySelector("span span");
						if (!content) {
							return 0;
						}
						const box = marker.getBoundingClientRect();
						const ink = content.getBoundingClientRect();
						return Math.abs(box.y + box.height / 2 - ink.y - ink.height / 2);
					})
				);
			expect(Math.max(...offsets)).toBeLessThan(1);
			const title = page
				.getByRole("list", { exact: true, name: "Workspace setup" })
				.getByText("Integrations", { exact: true });
			const clearance = await title.evaluate((ink) => {
				const ctx = document.createElement("canvas").getContext("2d");
				if (!ctx) {
					throw new Error("Missing text geometry");
				}
				ctx.font = getComputedStyle(ink).font;
				const metrics = ctx.measureText(ink.textContent ?? "");
				// A cap-trimmed box ends at the alphabetic baseline. Its descender ink needs extra room.
				return (
					Number.parseFloat(getComputedStyle(ink).paddingBottom) -
					metrics.actualBoundingBoxDescent
				);
			});
			expect(clearance).toBeGreaterThanOrEqual(0);
			const accentClearance = await title.evaluate((ink) => {
				const ctx = document.createElement("canvas").getContext("2d");
				if (!ctx) {
					throw new Error("Missing text metrics");
				}
				ctx.font = getComputedStyle(ink).font;
				return (
					Number.parseFloat(getComputedStyle(ink).paddingTop) -
					(ctx.measureText("Équipe").actualBoundingBoxAscent -
						ctx.measureText("H").actualBoundingBoxAscent)
				);
			});
			expect(accentClearance).toBeGreaterThanOrEqual(0);
			await list.screenshot({
				path: `/private/tmp/mizen-stepper-markers-${theme}.png`,
			});
		}
	);

	it("animates adjacent forward moves and immediately handles backward moves and jumps", async () => {
		await page.emulateMedia({ reducedMotion: "no-preference" });
		await page.goto(`${handle.url}/components/stepper`, {
			waitUntil: "networkidle",
		});
		const list = page.getByRole("list", { name: "Release checklist" });
		const frame = list.locator("xpath=ancestor::section[1]");
		await frame.getByRole("button", { exact: true, name: "Next step" }).click();
		expect(await list.locator('[data-motion="forward"]').count()).toBe(4);
		const fill = await list
			.locator("li")
			.first()
			.evaluate(async (el) => {
				const before = getComputedStyle(el, "::before").backgroundSize;
				await new Promise((resolve) => setTimeout(resolve, 400));
				return {
					after: getComputedStyle(el, "::before").backgroundSize,
					before,
				};
			});
		expect(fill.before).not.toBe("100% 100%");
		expect(fill.after).toBe("100% 100%");
		await frame.getByRole("button", { exact: true, name: "Next step" }).click();
		await frame
			.getByRole("button", { exact: true, name: "Previous step" })
			.click();
		expect(await list.locator('[data-motion="forward"]').count()).toBe(0);
		expect(
			await list
				.locator("li")
				.nth(1)
				.evaluate((el) => getComputedStyle(el, "::before").backgroundSize)
		).toBe("0% 100%");
		await frame
			.getByRole("button", { exact: true, name: "Previous step" })
			.click();
		await list.getByRole("button", { name: "Go to Verify" }).click();
		expect(await list.locator('[data-motion="forward"]').count()).toBe(0);
		expect(await list.locator('[aria-current="step"]').textContent()).toContain(
			"Verify"
		);
		await frame.screenshot({
			path: "/private/tmp/mizen-stepper-motion-review.png",
		});
	});

	it("disables progress motion when reduced motion is requested", async () => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.goto(`${handle.url}/components/stepper`, {
			waitUntil: "networkidle",
		});
		const list = page.getByRole("list", { name: "Release checklist" });
		await list
			.locator("xpath=ancestor::section[1]")
			.getByRole("button", { exact: true, name: "Next step" })
			.click();
		expect(
			await list
				.locator("li")
				.first()
				.evaluate((el) => getComputedStyle(el, "::before").transitionDuration)
		).toBe("0s");
	});
});
