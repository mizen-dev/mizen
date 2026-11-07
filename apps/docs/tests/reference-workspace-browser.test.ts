import { type Browser, chromium, type Page } from "playwright";
import { expect as expectLocator } from "playwright/test";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

const BASE_URL = process.env.MIZEN_REFERENCE_TEST_URL ?? "";
const STORAGE_KEY = "mizen-reference-projects:v1";
const pageErrors: string[] = [];
const consoleErrors: string[] = [];
let browser: Browser;
let page: Page;

async function captureNarrowTheme(theme: "light" | "dark") {
	await page.getByLabel("Theme preference").selectOption(theme);
	await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
	await page.getByRole("button", { name: "Edit details" }).click();
	await expectLocator(page.getByLabel("Project name")).toBeFocused();
	const dimensions = await page.evaluate(() => ({
		client: document.documentElement.clientWidth,
		offenders: [...document.querySelectorAll("body *")]
			.map((element) => ({
				right: element.getBoundingClientRect().right,
				tag: element.tagName,
				text: element.textContent?.trim().slice(0, 48),
			}))
			.filter(
				(element) => element.right > document.documentElement.clientWidth + 1
			)
			.slice(0, 8),
		scroll: document.documentElement.scrollWidth,
		theme: document.documentElement.dataset.theme,
	}));
	expect(
		dimensions.scroll,
		JSON.stringify(dimensions.offenders)
	).toBeLessThanOrEqual(dimensions.client);
	expect(dimensions.theme).toBe(theme);
	await page.screenshot({
		fullPage: true,
		path: `/private/tmp/mizen-reference-${theme}-320-text200.png`,
	});
	await page.getByRole("button", { name: "Cancel" }).click();
	await page.evaluate(() => {
		for (const style of document.querySelectorAll("style")) {
			if (style.textContent?.includes("font-size: 200%")) {
				style.remove();
			}
		}
	});
}

