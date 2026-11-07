import { type Browser, chromium, type Page } from "playwright";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
let handle: TestServerHandle;
let browser: Browser;
let page: Page;

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
		throw new AggregateError(
			failures,
			"NumberField layout browser teardown failed"
		);
	}
}

describe("NumberField browser layout and responsiveness", {
	timeout: 20_000,
}, () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		page.setDefaultTimeout(8000);
	}, 120_000);

	beforeEach(async () => {
		await page.setViewportSize({ height: 800, width: 1280 });
		await page.goto(`${handle.url}/components/number-field`, {
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
		"centers input and icons and reviews states in %s",
		async (theme) => {
			await page.emulateMedia({ colorScheme: theme });
			const geometry = await page
				.locator('[data-slot="number-field-group"]')
				.evaluateAll((groups) =>
					groups.map((group) => {
						const box = group.getBoundingClientRect();
						return Array.from(group.querySelectorAll("input, button svg")).map(
							(element) => {
								const rect = element.getBoundingClientRect();
								return Math.abs(
									box.y + box.height / 2 - rect.y - rect.height / 2
								);
							}
						);
					})
				);
			for (const delta of geometry.flat()) {
				expect(delta).toBeLessThan(0.5);
			}
			await page
				.locator('[data-slot="component-preview"]')
				.first()
				.screenshot({ path: `/private/tmp/mizen-number-field-${theme}.png` });
			await page.getByTestId("number-field-invalid").screenshot({
				path: `/private/tmp/mizen-number-field-invalid-${theme}.png`,
			});
			await page.getByTestId("number-field-disabled").screenshot({
				path: `/private/tmp/mizen-number-field-disabled-${theme}.png`,
			});
		}
	);
	it("prevents horizontal overflow across 1280, 768, 375, and 320 viewports", async () => {
		async function checkViewport(width: number) {
			await page.setViewportSize({ height: 800, width });
			const docContained = await page.evaluate(
				() => document.documentElement.scrollWidth <= window.innerWidth
			);
			expect(docContained).toBe(true);

			const groupsContained = await page
				.locator('[data-slot="number-field-group"]')
				.evaluateAll((elements) =>
					elements.every((el) => el.scrollWidth <= el.clientWidth)
				);
			expect(groupsContained).toBe(true);
		}

		await checkViewport(1280);
		await checkViewport(768);
		await checkViewport(375);
		await checkViewport(320);
	});

	it("gives steppers at least 32px width and stretches them to the field height", async () => {
		const steppers = page.locator(
			'[data-slot="number-field-increment"], [data-slot="number-field-decrement"]'
		);
		const dimensions = await steppers.evaluateAll((elements) =>
			elements.map((el) => {
				const rect = el.getBoundingClientRect();
				return {
					groupHeight: el.parentElement?.getBoundingClientRect().height,
					height: rect.height,
					width: rect.width,
				};
			})
		);
		expect(dimensions.length).toBeGreaterThan(0);
		for (const dim of dimensions) {
			expect(dim.width).toBeGreaterThanOrEqual(32);
			expect(dim.height).toBe((dim.groupHeight ?? 0) - 2);
		}
	});

	it("enforces non-overlapping geometry between steppers and input", async () => {
		const groups = page.locator('[data-slot="number-field-group"]');
		const overlaps = await groups.evaluateAll((elements) =>
			elements.map((group) => {
				const dec = group.querySelector('[data-slot="number-field-decrement"]');
				const input = group.querySelector('[data-slot="number-field-input"]');
				const inc = group.querySelector('[data-slot="number-field-increment"]');
				if (!(dec && input && inc)) {
					return false;
				}
				const decRect = dec.getBoundingClientRect();
				const inRect = input.getBoundingClientRect();
				const incRect = inc.getBoundingClientRect();
				const decOverlaps = decRect.right > inRect.left;
				const incOverlaps = inRect.right > incRect.left;
				return decOverlaps || incOverlaps;
			})
		);
		expect(overlaps.length).toBeGreaterThan(0);
		expect(overlaps.every((overlap) => !overlap)).toBe(true);
	});

	it("scales control dimensions hierarchically across sm, default, and lg sizes", async () => {
		const smGroup = page
			.getByTestId("number-field-size-sm")
			.locator('[data-slot="number-field-group"]');
		const defaultGroup = page
			.getByTestId("number-field-size-default")
			.locator('[data-slot="number-field-group"]');
		const lgGroup = page
			.getByTestId("number-field-size-lg")
			.locator('[data-slot="number-field-group"]');

		const [smBox, defaultBox, lgBox] = await Promise.all([
			smGroup.boundingBox(),
			defaultGroup.boundingBox(),
			lgGroup.boundingBox(),
		]);
		expect(smBox).not.toBeNull();
		expect(defaultBox).not.toBeNull();
		expect(lgBox).not.toBeNull();

		if (smBox && defaultBox && lgBox) {
			expect(smBox.height).toBeLessThan(defaultBox.height);
			expect(defaultBox.height).toBeLessThan(lgBox.height);
			expect(smBox.width).toBeGreaterThan(0);
			expect(defaultBox.width).toBeGreaterThan(0);
			expect(lgBox.width).toBeGreaterThan(0);
		}
	});

	it("enforces disabled visual precedence over invalid styling", async () => {
		const readonlyGroup = page
			.getByTestId("number-field-readonly")
			.locator('[data-slot="number-field-group"]');
		const disabledGroup = page
			.getByTestId("number-field-disabled")
			.locator('[data-slot="number-field-group"]');
		const invalidGroup = page
			.getByTestId("number-field-invalid")
			.locator('[data-slot="number-field-group"]');
		const disabledInvalidGroup = page
			.getByTestId("number-field-disabled-invalid")
			.locator('[data-slot="number-field-group"]');

		const [roStyles, disStyles, invStyles, disInvStyles] = await Promise.all([
			readonlyGroup.evaluate((el) => {
				const cs = getComputedStyle(el);
				return {
					bg: cs.backgroundColor,
					border: cs.borderColor,
					opacity: cs.opacity,
				};
			}),
			disabledGroup.evaluate((el) => {
				const cs = getComputedStyle(el);
				return {
					bg: cs.backgroundColor,
					border: cs.borderColor,
					opacity: cs.opacity,
				};
			}),
			invalidGroup.evaluate((el) => {
				const cs = getComputedStyle(el);
				return {
					bg: cs.backgroundColor,
					border: cs.borderColor,
					opacity: cs.opacity,
				};
			}),
			disabledInvalidGroup.evaluate((el) => {
				const cs = getComputedStyle(el);
				return {
					bg: cs.backgroundColor,
					border: cs.borderColor,
					opacity: cs.opacity,
				};
			}),
		]);

		expect(roStyles.opacity).toBe("1");
		expect(roStyles.bg).not.toBe(disStyles.bg);

		expect(disStyles.opacity).toBe("1");
		expect(invStyles.border).not.toBe(disStyles.border);

		expect(disInvStyles.bg).toBe(disStyles.bg);
		expect(disInvStyles.opacity).toBe(disStyles.opacity);
		expect(disInvStyles.border).toBe(disStyles.border);
	});

	it("renders no duplicate IDs across the entire page", async () => {
		const duplicateIds = await page.evaluate(() => {
			const ids = Array.from(document.querySelectorAll("[id]")).map(
				(el) => el.id
			);
			const seen = new Set<string>();
			return ids.filter((id) => {
				const has = seen.has(id);
				seen.add(id);
				return has;
			});
		});
		expect(duplicateIds).toEqual([]);
	});

	it("gives enabled steppers hover feedback while keeping inert steppers still", async () => {
		const enabled = page
			.getByTestId("number-field-size-default")
			.getByRole("button", { name: "Increase" });
		const inert = page
			.getByTestId("number-field-readonly")
			.getByRole("button", { name: "Increase" });
		const background = (element: Element) =>
			getComputedStyle(element).backgroundColor;
		const rest = await enabled.evaluate(background);
		await enabled.hover();
		await expect.poll(() => enabled.evaluate(background)).not.toBe(rest);
		const hovered = await enabled.evaluate(background);
		await page.mouse.down();
		try {
			await expect.poll(() => enabled.evaluate(background)).not.toBe(hovered);
		} finally {
			await page.mouse.up();
		}
		const inertRest = await inert.evaluate(background);
		await inert.hover();
		await inert.evaluate(async (element) => {
			await Promise.allSettled(
				element.getAnimations().map((animation) => animation.finished)
			);
		});
		expect(await inert.evaluate(background)).toBe(inertRest);
	});
});
