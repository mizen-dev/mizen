import { type Browser, chromium, type Locator, type Page } from "playwright";
import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from "vitest";
import {
	setDocsTheme,
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
let handle: TestServerHandle;
let browser: Browser;
let page: Page;
const errors: string[] = [];

async function setTheme(
	theme: "light" | "dark",
	reducedMotion: "reduce" | "no-preference" = "no-preference"
) {
	await page.emulateMedia({
		colorScheme: theme === "light" ? "dark" : "light",
		reducedMotion,
	});
	await setDocsTheme(page, theme);
	await expect
		.poll(() => page.locator("html").getAttribute("data-theme"))
		.toBe(theme);
}

async function capture(roots: Locator, path: string) {
	const boxes = await roots.evaluateAll((nodes) =>
		nodes.map((el) => {
			const r = el.getBoundingClientRect();
			return { bottom: r.bottom, right: r.right, x: r.x, y: r.y };
		})
	);
	const x = Math.max(0, Math.min(...boxes.map((r) => r.x)) - 12);
	const y = Math.max(0, Math.min(...boxes.map((r) => r.y)) - 12);
	const size = page.viewportSize();
	const right = Math.min(
		size?.width ?? 1280,
		Math.max(...boxes.map((r) => r.right)) + 12
	);
	const bottom = Math.min(
		size?.height ?? 900,
		Math.max(...boxes.map((r) => r.bottom)) + 12
	);
	await page.screenshot({
		clip: { height: bottom - y, width: right - x, x, y },
		path,
	});
}

async function settled(roots: Locator) {
	await expect
		.poll(() =>
			roots.evaluateAll((nodes) =>
				nodes.every(
					(el) =>
						!el.hasAttribute("data-starting-style") &&
						el
							.getAnimations()
							.every((animation) => animation.playState === "finished")
				)
			)
		)
		.toBe(true);
}

describe("Toast visual and interaction states", { timeout: 20_000 }, () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
	}, 120_000);
	beforeEach(async () => {
		errors.length = 0;
		page = await browser.newPage({ viewport: { height: 900, width: 1280 } });
		page.setDefaultTimeout(8000);
		page.on("pageerror", (e) => errors.push(e.message));
		page.on("console", (m) => {
			if (m.type() === "error") {
				errors.push(m.text());
			}
		});
		await page.goto(`${handle.url}/components/toast`, {
			waitUntil: "networkidle",
		});
	});
	afterEach(async () => {
		expect(errors).toEqual([]);
		await page.close();
	});
	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
	});

	it.each(["light", "dark"] as const)(
		"shows visible collapsed surfaces and expands variable heights in %s",
		async (theme) => {
			await setTheme(theme);
			const trigger = page.getByRole("button", {
				exact: true,
				name: "Show toast stack",
			});
			await trigger.click();
			const roots = page.locator('[data-slot="toast-root"]');
			await expect.poll(() => roots.count()).toBe(3);
			await settled(roots);
			expect(await page.locator('[data-slot="toast-viewport"]').count()).toBe(
				1
			);
			const behind = roots.nth(1);
			expect(
				await behind.evaluate((el) => getComputedStyle(el).backgroundColor)
			).not.toBe("rgba(0, 0, 0, 0)");
			expect(
				await behind.evaluate((el) => getComputedStyle(el).borderStyle)
			).toBe("solid");
			expect(
				await behind
					.locator('[data-slot="toast-content"]')
					.evaluate((el) => getComputedStyle(el).opacity)
			).toBe("0");
			const text = roots.first().locator('[data-slot="toast-title"]');
			expect(await text.evaluate((el) => getComputedStyle(el).color)).toBe(
				await trigger.evaluate((el) => getComputedStyle(el).color)
			);
			expect(await text.evaluate((el) => getComputedStyle(el).fontSize)).toBe(
				"14px"
			);
			await capture(roots, `/private/tmp/mizen-toast-collapsed-${theme}.png`);
			await roots.first().hover();
			await expect
				.poll(() =>
					roots.evaluateAll((nodes) =>
						nodes.every((el) => el.hasAttribute("data-expanded"))
					)
				)
				.toBe(true);
			await settled(roots);
			const boxes = await roots.evaluateAll((nodes) =>
				nodes.map((el) => {
					const r = el.getBoundingClientRect();
					return { bottom: r.bottom, height: r.height, y: r.y };
				})
			);
			expect(boxes[1].bottom).toBeLessThanOrEqual(boxes[0].y - 10);
			expect(boxes[2].bottom).toBeLessThanOrEqual(boxes[1].y - 10);
			expect(new Set(boxes.map((r) => r.height)).size).toBeGreaterThan(1);
			expect(
				await behind
					.locator('[data-slot="toast-content"]')
					.evaluate((el) => getComputedStyle(el).opacity)
			).toBe("1");
			await capture(roots, `/private/tmp/mizen-toast-expanded-${theme}.png`);
		}
	);

	it.each(["light", "dark"] as const)(
		"shares a toaster across demos and keeps actions and anchored feedback aligned in %s",
		async (theme) => {
			await setTheme(theme);
			await page
				.getByRole("button", { exact: true, name: "Copy link" })
				.click();
			await page
				.getByRole("button", { exact: true, name: "Deploy production release" })
				.click();
			const roots = page.locator('[data-slot="toast-root"]');
			await expect.poll(() => roots.count()).toBe(2);
			expect(await page.locator('[data-slot="toast-viewport"]').count()).toBe(
				1
			);
			const deployed = roots.filter({
				has: page.locator('[data-slot="toast-title"]', {
					hasText: "Release deployed",
				}),
			});
			await deployed.hover();
			await settled(deployed);
			const action = deployed.getByRole("button", {
				exact: true,
				name: "Undo",
			});
			expect(await action.evaluate((el) => getComputedStyle(el).height)).toBe(
				"28px"
			);
			await capture(deployed, `/private/tmp/mizen-toast-action-${theme}.png`);
			const titleId = await deployed.getAttribute("aria-labelledby");
			const updated = page.locator(
				`[data-slot="toast-root"][aria-labelledby="${titleId}"]`
			);
			await action.click();
			await expect
				.poll(() => updated.locator('[data-slot="toast-title"]').textContent())
				.toBe("Deployment rolled back");
			expect(await updated.getByRole("button").count()).toBe(0);
			const anchor = page.getByRole("button", {
				exact: true,
				name: "Show manifest details",
			});
			await anchor.click();
			const popup = page.locator('[data-slot="toast-popup"]');
			await popup.waitFor({ state: "visible" });
			await settled(popup);
			expect(
				await popup
					.locator('[data-slot="toast-title"]')
					.evaluate((el) => getComputedStyle(el).fontSize)
			).toBe("14px");
			expect(
				await popup
					.locator('[data-slot="toast-title"]')
					.evaluate((el) => getComputedStyle(el).color)
			).toBe(await anchor.evaluate((el) => getComputedStyle(el).color));
			await capture(popup, `/private/tmp/mizen-toast-anchored-${theme}.png`);
			await popup.getByRole("button", { exact: true, name: "Dismiss" }).click();
			await popup.waitFor({ state: "detached" });
		}
	);

	it.each(["light", "dark"] as const)(
		"renders loading, success, error, info and warning in %s",
		async (theme) => {
			await setTheme(theme, "reduce");
			for (const type of ["success", "error", "info", "warning"]) {
				// biome-ignore lint/performance/noAwaitInLoops: Status buttons share a single toast viewport.
				await page
					.getByRole("button", {
						exact: true,
						name: `${type.charAt(0).toUpperCase() + type.slice(1)} toast`,
					})
					.click();
				const root = page.locator(
					`[data-slot="toast-root"][data-type="${type}"]`
				);
				await root.waitFor({ state: "visible" });
				expect(await root.locator('[data-slot="toast-icon"]').count()).toBe(1);
				expect(
					await root
						.locator('[data-slot="toast-description"]')
						.evaluate((el) => getComputedStyle(el).fontSize)
				).toBe("14px");
			}
			await expect
				.poll(() =>
					page.locator('[data-slot="toast-root"]:not([data-limited])').count()
				)
				.toBe(3);
			await page
				.getByRole("button", { exact: true, name: "Complete export" })
				.click();
			const root = page.locator('[data-slot="toast-root"]', {
				has: page.locator('[data-slot="toast-title"]', {
					hasText: "Preparing export",
				}),
			});
			await root.waitFor({ state: "visible" });
			const id = await root.getAttribute("aria-labelledby");
			expect(await root.getAttribute("data-type")).toBe("loading");
			await expect
				.poll(
					() =>
						page
							.locator(`[aria-labelledby="${id}"] [data-slot="toast-title"]`)
							.textContent(),
					{ timeout: 5000 }
				)
				.toBe("Export complete");
			await page
				.getByRole("button", { exact: true, name: "Fail export" })
				.click();
			await page
				.locator('[data-slot="toast-title"]', { hasText: "Export failed" })
				.waitFor({ state: "visible" });
		}
	);

	it.each(["light", "dark"] as const)(
		"fits a narrow viewport and supports swipe dismissal and compact anchored feedback in %s",
		async (theme) => {
			await setTheme(theme, "reduce");
			await page.setViewportSize({ height: 800, width: 390 });
			await page
				.getByRole("button", { exact: true, name: "Copy link" })
				.click();
			const root = page.locator('[data-slot="toast-root"]');
			await root.waitFor({ state: "visible" });
			const box = await root.boundingBox();
			expect(box?.x).toBeGreaterThanOrEqual(0);
			expect(box ? box.x + box.width : 1000).toBeLessThanOrEqual(390);
			expect(
				await root.evaluate((el) => getComputedStyle(el).transitionDuration)
			).toBe("0s");
			if (!box) {
				throw new Error("Missing toast geometry");
			}
			await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
			await page.mouse.down();
			await page.mouse.move(box.x + box.width + 200, box.y + box.height / 2, {
				steps: 8,
			});
			await page.mouse.up();
			await root.waitFor({ state: "detached" });
			await page
				.getByRole("button", { exact: true, name: "Copy release commit SHA" })
				.click();
			const popup = page.locator('[data-slot="toast-popup"]');
			await popup.waitFor({ state: "visible" });
			expect(
				await popup
					.locator('[data-slot="toast-title"]')
					.evaluate((el) => getComputedStyle(el).fontSize)
			).toBe("12px");
			const tipBox = await popup.boundingBox();
			expect(tipBox?.x).toBeGreaterThanOrEqual(0);
			expect(tipBox ? tipBox.x + tipBox.width : 1000).toBeLessThanOrEqual(390);
			await capture(popup, `/private/tmp/mizen-toast-compact-${theme}.png`);
		}
	);
	it.each(["light", "dark"] as const)(
		"supports keyboard focus, dismissal and automatic timeout in %s",
		async (theme) => {
			await setTheme(theme, "reduce");
			const trigger = page.getByRole("button", {
				exact: true,
				name: "Copy link",
			});
			await trigger.click();
			const root = page.locator('[data-slot="toast-root"]');
			await root.waitFor({ state: "visible" });
			await page.keyboard.press("F6");
			await expect
				.poll(() => root.getAttribute("data-expanded"))
				.not.toBeNull();
			expect(
				await root.evaluate((el) => getComputedStyle(el).outlineColor)
			).not.toBe("rgba(0, 0, 0, 0)");
			await page.keyboard.press("Tab");
			await page.keyboard.press("Escape");
			await root.waitFor({ state: "detached" });
			await trigger.click();
			await root.waitFor({ state: "visible" });
			await root.waitFor({ state: "detached" });
		}
	);
});
