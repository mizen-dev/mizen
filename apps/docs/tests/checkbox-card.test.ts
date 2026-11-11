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
			"Failed to tear down the checkbox-card test"
		);
	}
}

describe("Checkbox labels and card contract", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		// Settled focus rings: the ring grows in over 200ms otherwise.
		await page.emulateMedia({ reducedMotion: "reduce" });
		page.setDefaultTimeout(6000);
		await page.goto(`${handle.url}/components/checkbox`, {
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

	it("keeps checkbox labels stable in the control states example", async () => {
		const example = page.getByRole("region", {
			exact: true,
			name: "Checkbox: Control states example",
		});
		const small = example.getByRole("checkbox", {
			exact: true,
			name: "Small option",
		});
		const smallText = example.getByText("Small option", { exact: true });
		const geometry = await Promise.all([
			small.evaluate((element) => {
				const rect = element.getBoundingClientRect();
				return { bottom: rect.bottom, center: rect.top + rect.height / 2 };
			}),
			smallText.evaluate((element) => {
				const rect = element.getBoundingClientRect();
				return { center: rect.top + rect.height / 2, left: rect.left };
			}),
		]);
		expect(
			await smallText.evaluate((element) => getComputedStyle(element).fontSize)
		).toBe("13px");
		expect(
			await small.evaluate(
				(element) => getComputedStyle(element).borderStartStartRadius
			)
		).toBe("4px");
		const checkboxNames = ["Product updates", "Small option", "Large option"];
		expect(
			await Promise.all(
				checkboxNames.map((name) =>
					page
						.getByRole("checkbox", { exact: true, name })
						.evaluate(
							(element) => getComputedStyle(element).borderStartStartRadius
						)
				)
			)
		).toEqual(checkboxNames.map(() => "4px"));
		expect(
			geometry[1].left -
				(await small.evaluate(
					(element) => element.getBoundingClientRect().right
				))
		).toBe(8);
		expect(geometry[0].center - geometry[1].center).toBeCloseTo(-1, 5);

		await small.scrollIntoViewIfNeeded();
		const before = await smallText.evaluate(
			(element) => element.getBoundingClientRect().top
		);
		await small.press("Space");
		await small.locator("svg").waitFor();
		const checkedBackground = await page
			.getByRole("checkbox", { exact: true, name: "Product updates" })
			.evaluate((element) => getComputedStyle(element).backgroundColor);
		await expect
			.poll(() =>
				small.evaluate((element) => getComputedStyle(element).backgroundColor)
			)
			.toBe(checkedBackground);
		const after = await smallText.evaluate(
			(element) => element.getBoundingClientRect().top
		);
		expect(after).toBe(before);
		const restBackground = await small.evaluate(
			(element) => getComputedStyle(element).backgroundColor
		);
		await smallText.hover();
		await expect
			.poll(() => smallText.evaluate((element) => element.matches(":hover")))
			.toBe(true);
		expect(
			await small.evaluate(
				(element) => getComputedStyle(element).backgroundColor
			)
		).toBe(restBackground);
	});

	it("supports checkbox cards in the digest schedule example", async () => {
		await page.goto(`${handle.url}/components/checkbox-group`, {
			waitUntil: "networkidle",
		});
		const example = page.getByRole("region", {
			exact: true,
			name: "Checkbox group: Digest schedule example",
		});
		const card = example.getByRole("checkbox", {
			exact: true,
			name: "Daily digest",
		});
		const descriptionId = await card.getAttribute("aria-describedby");
		expect(descriptionId).not.toBeNull();
		expect(await page.locator(`#${descriptionId}`).textContent()).toContain(
			"A concise summary each morning."
		);
		expect(
			await example.locator("input[name='digest'][value='daily']").isChecked()
		).toBe(true);
		const cardLabel = example
			.locator("label")
			.filter({ hasText: "Daily digest" });
		expect(
			await cardLabel.evaluate((element) => getComputedStyle(element).fontSize)
		).toBe("14px");
		await cardLabel.getByText("A concise summary each morning.").click();
		expect(await card.getAttribute("aria-checked")).toBe("false");
		expect(
			await example.locator("input[name='digest'][value='daily']").count()
		).toBe(0);
		await card.focus();
		expect(
			await card.evaluate((element) => document.activeElement === element)
		).toBe(true);
		expect(
			await card.evaluate((element) => getComputedStyle(element).outlineWidth)
		).toBe("2px");

		const disabledCard = example.getByRole("checkbox", {
			exact: true,
			name: "Security digest",
		});
		expect(await disabledCard.getAttribute("data-disabled")).not.toBeNull();
		expect(await disabledCard.isDisabled()).toBe(true);
	});
});
