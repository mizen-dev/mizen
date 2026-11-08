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
		throw new AggregateError(failures, "Failed to tear down the button test");
	}
}

describe("Button size contract", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		page.setDefaultTimeout(6000);
		await page.goto(`${handle.url}/components/button`, {
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

	it("renders every documented size with square icon dimensions", async () => {
		const textLabels = [
			"Default size",
			"Extra small",
			"Small",
			"Large",
			"Extra large",
		];
		expect(
			await Promise.all(
				textLabels.map((name) =>
					page.getByRole("button", { exact: true, name }).count()
				)
			)
		).toEqual(textLabels.map(() => 1));

		const assertSizes = async (
			textSizes: readonly (readonly [string, number])[],
			iconSizes: readonly (readonly [string, number])[]
		) => {
			expect(
				await Promise.all(
					textSizes.map(async ([name]) => {
						const button = page.getByRole("button", { exact: true, name });
						return await button.evaluate(
							(element) => element.getBoundingClientRect().height
						);
					})
				)
			).toEqual(textSizes.map(([, size]) => size));
			expect(
				await Promise.all(
					iconSizes.map(async ([name, size]) => {
						const button = page.getByRole("button", { exact: true, name });
						return [
							await button.evaluate(
								(element) => element.getBoundingClientRect().width
							),
							await button.evaluate(
								(element) => element.getBoundingClientRect().height
							),
							size,
						];
					})
				)
			).toEqual(iconSizes.map(([, size]) => [size, size, size]));
		};

		const assertIconGlyph = async (name: string, size: string) => {
			const icon = page
				.getByRole("button", { exact: true, name })
				.locator("svg");
			expect(
				await icon.evaluate((element) => {
					const style = getComputedStyle(element);
					return [style.width, style.height, element.getAttribute("stroke")];
				})
			).toEqual([size, size, "currentColor"]);
		};

		const assertRadius = async (name: string, radius: string) => {
			expect(
				await page
					.getByRole("button", { exact: true, name })
					.evaluate(
						(element) => getComputedStyle(element).borderStartStartRadius
					)
			).toBe(radius);
		};

		const radii = [
			["Default size", "16px"],
			["Extra small", "12px"],
			["Small", "12px"],
			["Large", "16px"],
			["Extra large", "16px"],
			["Icon", "16px"],
			["Extra small icon", "12px"],
			["Small icon", "12px"],
			["Large icon", "16px"],
			["Extra large icon", "16px"],
		] as const;

		await page.setViewportSize({ height: 800, width: 375 });
		await assertSizes(
			[
				["Default size", 36],
				["Extra small", 28],
				["Small", 32],
				["Large", 40],
				["Extra large", 44],
			],
			[
				["Icon", 36],
				["Extra small icon", 28],
				["Small icon", 32],
				["Large icon", 40],
				["Extra large icon", 44],
			]
		);
		await assertIconGlyph("Icon", "18px");
		await assertIconGlyph("Extra small icon", "14px");
		await assertIconGlyph("Small icon", "16px");
		await assertIconGlyph("Large icon", "18px");
		await assertIconGlyph("Extra large icon", "20px");
		await Promise.all(
			radii.map(([name, radius]) => assertRadius(name, radius))
		);

		await page.setViewportSize({ height: 800, width: 1024 });
		await assertSizes(
			[
				["Default size", 36],
				["Extra small", 28],
				["Small", 32],
				["Large", 40],
				["Extra large", 44],
			],
			[
				["Icon", 36],
				["Extra small icon", 28],
				["Small icon", 32],
				["Large icon", 40],
				["Extra large icon", 44],
			]
		);
		await assertIconGlyph("Icon", "18px");
		await assertIconGlyph("Extra small icon", "14px");
		await assertIconGlyph("Small icon", "16px");
		await assertIconGlyph("Large icon", "18px");
		await assertIconGlyph("Extra large icon", "20px");
		await Promise.all(
			radii.map(([name, radius]) => assertRadius(name, radius))
		);

		const paddingAndGap = async (
			name: string,
			padding: string,
			gap: string
		) => {
			const button = page.getByRole("button", { exact: true, name });
			expect(
				await button.evaluate((element) => {
					const style = getComputedStyle(element);
					return [style.paddingInlineStart, style.paddingInlineEnd, style.gap];
				})
			).toEqual([padding, padding, gap]);
		};

		await paddingAndGap("Default size", "11px", "8px");
		await paddingAndGap("Extra small", "7px", "4px");
		await paddingAndGap("Small", "11px", "4px");
		await paddingAndGap("Large", "15px", "8px");
		await paddingAndGap("Extra large", "15px", "8px");
	});
});
