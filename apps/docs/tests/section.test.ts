import type { SectionProps } from "@mizen-labs/ui/section";
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

type SectionPropsAcceptsRole = "role" extends keyof SectionProps ? true : false;

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
		throw new AggregateError(failures, "Failed to tear down the section test");
	}
}

describe("Section component and docs specimen", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		page.setDefaultTimeout(6000);
	}, 120_000);

	afterAll(async () => {
		const results = await Promise.allSettled([
			Promise.resolve().then(() => browser?.close()),
			Promise.resolve().then(() => teardownTestServer(handle)),
		]);
		throwTeardownFailures(results);
	}, 120_000);

	it("resolves root and section subpath exports with a closed prop contract", () => {
		expect(import.meta.resolve("@mizen-labs/ui")).toContain(
			"packages/ui/dist/index.js"
		);
		expect(import.meta.resolve("@mizen-labs/ui/section")).toContain(
			"packages/ui/dist/components/section/section.js"
		);
		const acceptsRole = false satisfies SectionPropsAcceptsRole;
		expect(acceptsRole).toBe(false);
	});

	it("renders the Section docs route", async () => {
		const response = await page.goto(`${handle.url}/components/section`, {
			waitUntil: "networkidle",
		});
		expect(response?.status()).toBe(200);
		expect(
			await page
				.getByRole("heading", { exact: true, level: 1, name: "Section" })
				.isVisible()
		).toBe(true);
	});

	it("renders one role-free native section named by its title", async () => {
		const section = page
			.locator('[data-slot="component-preview"] [data-slot="section"]')
			.first();
		expect(await section.evaluate((node) => node.tagName)).toBe("SECTION");
		expect(await section.getAttribute("role")).toBeNull();
		// The header, then the grid of metrics.
		expect(await section.locator(":scope > *").count()).toBe(2);
		expect(
			await page
				.getByRole("region", { exact: true, name: "Section preview" })
				.getByRole("region", { name: "Usage" })
				.isVisible()
		).toBe(true);
	});

	it("uses the system-owned vertical layout and spacing", async () => {
		const style = await page
			.locator('[data-slot="component-preview"] [data-slot="section"]')
			.first()
			.evaluate((node) => {
				const computed = getComputedStyle(node);
				return [
					computed.display,
					computed.flexDirection,
					computed.gap,
					computed.minWidth,
				];
			});
		expect(style).toEqual(["flex", "column", "16px", "0px"]);
	});

	it("renders the header parts with the section type roles", async () => {
		const header = page.locator(
			'[data-slot="component-preview"] [data-slot="section-header"]'
		);
		const title = header.getByRole("heading", { level: 2, name: "Usage" });
		expect(await title.getAttribute("data-slot")).toBe("section-title");
		expect(
			await title.evaluate((node) => {
				const { fontSize, fontWeight } = getComputedStyle(node);
				return [fontSize, fontWeight];
			})
		).toEqual(["16px", "600"]);
		expect(
			await header.locator('[data-slot="section-description"]').textContent()
		).toBe("This billing period.");
		expect(
			await header
				.locator('[data-slot="section-action"]')
				.getByRole("button", { name: "Export" })
				.isVisible()
		).toBe(true);
	});

	it("sets the heading level without changing the look", async () => {
		const nested = page.getByRole("heading", {
			level: 3,
			name: "Notifications",
		});
		expect(await nested.getAttribute("data-slot")).toBe("section-title");
		expect(
			await nested.evaluate((node) => getComputedStyle(node).fontSize)
		).toBe("16px");
	});

	// The header follows its own width: 30rem is the step.
	it.each([
		{ beside: true, width: 1280 },
		{ beside: false, width: 375 },
	])(
		"places the action beside the title: $beside at a $width px window",
		async ({ beside, width }) => {
			await page.setViewportSize({ height: 900, width });
			await page.goto(`${handle.url}/components/section`, {
				waitUntil: "networkidle",
			});
			const header = page.locator(
				'[data-slot="component-preview"] [data-slot="section-header"]'
			);
			const title = await header
				.locator('[data-slot="section-title"]')
				.boundingBox();
			const action = await header
				.locator('[data-slot="section-action"]')
				.boundingBox();
			if (!(title && action)) {
				throw new Error("Expected the title and the action to be rendered");
			}
			const titleBottom = title.y + title.height;
			expect(action.y < titleBottom).toBe(beside);
			expect(action.x > title.x).toBe(beside);
		}
	);

	it("keeps the width of its content in a parent that shrinks to fit", async () => {
		const widths = await page
			.locator('[data-slot="component-preview"] [data-slot="section"]')
			.first()
			.evaluate((section) => {
				const parent = document.createElement("div");
				parent.style.display = "inline-block";
				const copy = section.cloneNode(true) as HTMLElement;
				copy.querySelector('[data-slot="grid"]')?.remove();
				const content = document.createElement("div");
				content.style.width = "40rem";
				copy.append(content);
				parent.append(copy);
				document.body.append(parent);
				const header = copy.querySelector('[data-slot="section-header"]');
				return [
					copy.getBoundingClientRect().width,
					header?.getBoundingClientRect().width,
				];
			});
		expect(widths).toEqual([640, 640]);
	});

	it("fits the mobile viewport without horizontal overflow", async () => {
		await page.setViewportSize({ height: 812, width: 375 });
		await page.goto(`${handle.url}/components/section`, {
			waitUntil: "networkidle",
		});
		const widths = await page.evaluate(() => [
			document.body.scrollWidth,
			document.body.clientWidth,
		]);
		expect(widths[0]).toBe(widths[1]);
	});
});
