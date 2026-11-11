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

async function openButtonPage(theme: "dark" | "light"): Promise<void> {
	await page.evaluate(
		(value) => localStorage.setItem("mizen-theme", value),
		theme
	);
	await page.goto(`${handle.url}/docs/components/button`, {
		waitUntil: "networkidle",
	});
}

// What an application-owned element sees when it reads a token.
function readToken(name: string) {
	return page.evaluate((token) => {
		const probe = document.createElement("div");
		probe.style.color = `var(${token}, rgb(1, 2, 3))`;
		probe.style.width = `var(${token})`;
		document.body.append(probe);
		const { color, width } = getComputedStyle(probe);
		probe.remove();
		return { color, width };
	}, name);
}

function brandBackground() {
	return page
		.getByRole("button", { exact: true, name: "Brand" })
		.first()
		.evaluate((button) => getComputedStyle(button, "::before").backgroundColor);
}

describe("Public token variables", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		page.setDefaultTimeout(6000);
		await page.goto(`${handle.url}/docs/components/button`, {
			waitUntil: "networkidle",
		});
	}, 120_000);

	afterAll(async () => {
		await Promise.all([browser?.close(), teardownTestServer(handle)]);
	}, 120_000);

	it("gives application CSS the themed tokens in both themes", async () => {
		await openButtonPage("light");
		const light = await readToken("--mizen-color-content");
		await openButtonPage("dark");
		const dark = await readToken("--mizen-color-content");
		expect(light.color).not.toBe("rgb(1, 2, 3)");
		expect(dark.color).not.toBe("rgb(1, 2, 3)");
		expect(dark.color).not.toBe(light.color);
	});

	it("gives application CSS the scales", async () => {
		expect((await readToken("--mizen-space-4")).width).toBe("16px");
		expect((await readToken("--mizen-control-size-md")).width).toBe("32px");
	});

	it.each(["light", "dark"] as const)(
		"lets a plain root rule replace a themed token in the %s theme",
		async (theme) => {
			await openButtonPage(theme);
			expect(await brandBackground()).not.toBe("rgb(0, 128, 0)");
			await page.addStyleTag({
				content: ":root { --mizen-color-accent: rgb(0, 128, 0); }",
			});
			// The fill follows after its color transition.
			await expect.poll(brandBackground).toBe("rgb(0, 128, 0)");
		}
	);

	it("takes a separate dark value and a new radius from application CSS", async () => {
		await openButtonPage("dark");
		await page.addStyleTag({
			content: `:root { --mizen-color-accent: rgb(0, 128, 0); --mizen-shape-control-radius-large: 0px; }
[data-theme="dark"] { --mizen-color-accent: rgb(0, 0, 128); }`,
		});
		await expect.poll(brandBackground).toBe("rgb(0, 0, 128)");
		expect(
			await page
				.getByRole("button", { exact: true, name: "Brand" })
				.first()
				.evaluate((button) => getComputedStyle(button).borderRadius)
		).toBe("0px");
	});
});