describe.skipIf(!BASE_URL)("project records workspace", () => {
	beforeAll(async () => {
		browser = await chromium.launch();
		page = await browser.newPage({ viewport: { height: 900, width: 1280 } });
		page.on("pageerror", (error) => pageErrors.push(error.message));
		page.on("console", (message) => {
			if (message.type() === "error") {
				consoleErrors.push(message.text());
			}
		});
	});

	beforeEach(async () => {
		pageErrors.length = 0;
		consoleErrors.length = 0;
		await page.goto(BASE_URL, { waitUntil: "networkidle" });
		await page.evaluate(
			(key) => window.localStorage.removeItem(key),
			STORAGE_KEY
		);
		await page.reload();
	});

	afterAll(async () => {
		await browser.close();
	});

	it("searches, filters, selects with the keyboard, validates and saves edits", async () => {
		await page.setViewportSize({ height: 900, width: 640 });
		const stackedPaneTop = await page
			.locator("#records")
			.evaluate((element) => element.getBoundingClientRect().top);
		const projectPaneTop = await page
			.locator("#project-list")
			.evaluate((element) => element.getBoundingClientRect().top);
		expect(stackedPaneTop).toBeGreaterThan(projectPaneTop);
		await page.setViewportSize({ height: 900, width: 768 });
		const paneBounds = await page.evaluate(() => ({
			projectsRight: document
				.querySelector("#project-list")
				?.getBoundingClientRect().right,
			recordLeft: document.querySelector("#records")?.getBoundingClientRect()
				.left,
		}));
		expect(paneBounds.recordLeft).toBeGreaterThan(
			paneBounds.projectsRight ?? 0
		);
		await page.getByRole("button", { name: "Edit details" }).click();
		const narrowFieldTops = await Promise.all(
			["Project name", "Project key"].map((label) =>
				page
					.getByLabel(label)
					.evaluate((element) => element.getBoundingClientRect().top)
			)
		);
		const editorNameWidth = await page
			.getByLabel("Project name")
			.evaluate((element) => element.getBoundingClientRect().width);
		expect(editorNameWidth).toBeGreaterThan(250);
		expect(narrowFieldTops[1]).toBeGreaterThan(narrowFieldTops[0]);
		await page.getByRole("button", { name: "Cancel" }).click();
		await page.setViewportSize({ height: 900, width: 1280 });
		await page.screenshot({
			path: "/private/tmp/mizen-reference-light-1280.png",
		});
		const search = page.getByRole("searchbox", { name: "Search projects" });
		const searchSurface = await search.evaluate(
			(element) => getComputedStyle(element).backgroundColor
		);
		const filterSurface = await page
			.getByRole("combobox", { name: "Status" })
			.evaluate((element) => getComputedStyle(element).backgroundColor);
		await page.getByRole("button", { name: "Edit details" }).click();
		const nameSurface = await page
			.getByLabel("Project name")
			.evaluate((element) => getComputedStyle(element).backgroundColor);
		const editorStatusSurface = await page
			.getByRole("combobox", { name: "Status" })
			.last()
			.evaluate((element) => getComputedStyle(element).backgroundColor);
		const editorControlTops = await Promise.all([
			page
				.getByLabel("Project name")
				.evaluate((element) => element.getBoundingClientRect().top),
			page
				.getByLabel("Project key")
				.evaluate((element) => element.getBoundingClientRect().top),
			page
				.getByLabel("Owner")
				.evaluate((element) => element.getBoundingClientRect().top),
			page
				.getByRole("combobox", { name: "Status" })
				.last()
				.evaluate((element) => element.getBoundingClientRect().top),
		]);
		expect(editorControlTops[0]).toBe(editorControlTops[1]);
		expect(editorControlTops[2]).toBe(editorControlTops[3]);
		expect(searchSurface).toBe(nameSurface);
		expect(filterSurface).toBe(editorStatusSurface);
		await page.screenshot({
			path: "/private/tmp/mizen-reference-light-edit-1280.png",
		});
		await page.getByRole("button", { name: "Cancel" }).click();
		await search.fill("atlas");
		await expectLocator(
			page.getByRole("button", { name: "Atlas migration" })
		).toBeVisible();
		await expectLocator(
			page.getByRole("button", { name: "Northstar launch" })
		).toHaveCount(0);
		const statusFilter = page.getByRole("combobox", { name: "Status" }).first();
		await expectLocator(statusFilter).toHaveText("All statuses");
		await statusFilter.focus();
		await page.keyboard.press("Enter");
		const filterListbox = page.getByRole("listbox");
		await filterListbox.waitFor({ state: "visible", timeout: 2000 });
		await page
			.locator('[role="option"][data-highlighted]', { hasText: "All statuses" })
			.waitFor({ timeout: 2000 });
		await page.keyboard.press("ArrowDown");
		await page
			.locator('[role="option"][data-highlighted]', { hasText: "Active" })
			.waitFor({ timeout: 2000 });
		await page.keyboard.press("Enter");
		await expectLocator(
			page.getByText("No projects match those filters.")
		).toBeVisible();
		await page.getByRole("button", { name: "Clear filters" }).click();

		const northstar = page.getByRole("button", { name: "Northstar launch" });
		await northstar.focus();
		await page.keyboard.press("Enter");
		await expectLocator(
			page.getByRole("heading", { level: 2, name: "Northstar launch" })
		).toBeVisible();
		const edit = page.getByRole("button", { name: "Edit details" });
		await edit.focus();
		await page.keyboard.press("Enter");

		const name = page.getByLabel("Project name");
		const key = page.getByLabel("Project key");
		await expectLocator(name).toBeFocused();
		await expectLocator(
			page.getByRole("button", { name: "Atlas migration" })
		).toBeDisabled();
		await name.fill("   ");
		await page.getByRole("button", { name: "Save changes" }).click();
		await expectLocator(page.getByText("Enter a project name.")).toBeVisible();
		await expectLocator(name).toBeFocused();
		await name.fill("Northstar launch");
		await page.getByLabel("Owner").fill("   ");
		await page.getByRole("button", { name: "Save changes" }).click();
		await expectLocator(page.getByText("Enter an owner.")).toBeVisible();
		await expectLocator(page.getByLabel("Owner")).toBeFocused();
		await page.getByLabel("Owner").fill("Mara Chen");
		await page.getByLabel("Summary").fill("   ");
		await page.getByRole("button", { name: "Save changes" }).click();
		await expectLocator(page.getByText("Enter a summary.")).toBeVisible();
		await expectLocator(page.getByLabel("Summary")).toBeFocused();
		await page.getByLabel("Summary").fill("Prepare the second launch wave.");
		await key.fill("ATM");
		await page.getByRole("button", { name: "Save changes" }).click();
		await expectLocator(
			page.getByText("That project key is already in use.")
		).toBeVisible();
		await expectLocator(key).toBeFocused();
		await expectLocator(name).toHaveValue("Northstar launch");
		await expectLocator(key).toHaveValue("ATM");

		await name.fill("Northstar launch, phase two");
		await key.fill("NST2");
		await page.getByLabel("Owner").fill("Mara Chen");
		await page.getByLabel("Summary").fill("Prepare the second launch wave.");
		const projectStatus = page.getByRole("combobox", { name: "Status" }).last();
		await page.mouse.move(0, 0);
		await projectStatus.focus();
		await page.keyboard.press("Enter");
		const editListbox = page.getByRole("listbox");
		await editListbox.waitFor({ state: "visible", timeout: 2000 });
		const highlightedStatus = editListbox.locator(
			'[role="option"][data-highlighted]'
		);
		await expectLocator(highlightedStatus).toHaveText("Active");
		await expectLocator(highlightedStatus).toBeFocused();
		await page.mouse.move(0, 0);
		await page.keyboard.press("ArrowDown");
		await expectLocator(highlightedStatus).toHaveText("Planning");
		await expectLocator(highlightedStatus).toBeFocused();
		await page.keyboard.press("Enter");
		await expectLocator(projectStatus).toHaveText("Planning");
		await page.getByRole("button", { name: "Save changes" }).click();
		await expectLocator(page.getByRole("status")).toHaveText(
			"Changes saved in this browser."
		);
		await expectLocator(
			page.getByRole("button", { name: "Edit details" })
		).toBeFocused();
		await expectLocator(
			page.getByRole("heading", { name: "Northstar launch, phase two" })
		).toBeVisible();
		await expectLocator(
			page.getByRole("button", { name: "Northstar launch, phase two" })
		).toBeVisible();
		await expectLocator(
			page.locator("#records").getByText("NST2", { exact: true })
		).toBeVisible();
		expect(pageErrors).toEqual([]);

		await page.reload();
		await expectLocator(
			page.getByRole("heading", { name: "Northstar launch, phase two" })
		).toBeVisible();
		await expectLocator(
			page.getByText("Prepare the second launch wave.")
		).toBeVisible();
		expect(pageErrors).toEqual([]);
		expect(consoleErrors).toEqual([]);
		await page.getByLabel("Theme preference").selectOption("dark");
		const darkPanelSurface = await page
			.locator("#project-list")
			.evaluate((element) => getComputedStyle(element).backgroundColor);
		const darkSearchSurface = await search.evaluate(
			(element) => getComputedStyle(element).backgroundColor
		);
		const darkFilterSurface = await page
			.getByRole("combobox", { name: "Status" })
			.evaluate((element) => getComputedStyle(element).backgroundColor);
		await page.getByRole("button", { name: "Edit details" }).click();
		const darkNameSurface = await page
			.getByLabel("Project name")
			.evaluate((element) => getComputedStyle(element).backgroundColor);
		const darkEditorStatusSurface = await page
			.getByRole("combobox", { name: "Status" })
			.last()
			.evaluate((element) => getComputedStyle(element).backgroundColor);
		expect(darkSearchSurface).toBe(darkNameSurface);
		expect(darkFilterSurface).toBe(darkEditorStatusSurface);
		await page.screenshot({
			path: "/private/tmp/mizen-reference-dark-edit-1280.png",
		});
		await page.getByRole("button", { name: "Cancel" }).click();
		expect(darkSearchSurface).not.toBe(darkPanelSurface);
		expect(darkFilterSurface).not.toBe(darkPanelSurface);
	});

	it("falls back to the example records when saved data is malformed", async () => {
		await page.evaluate((key) => {
			const project = {
				id: "duplicate-id",
				key: "BAD",
				name: "Corrupt record",
				owner: "Sample Owner",
				status: "Active",
				summary: "This record should not load.",
			};
			window.localStorage.setItem(
				key,
				JSON.stringify({
					projects: [
						project,
						{ ...project, key: "BAD2", name: "Second corrupt record" },
					],
					version: 1,
				})
			);
		}, STORAGE_KEY);
		await page.reload();
		await expectLocator(
			page.getByRole("heading", { name: "Northstar launch" })
		).toBeVisible();
		await expectLocator(
			page.getByRole("button", { name: "Corrupt record" })
		).toHaveCount(0);
		expect(pageErrors).toEqual([]);
		expect(consoleErrors).toEqual([]);
		await page.evaluate((key) => {
			const project = {
				id: "duplicate-key-one",
				key: "BAD",
				name: "Corrupt record",
				owner: "Sample Owner",
				status: "Active",
				summary: "This record should not load.",
			};
			window.localStorage.setItem(
				key,
				JSON.stringify({
					projects: [
						project,
						{
							...project,
							id: "duplicate-key-two",
							name: "Second corrupt record",
						},
					],
					version: 1,
				})
			);
		}, STORAGE_KEY);
		await page.reload();
		await expectLocator(
			page.getByRole("heading", { name: "Northstar launch" })
		).toBeVisible();
		await expectLocator(
			page.getByRole("button", { name: "Corrupt record" })
		).toHaveCount(0);
		expect(pageErrors).toEqual([]);
		expect(consoleErrors).toEqual([]);
		await page.evaluate((key) => {
			window.localStorage.setItem(
				key,
				JSON.stringify({
					projects: [
						{
							id: "custom-record",
							key: "CUS",
							name: "Custom record",
							owner: "Avery Lane",
							status: "Active",
							summary: "A saved record with a non-default ID.",
						},
					],
					version: 1,
				})
			);
		}, STORAGE_KEY);
		await page.reload();
		await expectLocator(
			page.getByRole("heading", { name: "Custom record" })
		).toBeVisible();
		await page.getByRole("button", { name: "Edit details" }).click();
		await page.getByLabel("Project name").fill("Custom record updated");
		await page.getByRole("button", { name: "Save changes" }).click();
		await expectLocator(
			page.getByRole("heading", { name: "Custom record updated" })
		).toBeVisible();
		await expectLocator(
			page.getByRole("button", { name: "Custom record updated" })
		).toBeVisible();
		expect(pageErrors).toEqual([]);
		expect(consoleErrors).toEqual([]);
	});

	it("cancels a draft and keeps it available when browser storage rejects a save", async () => {
		await page.getByRole("button", { name: "Edit details" }).click();
		const name = page.getByLabel("Project name");
		await name.fill("Unsaved draft");
		await page.getByRole("button", { name: "Cancel" }).click();
		await expectLocator(
			page.getByRole("heading", { name: "Northstar launch" })
		).toBeVisible();
		await expectLocator(page.getByRole("status")).toHaveText(
			"Draft discarded. The saved record is unchanged."
		);

		await page.evaluate((key) => {
			const original = Storage.prototype.setItem;
			Storage.prototype.setItem = function (storageName, storageValue) {
				if (storageName === key) {
					Storage.prototype.setItem = original;
					throw new DOMException("Storage is full", "QuotaExceededError");
				}
				original.call(this, storageName, storageValue);
			};
		}, STORAGE_KEY);
		await page.getByRole("button", { name: "Edit details" }).click();
		await name.fill("Keep this draft");
		await page.getByRole("button", { name: "Save changes" }).click();
		await expectLocator(page.locator("form").getByRole("alert")).toHaveText(
			"Could not save to this browser. Your draft is still here. Try again."
		);
		await expectLocator(name).toHaveValue("Keep this draft");
		await page.getByRole("button", { name: "Save changes" }).click();
		await expectLocator(page.getByRole("status")).toHaveText(
			"Changes saved in this browser."
		);
		await expectLocator(
			page.getByRole("heading", { name: "Keep this draft" })
		).toBeVisible();
		expect(pageErrors).toEqual([]);
		expect(consoleErrors).toEqual([]);
	});

	it("keeps the workspace usable at 320px with doubled root text in both themes", async () => {
		await page.setViewportSize({ height: 740, width: 320 });
		await page.emulateMedia({ reducedMotion: "reduce" });
		await captureNarrowTheme("light");
		await captureNarrowTheme("dark");
		const row = page.getByRole("button", { name: "Northstar launch" });
		expect(
			await row.evaluate(
				(element) => getComputedStyle(element).transitionDuration
			)
		).toBe("0s");
		expect(pageErrors).toEqual([]);
		expect(consoleErrors).toEqual([]);
	});
});
