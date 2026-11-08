import { type Browser, chromium, type Page } from "playwright";
import { expect as expectLocator } from "playwright/test";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";

let browser: Browser;
let page: Page;
const docsUrl = process.env.MIZEN_DOCS_TEST_URL ?? "http://127.0.0.1:3001";
const errors: string[] = [];

describe("Tree browser behavior", { timeout: 30_000 }, () => {
	beforeAll(async () => {
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage({ viewport: { height: 800, width: 1000 } });
		page.on("pageerror", (error) => errors.push(error.message));
		page.on("console", (message) => {
			if (message.type() === "error") {
				errors.push(message.text());
			}
		});
	}, 30_000);

	afterAll(async () => {
		await browser?.close();
		expect(errors).toEqual([]);
	});

	it("supports nested expansion, typeahead, disabled items, and RTL arrows", async () => {
		await page.goto(`${docsUrl}/internal/specimens`, { waitUntil: "load" });
		const tree = page
			.getByTestId("tree-example")
			.getByRole("tree", { name: "Workspace files" });
		const workspace = tree.getByRole("treeitem", { name: "Workspace" });
		const design = tree.getByRole("treeitem", { name: "Design" });
		const reports = tree.getByRole("treeitem", { name: "Reports" });
		const archive = tree.getByRole("treeitem", { name: "Archive" });
		await expectLocator(workspace).toHaveAttribute("aria-expanded", "true");
		await reports.locator('[data-slot="tree-item-row"]').click();
		await expectLocator(tree).toHaveAttribute(
			"aria-activedescendant",
			(await reports.getAttribute("id")) ?? ""
		);
		await tree.focus();
		await page.keyboard.press("Home");
		await page.keyboard.press("ArrowRight");
		await expectLocator(tree).toHaveAttribute(
			"aria-activedescendant",
			(await design.getAttribute("id")) ?? ""
		);
		await page.keyboard.press("ArrowRight");
		await expectLocator(design).toHaveAttribute("aria-expanded", "true");
		await page.keyboard.press("r");
		await expectLocator(tree).toHaveAttribute(
			"aria-activedescendant",
			(await reports.getAttribute("id")) ?? ""
		);
		await expectLocator(archive).toHaveAttribute("aria-disabled", "true");
		await page.keyboard.press("ArrowDown");
		await expectLocator(tree).toHaveAttribute(
			"aria-activedescendant",
			(await archive.getAttribute("id")) ?? ""
		);

		await tree.evaluate((element) => element.setAttribute("dir", "rtl"));
		await page.keyboard.press("Home");
		await page.keyboard.press("ArrowLeft");
		await expectLocator(tree).toHaveAttribute(
			"aria-activedescendant",
			(await design.getAttribute("id")) ?? ""
		);
		await page.keyboard.press("ArrowRight");
		await expectLocator(design).toHaveAttribute("aria-expanded", "false");
		await page.keyboard.press("ArrowLeft");
		await expectLocator(design).toHaveAttribute("aria-expanded", "true");
		await page.keyboard.press("ArrowRight");
		await expectLocator(design).toHaveAttribute("aria-expanded", "false");
	});

	it("keeps single selection separate from focus and expansion", async () => {
		await page.goto(`${docsUrl}/internal/specimens`, { waitUntil: "load" });
		const section = page.getByTestId("tree-list-example");
		const tree = section.getByRole("tree", {
			name: "Workspace files, controlled selection",
		});
		const item = (id: string) => tree.locator(`[data-tree-item-id="${id}"]`);
		const row = (id: string) =>
			item(id).locator(':scope > [data-slot="tree-item-row"]');
		const indicator = (id: string) =>
			row(id).locator('[data-slot="tree-item-indicator"]');
		const selectedSummary = section.getByText("Selected resource: Components");

		await expectLocator(
			tree.getByRole("treeitem", { exact: true, name: "Workspace" })
		).toHaveCount(1);
		await expectLocator(
			tree.getByRole("treeitem", { exact: true, name: "Design" })
		).toHaveCount(1);
		await expectLocator(item("components")).toHaveAttribute(
			"aria-selected",
			"true"
		);
		await page.mouse.move(1, 1);
		const selectedRow = row("components");
		const selectedBackground = await selectedRow.evaluate(
			(element) => getComputedStyle(element).backgroundColor
		);
		await selectedRow.hover();
		await expect
			.poll(() =>
				selectedRow.evaluate(
					(element) => getComputedStyle(element).backgroundColor
				)
			)
			.toBe(selectedBackground);
		await row("components").click();
		await expectLocator(tree).toHaveAttribute(
			"aria-activedescendant",
			(await item("components").getAttribute("id")) ?? ""
		);
		await tree.focus();
		await page.keyboard.press("ArrowDown");
		await expectLocator(tree).toHaveAttribute(
			"aria-activedescendant",
			(await item("reports").getAttribute("id")) ?? ""
		);
		await expectLocator(item("components")).toHaveAttribute(
			"aria-selected",
			"true"
		);
		await expectLocator(selectedSummary).toBeVisible();

		await page.keyboard.press("Enter");
		await expectLocator(item("reports")).toHaveAttribute(
			"aria-selected",
			"true"
		);
		await expectLocator(
			section.getByText("Selected resource: Reports")
		).toBeVisible();

		// Selecting a folder also closes it; the chevron alone reopens it.
		await row("design").click();
		await expectLocator(item("design")).toHaveAttribute(
			"aria-selected",
			"true"
		);
		await expectLocator(item("design")).toHaveAttribute(
			"aria-expanded",
			"false"
		);
		await indicator("design").click();
		await expectLocator(item("design")).toHaveAttribute(
			"aria-expanded",
			"true"
		);
		await expectLocator(item("design")).toHaveAttribute(
			"aria-selected",
			"true"
		);
		await page.keyboard.press("Space");
		await expectLocator(item("design")).toHaveAttribute(
			"aria-expanded",
			"false"
		);
		await expectLocator(item("design")).toHaveAttribute(
			"aria-selected",
			"true"
		);

		await row("archive").click();
		await page.keyboard.press("Space");
		await expectLocator(item("archive")).toHaveAttribute(
			"aria-disabled",
			"true"
		);
		await expectLocator(item("archive")).not.toHaveAttribute(
			"aria-selected",
			"true"
		);
		await expectLocator(
			section.getByText("Selected resource: Design")
		).toBeVisible();

		const favorites = section.getByRole("tree", {
			name: "Favorite resources, uncontrolled selection",
		});
		const favoriteItem = (id: string) =>
			favorites.locator(`[data-tree-item-id="${id}"]`);
		const favoriteRow = (id: string) =>
			favoriteItem(id).locator(':scope > [data-slot="tree-item-row"]');
		await expectLocator(favoriteItem("research")).toHaveAttribute(
			"aria-selected",
			"false"
		);
		await favoriteRow("research").click();
		await expectLocator(favoriteItem("research")).toHaveAttribute(
			"aria-selected",
			"true"
		);
		await favoriteRow("writing").click();
		await expectLocator(favoriteItem("writing")).not.toHaveAttribute(
			"aria-selected",
			"true"
		);
		await expectLocator(favoriteItem("research")).toHaveAttribute(
			"aria-selected",
			"true"
		);
	});
});
