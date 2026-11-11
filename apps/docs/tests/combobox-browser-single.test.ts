import { type Browser, chromium, type Locator, type Page } from "playwright";
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
const transparentOutline = /transparent|rgba\(0, 0, 0, 0\)/u;
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
		throw new AggregateError(failures, "Combobox browser teardown failed");
	}
}

describe("Combobox browser integration - Single select", () => {
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

	it("renders combobox component without errors or horizontal overflow at 375px", async () => {
		await page.setViewportSize({ height: 812, width: 375 });
		const response = await page.goto(`${handle.url}/components/combobox`, {
			waitUntil: "networkidle",
		});
		expect(response?.status()).toBe(200);

		const inputGroup = page
			.locator('[data-slot="combobox-input-group"]')
			.first();
		await inputGroup.waitFor({ state: "visible" });
		const inputGroupOverflow = await inputGroup.evaluate(
			(el) => el.scrollWidth > el.clientWidth
		);
		expect(inputGroupOverflow).toBe(false);

		expect(consoleErrors).toEqual([]);
		expect(pageErrors).toEqual([]);
	});

	it("handles typing, filtering, active-descendant navigation, and Enter selection", async () => {
		const singleInput = page.getByPlaceholder("Select or search framework…");
		await singleInput.waitFor({ state: "visible" });

		await singleInput.click();
		expect(
			await singleInput.evaluate((el) => document.activeElement === el)
		).toBe(true);

		await singleInput.fill("Sve");

		const popup = page.locator('[data-slot="combobox-popup"]').first();
		await popup.waitFor({ state: "visible" });

		const svelteItem = page.locator(
			'[data-slot="combobox-item"]:has-text("Svelte")'
		);
		expect(await svelteItem.isVisible()).toBe(true);

		const reactItem = page.locator(
			'[data-slot="combobox-item"]:has-text("React")'
		);
		expect(await reactItem.count()).toBe(0);

		await page.keyboard.press("ArrowDown");

		const inputRetainsFocus = await singleInput.evaluate(
			(el) => document.activeElement === el
		);
		expect(inputRetainsFocus).toBe(true);

		const hasHighlighted = await page
			.locator('[data-slot="combobox-item"][data-highlighted]')
			.count();
		expect(hasHighlighted).toBeGreaterThan(0);

		await page.keyboard.press("Enter");
		expect(await singleInput.inputValue()).toBe("Svelte");
		await popup.waitFor({ state: "hidden" });
	});

	it("anchors single popup below the input group with matching alignment and width", async () => {
		const singleInput = page.getByPlaceholder("Select or search framework…");
		await singleInput.evaluate((element) =>
			element.scrollIntoView({ behavior: "instant", block: "center" })
		);
		await singleInput.click();

		const positioner = page
			.locator('[data-slot="combobox-positioner"]')
			.first();
		await positioner.waitFor({ state: "visible" });
		expect(await positioner.getAttribute("data-side")).toBe("bottom");

		const singleInputGroup = page
			.locator('[data-slot="combobox-input-group"]')
			.first();
		const inputGroupBounds = await singleInputGroup.boundingBox();
		const positionerBounds = await positioner.boundingBox();
		expect(inputGroupBounds).not.toBeNull();
		expect(positionerBounds).not.toBeNull();
		if (inputGroupBounds && positionerBounds) {
			// Floating UI rounds centered anchors to device pixels.
			expect(
				Math.abs(positionerBounds.x - inputGroupBounds.x)
			).toBeLessThanOrEqual(0.5);
			expect(positionerBounds.width).toBeCloseTo(inputGroupBounds.width, 0);
			expect(positionerBounds.y).toBeGreaterThanOrEqual(
				inputGroupBounds.y + inputGroupBounds.height - 1
			);
		}

		await page.keyboard.press("Escape");
	});

	it("selects a value and clears it via accessible clear button without trigger collision", async () => {
		const singleInput = page.getByPlaceholder("Select or search framework…");
		await singleInput.waitFor({ state: "visible" });

		const inputGroup = page
			.locator('[data-slot="combobox-input-group"]')
			.filter({ has: singleInput });
		const triggerBtn = inputGroup.locator('[data-slot="combobox-trigger"]');
		expect(await triggerBtn.isVisible()).toBe(true);
		expect(
			await inputGroup.locator('[data-slot="combobox-clear"]').count()
		).toBe(0);

		await singleInput.click();

		const popup = page.locator('[data-slot="combobox-popup"]').first();
		await popup.waitFor({ state: "visible" });

		const vueOption = page.locator(
			'[data-slot="combobox-item"]:has-text("Vue")'
		);
		await vueOption.waitFor({ state: "visible" });
		await vueOption.click();

		expect(await singleInput.inputValue()).toBe("Vue");
		await popup.waitFor({ state: "hidden" });

		const clearBtn = inputGroup.locator('[data-slot="combobox-clear"]');
		await clearBtn.waitFor({ state: "visible" });
		expect(await clearBtn.getAttribute("aria-label")).toBe("Clear selection");
		expect(await triggerBtn.isVisible()).toBe(false);

		await clearBtn.click();

		await clearBtn.waitFor({ state: "hidden" });
		expect(await singleInput.inputValue()).toBe("");
		expect(await triggerBtn.isVisible()).toBe(true);
	});

	it("shows focus rings on caller-enabled action tab stops", async () => {
		const input = page.getByPlaceholder("Select framework with Tab");
		const inputGroup = page
			.locator('[data-slot="combobox-input-group"]')
			.filter({ has: input });
		const clear = inputGroup.locator('[data-slot="combobox-clear"]');
		const trigger = inputGroup.locator('[data-slot="combobox-trigger"]');

		await input.click();
		await page.keyboard.press("Tab");
		expect(
			await clear.evaluate((element) => document.activeElement === element)
		).toBe(true);

		const assertVisibleRing = async (control: Locator) => {
			const ring = await control.evaluate((element) => {
				const style = getComputedStyle(element);
				return [style.outlineStyle, style.outlineWidth, style.outlineColor];
			});
			expect(ring.slice(0, 2)).toEqual(["solid", "2px"]);
			expect(ring[2]).not.toMatch(transparentOutline);
		};
		await assertVisibleRing(clear);

		await page.keyboard.press("Enter");
		await clear.waitFor({ state: "hidden" });
		expect(await input.inputValue()).toBe("");
		await page.keyboard.press("Tab");
		expect(
			await trigger.evaluate((element) => document.activeElement === element)
		).toBe(true);
		await assertVisibleRing(trigger);
	});

	it("respects prefers-reduced-motion media condition", async () => {
		await page.emulateMedia({ reducedMotion: "reduce" });

		const singleInput = page.getByPlaceholder("Select or search framework…");
		await singleInput.click();

		const popup = page.locator('[data-slot="combobox-popup"]').first();
		await popup.waitFor({ state: "visible" });

		const transitionDuration = await popup.evaluate(
			(el) => getComputedStyle(el).transitionDuration
		);
		expect(["0s", "0ms", "0.001s"]).toContain(transitionDuration);

		await page.keyboard.press("Escape");
		await page.emulateMedia({ reducedMotion: "no-preference" });
	});

	it("supports Escape dismissal while retaining input focus", async () => {
		const singleInput = page.getByPlaceholder("Select or search framework…");
		await singleInput.click();

		const popup = page.locator('[data-slot="combobox-popup"]').first();
		await popup.waitFor({ state: "visible" });

		await page.keyboard.press("Escape");
		await popup.waitFor({ state: "hidden" });

		const inputFocused = await singleInput.evaluate(
			(el) => document.activeElement === el
		);
		expect(inputFocused).toBe(true);
	});

	it("vertically centers the chevron SVG within the trigger within 1px", async () => {
		const trigger = page.locator('[data-slot="combobox-trigger"]').first();
		await trigger.waitFor({ state: "visible" });

		const triggerBox = await trigger.boundingBox();
		const svg = trigger.locator("svg");
		const svgBox = await svg.boundingBox();

		expect(triggerBox).not.toBeNull();
		expect(svgBox).not.toBeNull();
		if (triggerBox && svgBox) {
			const triggerCenterY = triggerBox.y + triggerBox.height / 2;
			const svgCenterY = svgBox.y + svgBox.height / 2;
			expect(Math.abs(triggerCenterY - svgCenterY)).toBeLessThanOrEqual(1);
		}
	});

	it("keeps empty live region mounted without creating top whitespace above first option", async () => {
		const singleInput = page.getByPlaceholder("Select or search framework…");
		await singleInput.click();

		const popup = page.locator('[data-slot="combobox-popup"]').first();
		await popup.waitFor({ state: "visible" });

		const empty = popup.locator('[data-slot="combobox-empty"]');
		expect(await empty.count()).toBe(1);
		expect(await empty.getAttribute("aria-hidden")).toBeNull();
		expect(
			await empty.evaluate((el) => {
				const style = getComputedStyle(el);
				return (
					style.display !== "none" &&
					style.visibility !== "hidden" &&
					style.paddingTop === "0px" &&
					style.paddingBottom === "0px"
				);
			})
		).toBe(true);

		const topInset = await popup.evaluate((popupEl) => {
			const itemEl = popupEl.querySelector('[data-slot="combobox-item"]');
			if (!itemEl) {
				return null;
			}
			const popupRect = popupEl.getBoundingClientRect();
			const itemRect = itemEl.getBoundingClientRect();
			const styles = getComputedStyle(popupEl);
			const list = popupEl.querySelector('[data-slot="combobox-list"]');
			const listPadding = list
				? Number.parseFloat(getComputedStyle(list).paddingTop)
				: 0;
			return (
				itemRect.y -
				popupRect.y -
				Number.parseFloat(styles.paddingTop) -
				Number.parseFloat(styles.borderTopWidth) -
				listPadding
			);
		});

		expect(topInset).not.toBeNull();
		if (topInset !== null) {
			expect(topInset).toBeLessThanOrEqual(1);
		}

		await singleInput.fill("ZzzNonExistent");
		expect(await empty.textContent()).toBe("No frameworks found.");
		expect(
			await empty.evaluate((el) => {
				const style = getComputedStyle(el);
				return style.paddingTop !== "0px" && style.paddingBottom !== "0px";
			})
		).toBe(true);

		await page.keyboard.press("Escape");
	});
});
