import { type Browser, chromium, type Page } from "playwright";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
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
		.filter((r): r is PromiseRejectedResult => r.status === "rejected")
		.map(({ reason }) => reason);
	if (failures.length === 1) {
		throw failures[0];
	}
	if (failures.length > 1) {
		throw new AggregateError(
			failures,
			"Combobox chips browser teardown failed"
		);
	}
}

describe("Combobox browser integration - Multiple chips", () => {
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
	}, 120_000);

	beforeEach(async () => {
		await page.setViewportSize({ height: 800, width: 1280 });
		await page.goto(`${handle.url}/components/combobox`, {
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

	it("anchors multiple popup below the chips container with matching alignment and width", async () => {
		await page.setViewportSize({ height: 1200, width: 1280 });
		const chipInput = page.getByPlaceholder("Add tag...");
		// Leave room below the field so this test does not trigger collision flipping.
		await chipInput.evaluate((input) =>
			input.scrollIntoView({ block: "center" })
		);
		await chipInput.click();

		const chipsContainer = page.locator(
			'#MultipleCombobox [data-slot="combobox-chips"]'
		);
		await chipsContainer.waitFor({ state: "visible" });
		const chipsBounds = await chipsContainer.boundingBox();

		const positioner = page.locator('[data-slot="combobox-positioner"]').last();
		await positioner.waitFor({ state: "visible" });
		const positionerBounds = await positioner.boundingBox();

		expect(chipsBounds).not.toBeNull();
		expect(positionerBounds).not.toBeNull();
		if (chipsBounds && positionerBounds) {
			// Floating UI rounds centered anchors to device pixels.
			expect(Math.abs(positionerBounds.x - chipsBounds.x)).toBeLessThanOrEqual(
				0.5
			);
			expect(
				Math.abs(positionerBounds.width - chipsBounds.width)
			).toBeLessThanOrEqual(1);
			expect(positionerBounds.y).toBeGreaterThanOrEqual(
				chipsBounds.y + chipsBounds.height - 1
			);
		}

		await page.keyboard.press("Escape");
	});

	it("supports multiple chips, chip removal, and non-overlapping flow layout", async () => {
		const chips = page.locator(
			'#MultipleCombobox [data-slot="combobox-chips"]'
		);
		await chips.waitFor({ state: "visible" });

		const designChip = chips.locator(
			'[data-slot="combobox-chip"]:has-text("Design")'
		);
		expect(await designChip.isVisible()).toBe(true);

		const chipInput = chips.locator('[data-slot="combobox-chips-input"]');
		expect(await chipInput.isVisible()).toBe(true);

		const designBounds = await designChip.boundingBox();
		const inputBounds = await chipInput.boundingBox();
		expect(designBounds).not.toBeNull();
		expect(inputBounds).not.toBeNull();
		if (designBounds && inputBounds) {
			expect(designBounds.x + designBounds.width).toBeLessThanOrEqual(
				inputBounds.x + 4
			);
		}

		const removeBtn = designChip.locator('[data-slot="combobox-chip-remove"]');
		expect(await removeBtn.getAttribute("aria-label")).toBe("Remove");
		await removeBtn.click();

		expect(
			await chips
				.locator('[data-slot="combobox-chip"]:has-text("Design")')
				.count()
		).toBe(0);

		expect(
			await chips
				.locator('[data-slot="combobox-chip"]:has-text("Engineering")')
				.isVisible()
		).toBe(true);
	});

	it("supports keyboard navigation from chips input to chip with visible focus indicator and deletion", async () => {
		const chipInput = page.getByPlaceholder("Add tag...");
		await chipInput.click();

		const engineeringChip = page.locator(
			'[data-slot="combobox-chip"]:has-text("Engineering")'
		);
		await engineeringChip.waitFor({ state: "visible" });

		await page.keyboard.press("ArrowLeft");

		const isChipFocused = await engineeringChip.evaluate(
			(el) => document.activeElement === el
		);
		expect(isChipFocused).toBe(true);

		const outlineWidth = await engineeringChip.evaluate(
			(el) => getComputedStyle(el).outlineWidth
		);
		expect(outlineWidth).toBe("3px");

		await page.keyboard.press("Backspace");

		const chips = page.locator(
			'#MultipleCombobox [data-slot="combobox-chips"]'
		);
		expect(
			await chips
				.locator('[data-slot="combobox-chip"]:has-text("Engineering")')
				.count()
		).toBe(0);
		expect(
			await chips
				.locator('[data-slot="combobox-chip"]:has-text("Design")')
				.isVisible()
		).toBe(true);
	});

	it("keeps small chip input text at 16px on narrow viewports", async () => {
		const input = page.locator(
			'#MultipleCombobox [data-slot="combobox-chips-input"]'
		);
		expect(
			await input.evaluate((element) => getComputedStyle(element).fontSize)
		).toBe("14px");
		await page.setViewportSize({ height: 800, width: 320 });
		expect(
			await input.evaluate((element) => getComputedStyle(element).fontSize)
		).toBe("16px");
	});
	it("derives field decoration from its editable input rather than chip actions", async () => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		const chips = page.locator(
			'#MultipleCombobox [data-slot="combobox-chips"]'
		);
		const input = chips.locator('[data-slot="combobox-chips-input"]');
		const read = (element: Element) => {
			const style = getComputedStyle(element);
			return {
				border: style.borderColor,
				fill: style.backgroundColor,
				opacity: style.opacity,
				shadow: style.boxShadow,
			};
		};
		const initial = await chips.evaluate(read);
		// Exercise native CSS states without changing the selection or validation model.
		await chips
			.locator('[data-slot="combobox-chip-remove"]')
			.first()
			.evaluate((element) => {
				(element as HTMLButtonElement).disabled = true;
			});
		expect(await chips.evaluate(read)).toEqual(initial);
		await input.evaluate((element) =>
			element.setAttribute("aria-invalid", "true")
		);
		expect((await chips.evaluate(read)).border).not.toBe(initial.border);
		await input.evaluate((element) => {
			(element as HTMLInputElement).disabled = true;
		});
		const disabled = await chips.evaluate(read);
		expect(disabled.border).toBe(initial.border);
		expect(disabled.fill).not.toBe(initial.fill);
		expect(disabled.shadow).toBe("none");
		expect(disabled.opacity).toBe("1");
		await page.emulateMedia({ reducedMotion: "no-preference" });
	});
});
