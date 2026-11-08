import { describe, expect, it } from "vite-plus/test";
import {
	SLOT_INDICES_SIX,
	SLOT_INPUT_SELECTOR,
	setupOtpBrowserSuite,
	TESTID_DEFAULT,
	WHITESPACE_REGEX,
} from "./otp-field-browser-helper";

describe("OTPField browser documentation route and interaction contracts", {
	timeout: 20_000,
}, () => {
	const suite = setupOtpBrowserSuite();

	it("renders OTP Field documentation route and default specimen with six inputs", async () => {
		const page = suite.getPage();
		const handle = suite.getHandle();
		const response = await page.goto(`${handle.url}/components/otp-field`, {
			waitUntil: "networkidle",
		});
		expect(response?.status()).toBe(200);

		const heading = page.getByRole("heading", {
			exact: true,
			level: 1,
			name: "OTP Field",
		});
		expect(await heading.isVisible()).toBe(true);

		const defaultSpecimen = page.locator(TESTID_DEFAULT);
		expect(await defaultSpecimen.isVisible()).toBe(true);

		const label = page
			.locator("#OtpFieldVerifyYourAccountExample1")
			.getByText("Verification code", { exact: true });
		expect(await label.isVisible()).toBe(true);
		const labelId = await label.getAttribute("id");

		const inputs = defaultSpecimen.locator(SLOT_INPUT_SELECTOR);
		expect(await inputs.count()).toBe(6);

		const associations = await Promise.all(
			SLOT_INDICES_SIX.map(async (i) => {
				const input = inputs.nth(i);
				expect(await input.isVisible()).toBe(true);
				const ariaLabelledBy = await input.getAttribute("aria-labelledby");
				const hasLabelId = Boolean(
					labelId && ariaLabelledBy?.split(WHITESPACE_REGEX).includes(labelId)
				);
				const hasMatchingLabel = await input.evaluate((el) => {
					if (el instanceof HTMLInputElement) {
						const labels = Array.from(el.labels ?? []);
						return labels.some(
							(l) => l.textContent?.trim() === "Verification code"
						);
					}
					return false;
				});
				return hasLabelId || hasMatchingLabel;
			})
		);
		expect(associations.every((isAssoc) => isAssoc)).toBe(true);
	});

	it("auto-advances focus across slots while typing on default six-slot field", async () => {
		const page = suite.getPage();
		const defaultSpecimen = page.locator(TESTID_DEFAULT);
		const inputs = defaultSpecimen.locator(SLOT_INPUT_SELECTOR);
		expect(await inputs.count()).toBe(6);

		const firstInput = inputs.first();
		await firstInput.focus();

		await page.keyboard.press("1");
		expect(await inputs.nth(0).inputValue()).toBe("1");
		expect(
			await inputs.nth(1).evaluate((el) => document.activeElement === el)
		).toBe(true);

		await page.keyboard.press("2");
		expect(await inputs.nth(1).inputValue()).toBe("2");
		expect(
			await inputs.nth(2).evaluate((el) => document.activeElement === el)
		).toBe(true);

		await page.keyboard.press("3");
		await page.keyboard.press("4");
		await page.keyboard.press("5");
		await page.keyboard.press("6");

		const values = await Promise.all(
			SLOT_INDICES_SIX.map((i) => inputs.nth(i).inputValue())
		);
		expect(values).toEqual(["1", "2", "3", "4", "5", "6"]);
		expect(
			await inputs.nth(5).evaluate((el) => document.activeElement === el)
		).toBe(true);
	});

	it("supports correction, boundary navigation, and read-only input", async () => {
		const page = suite.getPage();
		const inputs = page.locator(TESTID_DEFAULT).locator(SLOT_INPUT_SELECTOR);
		await inputs.first().focus();
		await page.keyboard.type("123456");
		await page.keyboard.press("Home");
		expect(
			await inputs
				.first()
				.evaluate((element) => element === document.activeElement)
		).toBe(true);
		await page.keyboard.press("ArrowRight");
		expect(
			await inputs
				.nth(1)
				.evaluate((element) => element === document.activeElement)
		).toBe(true);
		await page.keyboard.press("End");
		await page.keyboard.press("Backspace");
		expect(await inputs.last().inputValue()).toBe("");
		expect(
			await inputs
				.nth(4)
				.evaluate((element) => element === document.activeElement)
		).toBe(true);
		await page.keyboard.press("Home");
		await page.keyboard.press("Delete");
		expect(await inputs.first().inputValue()).toBe("2");
		await page.keyboard.press("a");
		expect(await inputs.first().inputValue()).toBe("2");

		const readOnly = page
			.getByTestId("otp-field-read-only")
			.locator(SLOT_INPUT_SELECTOR);
		await readOnly.first().focus();
		await page.keyboard.press("9");
		await page.keyboard.press("Delete");
		await page.keyboard.press("Backspace");
		await page.evaluate(() => navigator.clipboard.writeText("123456"));
		await page.keyboard.press("ControlOrMeta+v");
		expect(await readOnly.first().inputValue()).toBe("8");
	});

	it("keeps small editable slots at 16px on narrow viewports", async () => {
		const page = suite.getPage();
		const inputs = page
			.getByTestId("otp-field-size-sm")
			.locator(SLOT_INPUT_SELECTOR);
		expect(
			await inputs
				.first()
				.evaluate((element) => getComputedStyle(element).fontSize)
		).toBe("14px");
		await page.setViewportSize({ height: 800, width: 320 });
		expect(
			await inputs
				.first()
				.evaluate((element) => getComputedStyle(element).fontSize)
		).toBe("16px");
	});

	it("distributes pasted code across slots on default six-slot field", async () => {
		const page = suite.getPage();
		const defaultSpecimen = page.locator(TESTID_DEFAULT);
		const inputs = defaultSpecimen.locator(SLOT_INPUT_SELECTOR);
		expect(await inputs.count()).toBe(6);

		await page.evaluate(() => navigator.clipboard.writeText("654321"));

		const firstInput = inputs.first();
		await firstInput.focus();
		await page.keyboard.press("ControlOrMeta+v");

		const values = await Promise.all(
			SLOT_INDICES_SIX.map((i) => inputs.nth(i).inputValue())
		);
		expect(values).toEqual(["6", "5", "4", "3", "2", "1"]);
	});
});
