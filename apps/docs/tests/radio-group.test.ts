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
			"Failed to tear down the radio-group test"
		);
	}
}

describe("RadioGroup component route", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		page.setDefaultTimeout(6000);
		await page.goto(`${handle.url}/components/radio-group`, {
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

	it.each(["light", "dark"] as const)(
		"centers controls and restores press feedback in %s",
		async (theme) => {
			await page.emulateMedia({
				colorScheme: theme,
				reducedMotion: "no-preference",
			});
			await page.goto(`${handle.url}/components/radio-group`, {
				waitUntil: "networkidle",
			});
			const group = page.getByRole("radiogroup", { name: "Interface density" });
			const offsets = await group.getByRole("radio").evaluateAll((elements) =>
				elements.map((element) => {
					const label = element.closest("label");
					if (!label) {
						throw new Error("Missing radio label");
					}
					const control = element.getBoundingClientRect();
					const row = label.getBoundingClientRect();
					return Math.abs(
						control.y + control.height / 2 - row.y - row.height / 2
					);
				})
			);
			expect(offsets.every((offset) => offset < 0.5)).toBe(true);
			const selected = group.getByRole("radio", {
				name: "Comfortable density",
			});
			const dotOffset = await selected.evaluate((element) => {
				const dot = element.querySelector('[data-slot="radio-indicator"]');
				if (!dot) {
					throw new Error("Missing selected indicator");
				}
				const outer = element.getBoundingClientRect();
				const inner = dot.getBoundingClientRect();
				return {
					x: inner.x + inner.width / 2 - outer.x - outer.width / 2,
					y: inner.y + inner.height / 2 - outer.y - outer.height / 2,
				};
			});
			expect(dotOffset).toEqual({ x: 0, y: 0 });
			await page.mouse.move(0, 0);
			// Flat controls lighten their fill on hover instead of lifting.
			const restingFill = await selected.evaluate(
				(element) => getComputedStyle(element).backgroundColor
			);
			await selected.hover();
			await expect
				.poll(() =>
					selected.evaluate(
						(element) => getComputedStyle(element).backgroundColor
					)
				)
				.not.toBe(restingFill);
			await page.mouse.down();
			await expect
				.poll(() =>
					selected.evaluate(
						(element) => new DOMMatrix(getComputedStyle(element).transform).a
					)
				)
				.toBeLessThan(1);
			await page.mouse.up();
			await page.emulateMedia({ reducedMotion: "reduce" });
			await selected.hover();
			await page.mouse.down();
			expect(
				await selected.evaluate(
					(element) => getComputedStyle(element).transform
				)
			).toBe("none");
			await page.mouse.up();
			await page
				.locator("#RadioGroupReadingPreferencesExample1")
				.screenshot({ path: `/private/tmp/radio-${theme}.png` });
		}
	);

	it.each(["light", "dark"] as const)(
		"preserves keyboard and inert states in %s",
		async (theme) => {
			await page.emulateMedia({ colorScheme: theme });
			await page.goto(`${handle.url}/components/radio-group`, {
				waitUntil: "networkidle",
			});
			const group = page.getByRole("radiogroup", { name: "Interface density" });
			const comfortable = group.getByRole("radio", {
				name: "Comfortable density",
			});
			const spacious = group.getByRole("radio", { name: "Spacious density" });
			await comfortable.focus();
			await page.keyboard.press("ArrowDown");
			expect(await spacious.getAttribute("aria-checked")).toBe("true");
			expect(await comfortable.getAttribute("aria-checked")).toBe("false");
			expect(
				await spacious.evaluate((element) => element === document.activeElement)
			).toBe(true);
			expect(
				await spacious.evaluate(
					(element) => getComputedStyle(element).outlineStyle
				)
			).toBe("solid");
			const readOnly = group.getByRole("radio", { name: "Read-only density" });
			await readOnly.click();
			await page.keyboard.press("Space");
			expect(await readOnly.getAttribute("aria-checked")).toBe("false");
			expect(await spacious.getAttribute("aria-checked")).toBe("true");
			const disabled = group.getByRole("radio", { name: "Managed density" });
			expect(await disabled.isDisabled()).toBe(true);
			expect(
				await disabled.evaluate((element) =>
					Number(getComputedStyle(element).opacity)
				)
			).toBeLessThan(1);
			await disabled.click({ force: true });
			expect(await disabled.getAttribute("aria-checked")).toBe("false");
			const invalid = group.getByRole("radio", { name: "Invalid density" });
			await invalid.click();
			expect(await invalid.getAttribute("aria-checked")).toBe("true");
			expect(await invalid.getAttribute("aria-invalid")).toBe("true");
			expect(
				await invalid.evaluate(
					(element) => getComputedStyle(element).borderColor
				)
			).not.toBe(
				await spacious.evaluate(
					(element) => getComputedStyle(element).borderColor
				)
			);
			const cards = page.getByRole("radiogroup", { name: "Workspace plan" });
			await cards.getByText("Team plan", { exact: true }).click();
			expect(
				await cards
					.getByRole("radio", { name: "Team plan" })
					.getAttribute("aria-checked")
			).toBe("true");
			await cards
				.getByText("Enterprise plan", { exact: true })
				.click({ force: true });
			expect(
				await cards
					.getByRole("radio", { name: "Team plan" })
					.getAttribute("aria-checked")
			).toBe("true");
			await page
				.locator("#RadioGroupSubscriptionPlanExample2")
				.screenshot({ path: `/private/tmp/radio-cards-${theme}.png` });
		}
	);

	it("keeps RadioGroup selection, sizes, and cards stable", async () => {
		await page.goto(`${handle.url}/components/radio-group`, {
			waitUntil: "networkidle",
		});
		const group = page.getByRole("radiogroup", { name: "Interface density" });
		const compact = group.getByRole("radio", { name: "Compact density" });
		const comfortable = group.getByRole("radio", {
			name: "Comfortable density",
		});
		const spacious = group.getByRole("radio", { name: "Spacious density" });

		expect(await comfortable.getAttribute("aria-checked")).toBe("true");
		expect(
			await Promise.all(
				[compact, comfortable, spacious].map((radio) =>
					radio.evaluate((element) => element.getBoundingClientRect().width)
				)
			)
		).toEqual([16, 18, 20]);
		await compact.click();
		expect(await compact.getAttribute("aria-checked")).toBe("true");
		expect(await comfortable.getAttribute("aria-checked")).toBe("false");

		const managed = group.getByRole("radio", { name: "Managed density" });
		expect(await managed.isDisabled()).toBe(true);

		const readOnly = group.getByRole("radio", { name: "Read-only density" });
		expect(await readOnly.getAttribute("data-readonly")).not.toBeNull();

		const invalid = group.getByRole("radio", { name: "Invalid density" });
		expect(await invalid.getAttribute("aria-invalid")).toBe("true");
		expect(await invalid.getAttribute("data-invalid")).not.toBeNull();

		const cards = page.getByRole("radiogroup", { name: "Workspace plan" });
		const personal = cards.getByRole("radio", { name: "Personal plan" });
		const team = cards.getByRole("radio", { name: "Team plan" });
		const enterprise = cards.getByRole("radio", { name: "Enterprise plan" });

		expect(await enterprise.isDisabled()).toBe(true);
		await team.click();
		expect(await personal.getAttribute("aria-checked")).toBe("false");
		expect(await team.getAttribute("aria-checked")).toBe("true");
	});
});
