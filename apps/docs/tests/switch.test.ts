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
let handle: TestServerHandle;
let browser: Browser;
let page: Page;

async function requireBox(locator: Locator) {
	const box = await locator.boundingBox();
	if (!box) {
		throw new Error("Missing switch label geometry");
	}
	return box;
}

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
		throw new AggregateError(failures, "Failed to tear down the switch test");
	}
}

async function focusWithKeyboard(locator: Locator): Promise<void> {
	await locator.focus();
	await page.keyboard.press("Shift+Tab");
	await page.keyboard.press("Tab");
	expect(
		await locator.evaluate(
			(element) =>
				document.activeElement === element && element.matches(":focus-visible")
		)
	).toBe(true);
}

describe("Switch component route", () => {
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
		await page.goto(`${handle.url}/components/switch`, {
			waitUntil: "networkidle",
		});
	}, 120_000);

	beforeEach(async () => {
		await page.emulateMedia({ reducedMotion: "no-preference" });
		await page.goto(`${handle.url}/components/switch`, {
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

	it.each(["light", "dark"] as const)(
		"aligns switches and animates label presses in %s",
		async (theme) => {
			await page.emulateMedia({ colorScheme: theme });
			const offsets = await page.getByRole("switch").evaluateAll((controls) =>
				controls.map((switchElement) => {
					const label = switchElement.closest("label");
					const thumb = switchElement.querySelector(
						'[data-slot="switch-thumb"]'
					);
					if (!(label && thumb)) {
						throw new Error("Missing labeled switch anatomy");
					}
					const a = switchElement.getBoundingClientRect();
					const b = label.getBoundingClientRect();
					const c = thumb.getBoundingClientRect();
					return [
						Math.abs(a.y + a.height / 2 - b.y - b.height / 2),
						Math.abs(c.y + c.height / 2 - a.y - a.height / 2),
					];
				})
			);
			expect(offsets.flat().every((offset) => offset < 0.5)).toBe(true);

			const control = page.getByRole("switch", {
				exact: true,
				name: "Sync changes",
			});
			const thumb = control.locator('[data-slot="switch-thumb"]');
			const label = page.locator("label").filter({ has: control });
			const read = (element: Element) => {
				const rect = element.getBoundingClientRect();
				return { center: rect.y + rect.height / 2, height: rect.height };
			};
			await control.scrollIntoViewIfNeeded();
			const resting = await thumb.evaluate(read);
			await label.hover({
				position: { x: (await requireBox(label)).width - 4, y: 10 },
			});
			await page.mouse.down();
			try {
				await expect
					.poll(() =>
						thumb.evaluate((element) => element.getBoundingClientRect().height)
					)
					.toBeCloseTo(resting.height * 0.82, 1);
				expect((await thumb.evaluate(read)).center).toBeCloseTo(
					resting.center,
					1
				);
			} finally {
				await page.mouse.up();
			}
			await expect
				.poll(() => control.getAttribute("aria-checked"))
				.toBe("false");
			await expect
				.poll(() =>
					thumb.evaluate((element) => element.getBoundingClientRect().height)
				)
				.toBeCloseTo(resting.height, 1);
			await label.click({
				position: { x: (await requireBox(label)).width - 4, y: 10 },
			});
			await expect
				.poll(() => control.getAttribute("aria-checked"))
				.toBe("true");
			const compact = page.getByRole("switch", {
				exact: true,
				name: "Compact mode",
			});
			const compactLabel = page.locator("label").filter({ has: compact });
			await page.mouse.move(0, 0);
			// The off track darkens its fill on hover; it has no outline.
			const fill = await compact.evaluate(
				(element) => getComputedStyle(element).backgroundColor
			);
			await compactLabel.hover({
				position: { x: (await requireBox(compactLabel)).width - 4, y: 10 },
			});
			await expect
				.poll(() =>
					compact.evaluate(
						(element) => getComputedStyle(element).backgroundColor
					)
				)
				.not.toBe(fill);

			await page
				.locator("#SwitchWorkspacePreferencesExample1")
				.screenshot({ path: `/private/tmp/switch-${theme}.png` });
		}
	);

	it.each(["light", "dark"] as const)(
		"keeps inert and reduced-motion label presses stable in %s",
		async (theme) => {
			await page.emulateMedia({ colorScheme: theme });
			for (const name of ["Managed setting", "Read-only mode"]) {
				const control = page.getByRole("switch", { exact: true, name });
				const thumb = control.locator('[data-slot="switch-thumb"]');
				const label = page.locator("label").filter({ has: control });
				// biome-ignore lint/performance/noAwaitInLoops: Each switch is pressed in turn on the shared page.
				const before = await thumb.evaluate(
					(element) => getComputedStyle(element).transform
				);
				await label.hover({
					position: { x: (await requireBox(label)).width - 4, y: 10 },
				});
				await page.mouse.down();
				await page.waitForTimeout(180);
				await expect
					.poll(() =>
						thumb.evaluate((element) => getComputedStyle(element).transform)
					)
					.toBe(before);
				await page.mouse.up();
				expect(await control.getAttribute("aria-checked")).toBe("true");
			}
			await page.emulateMedia({ reducedMotion: "reduce" });
			const control = page.getByRole("switch", {
				exact: true,
				name: "Sync changes",
			});
			const label = page.locator("label").filter({ has: control });
			const thumb = control.locator('[data-slot="switch-thumb"]');
			await label.hover({
				position: { x: (await requireBox(label)).width - 4, y: 10 },
			});
			await page.mouse.down();
			expect(
				await thumb.evaluate((element) => getComputedStyle(element).transform)
			).toBe("matrix(1, 0, 0, 1, 0, 0)");
			await page.mouse.up();
			expect(await control.getAttribute("aria-checked")).toBe("false");
			await page
				.locator("#SwitchPermissionsAndValidationExample2")
				.screenshot({ path: `/private/tmp/switch-states-${theme}.png` });
		}
	);

	it("renders Switch with native form state, sizes, and motion", async () => {
		const checked = page.getByRole("switch", {
			exact: true,
			name: "Sync changes",
		});
		const hiddenInput = page.locator("input[name='sync']");
		expect(await checked.getAttribute("data-checked")).not.toBeNull();
		expect(await checked.getAttribute("aria-checked")).toBe("true");
		expect(await hiddenInput.isChecked()).toBe(true);
		expect(await hiddenInput.getAttribute("value")).toBe("enabled");

		const sizes = await Promise.all(
			(
				[
					["Compact mode", 32, 18],
					["Sync changes", 36, 20],
					["Managed setting", 44, 24],
				] as const
			).map(async ([name, expectedWidth, expectedHeight]) => {
				const control = page.getByRole("switch", { exact: true, name });
				const rect = await control.evaluate((element) => {
					const bounds = element.getBoundingClientRect();
					return [bounds.width, bounds.height];
				});
				return [rect, [expectedWidth, expectedHeight]];
			})
		);
		expect(sizes.map(([actual]) => actual)).toEqual(
			sizes.map(([, expected]) => expected)
		);

		const thumb = checked.locator("[data-slot='switch-thumb']");
		const checkedThumbLeft = await thumb.evaluate(
			(element) => element.getBoundingClientRect().left
		);
		await checked.press("Space");
		await expect.poll(() => checked.getAttribute("aria-checked")).toBe("false");
		expect(await hiddenInput.isChecked()).toBe(false);
		await expect
			.poll(() =>
				thumb.evaluate((element) => element.getBoundingClientRect().left)
			)
			.toBeLessThan(checkedThumbLeft);

		const disabled = page.getByRole("switch", {
			exact: true,
			name: "Managed setting",
		});
		expect(await disabled.getAttribute("data-disabled")).not.toBeNull();
		expect(await disabled.isDisabled()).toBe(true);

		const readOnly = page.getByRole("switch", {
			exact: true,
			name: "Read-only mode",
		});
		expect(await readOnly.getAttribute("data-readonly")).not.toBeNull();
		await readOnly.press("Space");
		expect(await readOnly.getAttribute("aria-checked")).toBe("true");

		const invalid = page.getByRole("switch", {
			exact: true,
			name: "Invalid mode",
		});
		expect(await invalid.getAttribute("aria-invalid")).toBe("true");
		expect(await invalid.getAttribute("data-invalid")).not.toBeNull();
		await page.emulateMedia({ reducedMotion: "reduce" });
		const invalidBorder = await invalid.evaluate(
			(element) => getComputedStyle(element).borderColor
		);
		await invalid.check();
		expect(
			await invalid.evaluate((element) => getComputedStyle(element).borderColor)
		).toBe(invalidBorder);
		await invalid.hover();
		expect(
			await invalid.evaluate((element) => getComputedStyle(element).borderColor)
		).toBe(invalidBorder);
		await page.emulateMedia({ reducedMotion: "no-preference" });

		await focusWithKeyboard(checked);
		await expect
			.poll(() =>
				checked.evaluate((element) => {
					const style = getComputedStyle(element);
					return [style.outlineWidth, style.outlineOffset];
				})
			)
			.toEqual(["3px", "0px"]);
		expect(
			await thumb.evaluate(
				(element) => getComputedStyle(element).transitionProperty
			)
		).toContain("margin-inline-start");

		await page.emulateMedia({ reducedMotion: "reduce" });
		expect(
			await thumb.evaluate(
				(element) => getComputedStyle(element).transitionDuration
			)
		).toBe("0s");
		await page.emulateMedia({ reducedMotion: "no-preference" });
	});
});
