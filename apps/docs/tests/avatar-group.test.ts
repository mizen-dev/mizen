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
			"Failed to tear down the avatar group test"
		);
	}
}

async function gotoAvatarGroup(width = 1280, height = 900): Promise<void> {
	await page.setViewportSize({ height, width });
	await page.goto(`${handle.url}/components/avatar-group`, {
		waitUntil: "networkidle",
	});
}

interface OverlapCase {
	expectedDelta: number;
	expectedMargin: string;
	groupId: string;
}

const OVERLAP_CASES: readonly OverlapCase[] = [
	{ expectedDelta: 21, expectedMargin: "-3px", groupId: "avatar-group-sm" },
	{
		expectedDelta: 28,
		expectedMargin: "-4px",
		groupId: "avatar-group-default",
	},
	{ expectedDelta: 35, expectedMargin: "-5px", groupId: "avatar-group-lg" },
];

describe("AvatarGroup component browser behavior", () => {
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

	it("resolves package root and avatar-group subpath exports", () => {
		expect(import.meta.resolve("@mizen/ui")).toContain(
			"packages/ui/dist/index.js"
		);
		expect(import.meta.resolve("@mizen/ui/avatar-group")).toContain(
			"packages/ui/dist/components/avatar/avatar.js"
		);
	});

	it("renders the Avatar Group docs route with HTTP 200 and top-level heading", async () => {
		const response = await page.goto(`${handle.url}/components/avatar-group`, {
			waitUntil: "networkidle",
		});
		expect(response?.status()).toBe(200);
		expect(
			await page
				.getByRole("heading", { exact: true, level: 1, name: "Avatar Group" })
				.isVisible()
		).toBe(true);
	});

	it("renders explicit group roles and accessible names", async () => {
		await gotoAvatarGroup();
		const smGroup = page.getByRole("group", {
			name: "Core team members (small)",
		});
		const defaultGroup = page.getByRole("group", {
			name: "Core team members (default)",
		});
		const lgGroup = page.getByRole("group", {
			name: "Core team members (large)",
		});

		expect(await smGroup.isVisible()).toBe(true);
		expect(await defaultGroup.isVisible()).toBe(true);
		expect(await lgGroup.isVisible()).toBe(true);
	});

	it("renders exact 24px, 32px, and 40px avatar geometry through inherited size", async () => {
		await gotoAvatarGroup();
		const getAvatarDimensions = (groupId: string) =>
			page
				.locator(`[data-testid="${groupId}"] [data-slot="avatar"]`)
				.evaluateAll((elements) =>
					elements.map((el) => {
						const rect = el.getBoundingClientRect();
						return {
							height: Math.round(rect.height),
							width: Math.round(rect.width),
						};
					})
				);

		const smDimensions = await getAvatarDimensions("avatar-group-sm");
		expect(smDimensions).toEqual([
			{ height: 24, width: 24 },
			{ height: 24, width: 24 },
			{ height: 24, width: 24 },
		]);

		const defaultDimensions = await getAvatarDimensions("avatar-group-default");
		expect(defaultDimensions).toEqual([
			{ height: 32, width: 32 },
			{ height: 32, width: 32 },
			{ height: 32, width: 32 },
		]);

		const lgDimensions = await getAvatarDimensions("avatar-group-lg");
		expect(lgDimensions).toEqual([
			{ height: 40, width: 40 },
			{ height: 40, width: 40 },
			{ height: 40, width: 40 },
		]);
	});

	it("enforces non-first logical overlap of an eighth avatar: 3px, 4px, and 5px", async () => {
		await gotoAvatarGroup();
		await Promise.all(
			OVERLAP_CASES.map(async ({ expectedDelta, expectedMargin, groupId }) => {
				const avatars = page.locator(
					`[data-testid="${groupId}"] [data-slot="avatar"]`
				);
				const [margins, rects] = await Promise.all([
					avatars.evaluateAll((elements) =>
						elements.map((el) => getComputedStyle(el).marginInlineStart)
					),
					avatars.evaluateAll((elements) =>
						elements.map((el) => Math.round(el.getBoundingClientRect().x))
					),
				]);
				expect(margins).toEqual(["0px", expectedMargin, expectedMargin]);
				expect(rects[1] - rects[0]).toBe(expectedDelta);
			})
		);
	});

	it("applies 2px separation ring on avatars in group", async () => {
		await gotoAvatarGroup();
		const rings = await page
			.locator('[data-testid="avatar-group-default"] [data-slot="avatar"]')
			.evaluateAll((elements) =>
				elements.map((el) => getComputedStyle(el).boxShadow)
			);
		expect(rings.length).toBe(3);
		for (const shadow of rings) {
			expect(shadow).toContain("0px 0px 0px 2px");
		}
	});

	it("renders deterministic image and supplied fallback states", async () => {
		await gotoAvatarGroup();
		const defaultGroup = page.locator('[data-testid="avatar-group-default"]');
		const images = defaultGroup.locator('img[data-slot="avatar-image"]');
		expect(await images.count()).toBe(2);

		const firstImg = images.first();
		await expect.poll(async () => firstImg.isVisible()).toBe(true);
		expect(await firstImg.getAttribute("alt")).toBe("Alex Rivera");
		const imgState = await firstImg.evaluate((el) => {
			if (!(el instanceof HTMLImageElement)) {
				throw new TypeError("Expected image");
			}
			return { complete: el.complete, naturalWidth: el.naturalWidth };
		});
		expect(imgState.complete).toBe(true);
		expect(imgState.naturalWidth).toBeGreaterThan(0);

		const thirdAvatar = defaultGroup.locator('[data-slot="avatar"]').nth(2);
		expect(await thirdAvatar.locator("img").count()).toBe(0);
		const thirdFallback = thirdAvatar.locator('[data-slot="avatar-fallback"]');
		await expect.poll(async () => thirdFallback.isVisible()).toBe(true);
		expect(await thirdFallback.innerText()).toBe("MC");
		expect(await thirdFallback.getAttribute("role")).toBe("img");
		expect(await thirdFallback.getAttribute("aria-label")).toBe("Maya Chen");
	});

	it("adapts separation ring under dark theme composition", async () => {
		await gotoAvatarGroup();
		await page.goto(`${handle.url}/internal/theme-fixtures`, {
			waitUntil: "networkidle",
		});
		const getShadow = (selector: string) =>
			page.locator(selector).evaluate((el) => getComputedStyle(el).boxShadow);

		const [lightShadow, darkShadow] = await Promise.all([
			getShadow(
				'[data-testid="avatar-group-default"] [data-slot="avatar"]:first-child'
			),
			getShadow(
				'[data-testid="avatar-group-dark"] [data-slot="avatar"]:first-child'
			),
		]);

		expect(lightShadow).toContain("0px 0px 0px 2px");
		expect(darkShadow).toContain("0px 0px 0px 2px");
		expect(darkShadow).not.toBe(lightShadow);
	});

	it("fits 375px, 768px, and 1280px viewports without horizontal overflow", async () => {
		const checkFit = async (width: number) => {
			await gotoAvatarGroup(width, 900);
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
