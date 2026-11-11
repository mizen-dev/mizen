import { type Browser, chromium, type Page } from "playwright";
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
const consoleErrors: string[] = [];
const pageErrors: string[] = [];

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
		throw new AggregateError(failures, "InputGroup browser teardown failed");
	}
}

describe("InputGroup browser integration", () => {
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
		await page.setViewportSize({ height: 800, width: 1280 });
		await page.goto(`${handle.url}/components/input-group`, {
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
		"aligns prefixes and compact actions in %s",
		async (theme) => {
			await page.emulateMedia({ colorScheme: theme });
			const input = page.getByPlaceholder("example.com").first();
			expect(
				await input.evaluate(
					(element) => getComputedStyle(element).paddingInlineStart
				)
			).toBe("0px");
			const search = page
				.locator('[data-slot="input-group"]')
				.filter({ has: page.getByPlaceholder("Search documents…") });
			const group = await search.boundingBox();
			const button = await search
				.getByRole("button", { name: "Find" })
				.boundingBox();
			if (!(group && button)) {
				throw new Error("Missing search controls");
			}
			expect(button.height).toBe(24);
			expect(
				Math.abs(group.y + group.height / 2 - button.y - button.height / 2)
			).toBeLessThan(0.5);
			await search.screenshot({
				path: `/private/tmp/mizen-input-group-search-${theme}.png`,
			});
			await page
				.locator('[data-slot="input-group"]')
				.filter({ has: page.getByPlaceholder("Share your suggestions…") })
				.screenshot({
					path: `/private/tmp/mizen-input-group-textarea-${theme}.png`,
				});
		}
	);
	it("renders input group route without console or page errors", async () => {
		const response = await page.goto(`${handle.url}/components/input-group`, {
			waitUntil: "networkidle",
		});
		expect(response?.status()).toBe(200);

		const inputGroup = page.locator('[data-slot="input-group"]').first();
		await inputGroup.waitFor({ state: "visible" });
		expect(consoleErrors).toEqual([]);
		expect(pageErrors).toEqual([]);
	});

	it("redirects focus on static addon click while isolating nested buttons", async () => {
		const websiteInput = page
			.getByRole("region", { exact: true, name: "Input group preview" })
			.getByPlaceholder("example.com");
		const prefix = page
			.getByRole("region", { exact: true, name: "Input group preview" })
			.getByText("https://");

		await prefix.click();
		expect(
			await websiteInput.evaluate((el) => document.activeElement === el)
		).toBe(true);

		const searchInput = page.getByPlaceholder("Search documents…");
		const findButton = page.getByRole("button", { name: "Find" });

		await findButton.click();
		expect(
			await findButton.evaluate((el) => document.activeElement === el)
		).toBe(true);
		expect(
			await searchInput.evaluate((el) => document.activeElement === el)
		).toBe(false);
	});

	it("hoists focus ring to container when input is focused", async () => {
		const websiteInput = page
			.getByRole("region", { exact: true, name: "Input group preview" })
			.getByPlaceholder("example.com");
		const container = page
			.locator('[data-slot="input-group"]')
			.filter({ has: page.getByPlaceholder("example.com") })
			.first();

		const blurOutline = await container.evaluate(
			(el) => getComputedStyle(el).outlineWidth
		);
		expect(blurOutline).toBe("0px");

		await websiteInput.focus();
		const focusOutline = await container.evaluate(
			(el) => getComputedStyle(el).outlineWidth
		);
		expect(focusOutline).toBe("1px");
	});

	it("correctly renders disabled, read-only, and invalid states", async () => {
		const disabledInput = page.getByRole("textbox", {
			name: "Disabled repository",
		});
		expect(await disabledInput.isDisabled()).toBe(true);

		const readOnlyInput = page.getByRole("textbox", {
			name: "Read-only endpoint",
		});
		expect(await readOnlyInput.getAttribute("readonly")).not.toBeNull();

		const invalidInput = page.getByRole("textbox", {
			name: "Database port",
		});
		expect(await invalidInput.getAttribute("aria-invalid")).toBe("true");

		const error = page.getByText("Please enter a valid numeric port.");
		expect(await error.isVisible()).toBe(true);
	});

	it("renders full-width textarea block addons without a stray inline prefix", async () => {
		const textarea = page.getByPlaceholder("Share your suggestions…");
		const container = page
			.locator('[data-slot="input-group"]')
			.filter({ has: textarea });

		const blockStart = container.locator('[data-align="block-start"]');
		expect(await container.locator('[data-align="inline-start"]').count()).toBe(
			0
		);
		const blockEnd = container.locator('[data-align="block-end"]');

		const [blockStartBox, textareaBox, blockEndBox, containerBox] =
			await Promise.all([
				blockStart.boundingBox(),
				textarea.boundingBox(),
				blockEnd.boundingBox(),
				container.boundingBox(),
			]);

		if (!(blockStartBox && textareaBox && blockEndBox && containerBox)) {
			throw new Error("Boxes missing");
		}

		expect(blockStartBox.y + blockStartBox.height).toBeLessThanOrEqual(
			textareaBox.y
		);
		expect(textareaBox.y + textareaBox.height).toBeLessThanOrEqual(
			blockEndBox.y
		);
		expect(blockStartBox.width).toBeGreaterThan(containerBox.width - 4);
		expect(blockEndBox.width).toBeGreaterThan(containerBox.width - 4);

		const blockEndJustify = await blockEnd.evaluate(
			(el) => getComputedStyle(el).justifyContent
		);
		expect(blockEndJustify).toBe("space-between");
		const dividers = await Promise.all(
			[blockStart, blockEnd].map((addon) =>
				addon.evaluate((el) => {
					const line = getComputedStyle(el, "::before");
					return [line.left, line.right, line.height];
				})
			)
		);
		expect(dividers).toEqual([
			["8px", "8px", "1px"],
			["8px", "8px", "1px"],
		]);
	});

	it("isolates group size from nested addon buttons and enforces disabled visual precedence", async () => {
		const searchInput = page.getByPlaceholder("Search documents…");
		const searchGroup = page
			.locator('[data-slot="input-group"]')
			.filter({ has: searchInput });

		const searchHeight = await searchGroup.evaluate(
			(el) => getComputedStyle(el).minHeight
		);
		expect(searchHeight).toBe("32px");

		const readOnlyInput = page.getByRole("textbox", {
			name: "Read-only endpoint",
		});
		const readOnlyGroup = page
			.locator('[data-slot="input-group"]')
			.filter({ has: readOnlyInput });
		const readOnlyBg = await readOnlyGroup.evaluate(
			(el) => getComputedStyle(el).backgroundColor
		);

		const disabledInput = page.getByRole("textbox", {
			name: "Disabled repository",
		});
		const disabledGroup = page
			.locator('[data-slot="input-group"]')
			.filter({ has: disabledInput });
		const disabledBorder = await disabledGroup.evaluate(
			(el) => getComputedStyle(el).borderColor
		);
		const disabledBg = await disabledGroup.evaluate(
			(el) => getComputedStyle(el).backgroundColor
		);

		const disabledInvalidInput = page.getByRole("textbox", {
			name: "Disabled invalid note",
		});
		const disabledInvalidGroup = page
			.locator('[data-slot="input-group"]')
			.filter({ has: disabledInvalidInput });

		const styles = await disabledInvalidGroup.evaluate((el) => {
			const cs = getComputedStyle(el);
			return {
				backgroundColor: cs.backgroundColor,
				borderColor: cs.borderColor,
				opacity: cs.opacity,
			};
		});

		expect(styles.borderColor).toBe(disabledBorder);
		expect(styles.opacity).toBe("1");
		expect(readOnlyBg).not.toBe(disabledBg);
		expect(styles.backgroundColor).toBe(disabledBg);

		const innerOpacity = await disabledInvalidInput.evaluate(
			(el) => getComputedStyle(el).opacity
		);
		expect(innerOpacity).toBe("1");
	});

	it("keeps explicit input group sizes stable across viewport widths", async () => {
		const readHeights = () =>
			Promise.all(
				[0, 1, 2].map((index) => {
					const input = page.getByPlaceholder("Filter…").nth(index);
					const group = input.locator("xpath=..");
					return group.evaluate(
						(element) => element.getBoundingClientRect().height
					);
				})
			);

		await page.setViewportSize({ height: 800, width: 1280 });
		const wideHeights = await readHeights();
		const smallText = page
			.getByPlaceholder("Filter…")
			.first()
			.locator("..")
			.locator('[data-slot="input-group-text"]');
		expect(
			await smallText.evaluate((el) => getComputedStyle(el).fontSize)
		).toBe("13px");
		await page.setViewportSize({ height: 800, width: 320 });
		const narrowHeights = await readHeights();
		expect(
			await smallText.evaluate((el) => getComputedStyle(el).fontSize)
		).toBe("16px");

		expect(wideHeights).toEqual([28, 32, 40]);
		expect(narrowHeights).toEqual(wideHeights);
	});

	it.each(["Database port", "Read-only endpoint"])(
		"keeps %s borders stable during hover",
		async (name) => {
			const input = page.getByRole("textbox", { name });
			const group = input.locator("..");
			const border = await group.evaluate(
				(el) => getComputedStyle(el).borderColor
			);
			await input.hover();
			await group.evaluate(async (element) => {
				await Promise.allSettled(
					element.getAnimations().map((animation) => animation.finished)
				);
			});
			expect(
				await group.evaluate((el) => getComputedStyle(el).borderColor)
			).toBe(border);
		}
	);

	it("prevents horizontal overflow across 1280, 768, 375, and 320px viewports", async () => {
		const checkViewport = async (width: number) => {
			await page.setViewportSize({ height: 800, width });
			const hasDocOverflow = await page.evaluate(
				() => document.documentElement.scrollWidth > window.innerWidth
			);
			expect(hasDocOverflow).toBe(false);

			const groups = page.locator('[data-slot="input-group"]');
			const overflows = await groups.evaluateAll((elements) =>
				elements.map((el) => el.scrollWidth > el.clientWidth)
			);
			expect(overflows.every((hasOverflow) => !hasOverflow)).toBe(true);
		};

		await checkViewport(1280);
		await checkViewport(768);
		await checkViewport(375);
		await checkViewport(320);
	});
});
