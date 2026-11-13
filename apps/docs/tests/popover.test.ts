import { type Browser, chromium, type Page } from "playwright";
import { expect as expectLocator } from "playwright/test";
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
		throw new AggregateError(failures, "Failed to tear down the popover test");
	}
}

describe("Popover component route", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		page.setDefaultTimeout(6000);
		await page.goto(`${handle.url}/components/popover`, {
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

	it("places Popover without overlapping its trigger and restores focus on close", async () => {
		const trigger = page.getByRole("button", {
			exact: true,
			name: "Edit project",
		});
		await trigger.click();
		const popup = page.getByRole("dialog");
		await popup.waitFor({ state: "visible" });
		expect(await popup.isVisible()).toBe(true);
		const labelledBy = await popup.getAttribute("aria-labelledby");
		const describedBy = await popup.getAttribute("aria-describedby");
		expect(await page.locator(`#${labelledBy}`).textContent()).toBe(
			"Edit project"
		);
		expect(await page.locator(`#${describedBy}`).textContent()).toContain(
			"easy to recognize"
		);
		// Polled: the popup scales and slides in, so its first frames can touch
		// the trigger.
		await expect
			.poll(async () => {
				const [triggerBox, popupBox] = await Promise.all([
					trigger.boundingBox(),
					popup.boundingBox(),
				]);
				return (
					triggerBox &&
					popupBox &&
					(popupBox.y >= triggerBox.y + triggerBox.height ||
						popupBox.y + popupBox.height <= triggerBox.y)
				);
			})
			.toBe(true);
		await page.getByRole("button", { exact: true, name: "Done" }).click();
		await popup.waitFor({ state: "detached" });
		expect(await popup.count()).toBe(0);
		expect(
			await trigger.evaluate((element) => document.activeElement === element)
		).toBe(true);
	});
	it.each(["light", "dark"] as const)(
		"supports native styling, retained drafts, and dismiss states in %s",
		async (theme) => {
			await page.emulateMedia({ colorScheme: theme });
			await page.goto(`${handle.url}/components/popover`, {
				waitUntil: "networkidle",
			});
			const trigger = page.getByRole("button", {
				exact: true,
				name: "Quick note",
			});
			await trigger.click();
			const popup = page.locator('section[data-slot="popover-popup"]');
			expect(await popup.evaluate((el) => el.tagName)).toBe("SECTION");
			await expectLocator(popup).toHaveAttribute("data-open", "");
			await popup
				.getByRole("textbox", { name: "Note draft" })
				.fill("Keep this draft");
			await page.keyboard.press("Escape");
			await popup.waitFor({ state: "hidden" });
			await expectLocator(popup).toHaveAttribute("data-closed", "");
			await trigger.click();
			expect(
				await popup.getByRole("textbox", { name: "Note draft" }).inputValue()
			).toBe("Keep this draft");
			await popup.getByRole("button", { exact: true, name: "Done" }).click();
			await popup.waitFor({ state: "hidden" });
			await expect
				.poll(() => trigger.evaluate((el) => document.activeElement === el))
				.toBe(true);
			expect(
				await page
					.getByRole("button", { exact: true, name: "Unavailable" })
					.isDisabled()
			).toBe(true);
		}
	);

	it.each(["light", "dark"] as const)(
		"supports compact hover content and detached transitions in %s",
		async (theme) => {
			await page.emulateMedia({ colorScheme: theme });
			await page.goto(`${handle.url}/components/popover`, {
				waitUntil: "networkidle",
			});
			const info = page.getByRole("button", {
				exact: true,
				name: "Password requirements",
			});
			await info.hover();
			const tip = page.locator('[data-slot="popover-popup"][data-open]');
			await tip.waitFor({ state: "visible" });
			expect(await tip.textContent()).toContain("eight characters");
			expect(await tip.evaluate((el) => getComputedStyle(el).fontSize)).toBe(
				"12px"
			);
			await page.keyboard.press("Escape");
			await tip.waitFor({ state: "detached" });
			const notifications = page.getByRole("button", {
				exact: true,
				name: "Shared notifications",
			});
			const profile = page.getByRole("button", {
				exact: true,
				name: "Shared profile",
			});
			await notifications.click();
			const popup = page.locator('[data-slot="popover-popup"][data-open]');
			await popup.waitFor({ state: "visible" });
			const id = await popup.getAttribute("id");
			await profile.click();
			await expect
				.poll(() => popup.locator("[data-current]").textContent())
				.toContain("Maya Chen");
			expect(await popup.getAttribute("id")).toBe(id);
			await expect.poll(() => popup.locator("[data-previous]").count()).toBe(0);
			await popup.screenshot({
				path: `/private/tmp/mizen-popover-detached-${theme}.png`,
			});
			await page.keyboard.press("Escape");
			await popup.waitFor({ state: "detached" });
		}
	);

	it.each([
		[1280, 288],
		[280, 248],
	])(
		"wraps text alone at the default width in a %ipx window",
		async (width, expected) => {
			await page.setViewportSize({ height: 900, width });
			await page.goto(`${handle.url}/components/popover`, {
				waitUntil: "networkidle",
			});
			await page
				.getByRole("button", { exact: true, name: "About the shared bank" })
				.click();
			const popup = page.locator('[data-slot="popover-popup"][data-open]');
			await popup.waitFor({ state: "visible" });
			// 18rem, or the room the window leaves; never one long line.
			await expect
				.poll(async () => (await popup.boundingBox())?.width)
				.toBe(expected);
			const description = popup.locator('[data-slot="popover-description"]');
			expect((await description.boundingBox())?.height).toBeGreaterThan(40);
			expect(
				await page.evaluate(() => document.documentElement.scrollWidth)
			).toBeLessThanOrEqual(width);
			await page.keyboard.press("Escape");
			await popup.waitFor({ state: "detached" });
			await page.setViewportSize({ height: 900, width: 1280 });
		}
	);

	it.each(["light", "dark"] as const)(
		"fits all sides and dismisses outside with reduced motion in %s",
		async (theme) => {
			await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
			await page.setViewportSize({ height: 800, width: 390 });
			await page.goto(`${handle.url}/components/popover`, {
				waitUntil: "networkidle",
			});
			for (const side of ["top", "right", "bottom", "left"]) {
				const trigger = page.getByRole("button", { exact: true, name: side });
				// biome-ignore lint/performance/noAwaitInLoops: Popups share one page and must open sequentially.
				await trigger.click();
				const popup = page.getByRole("dialog", {
					exact: true,
					name: `Anchored ${side}`,
				});
				await popup.waitFor({ state: "visible" });
				const box = await popup.boundingBox();
				expect(box?.x).toBeGreaterThanOrEqual(0);
				expect(box ? box.x + box.width : 1000).toBeLessThanOrEqual(390);
				expect(
					await popup.evaluate((el) => getComputedStyle(el).transitionDuration)
				).toBe("0s");
				await page.locator("h1").click();
				await popup.waitFor({ state: "detached" });
			}
			await page.setViewportSize({ height: 900, width: 1280 });
			await page.emulateMedia({ reducedMotion: "no-preference" });
		}
	);
});
