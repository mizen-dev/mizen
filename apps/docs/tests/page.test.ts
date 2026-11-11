import type { PageProps } from "@mizen-labs/ui/page";
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

type PagePropsAcceptsStyle = "style" extends keyof PageProps ? true : false;

async function openExample(name: string, width: number): Promise<void> {
	await page.setViewportSize({ height: 900, width });
	const response = await page.goto(`${handle.url}/docs/examples/${name}`, {
		waitUntil: "networkidle",
	});
	expect(response?.status()).toBe(200);
}

function readBox(slot: string) {
	return page
		.locator(`[data-slot="${slot}"]`)
		.first()
		.evaluate((node) => node.getBoundingClientRect().toJSON() as DOMRect);
}

describe("Page component and screen recipes", () => {
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
		await Promise.all([browser?.close(), teardownTestServer(handle)]);
	}, 120_000);

	it("resolves root and page subpath exports with a closed prop contract", () => {
		expect(import.meta.resolve("@mizen-labs/ui/page")).toContain(
			"packages/ui/dist/components/page/page.js"
		);
		const acceptsStyle = false satisfies PagePropsAcceptsStyle;
		expect(acceptsStyle).toBe(false);
	});

	it("renders the Page docs route with every screen recipe", async () => {
		const response = await page.goto(`${handle.url}/components/page`, {
			waitUntil: "networkidle",
		});
		expect(response?.status()).toBe(200);
		expect(
			await page
				.getByRole("heading", { exact: true, level: 1, name: "Page" })
				.isVisible()
		).toBe(true);
		const counts = await Promise.all(
			["Dashboard", "Record list", "Record detail", "Settings form"].map(
				(recipe) =>
					page
						.getByRole("region", { name: `Page: ${recipe} example` })
						.locator('[data-slot="page"]')
						.count()
			)
		);
		expect(counts).toEqual([1, 1, 1, 1]);
	});

	it("fills the window, owns the inset, and spaces its sections", async () => {
		await openExample("ProjectsPage", 1280);
		const root = page.locator('[data-slot="page"]');
		expect(await root.getAttribute("data-width")).toBe("full");
		expect(
			await root.evaluate((node) => {
				const { gap, paddingBlock, paddingInline } = getComputedStyle(node);
				return [
					node.getBoundingClientRect().width ===
						node.parentElement?.clientWidth,
					gap,
					paddingBlock,
					paddingInline,
				];
			})
		).toEqual([true, "32px", "24px", "24px"]);
	});

	it("renders one h1 title, a description, and the brand action", async () => {
		expect(await page.getByRole("heading", { level: 1 }).count()).toBe(1);
		const title = page.getByRole("heading", { level: 1, name: "Projects" });
		expect(await title.getAttribute("data-slot")).toBe("page-title");
		expect(
			await title.evaluate((node) => {
				const { fontSize, fontWeight } = getComputedStyle(node);
				return [fontSize, fontWeight];
			})
		).toEqual(["20px", "600"]);
		expect(
			await page.locator('[data-slot="page-description"]').textContent()
		).toBe("Everything your team ships.");
		expect(
			await page
				.locator('[data-slot="page-action"]')
				.getByRole("button", { name: "New project" })
				.isVisible()
		).toBe(true);
	});

	it.each([
		{ beside: true, width: 1280 },
		{ beside: false, width: 375 },
	])(
		"places the action beside the title: $beside at a $width px window",
		async ({ beside, width }) => {
			await openExample("ProjectsPage", width);
			const title = await readBox("page-title");
			const action = await readBox("page-action");
			expect(action.top < title.bottom).toBe(beside);
			expect(action.left > title.left).toBe(beside);
			expect(
				await page.evaluate(
					() => document.body.scrollWidth - document.body.clientWidth
				)
			).toBe(0);
		}
	);

	it("uses the smaller inset on a phone", async () => {
		expect(
			await page
				.locator('[data-slot="page"]')
				.evaluate((node) => getComputedStyle(node).paddingInline)
		).toBe("16px");
	});

	it("keeps a narrow page in one 42rem column", async () => {
		await openExample("PageSettingsExample4", 1280);
		const root = page.locator('[data-slot="page"]');
		expect(await root.getAttribute("data-width")).toBe("narrow");
		expect((await readBox("page")).width).toBe(672);
	});

	it("puts the dashboard metrics in one row on a wide screen", async () => {
		await openExample("PageDashboardExample1", 1280);
		const columns = await page
			.locator(
				'[data-slot="grid"][data-columns="4"] > [data-slot="grid-track"]'
			)
			.evaluate(
				(track) => getComputedStyle(track).gridTemplateColumns.split(" ").length
			);
		expect(columns).toBe(4);
	});

	it("takes the space beside a sidebar", async () => {
		await openExample("ProjectsPage", 1280);
		const rest = await page.locator('[data-slot="page"]').evaluate((node) => {
			const shell = document.createElement("div");
			shell.style.display = "flex";
			const sidebar = document.createElement("div");
			sidebar.style.flex = "none";
			sidebar.style.width = "240px";
			node.replaceWith(shell);
			shell.append(sidebar, node);
			return shell.clientWidth - node.getBoundingClientRect().width;
		});
		expect(rest).toBe(240);
	});
});
