import type { LabelProps } from "@mizen-labs/ui/label";
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

type LabelPropsAcceptsRole = "role" extends keyof LabelProps ? true : false;

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
		throw new AggregateError(failures, "Failed to tear down the label test");
	}
}

describe("Label component and docs specimen", () => {
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

	it("resolves root and label subpath exports with a closed prop contract", () => {
		expect(import.meta.resolve("@mizen-labs/ui")).toContain(
			"packages/ui/dist/index.js"
		);
		expect(import.meta.resolve("@mizen-labs/ui/label")).toContain(
			"packages/ui/dist/components/label/label.js"
		);
		const props = { htmlFor: "name" } satisfies LabelProps;
		const acceptsRole = false satisfies LabelPropsAcceptsRole;
		expect(props.htmlFor).toBe("name");
		expect(acceptsRole).toBe(false);
	});

	it("renders the Label docs route", async () => {
		const response = await page.goto(`${handle.url}/components/label`, {
			waitUntil: "networkidle",
		});
		expect(response?.status()).toBe(200);
		expect(
			await page
				.getByRole("heading", { exact: true, level: 1, name: "Label" })
				.isVisible()
		).toBe(true);
	});

	it("renders native role-free labels associated with their controls", async () => {
		const labels = page
			.getByRole("region", {
				exact: true,
				name: "Label: Workspace identity example",
			})
			.locator('[data-slot="label"]');
		expect(
			await labels.evaluateAll((nodes) => nodes.map((node) => node.tagName))
		).toEqual(["LABEL", "LABEL"]);
		expect(
			await labels.evaluateAll((nodes) =>
				nodes.map((node) => node.getAttribute("role"))
			)
		).toEqual([null, null]);
		expect(
			await labels.evaluateAll((nodes) =>
				nodes.map((node) => node.getAttribute("for"))
			)
		).toEqual(["workspace-name", "branch-name"]);
	});

	it("focuses the associated input when activated", async () => {
		await page.getByText("Branch name", { exact: true }).click();
		expect(await page.evaluate(() => document.activeElement?.id)).toBe(
			"branch-name"
		);
	});

	it("uses the shared label typography", async () => {
		const style = await page
			.locator('[data-slot="component-preview"] [data-slot="label"]')
			.first()
			.evaluate((node) => {
				const computed = getComputedStyle(node);
				return [computed.fontSize, computed.fontWeight, computed.lineHeight];
			});
		expect(style).toEqual(["14px", "500", "20px"]);
	});
});
