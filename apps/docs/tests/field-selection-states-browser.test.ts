// biome-ignore-all lint/performance/noAwaitInLoops: These browser gestures and navigations must share one page sequentially.
import { type Browser, chromium, type Locator, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const previewName = /preview$/i;
let browser: Browser;
let page: Page;
let handle: TestServerHandle;

function readPressState(element: Element) {
	const style = getComputedStyle(element);
	const thumb = element.querySelector('[data-slot="switch-thumb"]');
	return {
		shadow: style.boxShadow,
		thumbRadius: thumb ? getComputedStyle(thumb).borderRadius : null,
		thumbTransform: thumb ? getComputedStyle(thumb).transform : null,
		transform: style.transform,
	};
}

async function press(control: Locator) {
	await control.scrollIntoViewIfNeeded();
	await control.hover({ force: true });
	const before = await control.evaluate(readPressState);
	await page.mouse.down();
	// Hold through the normal press transition, so unchanged states cannot pass early.
	await page.waitForTimeout(180);
	return before;
}

function luminance(channels: Uint8ClampedArray) {
	return [0.2126, 0.7152, 0.0722].reduce((sum, weight, index) => {
		const value = channels[index] / 255;
		return (
			sum +
			weight *
				(value <= 0.040_45 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
		);
	}, 0);
}

function placeholderContrast(element: Element) {
	const canvas = document.createElement("canvas");
	canvas.width = 1;
	canvas.height = 1;
	const context = canvas.getContext("2d");
	if (!context) {
		throw new Error("Canvas context unavailable");
	}
	let surface: Element | null = element;
	while (
		surface &&
		getComputedStyle(surface).backgroundColor === "rgba(0, 0, 0, 0)"
	) {
		surface = surface.parentElement;
	}
	if (!surface) {
		throw new Error("Field surface unavailable");
	}
	context.fillStyle = getComputedStyle(surface).backgroundColor;
	context.fillRect(0, 0, 1, 1);
	const background = context.getImageData(0, 0, 1, 1).data;
	const placeholder = element.matches("span[data-placeholder]")
		? getComputedStyle(element)
		: getComputedStyle(element, "::placeholder");
	context.globalAlpha = Number(placeholder.opacity);
	context.fillStyle = placeholder.color;
	context.fillRect(0, 0, 1, 1);
	return {
		background: Array.from(background),
		foreground: Array.from(context.getImageData(0, 0, 1, 1).data),
	};
}

describe("Field readability and selection press feedback", () => {
	beforeAll(async () => {
		handle = await setupTestServer(new URL("..", import.meta.url).pathname);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
		});
		page = await browser.newPage();
	}, 120_000);
	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
	});

	it("does not animate disabled or read-only switches and toggles", async () => {
		for (const slug of ["switch", "toggle"]) {
			await page.goto(`${handle.url}/docs/components/${slug}`, {
				waitUntil: "networkidle",
			});
			const controls = page
				.locator("#examples")
				.locator('[data-slot="switch"],[data-slot="toggle"]')
				.filter({ visible: true });
			const inert = controls.and(
				page.locator("[data-disabled],[data-readonly]")
			);
			expect(await inert.count()).toBeGreaterThan(0);
			for (const control of await inert.all()) {
				const before = await press(control);
				await expect
					.poll(() => control.evaluate(readPressState))
					.toEqual(before);
				await page.mouse.up();
			}
		}
	}, 30_000);

	it("preserves inherited disabled selection and stable inert surfaces", async () => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		for (const slug of ["checkbox", "radio-group", "switch"]) {
			await page.goto(`${handle.url}/docs/components/${slug}`, {
				waitUntil: "networkidle",
			});
			const control = page
				.locator("#examples")
				.locator("[data-disabled][data-readonly]")
				.first();
			const read = (element: Element) => {
				const style = getComputedStyle(element);
				return {
					cursor: style.cursor,
					fill: style.backgroundColor,
					opacity: Number(style.opacity),
					shadow: style.boxShadow,
				};
			};
			const before = await control.evaluate(read);
			expect(before.opacity).toBeLessThan(1);
			expect(before.fill).not.toBe("rgba(0, 0, 0, 0)");
			expect(before.shadow).toBe("none");
			expect(before.cursor).toBe("not-allowed");
			await control.hover({ force: true });
			expect(await control.evaluate(read)).toEqual(before);
		}
		await page.goto(`${handle.url}/docs/components/combobox`, {
			waitUntil: "networkidle",
		});
		const preview = page.locator("#examples");
		const disabled = preview.getByRole("combobox", {
			exact: true,
			name: "Disabled framework",
		});
		expect(await disabled.isDisabled()).toBe(true);
		expect(
			await disabled.evaluate((element) => getComputedStyle(element).boxShadow)
		).toBe("none");
		for (const name of ["Read-only framework", "Required framework"]) {
			const control = preview.getByRole("combobox", { exact: true, name });
			const border = await control.evaluate(
				(element) => getComputedStyle(element).borderColor
			);
			await control.hover();
			expect(
				await control.evaluate(
					(element) => getComputedStyle(element).borderColor
				)
			).toBe(border);
		}
		await page.emulateMedia({ reducedMotion: "no-preference" });
	}, 30_000);

	it("squishes an enabled switch from the whole track without moving its center", async () => {
		await page.emulateMedia({ reducedMotion: "no-preference" });
		await page.goto(`${handle.url}/docs/components/switch`, {
			waitUntil: "networkidle",
		});
		const control = page
			.getByRole("region", { name: previewName })
			.first()
			.getByRole("switch")
			.first();
		const thumb = control.locator('[data-slot="switch-thumb"]');
		const geometry = (element: Element) => {
			const rect = element.getBoundingClientRect();
			return { center: rect.y + rect.height / 2, height: rect.height };
		};
		await control.scrollIntoViewIfNeeded();
		await control.hover({ position: { x: 3, y: 10 } });
		const before = await thumb.evaluate(geometry);
		await page.mouse.down();
		await page.waitForTimeout(180);
		const after = await thumb.evaluate(geometry);
		expect(after.height).toBeCloseTo(before.height * 0.82, 1);
		expect(after.center).toBeCloseTo(before.center, 1);
		await page.mouse.up();
	});

	it("preserves selection geometry when reduced motion is requested", async () => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		for (const slug of ["switch", "checkbox", "toggle"]) {
			await page.goto(`${handle.url}/docs/components/${slug}`, {
				waitUntil: "networkidle",
			});
			const control = page
				.getByRole("region", { name: previewName })
				.first()
				.locator('[role="switch"],[role="checkbox"],[data-slot="toggle"]')
				.first();
			const before = await press(control);
			const after = await control.evaluate(readPressState);
			expect(after.transform).toBe(before.transform);
			expect(after.thumbTransform).toBe(before.thumbTransform);
			expect(after.thumbRadius).toBe(before.thumbRadius);
			await page.mouse.up();
		}
		await page.emulateMedia({ reducedMotion: "no-preference" });
	}, 30_000);

	it("keeps placeholders readable on field surfaces in both themes", async () => {
		for (const theme of ["light", "dark"]) {
			await page.addInitScript(
				(value) => localStorage.setItem("mizen-theme", value),
				theme
			);
			for (const slug of ["input", "textarea", "combobox", "select"]) {
				await page.goto(`${handle.url}/docs/components/${slug}`, {
					waitUntil: "networkidle",
				});
				const input = page
					.locator("[data-slot=component-preview],[data-slot=usage-preview]")
					.locator(
						"input[placeholder],textarea[placeholder],span[data-placeholder]"
					)
					.first();
				const colors = await input.evaluate(placeholderContrast);
				const background = luminance(new Uint8ClampedArray(colors.background));
				const foreground = luminance(new Uint8ClampedArray(colors.foreground));
				expect(
					(Math.max(background, foreground) + 0.05) /
						(Math.min(background, foreground) + 0.05)
				).toBeGreaterThanOrEqual(4.5);
			}
		}
	}, 30_000);
});
