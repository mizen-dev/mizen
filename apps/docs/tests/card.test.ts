import type { CardProps } from "@mizen-labs/ui/card";
import { type Browser, chromium, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
const DOCS_LINK_NAME = /Component documentation/iu;
const TRANSPARENT_COLOR = /transparent|rgba\(0, 0, 0, 0\)/u;

let handle: TestServerHandle;
let browser: Browser;
let page: Page;

type CardPropsAcceptsClickable = "clickable" extends keyof CardProps
	? true
	: false;

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
		throw new AggregateError(failures, "Failed to tear down the card test");
	}
}

async function gotoCard(width = 1280, height = 900): Promise<void> {
	await page.setViewportSize({ height, width });
	await page.goto(`${handle.url}/components/card`, {
		waitUntil: "networkidle",
	});
}

describe("Card component browser behavior", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		// Settled focus rings: the ring grows in over 200ms otherwise.
		await page.emulateMedia({ reducedMotion: "reduce" });
		page.setDefaultTimeout(6000);
	}, 120_000);

	afterAll(async () => {
		const results = await Promise.allSettled([
			Promise.resolve().then(() => browser?.close()),
			Promise.resolve().then(() => teardownTestServer(handle)),
		]);
		throwTeardownFailures(results);
	}, 120_000);

	it("resolves package root and card subpath exports with closed prop types", () => {
		// Given the @mizen-labs/ui workspace package
		// When resolving root and subpath entrypoints
		// Then both resolve cleanly to dist files without extra props
		expect(import.meta.resolve("@mizen-labs/ui")).toContain(
			"packages/ui/dist/index.js"
		);
		expect(import.meta.resolve("@mizen-labs/ui/card")).toContain(
			"packages/ui/dist/components/card/card.js"
		);
		const acceptsClickable = false satisfies CardPropsAcceptsClickable;
		expect(acceptsClickable).toBe(false);
	});

	it("renders the Card docs route with HTTP 200 and top-level heading", async () => {
		// Given the running docs server
		// When navigating to the Card documentation page
		const response = await page.goto(`${handle.url}/components/card`, {
			waitUntil: "networkidle",
		});
		// Then the server responds with 200 and renders the h1
		expect(response?.status()).toBe(200);
		expect(
			await page
				.getByRole("heading", { exact: true, level: 1, name: "Card" })
				.isVisible()
		).toBe(true);
	});

	it("renders static Card as a role-free div with semantic heading and all slots", async () => {
		// Given the Card docs page
		await gotoCard();
		const staticCard = page.locator('[data-testid="card-static"]');

		// When inspecting the static Card structure
		// Then it renders a role-free native div without tabindex
		expect(await staticCard.evaluate((node) => node.tagName)).toBe("DIV");
		expect(await staticCard.getAttribute("role")).toBeNull();
		expect(await staticCard.getAttribute("tabindex")).toBeNull();

		// And renders a semantic heading via CardTitle
		const heading = staticCard.getByRole("heading", { level: 3 });
		expect(await heading.isVisible()).toBe(true);
		expect(await heading.getAttribute("data-slot")).toBe("card-title");
		expect(await heading.textContent()).toBe("Deployment pipeline");

		// And renders CardContent with data-slot="card-panel"
		const panel = staticCard.locator('[data-slot="card-panel"]');
		expect(await panel.count()).toBe(1);
		expect(await panel.textContent()).toContain("Automated integration suites");

		// And renders all exact Card slots across the specimen
		const requiredSlots = [
			"card",
			"card-header",
			"card-title",
			"card-description",
			"card-action",
			"card-panel",
			"card-footer",
		];
		const slotCounts = await Promise.all(
			requiredSlots.map((slot) => page.locator(`[data-slot="${slot}"]`).count())
		);
		for (const count of slotCounts) {
			expect(count).toBeGreaterThan(0);
		}
	});

	it.each(["light", "dark"])(
		"aligns the header action with its title in %s",
		async (theme) => {
			await gotoCard();
			await page.evaluate(
				(value) => localStorage.setItem("mizen-theme", value),
				theme
			);
			await page.reload({ waitUntil: "networkidle" });
			const card = page.getByTestId("card-static");
			const title = await card.locator("[data-slot=card-title]").boundingBox();
			const action = await card
				.locator("[data-slot=card-action]")
				.boundingBox();
			if (!(title && action)) {
				throw new Error("Card title and action must be visible.");
			}
			expect(
				Math.abs(title.y + title.height / 2 - action.y - action.height / 2)
			).toBeLessThan(1);
			await page.evaluate(() => localStorage.setItem("mizen-theme", "light"));
		}
	);

	it("renders clickable Card as a native anchor with href and no role or tabIndex", async () => {
		// Given the Card docs page
		await gotoCard();
		const clickableCard = page.locator('[data-testid="card-clickable"]');

		// When inspecting the clickable Card root
		// Then it renders an anchor tag with href and no role or tabindex
		expect(await clickableCard.evaluate((node) => node.tagName)).toBe("A");
		expect(await clickableCard.getAttribute("href")).toBe(
			"#card-native-destination"
		);
		expect(await clickableCard.getAttribute("role")).toBeNull();
		expect(await clickableCard.getAttribute("tabindex")).toBeNull();

		// And provides an accessible link name via visible children
		const link = page.getByRole("link", { name: DOCS_LINK_NAME });
		expect(await link.isVisible()).toBe(true);
	});

	it("shows focus-visible outline on the clickable anchor after keyboard focus", async () => {
		// Given the Card docs page with a clickable anchor
		await gotoCard();
		const clickableCard = page.locator('[data-testid="card-clickable"]');
		const example = page.getByRole("region", {
			exact: true,
			name: "Card: Clickable navigation example",
		});

		// When navigating via keyboard Tab from the example region into the clickable Card
		await example.focus();
		await page.keyboard.press("Tab");
		expect(
			await clickableCard.evaluate((el) => document.activeElement === el)
		).toBe(true);

		// Then outlineStyle is solid with 2px focus width
		const outlineStyle = await clickableCard.evaluate((el) => {
			const s = getComputedStyle(el);
			return {
				color: s.outlineColor,
				style: s.outlineStyle,
				width: s.outlineWidth,
			};
		});
		expect(outlineStyle.style).toBe("solid");
		expect(outlineStyle.width).toBe("2px");
		expect(outlineStyle.color).not.toMatch(TRANSPARENT_COLOR);
	});

	it("changes Card surface and content colors under dark theme", async () => {
		// Given the Card docs page with light and dark-scoped Cards
		await gotoCard();
		await page.goto(`${handle.url}/internal/theme-fixtures`, {
			waitUntil: "networkidle",
		});
		const getColors = (sel: string) =>
			page.locator(sel).evaluate((el) => {
				const s = getComputedStyle(el);
				return { bg: s.backgroundColor, color: s.color };
			});

		// When evaluating computed surface and text colors
		const [lightColors, darkColors] = await Promise.all([
			getColors('[data-testid="card-static"]'),
			getColors('[data-testid="card-dark-theme"] [data-slot="card"]'),
		]);

		// Then dark theme applies distinct surface and content colors
		expect(darkColors.bg).not.toBe(lightColors.bg);
		expect(darkColors.color).not.toBe(lightColors.color);
	});

	it("fits 375px, 768px, and 1280px viewports without horizontal overflow", async () => {
		// Given the Card docs page
		// When viewed across mobile, tablet, and desktop breakpoints
		// Then document scrollWidth matches clientWidth with no horizontal overflow
		const checkFit = async (width: number) => {
			await gotoCard(width, 900);
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
