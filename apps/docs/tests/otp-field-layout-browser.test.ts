import { describe, expect, it } from "vite-plus/test";
import {
	DESKTOP_SLOT_SIZE_DEFAULT_PX,
	DESKTOP_SLOT_SIZE_LG_PX,
	DESKTOP_SLOT_SIZE_SM_PX,
	DESKTOP_VIEWPORT,
	ELEMENT_TIMEOUT_MS,
	MIN_FOCUS_OUTLINE_WIDTH_PX,
	MOBILE_SLOT_SIZE_DEFAULT_PX,
	MOBILE_SLOT_SIZE_LG_PX,
	MOBILE_SLOT_SIZE_SM_PX,
	MOBILE_VIEWPORT,
	SLOT_INPUT_SELECTOR,
	setupOtpBrowserSuite,
	TESTID_DEFAULT,
	TESTID_DISABLED,
	TESTID_INVALID,
	TESTID_MASKED,
	TESTID_READ_ONLY,
	TESTID_SIZE_DEFAULT,
	TESTID_SIZE_LG,
	TESTID_SIZE_SM,
	TRANSPARENT_COLOR_REGEX,
} from "./otp-field-browser-helper";

describe("OTPField browser layout, focus, and variant contracts", {
	timeout: 20_000,
}, () => {
	const suite = setupOtpBrowserSuite();

	it.each(["light", "dark"] as const)(
		"aligns grouped slots and preserves state feedback in %s",
		async (theme) => {
			const page = suite.getPage();
			await page.emulateMedia({ colorScheme: theme });
			const grouped = page.locator(
				'[data-slot="otp-field"]:has([data-slot="otp-field-separator"])'
			);
			const geometry = await grouped.evaluate((element) => {
				const root = element.getBoundingClientRect();
				return Array.from(element.children).map((child) => {
					const rect = child.getBoundingClientRect();
					return Math.abs(rect.y + rect.height / 2 - root.y - root.height / 2);
				});
			});
			expect(geometry.every((offset) => offset < 0.5)).toBe(true);
			const input = page
				.locator(TESTID_DEFAULT)
				.locator(SLOT_INPUT_SELECTOR)
				.first();
			await page.mouse.move(0, 0);
			const resting = await input.evaluate(
				(element) => getComputedStyle(element).borderColor
			);
			await input.hover();
			await expect
				.poll(() =>
					input.evaluate((element) => getComputedStyle(element).borderColor)
				)
				.not.toBe(resting);
			await input.focus();
			const clearance = await input.evaluate((element) => {
				const rect = element.getBoundingClientRect();
				const parent = element.parentElement;
				if (!parent) {
					throw new Error("Missing OTP root");
				}
				const root = parent.getBoundingClientRect();
				const css = getComputedStyle(element);
				const ring =
					Number.parseFloat(css.outlineWidth) +
					Number.parseFloat(css.outlineOffset);
				return {
					available: Math.min(
						rect.x - root.x,
						rect.y - root.y,
						root.bottom - rect.bottom
					),
					ring,
				};
			});
			expect(clearance.available).toBeGreaterThanOrEqual(clearance.ring);
			for (const state of [TESTID_DISABLED, TESTID_READ_ONLY, TESTID_INVALID]) {
				const slot = page.locator(state).locator(SLOT_INPUT_SELECTOR).first();
				// biome-ignore lint/performance/noAwaitInLoops: Each state resets the shared pointer before hovering.
				await page.mouse.move(0, 0);
				const border = await slot.evaluate(
					(element) => getComputedStyle(element).borderColor
				);
				await slot.hover();
				expect(
					await slot.evaluate(
						(element) => getComputedStyle(element).borderColor
					)
				).toBe(border);
			}
			await page
				.locator("#OtpFieldPrivacyAndValidationExample3")
				.screenshot({ path: `/private/tmp/otp-states-${theme}.png` });
		}
	);

	it("enforces responsive square slot geometry across desktop and mobile viewports", async () => {
		const page = suite.getPage();
		const smField = page.locator(TESTID_SIZE_SM);
		const defaultField = page.locator(TESTID_SIZE_DEFAULT);
		const lgField = page.locator(TESTID_SIZE_LG);

		await Promise.all([
			smField.waitFor({ state: "visible", timeout: ELEMENT_TIMEOUT_MS }),
			defaultField.waitFor({ state: "visible", timeout: ELEMENT_TIMEOUT_MS }),
			lgField.waitFor({ state: "visible", timeout: ELEMENT_TIMEOUT_MS }),
		]);

		const smInput = smField.locator(SLOT_INPUT_SELECTOR).first();
		const defaultInput = defaultField.locator(SLOT_INPUT_SELECTOR).first();
		const lgInput = lgField.locator(SLOT_INPUT_SELECTOR).first();

		const readSizes = async () => {
			const [smRect, defaultRect, lgRect] = await Promise.all([
				smInput.evaluate((el) => {
					const rect = el.getBoundingClientRect();
					return { height: rect.height, width: rect.width };
				}),
				defaultInput.evaluate((el) => {
					const rect = el.getBoundingClientRect();
					return { height: rect.height, width: rect.width };
				}),
				lgInput.evaluate((el) => {
					const rect = el.getBoundingClientRect();
					return { height: rect.height, width: rect.width };
				}),
			]);
			return { defaultRect, lgRect, smRect };
		};

		await page.setViewportSize(DESKTOP_VIEWPORT);
		const desktop = await readSizes();
		expect(desktop.smRect.width).toBe(DESKTOP_SLOT_SIZE_SM_PX);
		expect(desktop.smRect.height).toBe(DESKTOP_SLOT_SIZE_SM_PX);
		expect(desktop.defaultRect.width).toBe(DESKTOP_SLOT_SIZE_DEFAULT_PX);
		expect(desktop.defaultRect.height).toBe(DESKTOP_SLOT_SIZE_DEFAULT_PX);
		expect(desktop.lgRect.width).toBe(DESKTOP_SLOT_SIZE_LG_PX);
		expect(desktop.lgRect.height).toBe(DESKTOP_SLOT_SIZE_LG_PX);

		await page.setViewportSize(MOBILE_VIEWPORT);
		const mobile = await readSizes();
		expect(mobile.smRect.width).toBe(MOBILE_SLOT_SIZE_SM_PX);
		expect(mobile.smRect.height).toBe(MOBILE_SLOT_SIZE_SM_PX);
		expect(mobile.defaultRect.width).toBeLessThanOrEqual(
			MOBILE_SLOT_SIZE_DEFAULT_PX
		);
		expect(mobile.defaultRect.width).toBeGreaterThanOrEqual(24);
		expect(mobile.defaultRect.height).toBeCloseTo(mobile.defaultRect.width, 1);
		expect(mobile.lgRect.width).toBeLessThanOrEqual(MOBILE_SLOT_SIZE_LG_PX);
		expect(mobile.lgRect.width).toBeGreaterThanOrEqual(24);
		expect(mobile.lgRect.height).toBeCloseTo(mobile.lgRect.width, 1);
	});

	it("displays visible focus outline on keyboard navigation", async () => {
		const page = suite.getPage();
		const firstInput = page
			.locator(TESTID_DEFAULT)
			.locator(SLOT_INPUT_SELECTOR)
			.first();

		await page.emulateMedia({ reducedMotion: "reduce" });
		await firstInput.focus();
		await page.keyboard.press("Shift+Tab");
		await page.keyboard.press("Tab");
		expect(
			await firstInput.evaluate((el) => document.activeElement === el)
		).toBe(true);

		const outline = await firstInput.evaluate((el) => {
			const cs = getComputedStyle(el);
			return {
				style: cs.outlineStyle,
				width: Number.parseFloat(cs.outlineWidth) || 0,
			};
		});

		expect(outline.style).not.toBe("none");
		expect(outline.width).toBeGreaterThanOrEqual(MIN_FOCUS_OUTLINE_WIDTH_PX);
	});

	it("masks input characters as password type in masked specimen", async () => {
		const page = suite.getPage();
		const maskedField = page.locator(TESTID_MASKED);
		await maskedField.waitFor({
			state: "visible",
			timeout: ELEMENT_TIMEOUT_MS,
		});

		const inputs = maskedField.locator(SLOT_INPUT_SELECTOR);
		const count = await inputs.count();
		expect(count).toBeGreaterThan(0);

		const indices = Array.from({ length: count }, (_, i) => i);
		const types = await Promise.all(
			indices.map((i) => inputs.nth(i).getAttribute("type"))
		);
		expect(types.every((type) => type === "password")).toBe(true);
		await inputs.first().focus();
		await page.keyboard.type("654321");
		expect(await inputs.last().inputValue()).toBe("1");
	});

	it("disables all slot inputs with the field disabled surface", async () => {
		const page = suite.getPage();
		const disabledField = page.locator(TESTID_DISABLED);
		await disabledField.waitFor({
			state: "visible",
			timeout: ELEMENT_TIMEOUT_MS,
		});

		const inputs = disabledField.locator(SLOT_INPUT_SELECTOR);
		const count = await inputs.count();
		expect(count).toBeGreaterThan(0);

		const indices = Array.from({ length: count }, (_, i) => i);
		const states = await Promise.all(
			indices.map(async (i) => {
				const input = inputs.nth(i);
				const isDisabled = await input.isDisabled();
				// Disabled slots match Input: flat, not faded.
				const shadow = await input.evaluate(
					(el) => getComputedStyle(el).boxShadow
				);
				return { isDisabled, shadow };
			})
		);

		expect(states.every((state) => state.isDisabled)).toBe(true);
		expect(states.every((state) => state.shadow === "none")).toBe(true);
	});

	it("marks slot inputs as read-only while remaining focusable in read-only specimen", async () => {
		const page = suite.getPage();
		const readOnlyField = page.locator(TESTID_READ_ONLY);
		await readOnlyField.waitFor({
			state: "visible",
			timeout: ELEMENT_TIMEOUT_MS,
		});

		const inputs = readOnlyField.locator(SLOT_INPUT_SELECTOR);
		const count = await inputs.count();
		expect(count).toBeGreaterThan(0);

		const indices = Array.from({ length: count }, (_, i) => i);
		const states = await Promise.all(
			indices.map(async (i) => {
				const input = inputs.nth(i);
				const isReadOnly = (await input.getAttribute("readonly")) !== null;
				const isDisabled = await input.isDisabled();
				return { isDisabled, isReadOnly };
			})
		);

		expect(states.every((state) => state.isReadOnly)).toBe(true);
		expect(states.every((state) => !state.isDisabled)).toBe(true);
	});

	it("marks slot inputs with invalid state and visually distinct border color", async () => {
		const page = suite.getPage();
		const invalidField = page.locator(TESTID_INVALID);
		await invalidField.waitFor({
			state: "visible",
			timeout: ELEMENT_TIMEOUT_MS,
		});

		const defaultInput = page
			.locator(TESTID_DEFAULT)
			.locator(SLOT_INPUT_SELECTOR)
			.first();
		const invalidInput = invalidField.locator(SLOT_INPUT_SELECTOR).first();

		const [isAriaInvalid, dataInvalid, defaultBorderColor, invalidBorderColor] =
			await Promise.all([
				invalidInput.getAttribute("aria-invalid"),
				invalidInput.getAttribute("data-invalid"),
				defaultInput.evaluate((el) => getComputedStyle(el).borderColor),
				invalidInput.evaluate((el) => getComputedStyle(el).borderColor),
			]);

		const hasInvalidMark = isAriaInvalid === "true" || dataInvalid !== null;
		expect(hasInvalidMark).toBe(true);
		expect(invalidBorderColor).not.toBe(defaultBorderColor);
		expect(invalidBorderColor).not.toMatch(TRANSPARENT_COLOR_REGEX);
	});
});
