// biome-ignore-all lint/performance/noAwaitInLoops: Browser states share a page and must run sequentially.
import { type Browser, chromium, type Page } from "playwright";
import {
	afterAll,
	afterEach,
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

let browser: Browser;
let page: Page;
let handle: TestServerHandle;

function textContrast(element: Element) {
	const context = document.createElement("canvas").getContext("2d");
	if (!context) {
		throw new Error("Canvas unavailable");
	}
	let surface: Element | null = element;
	while (
		surface &&
		getComputedStyle(surface).backgroundColor === "rgba(0, 0, 0, 0)"
	) {
		surface = surface.parentElement;
	}
	if (!surface) {
		throw new Error("Text surface unavailable");
	}
	context.fillStyle = getComputedStyle(surface).backgroundColor;
	context.fillRect(0, 0, 1, 1);
	const background = context.getImageData(0, 0, 1, 1).data;
	const style = getComputedStyle(element);
	context.globalAlpha = Number(style.opacity);
	context.fillStyle = style.color;
	context.fillRect(0, 0, 1, 1);
	return [
		Array.from(background),
		Array.from(context.getImageData(0, 0, 1, 1).data),
	];
}

function luminance(channels: number[]) {
	return [0.2126, 0.7152, 0.0722].reduce((sum, weight, index) => {
		const value = channels[index] / 255;
		return (
			sum +
			weight *
				(value <= 0.040_45 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
		);
	}, 0);
}

describe("Remaining component state repairs", () => {
	beforeAll(async () => {
		handle = await setupTestServer(new URL("..", import.meta.url).pathname);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
		});
	}, 120_000);
	beforeEach(async () => {
		page = await browser.newPage();
	});
	afterEach(async () => {
		await page?.close();
	});
	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
	});

	describe.each(["light", "dark"] as const)("%s theme", (theme) => {
		it(`keeps menu metadata readable and navigation backgrounds explicit in ${theme}`, async () => {
			await page.addInitScript(
				(value) => localStorage.setItem("mizen-theme", value),
				theme
			);
			await page.goto(`${handle.url}/docs/components/menu`, {
				waitUntil: "networkidle",
			});
			await page
				.getByRole("button", { exact: true, name: "Project actions" })
				.click();
			const popup = page.getByRole("menu").first();
			await popup.waitFor();
			const shortcut = popup.getByText("⌘O", { exact: true });
			for (const text of [
				shortcut,
				popup.getByText("Project", { exact: true }),
			]) {
				const [a, b] = (await text.evaluate(textContrast)).map(luminance);
				expect(
					(Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
				).toBeGreaterThanOrEqual(4.5);
			}
			await page.getByRole("menuitem", { name: "Open project" }).focus();
			await page.emulateMedia({ forcedColors: "active" });
			const item = popup.getByRole("menuitem", { name: "Open project" });
			await expect
				.poll(async () => {
					const [metadataColor, itemColor] = await Promise.all([
						shortcut.evaluate((node) => getComputedStyle(node).color),
						item.evaluate((node) => getComputedStyle(node).color),
					]);
					return metadataColor === itemColor;
				})
				.toBe(true);
			await page.emulateMedia({ forcedColors: "none" });
			await page.mouse.move(0, 0);
			await page.goto(`${handle.url}/docs/components/navigation-menu`, {
				waitUntil: "networkidle",
			});
			const trigger = page
				.locator('[data-slot="navigation-menu-trigger"]')
				.first();
			expect(
				await trigger.evaluate((node) => getComputedStyle(node).backgroundColor)
			).toBe("rgba(0, 0, 0, 0)");
			await trigger.hover();
			await expect
				.poll(() =>
					trigger.evaluate((node) => getComputedStyle(node).backgroundColor)
				)
				.not.toBe("rgba(0, 0, 0, 0)");
		});
	});

	it("keeps disabled close and tree controls at rest during pointer input", async () => {
		await page.goto(`${handle.url}/docs/components/sheet`, {
			waitUntil: "networkidle",
		});
		await page.getByRole("button", { name: "Edit workspace settings" }).click();
		const close = page.locator('[data-slot="sheet-default-close"]');
		// Isolate native disabled CSS; public closeProps behavior is outside this CSS probe.
		await close.evaluate((node) => {
			(node as HTMLButtonElement).disabled = true;
		});
		await close.hover({ force: true });
		await page.mouse.down();
		await page.waitForTimeout(180);
		expect(
			await close.evaluate((node) => getComputedStyle(node).transform)
		).toBe("none");
		expect(
			await close.evaluate((node) => getComputedStyle(node).backgroundColor)
		).toBe("rgba(0, 0, 0, 0)");
		await page.mouse.up();
		await page.goto(`${handle.url}/docs/components/tree`, {
			waitUntil: "networkidle",
		});
		const row = page
			.locator("#examples")
			.getByRole("treeitem", { name: "Archive" })
			.locator('[data-slot="tree-item-row"]');
		await row.hover();
		expect(
			await row.evaluate((node) => getComputedStyle(node).backgroundColor)
		).toBe("rgba(0, 0, 0, 0)");
	});
});
