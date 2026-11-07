import { type Browser, chromium, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
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
			"Failed to tear down the button typography test"
		);
	}
}

describe("Button typography contract", () => {
	it.each(['"Wix Madefor Text Variable"', "Arial", "Georgia", "monospace"])(
		"centers visible capitals with %s without changing the control height",
		async (fontFamily) => {
			await page.goto(`${handle.url}/components/button`, {
				waitUntil: "networkidle",
			});
			await page.evaluate(() => document.fonts.ready);
			const result = await page
				.getByRole("button", { exact: true, name: "Default size" })
				.evaluate((button, font) => {
					const initialHeight = button.getBoundingClientRect().height;
					button.style.fontFamily = font;
					const label = button.firstElementChild as HTMLElement;
					const marker = document.createElement("span");
					marker.style.cssText = "display:inline-block;width:0;height:0";
					label.append(marker);
					const style = getComputedStyle(button);
					const context = document.createElement("canvas").getContext("2d");
					if (!context) {
						throw new Error("Canvas text metrics are unavailable");
					}
					context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
					const cap = context.measureText("H").actualBoundingBoxAscent;
					const bounds = button.getBoundingClientRect();
					const offset =
						marker.getBoundingClientRect().top -
						cap / 2 -
						bounds.top -
						bounds.height / 2;
					marker.remove();
					return { height: bounds.height, initialHeight, offset };
				}, fontFamily);
			expect(result.height).toBe(result.initialHeight);
			expect(Math.abs(result.offset)).toBeLessThan(1);
		}
	);
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

	it("renders responsive Button typography and line heights", async () => {
		const typography = async (
			name: string,
			fontSize: string,
			fontWeight: string
		) => {
			const button = page.getByRole("button", { exact: true, name });
			expect(
				await button.evaluate((element) => {
					const style = getComputedStyle(element);
					return [style.fontSize, style.fontWeight];
				})
			).toEqual([fontSize, fontWeight]);
		};

		await page.setViewportSize({ height: 800, width: 375 });
		await typography("Default size", "16px", "400");
		await typography("Secondary", "16px", "400");
		await typography("Extra small", "12px", "500");
		expect(
			await page
				.getByRole("button", { exact: true, name: "Extra small" })
				.evaluate((element) => getComputedStyle(element).lineHeight)
		).toBe("16px");
		expect(
			await page
				.getByRole("button", { exact: true, name: "Small" })
				.evaluate((element) => getComputedStyle(element).lineHeight)
		).toBe("20px");
		await typography("Large", "16px", "400");
		await typography("Extra large", "16px", "400");

		await page.setViewportSize({ height: 800, width: 1024 });
		await typography("Default size", "16px", "400");
		await typography("Secondary", "16px", "400");
		await typography("Extra small", "12px", "500");
		expect(
			await page
				.getByRole("button", { exact: true, name: "Extra small" })
				.evaluate((element) => getComputedStyle(element).lineHeight)
		).toBe("16px");
		expect(
			await page
				.getByRole("button", { exact: true, name: "Small" })
				.evaluate((element) => getComputedStyle(element).lineHeight)
		).toBe("20px");
		await typography("Large", "16px", "400");
		await typography("Extra large", "16px", "400");
	});
});
