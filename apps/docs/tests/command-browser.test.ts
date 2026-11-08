import { type Browser, chromium, type Page } from "playwright";
import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from "vite-plus/test";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
const OPEN_TRIGGER_NAME_REGEX = /Open Command Palette/iu;
let handle: TestServerHandle;
let browser: Browser;
let page: Page;
const consoleErrors: string[] = [];
const pageErrors: string[] = [];

function throwTeardownFailures(
	results: readonly PromiseSettledResult<unknown>[]
): void {
	const failures = results
		.filter((r): r is PromiseRejectedResult => r.status === "rejected")
		.map(({ reason }) => reason);
	if (failures.length === 1) {
		throw failures[0];
	}
	if (failures.length > 1) {
		throw new AggregateError(failures, "Command browser teardown failed");
	}
}

describe("Command browser integration", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		page.setDefaultTimeout(8000);
		page.on("console", (msg) => {
			if (msg.type() === "error") {
				consoleErrors.push(msg.text());
			}
		});
		page.on("pageerror", (err) => {
			pageErrors.push(err.message);
		});
	}, 120_000);

	beforeEach(async () => {
		consoleErrors.length = 0;
		pageErrors.length = 0;
		await page.setViewportSize({ height: 800, width: 1280 });
		await page.goto(`${handle.url}/components/command`, {
			waitUntil: "networkidle",
		});
	});

	afterAll(async () => {
		const results = await Promise.allSettled([
			Promise.resolve().then(() => browser?.close()),
			Promise.resolve().then(() => teardownTestServer(handle)),
		]);
		throwTeardownFailures(results);
	}, 120_000);

	it("renders command components with safe geometry and no overflow at 375px and 320px", async () => {
		await page.setViewportSize({ height: 800, width: 375 });
		const response375 = await page.goto(`${handle.url}/components/command`, {
			waitUntil: "networkidle",
		});
		expect(response375?.status()).toBe(200);
		await page
			.getByRole("button", { exact: true, name: "Search actions and pages" })
			.click();

		const standaloneInputGroup375 = page
			.locator('[data-slot="command-input-group"]')
			.last();
		await standaloneInputGroup375.waitFor({ state: "visible" });
		const hasOverflow375 = await standaloneInputGroup375.evaluate(
			(el) => el.scrollWidth > el.clientWidth
		);
		expect(hasOverflow375).toBe(false);

		await page.setViewportSize({ height: 800, width: 320 });
		const response320 = await page.goto(`${handle.url}/components/command`, {
			waitUntil: "networkidle",
		});
		expect(response320?.status()).toBe(200);
		await page
			.getByRole("button", { exact: true, name: "Search actions and pages" })
			.click();

		const standaloneInputGroup320 = page
			.locator('[data-slot="command-input-group"]')
			.last();
		await standaloneInputGroup320.waitFor({ state: "visible" });
		const hasOverflow320 = await standaloneInputGroup320.evaluate(
			(el) => el.scrollWidth > el.clientWidth
		);
		expect(hasOverflow320).toBe(false);

		await page.keyboard.press("Escape");
		await standaloneInputGroup320.waitFor({ state: "detached" });
		const modalTrigger320 = page.getByRole("button", {
			name: OPEN_TRIGGER_NAME_REGEX,
		});
		await modalTrigger320.click();

		const dialog320 = page.getByRole("dialog", { name: "Command palette" });
		await dialog320.waitFor({ state: "visible" });

		const footer320 = dialog320.locator('[data-slot="command-footer"]');
		await footer320.waitFor({ state: "visible" });
		const hasFooterOverflow320 = await footer320.evaluate(
			(el) => el.scrollWidth > el.clientWidth
		);
		expect(hasFooterOverflow320).toBe(false);

		const closeButton320 = dialog320.getByRole("button", { name: "Close" });
		expect(await closeButton320.isVisible()).toBe(true);

		await closeButton320.click();
		await dialog320.waitFor({ state: "detached" });

		expect(consoleErrors).toEqual([]);
		expect(pageErrors).toEqual([]);
	});

	it("handles modal open, focus, Escape, and focus restoration", async () => {
		await page.setViewportSize({ height: 800, width: 1024 });
		const trigger = page.getByRole("button", {
			name: OPEN_TRIGGER_NAME_REGEX,
		});
		await trigger.waitFor({ state: "visible" });
		await trigger.click();

		const dialog = page.getByRole("dialog", { name: "Command palette" });
		await dialog.waitFor({ state: "visible" });
		expect(await dialog.isVisible()).toBe(true);

		const popup = page.locator('[data-slot="command-dialog-popup"]');
		await popup.waitFor({ state: "visible" });
		expect(await popup.isVisible()).toBe(true);

		const popupBox = await popup.boundingBox();
		expect(
			popupBox &&
				popupBox.x > 0 &&
				popupBox.y > 0 &&
				popupBox.x + popupBox.width <= 1024 &&
				popupBox.y + popupBox.height <= 800
		).toBe(true);

		const modalInput = popup.locator('input[data-slot="command-input"]');
		await modalInput.waitFor({ state: "visible" });
		expect(
			await modalInput.evaluate((el) => document.activeElement === el)
		).toBe(true);

		await page.keyboard.press("Escape");
		await popup.waitFor({ state: "detached" });
		expect(await popup.count()).toBe(0);

		expect(await trigger.evaluate((el) => document.activeElement === el)).toBe(
			true
		);

		expect(consoleErrors).toEqual([]);
		expect(pageErrors).toEqual([]);
	});

	it("dismisses modal via visible Close button and restores focus to trigger", async () => {
		await page.setViewportSize({ height: 800, width: 1024 });
		const trigger = page.getByRole("button", {
			name: OPEN_TRIGGER_NAME_REGEX,
		});
		await trigger.waitFor({ state: "visible" });
		await trigger.click();

		const dialog = page.getByRole("dialog", { name: "Command palette" });
		await dialog.waitFor({ state: "visible" });

		const closeButton = dialog.getByRole("button", { name: "Close" });
		await closeButton.waitFor({ state: "visible" });
		expect(await closeButton.isVisible()).toBe(true);

		await closeButton.click();
		await dialog.waitFor({ state: "detached" });
		expect(
			await page.locator('[data-slot="command-dialog-popup"]').count()
		).toBe(0);

		expect(await trigger.evaluate((el) => document.activeElement === el)).toBe(
			true
		);

		expect(consoleErrors).toEqual([]);
		expect(pageErrors).toEqual([]);
	});

	it.each(["light", "dark"] as const)(
		"keeps grouped palette typography aligned in %s",
		async (theme) => {
			await page.evaluate(
				(value) => localStorage.setItem("mizen-theme", value),
				theme
			);
			await page.reload({ waitUntil: "networkidle" });
			await page
				.getByRole("button", { exact: true, name: "Search actions and pages" })
				.click();
			const palette = page.getByRole("dialog", {
				exact: true,
				name: "Actions and pages",
			});
			const input = palette.locator('[data-slot="command-input"]');
			expect(
				await input.evaluate((element) => getComputedStyle(element).height)
			).toBe("44px");
			expect(
				await input.evaluate((element) => getComputedStyle(element).fontSize)
			).toBe("16px");
			// A plain search row: no field chrome and no permanent ring.
			expect(
				await input.evaluate((element) => {
					const style = getComputedStyle(element);
					return [style.boxShadow, style.outlineStyle, style.borderTopWidth];
				})
			).toEqual(["none", "none", "0px"]);
			const shortcut = palette
				.locator('[data-slot="command-shortcut"]')
				.first();
			expect(
				await shortcut.locator('[data-slot="kbd"]').allTextContents()
			).toEqual(["⌘", "N"]);
			const footer = palette.locator('[data-slot="command-footer"]');
			const item = palette.locator('[data-slot="command-item"]').first();
			// Measure after the dialog's scale-in settles.
			await palette.evaluate((element) =>
				Promise.all(
					element
						.getAnimations({ subtree: true })
						.map((animation) => animation.finished)
				)
			);
			// Footer text starts where row content starts.
			const footerStart = await footer.evaluate(
				(element) =>
					element.getBoundingClientRect().left +
					Number.parseFloat(getComputedStyle(element).paddingInlineStart)
			);
			const rowStart = await item.evaluate(
				(element) =>
					element.getBoundingClientRect().left +
					Number.parseFloat(getComputedStyle(element).paddingInlineStart)
			);
			expect(Math.abs(footerStart - rowStart)).toBeLessThan(1);
			expect(await footer.locator('[data-slot="kbd"] svg').count()).toBe(3);
			const footerKey = footer.locator('[data-slot="kbd"]').first();
			expect(
				await footerKey.evaluate(
					(element) => getComputedStyle(element).backgroundColor
				)
			).not.toBe(
				await footer.evaluate(
					(element) => getComputedStyle(element).backgroundColor
				)
			);
			const group = palette
				.locator('[data-slot="command-group-label"]')
				.first();
			const label = item.locator(":scope > span").first();
			expect(
				await label.evaluate((element) =>
					getComputedStyle(element).getPropertyValue("text-box-trim")
				)
			).toBe("trim-both");
			expect(
				await label.evaluate((element) =>
					getComputedStyle(element).getPropertyValue("text-box-edge")
				)
			).toBe("cap alphabetic");

			expect(
				await group.evaluate((element) => getComputedStyle(element).color)
			).not.toBe(
				await item.evaluate((element) => getComputedStyle(element).color)
			);
			expect(
				await item.evaluate((element) => getComputedStyle(element).minHeight)
			).toBe("32px");
			const viewport = palette.locator('[data-slot="scroll-area-viewport"]');
			await viewport.evaluate((element) => {
				element.scrollTop = element.scrollHeight;
			});
			await expect
				.poll(() =>
					viewport.evaluate((element) => {
						const rows = element.querySelectorAll('[data-slot="command-item"]');
						const last = rows.item(rows.length - 1);
						return (
							element.getBoundingClientRect().bottom -
							last.getBoundingClientRect().bottom
						);
					})
				)
				.toBeCloseTo(8, 1);
			await palette.screenshot({
				path: `/private/tmp/mizen-command-grouped-${theme}.png`,
			});
			await page.setViewportSize({ height: 800, width: 375 });
			await palette.screenshot({
				path: `/private/tmp/mizen-command-grouped-narrow-${theme}.png`,
			});
			expect(
				await palette.evaluate(
					(element) => element.scrollWidth <= element.clientWidth
				)
			).toBe(true);
			await input.fill("No matching command 123");
			await palette
				.getByText("No matching results.")
				.waitFor({ state: "visible" });
			await page.keyboard.press("Escape");
			await palette.waitFor({ state: "detached" });
		}
	);

	it("handles grouped filtering and keyboard navigation", async () => {
		await page
			.getByRole("button", { exact: true, name: "Search actions and pages" })
			.click();
		const standaloneContainer = page.getByRole("dialog", {
			exact: true,
			name: "Actions and pages",
		});
		const standaloneInput = standaloneContainer.getByPlaceholder(
			"Filter actions and pages..."
		);
		await standaloneInput.waitFor({ state: "visible" });
		await standaloneInput.click();

		await standaloneInput.fill("Doc");

		const newDocItem = standaloneContainer.locator(
			'[data-slot="command-item"]:has-text("New document")'
		);
		const docsItem = standaloneContainer.locator(
			'[data-slot="command-item"]:has-text("Documentation")'
		);
		const copyLinkItem = standaloneContainer.locator(
			'[data-slot="command-item"]:has-text("Copy link")'
		);

		await newDocItem.waitFor({ state: "visible" });
		await docsItem.waitFor({ state: "visible" });
		expect(await copyLinkItem.count()).toBe(0);

		await page.keyboard.press("ArrowDown");
		expect(
			await docsItem.evaluate((el) => el.hasAttribute("data-highlighted"))
		).toBe(true);

		expect(consoleErrors).toEqual([]);
		expect(pageErrors).toEqual([]);
	});
});
