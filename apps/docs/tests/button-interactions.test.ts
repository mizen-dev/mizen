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

async function expectHoverStable(name: string): Promise<void> {
	const button = page.getByRole("button", { exact: true, name });
	const before = await button.evaluate((element) => {
		const style = getComputedStyle(element);
		return [style.backgroundColor, style.boxShadow, style.opacity];
	});
	const bounds = await button.boundingBox();
	expect(bounds).not.toBeNull();
	await page.mouse.move(
		(bounds?.x ?? 0) + (bounds?.width ?? 0) / 2,
		(bounds?.y ?? 0) + (bounds?.height ?? 0) / 2
	);
	expect(
		await button.evaluate((element) => {
			const style = getComputedStyle(element);
			return [style.backgroundColor, style.boxShadow, style.opacity];
		})
	).toEqual(before);
}

describe("Button interactions", () => {
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
		const failures = results
			.filter(
				(result): result is PromiseRejectedResult =>
					result.status === "rejected"
			)
			.map(({ reason }) => reason);
		if (failures.length === 1) {
			throw failures[0];
		}
		if (failures.length > 1) {
			throw new AggregateError(failures, "Failed to tear down Button tests");
		}
	}, 120_000);

	it("keeps disabled and loading buttons still while hovered", async () => {
		await expectHoverStable("Saving");
		await expectHoverStable("Disabled");
		const loading = page.getByRole("button", { exact: true, name: "Saving" });
		await page.mouse.down();
		expect(
			await loading.evaluate((element) => getComputedStyle(element).transform)
		).toBe("none");
		await page.mouse.up();
	});

	it.each([
		"Default",
		"Brand",
		"Secondary",
		"Outline",
		"Ghost",
		"Link",
		"Destructive",
		"Delete",
	])("keeps %s labels opaque during hover", async (name) => {
		const button = page.getByRole("button", { exact: true, name });
		await button.hover();
		await button.evaluate(async (element) => {
			await Promise.allSettled(
				element.getAnimations().map((animation) => animation.finished)
			);
		});
		expect(
			await button.evaluate((element) => getComputedStyle(element).opacity)
		).toBe("1");
	});

	it("sizes direct SVG icons and hides a fixed-color icon during loading", async () => {
		const iconDimensions = await Promise.all(
			[
				"Add",
				"Icon",
				"Extra small icon",
				"Small icon",
				"Large icon",
				"Extra large icon",
			].map((name) => {
				const icon = page
					.getByRole("button", { exact: true, name })
					.locator(":scope > svg");
				return icon.evaluate((element) => {
					const iconStyle = getComputedStyle(element);
					const buttonStyle = getComputedStyle(
						element.parentElement ?? element
					);
					return [
						iconStyle.width,
						iconStyle.height,
						iconStyle.flexShrink,
						buttonStyle.fontSize,
					];
				});
			})
		);
		for (const dimensions of iconDimensions) {
			expect(dimensions.slice(0, 2)).toEqual([dimensions[3], dimensions[3]]);
			expect(dimensions[2]).toBe("0");
		}

		const clone = await page
			.getByRole("button", { exact: true, name: "Default" })
			.evaluate((source) => {
				const button = document.createElement("a");
				button.className = source.className;
				button.dataset.slot = "button";
				button.href = "#loading";
				button.setAttribute("aria-label", "Loading product mark");
				button.setAttribute("aria-busy", "true");
				button.setAttribute("aria-disabled", "true");
				button.dataset.loading = "";
				const icon = document.createElementNS(
					"http://www.w3.org/2000/svg",
					"svg"
				);
				icon.setAttribute("width", "40");
				icon.setAttribute("height", "40");
				icon.setAttribute("stroke", "#f00");
				icon.innerHTML = '<path d="M0 0h24v24H0z" />';
				button.append(icon);
				document.body.append(button);
				return button.getAttribute("aria-label");
			});
		expect(clone).toBe("Loading product mark");
		const loadingLink = page.getByRole("link", {
			name: "Loading product mark",
		});
		const icon = loadingLink.locator(":scope > svg");
		expect(
			await icon.evaluate((element) => {
				const style = getComputedStyle(element);
				return [style.width, style.height, style.flexShrink, style.opacity];
			})
		).toEqual(["16px", "16px", "0", "0"]);
	});

	it("omits press scaling when reduced motion is preferred", async () => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		const button = page.getByRole("button", { exact: true, name: "Default" });
		const bounds = await button.boundingBox();
		expect(bounds).not.toBeNull();
		await page.mouse.move(
			(bounds?.x ?? 0) + (bounds?.width ?? 0) / 2,
			(bounds?.y ?? 0) + (bounds?.height ?? 0) / 2
		);
		await page.mouse.down();
		expect(
			await button.evaluate((element) => getComputedStyle(element).transform)
		).toBe("none");
		await page.mouse.up();
		await page.emulateMedia({ reducedMotion: "no-preference" });
	});
});
