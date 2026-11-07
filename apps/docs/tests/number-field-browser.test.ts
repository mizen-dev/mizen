import { type Browser, chromium, type Locator, type Page } from "playwright";
import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from "vitest";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
let handle: TestServerHandle;
let browser: Browser;
let page: Page;
const consoleErrors: string[] = [];
const pageErrors: string[] = [];

function resetErrors(): void {
	consoleErrors.length = 0;
	pageErrors.length = 0;
}

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
		throw new AggregateError(failures, "NumberField browser teardown failed");
	}
}

async function tabToElement(target: Locator, attempt = 0): Promise<void> {
	if (attempt === 0) {
		await page.locator("main#docs-content").click({ position: { x: 5, y: 5 } });
	}
	await page.keyboard.press("Tab");
	if (await target.evaluate((el) => document.activeElement === el)) {
		return;
	}
	if (attempt < 30) {
		return tabToElement(target, attempt + 1);
	}
	throw new Error("Could not reach target element via Tab navigation");
}

describe("NumberField browser interaction contracts", {
	timeout: 20_000,
}, () => {
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
		resetErrors();
		await page.setViewportSize({ height: 800, width: 1280 });
		await page.goto(`${handle.url}/components/number-field`, {
			waitUntil: "networkidle",
		});
	});

	afterEach(({ task }) => {
		try {
			if (task.result?.state !== "fail") {
				expect(consoleErrors).toEqual([]);
				expect(pageErrors).toEqual([]);
			}
		} finally {
			resetErrors();
		}
	});

	afterAll(async () => {
		const results = await Promise.allSettled([
			Promise.resolve().then(() => browser?.close()),
			Promise.resolve().then(() => teardownTestServer(handle)),
		]);
		throwTeardownFailures(results);
	}, 120_000);

	it("renders number field route without console or page errors", async () => {
		resetErrors();
		const response = await page.goto(`${handle.url}/components/number-field`, {
			waitUntil: "networkidle",
		});
		expect(response?.status()).toBe(200);

		const field = page.locator('[data-slot="number-field"]').first();
		await field.waitFor({ state: "visible" });
	});

	it("keeps small editable text at 16px on narrow viewports", async () => {
		const input = page
			.getByTestId("number-field-size-sm")
			.locator('[data-slot="number-field-input"]');
		expect(
			await input.evaluate((element) => getComputedStyle(element).fontSize)
		).toBe("14px");
		await page.setViewportSize({ height: 800, width: 320 });
		expect(
			await input.evaluate((element) => getComputedStyle(element).fontSize)
		).toBe("16px");
	});

	it("formats displayed values with deterministic en-US locale options", async () => {
		const formattedInput = page.getByTestId("formatted-input");
		expect(await formattedInput.inputValue()).toBe("$1,250.00");

		const inc = page.getByTestId("formatted-increment");
		await inc.click();
		expect(await formattedInput.inputValue()).toBe("$1,260.00");

		const dec = page.getByTestId("formatted-decrement");
		await dec.click();
		expect(await formattedInput.inputValue()).toBe("$1,250.00");
	});

	it("keeps a cleared controlled value empty instead of reporting zero", async () => {
		const input = page.getByTestId("bounded-input");
		await input.fill("");
		expect(await input.inputValue()).toBe("");
		await expect
			.poll(() => page.getByTestId("bounded-value").textContent())
			.toBe("Empty");
		await input.blur();
		expect(await input.inputValue()).toBe("");
	});
	it("steps value with steppers, clamps at bounds, and supports arrow keys", async () => {
		const input = page.getByTestId("bounded-input");
		const inc = page.getByTestId("bounded-increment");
		const dec = page.getByTestId("bounded-decrement");
		const valueDisplay = page.getByTestId("bounded-value");

		expect(await input.inputValue()).toBe("4");
		expect(await valueDisplay.textContent()).toBe("4");

		await inc.click();
		expect(await input.inputValue()).toBe("5");
		expect(await valueDisplay.textContent()).toBe("5");

		await dec.click();
		expect(await input.inputValue()).toBe("4");
		expect(await valueDisplay.textContent()).toBe("4");

		await input.focus();
		await page.keyboard.press("ArrowUp");
		expect(await input.inputValue()).toBe("5");

		await page.keyboard.press("ArrowDown");
		expect(await input.inputValue()).toBe("4");

		await input.fill("10");
		await input.blur();
		expect(await input.inputValue()).toBe("10");
		expect(await inc.isDisabled()).toBe(true);
		await input.focus();
		await page.keyboard.press("ArrowUp");
		expect(await input.inputValue()).toBe("10");

		await input.fill("1");
		await input.blur();
		expect(await input.inputValue()).toBe("1");
		expect(await dec.isDisabled()).toBe(true);
		await input.focus();
		await page.keyboard.press("ArrowDown");
		expect(await input.inputValue()).toBe("1");
	});

	it("scrubs value with mouse wheel when input is focused", async () => {
		const input = page.getByTestId("bounded-input");
		await input.hover();
		await input.focus();
		expect(await input.inputValue()).toBe("4");

		await page.mouse.wheel(0, -100);
		expect(await input.inputValue()).toBe("5");

		await page.mouse.wheel(0, 100);
		expect(await input.inputValue()).toBe("4");
	});

	it("supports pointer scrubbing on horizontal and vertical scrub areas", async () => {
		const hInput = page.getByTestId("scrub-horizontal-input");
		const hScrub = page.getByTestId("scrub-area-horizontal");
		expect(await hInput.inputValue()).toBe("64");
		await hScrub.scrollIntoViewIfNeeded();

		const hBox = await hScrub.boundingBox();
		expect(hBox).not.toBeNull();
		if (!hBox) {
			throw new Error("Missing horizontal scrub bounding box");
		}
		await page.mouse.move(hBox.x + hBox.width / 2, hBox.y + hBox.height / 2);
		await page.mouse.down();
		await page.mouse.move(
			hBox.x + hBox.width / 2 + 40,
			hBox.y + hBox.height / 2,
			{ steps: 5 }
		);
		await page.mouse.up();

		const scrubbedRightVal = Number.parseInt(await hInput.inputValue(), 10);
		expect(scrubbedRightVal).toBeGreaterThan(64);

		await page.mouse.move(hBox.x + hBox.width / 2, hBox.y + hBox.height / 2);
		await page.mouse.down();
		await page.mouse.move(
			hBox.x + hBox.width / 2 - 40,
			hBox.y + hBox.height / 2,
			{ steps: 5 }
		);
		await page.mouse.up();

		const scrubbedLeftVal = Number.parseInt(await hInput.inputValue(), 10);
		expect(scrubbedLeftVal).toBeLessThan(scrubbedRightVal);

		const vInput = page.getByTestId("scrub-vertical-input");
		const vScrub = page.getByTestId("scrub-area-vertical");
		expect(await vInput.inputValue()).toBe("32");
		await vScrub.scrollIntoViewIfNeeded();

		const vBox = await vScrub.boundingBox();
		expect(vBox).not.toBeNull();
		if (!vBox) {
			throw new Error("Missing vertical scrub bounding box");
		}
		await page.mouse.move(vBox.x + vBox.width / 2, vBox.y + vBox.height / 2);
		await page.mouse.down();
		await page.mouse.move(
			vBox.x + vBox.width / 2,
			vBox.y + vBox.height / 2 - 40,
			{ steps: 5 }
		);
		await page.mouse.up();

		const scrubbedUpVal = Number.parseInt(await vInput.inputValue(), 10);
		expect(scrubbedUpVal).toBeGreaterThan(32);

		await page.mouse.move(vBox.x + vBox.width / 2, vBox.y + vBox.height / 2);
		await page.mouse.down();
		await page.mouse.move(
			vBox.x + vBox.width / 2,
			vBox.y + vBox.height / 2 + 40,
			{ steps: 5 }
		);
		await page.mouse.up();

		const scrubbedDownVal = Number.parseInt(await vInput.inputValue(), 10);
		expect(scrubbedDownVal).toBeLessThan(scrubbedUpVal);
	});

	it("prevents interaction when field is disabled or read-only", async () => {
		const disabledInput = page.getByTestId("disabled-input");
		const disabledInc = page.getByTestId("disabled-increment");
		expect(await disabledInput.isDisabled()).toBe(true);
		expect(await disabledInc.isDisabled()).toBe(true);
		expect(await disabledInput.inputValue()).toBe("50");

		const readonlyInput = page.getByTestId("readonly-input");
		const readonlyInc = page.getByTestId("readonly-increment");
		expect(await readonlyInput.getAttribute("readonly")).not.toBeNull();
		expect(await readonlyInc.getAttribute("aria-disabled")).toBe("true");
		expect(await readonlyInput.inputValue()).toBe("100");
	});

	it("shows focus-visible group outline through Tab navigation and exposes semantics", async () => {
		const input = page.getByTestId("bounded-input");
		const group = page
			.locator('[data-slot="number-field-group"]')
			.filter({ has: input });

		expect(
			await group.evaluate((el) => getComputedStyle(el).outlineWidth)
		).toBe("0px");

		await tabToElement(input);
		expect(await input.evaluate((el) => document.activeElement === el)).toBe(
			true
		);
		expect(
			await group.evaluate((el) => getComputedStyle(el).outlineWidth)
		).toBe("3px");

		expect(await input.getAttribute("type")).toBe("text");
		expect(await input.getAttribute("inputmode")).toBe("numeric");
		expect(await input.getAttribute("aria-roledescription")).toBe(
			"Number field"
		);

		const hiddenInput = page
			.locator('[data-slot="number-field"]')
			.filter({ has: input })
			.locator("..")
			.locator('input[type="number"][aria-hidden="true"]');
		expect(await hiddenInput.count()).toBe(1);
		expect(await hiddenInput.getAttribute("tabindex")).toBe("-1");
		expect(await hiddenInput.inputValue()).toBe("4");
	});
});
