import { type Browser, chromium, type Page } from "playwright";
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
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
let handle: TestServerHandle;
let browser: Browser;
let page: Page;
const errors: string[] = [];

describe("Shared component preview layout", { timeout: 20_000 }, () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		page.setDefaultTimeout(8000);
		page.on("pageerror", (error) => errors.push(error.message));
		page.on("console", (message) => {
			if (message.type() === "error") {
				errors.push(message.text());
			}
		});
	}, 120_000);
	beforeEach(async () => {
		errors.length = 0;
		await page.setViewportSize({ height: 900, width: 1280 });
	});
	afterEach(() => expect(errors).toEqual([]));
	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
	});
	it.each([
		"navigation-menu",
		"button",
		"link",
		"menubar",
		"input",
		"form",
		"grid",
		"file-upload",
	])("keeps %s frames full-width, tall enough, and centered", async (slug) => {
		await page.goto(`${handle.url}/components/${slug}`, {
			waitUntil: "networkidle",
		});
		const frames = page.locator(
			'[data-slot="component-preview"], [data-slot="usage-preview"]'
		);
		const geometry = await frames.evaluateAll((elements) =>
			elements.map((el) => {
				const frame = el.getBoundingClientRect();
				const content = el.firstElementChild?.getBoundingClientRect();
				const exampleRoot =
					el.firstElementChild?.firstElementChild?.getBoundingClientRect();
				return {
					height: frame.height,
					horizontal: content
						? Math.abs(
								content.x + content.width / 2 - frame.x - frame.width / 2
							)
						: 0,
					rootHorizontal: exampleRoot
						? Math.abs(
								exampleRoot.x +
									exampleRoot.width / 2 -
									frame.x -
									frame.width / 2
							)
						: 0,
					vertical: content
						? Math.abs(
								content.y + content.height / 2 - frame.y - frame.height / 2
							)
						: 0,
					width: frame.width,
				};
			})
		);
		expect(geometry.length).toBeGreaterThan(1);
		for (const frame of geometry) {
			expect(frame.height).toBeGreaterThanOrEqual(384);
			expect(frame.width).toBeCloseTo(geometry[0].width, 0);
			expect(frame.horizontal).toBeLessThan(1);
			expect(frame.rootHorizontal).toBeLessThan(1);
			expect(frame.vertical).toBeLessThan(1);
		}
	});

	it.each(["light", "dark"] as const)(
		"centers compact navigation and keeps example frames consistent in %s",
		async (theme) => {
			await page.emulateMedia({ colorScheme: theme });
			await page.goto(`${handle.url}/components/navigation-menu`, {
				waitUntil: "networkidle",
			});
			const frame = page.locator('[data-slot="component-preview"]');
			const nav = frame.locator('[data-slot="navigation-menu"]');
			const [f, n] = await Promise.all([
				frame.boundingBox(),
				nav.boundingBox(),
			]);
			expect(
				f && n && Math.abs(n.x + n.width / 2 - f.x - f.width / 2) < 1
			).toBe(true);
			const exampleOffsets = await page
				.locator('[data-slot="usage-preview"]')
				.evaluateAll((frames) =>
					frames.flatMap((exampleFrame) => {
						const frameBounds = exampleFrame.getBoundingClientRect();
						return [
							...exampleFrame.querySelectorAll('[data-slot="navigation-menu"]'),
						].map((exampleNav) => {
							const navBounds = exampleNav.getBoundingClientRect();
							return Math.abs(
								navBounds.x +
									navBounds.width / 2 -
									frameBounds.x -
									frameBounds.width / 2
							);
						});
					})
				);
			for (const offset of exampleOffsets) {
				expect(offset).toBeLessThan(1);
			}
			await frame.screenshot({
				path: `/private/tmp/mizen-preview-center-${theme}.png`,
			});
			const example = page.getByRole("region", {
				exact: true,
				name: "Navigation Menu: Workspace resources example",
			});
			await example.screenshot({
				path: `/private/tmp/mizen-preview-frame-${theme}.png`,
			});
		}
	);

	it("keeps phone frames at the shared minimum without horizontal overflow", async () => {
		await page.setViewportSize({ height: 800, width: 320 });
		await page.goto(`${handle.url}/components/navigation-menu`, {
			waitUntil: "networkidle",
		});
		const frames = await page
			.locator('[data-slot="component-preview"], [data-slot="usage-preview"]')
			.evaluateAll((elements) =>
				elements.map((el) => ({
					height: el.getBoundingClientRect().height,
					scroll: el.scrollWidth,
					width: el.clientWidth,
				}))
			);
		for (const frame of frames) {
			expect(frame.height).toBeGreaterThanOrEqual(288);
			expect(frame.scroll).toBeLessThanOrEqual(frame.width);
		}
	});
});
