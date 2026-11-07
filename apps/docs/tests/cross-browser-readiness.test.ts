import {
	type Browser,
	type BrowserType,
	chromium,
	firefox,
	type Page,
	webkit,
} from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
	setDocsTheme,
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const browserTypes: readonly [string, BrowserType][] = [
	["Chromium", chromium],
	["Firefox", firefox],
	["WebKit", webkit],
];
let handle: TestServerHandle;

describe("focused cross-browser readiness", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
	}, 120_000);

	afterAll(async () => {
		await teardownTestServer(handle);
	}, 120_000);

	it.each(browserTypes)(
		"%s supports keyboard, motion, theme, RTL, and enlarged text",
		async (_name, browserType) => {
			const browser = await browserType.launch({ headless: true });
			try {
				await verifyDialogKeyboard(browser);
				await verifyDrawerMotion(browser);
				await verifyTablePreferences(browser);
			} finally {
				await browser.close();
			}
		},
		120_000
	);
});

async function verifyDialogKeyboard(browser: Browser): Promise<void> {
	const context = await browser.newContext({
		viewport: { height: 800, width: 1024 },
	});
	try {
		await context.addInitScript(() => {
			localStorage.setItem("mizen-theme", "dark");
		});
		const page = await context.newPage();
		const errors = watchErrors(page);
		await page.goto(`${handle.url}/components/dialog`, {
			waitUntil: "networkidle",
		});
		expect(await page.locator("html").getAttribute("data-theme")).toBe("dark");

		const example = page.locator("#BasicDialog");
		const trigger = example.getByRole("button", {
			exact: true,
			name: "About this workspace",
		});
		await trigger.focus();
		await page.keyboard.press("Enter");

		const dialog = page.getByRole("dialog", {
			exact: true,
			name: "Product workspace",
		});
		await dialog.waitFor({ state: "visible" });
		// Focus moves in and returns asynchronously; poll so slower engines pass.
		await expect
			.poll(() =>
				dialog.evaluate((element) =>
					Boolean(
						document.activeElement && element.contains(document.activeElement)
					)
				)
			)
			.toBe(true);

		await page.keyboard.press("Escape");
		await dialog.waitFor({ state: "hidden" });
		await expect
			.poll(() =>
				trigger.evaluate((element) => document.activeElement === element)
			)
			.toBe(true);
		assertNoPageErrors(errors);
	} finally {
		await context.close();
	}
}

async function verifyDrawerMotion(browser: Browser): Promise<void> {
	const context = await browser.newContext({
		reducedMotion: "reduce",
		viewport: { height: 800, width: 900 },
	});
	try {
		const page = await context.newPage();
		const errors = watchErrors(page);
		await page.goto(`${handle.url}/components/drawer`, {
			waitUntil: "networkidle",
		});

		const example = page.locator("#ActivityDrawer");
		const trigger = example.getByRole("button", {
			exact: true,
			name: "Review project activity",
		});
		await trigger.focus();
		await page.keyboard.press("Enter");

		const dialog = page.getByRole("dialog", {
			exact: true,
			name: "Recent activity",
		});
		await dialog.waitFor({ state: "visible" });
		expect(
			await dialog.evaluate(
				(element) => getComputedStyle(element).transitionDuration
			)
		).toBe("0s");

		await page.keyboard.press("Escape");
		await dialog.waitFor({ state: "hidden" });
		expect(
			await trigger.evaluate((element) => document.activeElement === element)
		).toBe(true);
		assertNoPageErrors(errors);
	} finally {
		await context.close();
	}
}

async function verifyTablePreferences(browser: Browser): Promise<void> {
	const context = await browser.newContext({
		viewport: { height: 900, width: 1280 },
	});
	try {
		await context.addInitScript(() => {
			localStorage.setItem("mizen-theme", "light");
		});
		const page = await context.newPage();
		const errors = watchErrors(page);
		await page.goto(`${handle.url}/components/table`, {
			waitUntil: "networkidle",
		});

		const container = page.getByRole("region", {
			exact: true,
			name: "2026 monthly operating budget by cost category",
		});
		await container.waitFor({ state: "visible" });
		await page.addStyleTag({ content: "html {font-size:32px!important}" });
		expect(
			await page.evaluate(
				() => getComputedStyle(document.documentElement).fontSize
			)
		).toBe("32px");
		expect(await page.locator("html").getAttribute("data-theme")).toBe("light");

		const rowHeader = container.locator("tbody th").first();
		await container.evaluate((element) => {
			element.setAttribute("dir", "rtl");
		});
		const rtlBaseline = await rowHeader.boundingBox();
		expect(rtlBaseline).not.toBeNull();
		await container.evaluate((element) => {
			element.scrollLeft = -240;
		});
		expect(
			await container.evaluate((element) => element.scrollLeft)
		).toBeLessThan(0);
		const rtlScrolled = await rowHeader.boundingBox();
		expect(rtlScrolled).not.toBeNull();
		expect(
			Math.abs((rtlBaseline?.x ?? 0) - (rtlScrolled?.x ?? 0))
		).toBeLessThan(2);

		await setDocsTheme(page, "dark");
		expect(await page.locator("html").getAttribute("data-theme")).toBe("dark");

		await page.setViewportSize({ height: 900, width: 390 });
		expect(
			await page.evaluate(
				() => document.documentElement.scrollWidth <= innerWidth
			)
		).toBe(true);
		assertNoPageErrors(errors);
	} finally {
		await context.close();
	}
}

function watchErrors(page: Page): string[] {
	const errors: string[] = [];
	page.on("console", (message) => {
		if (message.type() === "error") {
			errors.push(message.text());
		}
	});
	page.on("pageerror", (error) => errors.push(error.message));
	return errors;
}

function assertNoPageErrors(errors: readonly string[]): void {
	expect(errors).toEqual([]);
}
