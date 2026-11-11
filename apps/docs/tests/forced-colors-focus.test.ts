import { type Browser, chromium, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
const TRANSPARENT_BACKGROUND_PATTERN = /rgba\([^)]*,\s*0(?:\.0+)?\)$/u;
let handle: TestServerHandle;
let browser: Browser;
let page: Page;
const consoleErrors: string[] = [];
const pageErrors: string[] = [];

async function expectNoOutline(element: ReturnType<Page["locator"]>) {
	expect(
		await element.evaluate((node) => getComputedStyle(node).outlineStyle)
	).toBe("none");
}

async function expectFocusOutline(element: ReturnType<Page["locator"]>) {
	expect(
		await element.evaluate((node) => getComputedStyle(node).outlineStyle)
	).toBe("solid");
	expect(
		await element.evaluate((node) => getComputedStyle(node).outlineWidth)
	).toBe("2px");
}

async function expectSystemColorAdjustment(
	element: ReturnType<Page["locator"]>
) {
	expect(
		await element.evaluate((node) => getComputedStyle(node).forcedColorAdjust)
	).toBe("none");
}

function contrastRatio(first: string, second: string) {
	const luminance = (color: string) => {
		const channels =
			color
				.match(/[\d.]+/gu)
				?.slice(0, 3)
				.map(Number) ?? [];
		const [red, green, blue] = channels.map((channel) => {
			const value = channel / 255;
			return value <= 0.040_45
				? value / 12.92
				: ((value + 0.055) / 1.055) ** 2.4;
		});
		return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
	};
	const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
	return (values[0] + 0.05) / (values[1] + 0.05);
}

// Computed colors may be lab() or oklch(); a canvas converts any of them to sRGB.
function toRgb(color: string): Promise<string> {
	return page.evaluate((value) => {
		const canvas = document.createElement("canvas");
		canvas.width = 1;
		canvas.height = 1;
		const context = canvas.getContext("2d");
		if (!context) {
			throw new Error("Canvas 2D context is unavailable");
		}
		context.fillStyle = value;
		context.fillRect(0, 0, 1, 1);
		const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
		return `rgb(${red}, ${green}, ${blue})`;
	}, color);
}

async function pageContrast(first: string, second: string) {
	return contrastRatio(await toRgb(first), await toRgb(second));
}

async function expectIndicatorContrast(
	element: ReturnType<Page["locator"]>,
	indicatorSelector: string
) {
	const colors = await element.evaluate((node, selector) => {
		const indicator = node.querySelector(selector);
		let indicatorColor = "transparent";
		if (indicator) {
			const style = getComputedStyle(indicator);
			indicatorColor =
				indicator.tagName === "path" ? style.stroke : style.backgroundColor;
		}
		return {
			background: getComputedStyle(node).backgroundColor,
			indicator: indicatorColor,
		};
	}, indicatorSelector);
	expect(
		contrastRatio(colors.background, colors.indicator)
	).toBeGreaterThanOrEqual(3);
}

