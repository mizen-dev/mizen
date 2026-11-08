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
		throw new AggregateError(failures, "Failed to tear down the avatar test");
	}
}

async function gotoAvatar(width = 1280, height = 900): Promise<void> {
	await page.setViewportSize({ height, width });
	await page.goto(`${handle.url}/components/avatar`, {
		waitUntil: "networkidle",
	});
}

describe("Avatar component browser behavior", () => {
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

	it("resolves package root and avatar subpath exports", () => {
		expect(import.meta.resolve("@mizen-labs/ui")).toContain(
			"packages/ui/dist/index.js"
		);
		expect(import.meta.resolve("@mizen-labs/ui/avatar")).toContain(
			"packages/ui/dist/components/avatar/avatar.js"
		);
	});

	it("renders the Avatar docs route with HTTP 200 and top-level heading", async () => {
		const response = await page.goto(`${handle.url}/components/avatar`, {
			waitUntil: "networkidle",
		});
		expect(response?.status()).toBe(200);
		expect(
			await page
				.getByRole("heading", { exact: true, level: 1, name: "Avatar" })
				.isVisible()
		).toBe(true);
	});

	it("renders exact 24px, 32px, and 40px root geometry for sm, default, and lg sizes", async () => {
		await gotoAvatar();
		const getDimensions = (testId: string) =>
			page.locator(`[data-testid="${testId}"]`).evaluate((el) => {
				const rect = el.getBoundingClientRect();
				return {
					height: Math.round(rect.height),
					width: Math.round(rect.width),
				};
			});

		expect(await getDimensions("avatar-size-sm")).toEqual({
			height: 24,
			width: 24,
		});
		expect(await getDimensions("avatar-size-default")).toEqual({
			height: 32,
			width: 32,
		});
		expect(await getDimensions("avatar-size-lg")).toEqual({
			height: 40,
			width: 40,
		});
	});

	it("enforces circular clipping, fixed slots, and absolute fallback overlay", async () => {
		await gotoAvatar();
		const root = page.locator('[data-testid="avatar-size-default"]');
		const rootStyles = await root.evaluate((el) => {
			const s = getComputedStyle(el);
			return { borderRadius: s.borderRadius, overflow: s.overflow };
		});
		expect(rootStyles.borderRadius).toBe("9999px");
		expect(rootStyles.overflow).toBe("hidden");

		const requiredSlots = ["avatar", "avatar-image", "avatar-fallback"];
		const slotCounts = await Promise.all(
			requiredSlots.map((slot) => page.locator(`[data-slot="${slot}"]`).count())
		);
		for (const count of slotCounts) {
			expect(count).toBeGreaterThan(0);
		}

		const fallback = root.locator('[data-slot="avatar-fallback"]');
		const fallbackStyles = await fallback.evaluate((el) => {
			const s = getComputedStyle(el);
			return {
				height: s.height,
				insetBlockStart: s.top,
				insetInlineStart: s.left,
				position: s.position,
				width: s.width,
			};
		});
		expect(fallbackStyles.position).toBe("absolute");
		expect(fallbackStyles.insetBlockStart).toBe("0px");
		expect(fallbackStyles.insetInlineStart).toBe("0px");
		expect(fallbackStyles.width).toBe("32px");
		expect(fallbackStyles.height).toBe("32px");
	});

	it("loads deterministic image with meaningful alt and covers root", async () => {
		await gotoAvatar();
		const loadedAvatar = page.locator('[data-testid="avatar-loaded"]');
		const img = loadedAvatar.locator('img[data-slot="avatar-image"]');
		await expect.poll(async () => img.isVisible()).toBe(true);

		expect(await img.getAttribute("alt")).toBe("Maya Chen");
		const imageGeometry = await img.evaluate((el) => {
			if (!(el instanceof HTMLImageElement)) {
				throw new TypeError("Expected an HTMLImageElement target");
			}
			const rect = el.getBoundingClientRect();
			const s = getComputedStyle(el);
			return {
				complete: el.complete,
				height: Math.round(rect.height),
				naturalWidth: el.naturalWidth,
				objectFit: s.objectFit,
				width: Math.round(rect.width),
			};
		});
		expect(imageGeometry.complete).toBe(true);
		expect(imageGeometry.naturalWidth).toBeGreaterThan(0);
		expect(imageGeometry.objectFit).toBe("cover");
		expect(imageGeometry.width).toBe(32);
		expect(imageGeometry.height).toBe(32);
	});

	it("yields supplied fallback without a visible broken image when image fails", async () => {
		await gotoAvatar();
		const brokenAvatar = page.locator('[data-testid="avatar-broken"]');
		const fallback = brokenAvatar.locator('[data-slot="avatar-fallback"]');

		await expect.poll(async () => fallback.isVisible()).toBe(true);
		expect(await fallback.textContent()).toBe("JL");
		expect(await fallback.getAttribute("role")).toBe("img");
		expect(await fallback.getAttribute("aria-label")).toBe("Jordan Lee");

		const img = brokenAvatar.locator('img[data-slot="avatar-image"]');
		expect(await img.count()).toBe(0);
	});

	it("adapts fallback surface and content colors under dark theme", async () => {
		await gotoAvatar();
		await page.goto(`${handle.url}/internal/theme-fixtures`, {
			waitUntil: "networkidle",
		});
		const getColors = (selector: string) =>
			page.locator(selector).evaluate((el) => {
				const s = getComputedStyle(el);
				return { bg: s.backgroundColor, color: s.color };
			});

		const [lightColors, darkColors] = await Promise.all([
			getColors(
				'[data-testid="avatar-size-default"] [data-slot="avatar-fallback"]'
			),
			getColors(
				'[data-testid="avatar-dark-theme"] [data-slot="avatar-fallback"]'
			),
		]);

		expect(darkColors.bg).not.toBe(lightColors.bg);
		expect(darkColors.color).not.toBe(lightColors.color);
	});

	it("fits 375px, 768px, and 1280px viewports without horizontal overflow", async () => {
		const checkFit = async (width: number) => {
			await gotoAvatar(width, 900);
			const [scrollW, clientW] = await page.evaluate(() => [
				document.body.scrollWidth,
				document.body.clientWidth,
			]);
			expect(scrollW).toBe(clientW);
		};
		await checkFit(375);
		await checkFit(768);
		await checkFit(1280);
	});
});
