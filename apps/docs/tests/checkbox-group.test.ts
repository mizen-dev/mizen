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
			"Failed to tear down the checkbox-group test"
		);
	}
}

describe("CheckboxGroup component route", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		page.setDefaultTimeout(6000);
		await page.goto(`${handle.url}/components/checkbox-group`, {
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

	it("shares CheckboxGroup state across items, parents, and cards", async () => {
		const group = page
			.getByRole("region", { exact: true, name: "Checkbox group preview" })
			.getByRole("group", { name: "Notification channels" });
		const parent = group.getByRole("checkbox", {
			exact: true,
			name: "All channels",
		});
		const email = group.getByRole("checkbox", { exact: true, name: "Email" });
		const push = group.getByRole("checkbox", { exact: true, name: "Push" });

		expect(
			await group.evaluate((element) => {
				const style = getComputedStyle(element);
				return [style.display, style.flexDirection, style.gap];
			})
		).toEqual(["flex", "column", "8px"]);
		expect(await email.getAttribute("aria-checked")).toBe("true");
		expect(await push.getAttribute("aria-checked")).toBe("false");
		expect(await parent.getAttribute("aria-checked")).toBe("mixed");

		await push.click();
		expect(await parent.getAttribute("aria-checked")).toBe("true");
		await parent.click();
		expect(await email.getAttribute("aria-checked")).toBe("false");
		expect(await push.getAttribute("aria-checked")).toBe("false");

		const cardGroup = page
			.getByRole("region", {
				exact: true,
				name: "Checkbox group: Digest schedule example",
			})
			.getByRole("group", { name: "Digest options" });
		expect(
			await cardGroup
				.getByRole("checkbox", { exact: true, name: "Daily digest" })
				.getAttribute("aria-checked")
		).toBe("true");
		expect(
			await cardGroup
				.getByRole("checkbox", { exact: true, name: "Security digest" })
				.isDisabled()
		).toBe(true);
	});
});