async function expectHighlightedItem(
	item: ReturnType<Page["locator"]>,
	container: ReturnType<Page["locator"]>,
	requireSystemColorAdjustmentNone = false
) {
	await item.evaluate((node) =>
		Promise.all(
			node
				.getAnimations()
				.map((animation) => animation.finished.catch(() => undefined))
		)
	);
	const colors = await Promise.all([
		item.evaluate((node) => {
			const descendants = [...node.querySelectorAll("*")]
				.filter(
					(element) =>
						element.children.length === 0 && element.textContent?.trim()
				)
				.map((element) => {
					let surface: Element | null = element;
					let background = "transparent";
					while (surface && surface !== node.parentElement) {
						const candidate = getComputedStyle(surface).backgroundColor;
						if (candidate !== "transparent" && !candidate.endsWith(", 0)")) {
							background = candidate;
							break;
						}
						surface = surface.parentElement;
					}
					return {
						background,
						color: getComputedStyle(element).color,
						forcedColorAdjust: getComputedStyle(element).forcedColorAdjust,
						text: element.textContent?.trim(),
					};
				});
			return {
				background: getComputedStyle(node).backgroundColor,
				color: getComputedStyle(node).color,
				descendants,
				forcedColorAdjust: getComputedStyle(node).forcedColorAdjust,
			};
		}),
		container.evaluate((node) => {
			let surface: Element | null = node;
			while (surface) {
				const background = getComputedStyle(surface).backgroundColor;
				if (background !== "transparent" && !background.endsWith(", 0)")) {
					return background;
				}
				surface = surface.parentElement;
			}
			return "transparent";
		}),
	]);
	expect(colors[0].background).not.toMatch(TRANSPARENT_BACKGROUND_PATTERN);
	expect(colors[0].background).not.toBe(colors[1]);
	if (requireSystemColorAdjustmentNone) {
		expect(colors[0].forcedColorAdjust).toBe("none");
	}
	expect(
		await pageContrast(colors[0].background, colors[0].color)
	).toBeGreaterThanOrEqual(3);
	const descendantContrasts = await Promise.all(
		colors[0].descendants.map((descendant) =>
			pageContrast(descendant.background, descendant.color)
		)
	);
	for (const [index, descendant] of colors[0].descendants.entries()) {
		expect(
			descendantContrasts[index],
			JSON.stringify(descendant)
		).toBeGreaterThanOrEqual(3);
		if (requireSystemColorAdjustmentNone) {
			expect(descendant.forcedColorAdjust).toBe("none");
		}
	}
}

async function openComponent(slug: string) {
	await page.goto(`${handle.url}/components/${slug}`, {
		waitUntil: "networkidle",
	});
}

