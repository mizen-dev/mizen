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

function separatorGeometry(el: Element) {
	const previous = el.previousElementSibling?.getBoundingClientRect();
	const next = el.nextElementSibling?.getBoundingClientRect();
	if (!(previous && next)) {
		throw new Error("A joined separator must sit between controls.");
	}
	const horizontal = el.getAttribute("aria-orientation") === "horizontal";
	const line = getComputedStyle(el, "::before");
	const rect = el.getBoundingClientRect();
	return [
		horizontal ? rect.height : rect.width,
		horizontal ? next.top - previous.bottom : next.left - previous.right,
		horizontal ? line.left : line.top,
		horizontal ? line.right : line.bottom,
		horizontal ? line.height : line.width,
	];
}

describe("Toggle and Toggle Group", { timeout: 30_000 }, () => {
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
	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
	});

	it.each(["light", "dark"] as const)(
		"aligns standalone text and icons and preserves every state in %s",
		async (theme) => {
			await page.emulateMedia({
				colorScheme: theme,
				forcedColors: "none",
				reducedMotion: "reduce",
			});
			await page.setViewportSize({ height: 900, width: 1280 });
			await page.goto(`${handle.url}/components/toggle`, {
				waitUntil: "networkidle",
			});
			const tools = page.locator("#ToggleDocumentToolsExample1");
			const bold = tools.getByRole("button", {
				exact: true,
				name: "Bold text",
			});
			const geometry = await bold.evaluate((el) => {
				const icon = el.querySelector("svg")?.getBoundingClientRect();
				const label = el.querySelector("span")?.getBoundingClientRect();
				if (!(icon && label)) {
					throw new Error("Missing toggle content");
				}
				return {
					height: el.getBoundingClientRect().height,
					offset: Math.abs(
						icon.y + icon.height / 2 - label.y - label.height / 2
					),
				};
			});
			expect(geometry.height).toBe(36);
			expect(geometry.offset).toBeLessThan(1);
			expect(await bold.getAttribute("aria-pressed")).toBe("true");
			const selected = await bold.evaluate(
				(el) => getComputedStyle(el, "::before").backgroundColor
			);
			await bold.click();
			expect(await bold.getAttribute("aria-pressed")).toBe("false");
			expect(
				await bold.evaluate(
					(el) => getComputedStyle(el, "::before").backgroundColor
				)
			).not.toBe(selected);
			await bold.press("Space");
			expect(await bold.getAttribute("aria-pressed")).toBe("true");
			expect(
				await bold.evaluate((el) => getComputedStyle(el).outlineWidth)
			).toBe("3px");
			const disabled = page
				.locator("#ToggleManagedActionExample2")
				.getByRole("button", { exact: true, name: "Selected" });
			expect(await disabled.isDisabled()).toBe(true);
			const resting = await disabled.evaluate(
				(el) => getComputedStyle(el, "::before").backgroundColor
			);
			await disabled.hover();
			expect(
				await disabled.evaluate(
					(el) => getComputedStyle(el, "::before").backgroundColor
				)
			).toBe(resting);
			const dimensions = await page
				.locator("#ToggleControlSizesExample3 button[aria-label]")
				.evaluateAll((els) =>
					els.map((el) => {
						const rect = el.getBoundingClientRect();
						return [rect.width, rect.height];
					})
				);
			expect(dimensions).toEqual([
				[32, 32],
				[36, 36],
				[40, 40],
			]);
			await page
				.locator("#ToggleControlSizesExample3")
				.screenshot({ path: `/private/tmp/mizen-toggle-${theme}.png` });
			const controlled = page.locator("#ToggleControlledState");
			await controlled.getByRole("button", { name: "Pin project" }).click();
			expect(
				await controlled
					.getByText("Project pinned", { exact: true })
					.isVisible()
			).toBe(true);
		}
	);

	it.each(["light", "dark"] as const)(
		"joins outlines and preserves single, multiple, disabled, and vertical behavior in %s",
		async (theme) => {
			await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
			await page.goto(`${handle.url}/components/toggle-group`, {
				waitUntil: "networkidle",
			});
			const single = page
				.locator("#preview")
				.getByRole("group", { name: "Text alignment" });
			const center = single.getByRole("button", {
				exact: true,
				name: "Center",
			});
			await center.click();
			expect(await single.locator('[aria-pressed="true"]').count()).toBe(1);
			await center.click();
			expect(await single.locator('[aria-pressed="true"]').count()).toBe(0);
			const multiple = page.getByRole("group", {
				exact: true,
				name: "Text styles",
			});
			await multiple
				.getByRole("button", { exact: true, name: "Italic" })
				.click();
			expect(await multiple.locator('[aria-pressed="true"]').count()).toBe(2);
			const joins = await multiple.locator("button").evaluateAll((els) =>
				els.map((el) => {
					const style = getComputedStyle(el);
					return [style.borderTopLeftRadius, style.borderTopRightRadius];
				})
			);
			expect(joins).toEqual([
				["16px", "0px"],
				["0px", "0px"],
				["0px", "16px"],
			]);
			expect(
				await multiple.locator('[data-slot="toggle-group-separator"]').count()
			).toBe(2);
			expect(
				await multiple
					.locator('[data-slot="toggle-group-separator"]')
					.first()
					.evaluate(separatorGeometry)
			).toEqual([0, 0, "8px", "8px", "1px"]);
			await multiple
				.getByRole("button", { exact: true, name: "Underline" })
				.click();
			expect(
				await multiple
					.locator("button")
					.evaluateAll(
						(els) =>
							new Set(els.map((el) => getComputedStyle(el).borderTopColor)).size
					)
			).toBe(1);
			await multiple.screenshot({
				path: `/private/tmp/mizen-joined-toggle-${theme}.png`,
			});
			const unavailable = page.getByRole("group", {
				exact: true,
				name: "Formatting with disabled italic",
			});
			await unavailable
				.getByRole("button", { exact: true, name: "Bold" })
				.focus();
			await page.keyboard.press("ArrowRight");
			expect(
				await unavailable
					.getByRole("button", { exact: true, name: "Underline" })
					.evaluate((el) => el === document.activeElement)
			).toBe(true);
			await page.keyboard.press("ArrowRight");
			expect(
				await unavailable
					.getByRole("button", { exact: true, name: "Bold" })
					.evaluate((el) => el === document.activeElement)
			).toBe(true);
			expect(
				await page
					.getByRole("group", { exact: true, name: "Disabled formatting" })
					.locator("button:disabled")
					.count()
			).toBe(3);
			const vertical = page.getByRole("group", {
				exact: true,
				name: "Layout direction",
			});
			await vertical.getByRole("button", { exact: true, name: "Rows" }).focus();
			await page.keyboard.press("ArrowDown");
			expect(
				await vertical
					.getByRole("button", { exact: true, name: "Columns" })
					.evaluate((el) => el === document.activeElement)
			).toBe(true);
			const row = vertical.locator("button").first();
			expect(
				await row.evaluate((el) => getComputedStyle(el).borderBottomLeftRadius)
			).toBe("0px");
			expect(
				await vertical
					.locator('[data-slot="toggle-group-separator"]')
					.evaluate(separatorGeometry)
			).toEqual([0, 0, "8px", "8px", "1px"]);
			await page
				.locator("#ToggleGroupIconSizes")
				.screenshot({ path: `/private/tmp/mizen-toggle-group-${theme}.png` });
			const withTooltip = page.getByRole("group", {
				exact: true,
				name: "Formatting with tooltips",
			});
			await withTooltip
				.getByRole("button", { exact: true, name: "Italic" })
				.hover();
			const tooltip = page.locator('[data-slot="tooltip-popup"][data-open]');
			await tooltip.waitFor();
			expect(await tooltip.textContent()).toContain("Italic");
			await withTooltip
				.getByRole("button", { exact: true, name: "Italic" })
				.click();
			expect(
				await withTooltip
					.getByRole("button", { exact: true, name: "Italic" })
					.getAttribute("aria-pressed")
			).toBe("true");
		}
	);

	it("keeps selection readable in forced colors and respects reduced motion", async () => {
		await page.emulateMedia({
			forcedColors: "active",
			reducedMotion: "reduce",
		});
		await page.goto(`${handle.url}/components/toggle`, {
			waitUntil: "networkidle",
		});
		const selected = page
			.locator("#ToggleDocumentToolsExample1")
			.getByRole("button", { exact: true, name: "Bold text" });
		const styles = await selected.evaluate((el) => {
			const style = getComputedStyle(el);
			return {
				adjust: style.forcedColorAdjust,
				background: getComputedStyle(el, "::before").backgroundColor,
				color: style.color,
				duration: style.transitionDuration,
			};
		});
		expect(styles.background).not.toBe(styles.color);
		expect(styles.duration).toBe("0s");
		expect(styles.adjust).toBe("none");
	});

	it("responds on pointer down for standalone and joined controls", async () => {
		await page.emulateMedia({
			forcedColors: "none",
			reducedMotion: "no-preference",
		});
		await page.goto(`${handle.url}/components/toggle`, {
			waitUntil: "networkidle",
		});
		const toggle = page
			.locator("#ToggleDocumentToolsExample1")
			.getByRole("button", { exact: true, name: "Bold text" });
		await toggle.hover();
		await page.mouse.down();
		// The surface insets 2px per edge with the fast press transition.
		await expect
			.poll(() =>
				toggle.evaluate((el) => getComputedStyle(el, "::before").inset)
			)
			.toBe("1px");
		expect(
			await toggle.evaluate(
				(el) => getComputedStyle(el, "::before").transitionDuration
			)
		).toBe("0.1s");
		await page.mouse.up();
		await page.goto(`${handle.url}/components/toggle-group`, {
			waitUntil: "networkidle",
		});
		const joined = page
			.getByRole("group", { exact: true, name: "Text styles" })
			.getByRole("button", { exact: true, name: "Bold" });
		await joined.hover();
		await page.mouse.down();
		// Joined items contract only across the group.
		await expect
			.poll(() =>
				joined.evaluate((el) => getComputedStyle(el, "::before").inset)
			)
			.toBe("1px -1px");
		await page.mouse.up();
	});

	it("keeps grouped controls inside a narrow viewport", async () => {
		await page.emulateMedia({ forcedColors: "none" });
		await page.setViewportSize({ height: 900, width: 320 });
		await page.goto(`${handle.url}/components/toggle-group`, {
			waitUntil: "networkidle",
		});
		const bounds = await page
			.locator('[data-slot="toggle-group"]')
			.evaluateAll((els) =>
				els.map((el) => {
					const box = el.getBoundingClientRect();
					return { end: box.right, start: box.left };
				})
			);
		expect(bounds.every((box) => box.start >= 0 && box.end <= 320)).toBe(true);
	});
});
