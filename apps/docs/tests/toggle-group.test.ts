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

// Focused previews show one ordinary state; named examples own the variants.
const example = (title: string) =>
	page.getByRole("region", {
		exact: true,
		name: `Toggle group: ${title} example`,
	});

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
			"Failed to tear down the toggle-group test"
		);
	}
}

describe("ToggleGroup component route", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		page.setDefaultTimeout(6000);
		await page.goto(`${handle.url}/components/toggle-group`, {
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

	it("renders ToggleGroup states, multiple selection, and inherited styles", async () => {
		const left = page
			.getByRole("region", { exact: true, name: "Toggle group preview" })
			.getByRole("button", { exact: true, name: "Left" });
		const center = page
			.getByRole("region", { exact: true, name: "Toggle group preview" })
			.getByRole("button", { exact: true, name: "Center" });
		expect(await left.getAttribute("aria-pressed")).toBe("true");
		await center.press("Space");
		expect(await left.getAttribute("aria-pressed")).toBe("false");
		expect(await center.getAttribute("aria-pressed")).toBe("true");

		const bold = example("Text formatting").getByRole("button", {
			exact: true,
			name: "Bold",
		});
		const italic = example("Text formatting").getByRole("button", {
			exact: true,
			name: "Italic",
		});
		await italic.press("Space");
		expect(
			await Promise.all(
				[bold, italic].map((toggle) => toggle.getAttribute("aria-pressed"))
			)
		).toEqual(["true", "true"]);

		const rows = example("Canvas layout").getByRole("button", {
			exact: true,
			name: "Rows",
		});
		expect(
			await rows.evaluate((element) => getComputedStyle(element).height)
		).toBe("28px");
	});

	it("scrolls horizontal groups within a large-text host and preserves keyboard toggling", async () => {
		await page.setViewportSize({ height: 900, width: 375 });
		await page.goto(`${handle.url}/components/toggle-group`, {
			waitUntil: "networkidle",
		});
		await page.evaluate(() => {
			document.documentElement.style.fontSize = "200%";
		});

		// The paragraph alignment example has text labels that overflow at 200%.
		const alignment = example("Paragraph alignment");
		const group = alignment.locator('[data-slot="toggle-group"]');
		const left = alignment.getByRole("button", { exact: true, name: "Left" });
		const right = alignment.getByRole("button", { exact: true, name: "Right" });
		await right.focus();
		await right.press("Space");

		const layout = await page.evaluate(() => ({
			documentWidth: document.documentElement.scrollWidth,
			viewportWidth: window.innerWidth,
		}));
		const groupBox = await group.boundingBox();
		expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth);
		expect(groupBox?.width ?? 0).toBeLessThanOrEqual(247);
		expect(
			await group.evaluate(
				(element) => element.scrollWidth > element.clientWidth
			)
		).toBe(true);
		expect(
			await group.evaluate((element) => element.scrollLeft)
		).toBeGreaterThan(0);
		expect(await left.getAttribute("aria-pressed")).toBe("false");
		expect(await right.getAttribute("aria-pressed")).toBe("true");

		const outlineGroup = example("Text formatting").locator(
			'[data-slot="toggle-group"]'
		);
		const underline = outlineGroup.getByRole("button", {
			exact: true,
			name: "Underline",
		});
		await underline.focus();
		await underline.press("Space");
		// The focus ring animates in; measure it at rest.
		await underline.evaluate((element) =>
			Promise.all(
				element.getAnimations().map((animation) => animation.finished)
			)
		);
		const visibleFocus = await page.evaluate(() => {
			const button = document.activeElement;
			const groupElement = button?.closest('[data-slot="toggle-group"]');
			if (
				!(button instanceof HTMLElement && groupElement instanceof HTMLElement)
			) {
				return false;
			}
			const buttonRect = button.getBoundingClientRect();
			const groupRect = groupElement.getBoundingClientRect();
			const styles = getComputedStyle(button);
			// scrollLeft stops on a whole pixel while widths are fractional,
			// so allow under a pixel of rounding.
			const focusExtent =
				Number.parseFloat(styles.outlineWidth) +
				Number.parseFloat(styles.outlineOffset) -
				0.99;
			return (
				buttonRect.left - focusExtent >= groupRect.left &&
				buttonRect.right + focusExtent <= groupRect.right &&
				buttonRect.top - focusExtent >= groupRect.top &&
				buttonRect.bottom + focusExtent <= groupRect.bottom
			);
		});
		expect(await underline.getAttribute("aria-pressed")).toBe("true");
		expect(visibleFocus).toBe(true);
		expect(
			await outlineGroup.evaluate(
				(element) => element.scrollWidth > element.clientWidth
			)
		).toBe(true);
		expect(
			await outlineGroup.evaluate((element) => element.scrollLeft)
		).toBeGreaterThan(0);
	});
});