describe("forced-colors focus and control states", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		// Settled focus rings: the ring grows in over 200ms otherwise.
		await page.emulateMedia({ reducedMotion: "reduce" });
		page.on("console", (message) => {
			if (message.type() === "error") {
				consoleErrors.push(message.text());
			}
		});
		page.on("pageerror", (error) => pageErrors.push(error.message));
		page.setDefaultTimeout(6000);
		await page.emulateMedia({ forcedColors: "active" });
	}, 120_000);

	afterAll(async () => {
		const results = await Promise.allSettled([
			Promise.resolve().then(() => browser?.close()),
			Promise.resolve().then(() => teardownTestServer(handle)),
		]);
		for (const result of results) {
			if (result.status === "rejected") {
				throw result.reason;
			}
		}
	});

	it("keeps resting controls quiet and shows keyboard focus in system colors", async () => {
		await openComponent("button");
		const skipLink = page.getByRole("link", { name: "Skip to content" });
		const componentsLink = page.getByRole("link", {
			exact: true,
			name: "Docs",
		});
		await expectNoOutline(skipLink);
		await expectNoOutline(componentsLink);
		await page.keyboard.press("Tab");
		await expectFocusOutline(skipLink);
		await componentsLink.focus();
		await expectFocusOutline(componentsLink);

		const button = page.getByRole("button", { exact: true, name: "Default" });
		await expectNoOutline(button);
		await button.focus();
		await page.keyboard.press("Space");
		await expectFocusOutline(button);

		await openComponent("input");
		const input = page
			.getByRole("textbox", { exact: true, name: "Project name" })
			.first();
		await expectNoOutline(input);
		await input.focus();
		await expectFocusOutline(input);

		await openComponent("switch");
		const checkedSwitch = page.getByRole("switch", { name: "Sync changes" });
		const uncheckedSwitch = page.getByRole("switch", { name: "Compact mode" });
		const switchColors = await Promise.all(
			[checkedSwitch, uncheckedSwitch].map((element) =>
				element.evaluate((node) => getComputedStyle(node).backgroundColor)
			)
		);
		expect(switchColors[0]).not.toBe(switchColors[1]);
		await expectNoOutline(uncheckedSwitch);
		await uncheckedSwitch.focus();
		await page.keyboard.press("Space");
		await expectFocusOutline(uncheckedSwitch);
		expect(await uncheckedSwitch.getAttribute("aria-checked")).toBe("true");

		await openComponent("checkbox");
		const checkedCheckbox = page.getByRole("checkbox", {
			name: "Product updates",
		});
		const uncheckedCheckbox = page.getByRole("checkbox", {
			name: "Small option",
		});
		expect(await checkedCheckbox.locator("svg").count()).toBeGreaterThan(0);
		expect(await uncheckedCheckbox.locator("svg").count()).toBe(0);
		await expectNoOutline(uncheckedCheckbox);
		await uncheckedCheckbox.focus();
		await page.keyboard.press("Space");
		await expectFocusOutline(uncheckedCheckbox);
		expect(await uncheckedCheckbox.getAttribute("aria-checked")).toBe("true");

		await openComponent("radio-group");
		const selectedRadio = page.getByRole("radio", {
			name: "Comfortable density",
		});
		const unselectedRadio = page.getByRole("radio", {
			name: "Compact density",
		});
		expect(
			await selectedRadio.locator("[data-slot='radio-indicator']").count()
		).toBeGreaterThan(0);
		expect(
			await unselectedRadio.locator("[data-slot='radio-indicator']").count()
		).toBe(0);
		await expectIndicatorContrast(
			selectedRadio,
			"[data-slot='radio-indicator']"
		);
		await expectNoOutline(unselectedRadio);

		await openComponent("checkbox");
		const indeterminateCheckbox = page.getByRole("checkbox", {
			name: "Team settings",
		});
		await expectIndicatorContrast(indeterminateCheckbox, "svg path");

		await openComponent("select");
		const select = page.getByRole("combobox", { name: "Small select" });
		await expectNoOutline(select);
		await select.focus();
		await expectFocusOutline(select);
		await page.keyboard.press("Space");
		expect(await select.getAttribute("aria-expanded")).toBe("true");
		await page.keyboard.press("ArrowDown");
		const highlightedOption = page.locator("[role='option'][data-highlighted]");
		await expectHighlightedItem(
			highlightedOption,
			page.getByRole("listbox"),
			true
		);
		await page.keyboard.press("Escape");

		await openComponent("menu");
		await page.getByRole("button", { name: "Project actions" }).click();
		await page.keyboard.press("ArrowDown");
		const highlightedMenuItem = page.locator(
			"[role='menuitem'][data-highlighted]"
		);
		await expectHighlightedItem(
			highlightedMenuItem,
			page.getByRole("menu"),
			true
		);

		await openComponent("command");
		await page
			.locator("[data-slot='component-preview']")
			.getByRole("button", { name: "Find a project" })
			.click();
		await page.keyboard.press("ArrowDown");
		await expectHighlightedItem(
			page.locator("[data-slot='command-item'][data-highlighted]"),
			page.locator("[data-slot='command-list']"),
			true
		);
		await page.keyboard.press("Escape");

		await openComponent("combobox");
		const comboboxInput = page.getByPlaceholder(
			"Select or search framework..."
		);
		await comboboxInput.focus();
		await page.keyboard.press("ArrowDown");
		await expectHighlightedItem(
			page.locator("[data-slot='combobox-item'][data-highlighted]"),
			page.locator("[data-slot='combobox-list']"),
			true
		);

		await openComponent("toggle-group");
		const togglePreview = page.locator("[data-slot='component-preview']");
		const pressedToggle = togglePreview.getByRole("button", { name: "Left" });
		const unpressedToggle = togglePreview.getByRole("button", {
			name: "Center",
		});
		// Press surfaces paint their fill on ::before.
		const surfaceColors = (element: typeof pressedToggle) =>
			element.evaluate((node) => ({
				background: getComputedStyle(node, "::before").backgroundColor,
				color: getComputedStyle(node).color,
			}));
		const toggleColors = await Promise.all(
			[pressedToggle, unpressedToggle].map(surfaceColors)
		);
		expect(toggleColors[0].background).not.toBe(toggleColors[1].background);
		await expectSystemColorAdjustment(pressedToggle);
		expect(
			await pageContrast(toggleColors[0].background, toggleColors[0].color)
		).toBeGreaterThanOrEqual(3);
		await pressedToggle.hover();
		expect((await surfaceColors(pressedToggle)).background).toBe(
			toggleColors[0].background
		);

		await openComponent("tabs");
		const activeTab = page
			.getByRole("region", { exact: true, name: "Tabs preview" })
			.getByRole("tab", { name: "Overview" });
		const defaultTabList = page.getByRole("tablist", {
			name: "Project views",
		});
		const activeIndicator = page
			.locator("[data-slot='component-preview'] [data-slot='tabs-indicator']")
			.first();
		const indicatorColor = await activeIndicator.evaluate(
			(node) => getComputedStyle(node).backgroundColor
		);
		const listBackground = await defaultTabList.evaluate(
			(node) => getComputedStyle(node).backgroundColor
		);
		expect(
			contrastRatio(indicatorColor, listBackground)
		).toBeGreaterThanOrEqual(3);
		await expectSystemColorAdjustment(activeTab);
		const defaultTabColors = await activeTab.evaluate((node) => ({
			background: getComputedStyle(node).backgroundColor,
			color: getComputedStyle(node).color,
		}));
		expect(
			contrastRatio(defaultTabColors.background, defaultTabColors.color)
		).toBeGreaterThanOrEqual(3);

		const underlineList = page.getByRole("tablist", {
			exact: true,
			name: "Record sections",
		});
		const underlineTab = underlineList.getByRole("tab", { name: "Details" });
		const underlineIndicator = underlineList.locator(
			"[data-slot='tabs-indicator']:visible"
		);
		const underlineColors = await underlineTab.evaluate((node) => ({
			background: getComputedStyle(document.body).backgroundColor,
			color: getComputedStyle(node).color,
		}));
		expect(
			contrastRatio(underlineColors.background, underlineColors.color)
		).toBeGreaterThanOrEqual(3);
		const underlineIndicatorColor = await underlineIndicator.evaluate(
			(node) => getComputedStyle(node, "::after").backgroundColor
		);
		expect(
			contrastRatio(underlineColors.background, underlineIndicatorColor)
		).toBeGreaterThanOrEqual(3);

		await openComponent("calendar");
		const selectedDay = page
			.getByTestId("calendar-single")
			.getByRole("gridcell", { selected: true })
			.getByRole("button");
		const singleCalendar = page.getByTestId("calendar-single");
		const unselectedDay = singleCalendar
			.locator("[role='gridcell']:not([aria-selected='true']) button")
			.first();
		// Day buttons paint their fill on ::before.
		const selectedColors = await selectedDay.evaluate((node) => ({
			background: getComputedStyle(node, "::before").backgroundColor,
			color: getComputedStyle(node).color,
		}));
		const unselectedBackground = await unselectedDay.evaluate(
			(node) => getComputedStyle(node, "::before").backgroundColor
		);
		expect(selectedColors.background).not.toBe(unselectedBackground);
		await expectSystemColorAdjustment(selectedDay);
		const selectedRangeDay = page
			.getByTestId("calendar-range")
			.getByRole("gridcell", { selected: true })
			.first()
			.getByRole("button");
		await expectSystemColorAdjustment(selectedRangeDay);
		expect(
			contrastRatio(selectedColors.background, selectedColors.color)
		).toBeGreaterThanOrEqual(3);
		await page.keyboard.press("Tab");
		await selectedDay.focus();
		await page.keyboard.press("ArrowRight");
		const focusedDay = page
			.locator("[data-slot='calendar'] :focus-visible")
			.first();
		expect(await focusedDay.count()).toBe(1);
		// The ring sits on the rounded day button, against the calendar surface.
		await expectFocusOutline(focusedDay);
		const calendarColors = await focusedDay.evaluate((node) => ({
			background: getComputedStyle(
				node.closest("[data-slot='calendar']") ?? document.body
			).backgroundColor,
			outline: getComputedStyle(node).outlineColor,
		}));
		expect(
			await pageContrast(calendarColors.background, calendarColors.outline)
		).toBeGreaterThanOrEqual(3);

		await openComponent("toast");
		await page
			.getByRole("button", { name: "Deploy production release" })
			.click();
		const toastViewport = page.locator(
			"[data-slot='toast-viewport']:has([data-slot='toast-root'])"
		);
		const toastRoot = page.locator("[data-slot='toast-root']").first();
		await toastRoot.waitFor({ state: "visible" });
		await page.keyboard.press("Tab");
		await toastViewport.focus();
		expect(
			await toastViewport.evaluate((node) => node === document.activeElement)
		).toBe(true);
		await expectNoOutline(toastRoot);
		await expectFocusOutline(toastViewport);
		expect(consoleErrors).toEqual([]);
		expect(pageErrors).toEqual([]);
	});
});
