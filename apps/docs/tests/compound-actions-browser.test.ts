import { type Browser, chromium, type Page } from "playwright";
import { expect as expectLocator } from "playwright/test";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import {
	setDocsTheme,
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
const errors: string[] = [];
let handle: TestServerHandle;
let browser: Browser;
let page: Page;

describe("compound actions", { timeout: 30_000 }, () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage({ viewport: { height: 900, width: 1280 } });
		page.setDefaultTimeout(8000);
		page.on("pageerror", (error) => errors.push(error.message));
		page.on("console", (message) => {
			if (message.type() === "error") {
				errors.push(message.text());
			}
		});
	}, 120_000);
	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
		expect(errors).toEqual([]);
	});
	it.each(["light", "dark"])(
		"centers the draft badge and reveals ghost hover on %s surfaces",
		async (theme) => {
			await page.goto(`${handle.url}/docs/components/toolbar`, {
				waitUntil: "networkidle",
			});
			await page.evaluate(
				(value) => localStorage.setItem("mizen-theme", value),
				theme
			);
			await page.reload({ waitUntil: "networkidle" });
			const preview = page.locator("#ToolbarACalmerWorkspaceExample1");
			const title = await preview
				.getByText("Release notes", { exact: true })
				.boundingBox();
			const badge = await preview
				.getByText("Draft", { exact: true })
				.boundingBox();
			if (!(title && badge)) {
				throw new Error("Draft header must be visible.");
			}
			expect(
				Math.abs(title.y + title.height / 2 - (badge.y + badge.height / 2))
			).toBeLessThan(1);
			const duplicate = preview.getByRole("button", {
				name: "Duplicate draft",
			});
			// Ghost surfaces paint on ::before and appear on hover.
			const resting = await duplicate.evaluate(
				(element) => getComputedStyle(element, "::before").opacity
			);
			await duplicate.hover();
			await expectLocator
				.poll(() =>
					duplicate.evaluate(
						(element) => getComputedStyle(element, "::before").opacity
					)
				)
				.not.toBe(resting);
			await preview.screenshot({
				caret: "initial",
				path: `/private/tmp/mizen-toolbar-hover-${theme}.png`,
			});
		}
	);
	it.each(["light", "dark"])(
		"insets joined button separators in %s",
		async (theme) => {
			await page.goto(`${handle.url}/components/button-group`, {
				waitUntil: "networkidle",
			});
			await page.emulateMedia({ reducedMotion: "no-preference" });
			await page.evaluate(
				(value) => localStorage.setItem("mizen-theme", value),
				theme
			);
			await page.reload();
			const joined = page
				.getByRole("group", { exact: true, name: "History actions" })
				.getByRole("button", { exact: true, name: "Undo" });
			await joined.hover();
			await page.mouse.down();
			// Joined items contract only on the cross axis while pressed.
			await expect
				.poll(() =>
					joined.evaluate((el) => {
						const surface = getComputedStyle(el, "::before");
						return [surface.insetBlockStart, surface.insetInlineStart];
					})
				)
				.toEqual(["0px", "-1px"]);
			await page.mouse.up();
			await Promise.all(
				[
					"Publish options",
					"History actions",
					"Publication actions",
					"File actions",
				].map(async (name) => {
					const group = page.getByRole("group", { exact: true, name });
					const geometry = await group
						.locator("button")
						.nth(1)
						.evaluate((el) => {
							const isVertical =
								el.parentElement?.getAttribute("data-orientation") ===
								"vertical";
							const line = getComputedStyle(el, "::after");
							const border = getComputedStyle(el);
							return [
								line.content,
								isVertical ? line.left : line.top,
								isVertical ? line.right : line.bottom,
								isVertical ? line.height : line.width,
								isVertical
									? border.borderBlockStartColor
									: border.borderInlineStartColor,
							];
						});
					expect(geometry).toEqual([
						'""',
						"8px",
						"8px",
						"1px",
						"rgba(0, 0, 0, 0)",
					]);
				})
			);
			await page
				.getByRole("group", { exact: true, name: "Publication actions" })
				.screenshot({ path: `/private/tmp/mizen-joined-buttons-${theme}.png` });
			await page
				.getByRole("group", { exact: true, name: "File actions" })
				.screenshot({
					path: `/private/tmp/mizen-joined-buttons-vertical-${theme}.png`,
				});
		}
	);
	it("joins a menu trigger and keeps its corners while the menu is open", async () => {
		await page.goto(`${handle.url}/docs/components/button-group`, {
			waitUntil: "networkidle",
		});
		const trigger = page.getByRole("button", { name: "More page actions" });
		const corners = () =>
			trigger.evaluate((element) => {
				const style = getComputedStyle(element);
				return [style.borderStartStartRadius, style.borderEndEndRadius];
			});
		const [start, end] = await corners();
		expect(start).toBe("0px");
		expect(end).not.toBe("0px");
		// An open popup inserts hidden focus guards beside the trigger.
		await trigger.click();
		await expectLocator(page.getByRole("menu")).toBeVisible();
		expect(await corners()).toEqual([start, end]);
		await page.keyboard.press("Escape");
	});

	it("connects middle corners and keeps native Tab order in both directions", async () => {
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		const group = page.getByRole("group", {
			exact: true,
			name: "Publication actions",
		});
		const middle = group.getByRole("button", { exact: true, name: "Schedule" });
		const corners = (button: HTMLElement) => {
			const css = getComputedStyle(button);
			return [
				css.borderTopLeftRadius,
				css.borderTopRightRadius,
				css.borderBottomLeftRadius,
				css.borderBottomRightRadius,
			];
		};
		expect(await middle.evaluate(corners)).toEqual([
			"0px",
			"0px",
			"0px",
			"0px",
		]);
		await group.getByRole("button", { exact: true, name: "Publish" }).focus();
		await page.keyboard.press("Tab");
		expect(
			await group
				.getByRole("button", { exact: true, name: "Save draft" })
				.evaluate((button) => getComputedStyle(button).zIndex)
		).toBe("1");
		await expectLocator(
			group.getByRole("button", { exact: true, name: "Save draft" })
		).toBeFocused();
		expect(
			await group
				.getByRole("button", { exact: true, name: "Publish" })
				.evaluate((button) => getComputedStyle(button).borderTopLeftRadius)
		).not.toBe("0px");
		await group.evaluate((element) => element.setAttribute("dir", "rtl"));
		expect(
			await group
				.getByRole("button", { exact: true, name: "Publish" })
				.evaluate((button) => getComputedStyle(button).borderTopRightRadius)
		).not.toBe("0px");
		const vertical = page.getByRole("group", {
			exact: true,
			name: "File actions",
		});
		const edges = await vertical.getByRole("button").evaluateAll((buttons) =>
			buttons.map((button) => {
				const { left, right } = button.getBoundingClientRect();
				return { left, right };
			})
		);
		expect(edges).toHaveLength(3);
		expect(edges[0]).toEqual(edges[1]);
		expect(edges[2]).toEqual(edges[1]);
		expect(
			await vertical
				.getByRole("button", { name: "Rename file" })
				.evaluate(corners)
		).toEqual(["0px", "0px", "0px", "0px"]);
	});
	it("roves across actions, toggles, and a menu, then restores focus", async () => {
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		const toolbar = page.getByRole("toolbar", {
			exact: true,
			name: "Draft tools",
		});
		const duplicate = toolbar.getByRole("button", { name: "Duplicate draft" });
		await duplicate.focus();
		await page.keyboard.press("ArrowRight");
		const bold = toolbar.getByRole("button", { exact: true, name: "Bold" });
		await expectLocator(bold).toBeFocused();
		await page.keyboard.press("Space");
		await expectLocator(bold).toHaveAttribute("aria-pressed", "true");
		expect(
			await page
				.getByRole("article", { name: "Release note draft" })
				.locator("p")
				.filter({ hasText: "Keep your projects" })
				.evaluate((paragraph) => Number(getComputedStyle(paragraph).fontWeight))
		).toBeGreaterThanOrEqual(600);
		await page.keyboard.press("ArrowRight");
		await expectLocator(
			toolbar.getByRole("button", { exact: true, name: "Italic" })
		).toBeFocused();
		await page.keyboard.press("ArrowRight");
		const more = toolbar.getByRole("button", { name: "More draft actions" });
		await expectLocator(more).toBeFocused();
		await page.keyboard.press("Enter");
		await expectLocator(
			page.getByRole("menuitem", { name: "Export draft" })
		).toBeVisible();
		await page.keyboard.press("Escape");
		await expectLocator(more).toBeFocused();
		await more.click();
		await page.getByRole("menuitem", { name: "Export draft" }).click();
		await expectLocator(page.getByTestId("draft-action-status")).toHaveText(
			"Exported the draft."
		);
		await expectLocator(more).toBeFocused();
		await page.keyboard.press("ArrowRight");
		await expectLocator(
			toolbar.getByRole("link", { name: "Formatting guide" })
		).toBeFocused();
		await page.keyboard.press("ArrowRight");
		const undo = toolbar.getByRole("button", { name: "Undo edit" });
		await expectLocator(undo).toBeFocused();
		await expectLocator(undo).toHaveAttribute("aria-disabled", "true");
		await page.keyboard.press("ArrowRight");
		const add = toolbar.getByRole("button", { name: "Add draft block" });
		await expectLocator(add).toBeFocused();
		expect(
			await add
				.locator("svg")
				.evaluate((svg) => svg.getBoundingClientRect().width)
		).toBe(
			await add.evaluate((button) =>
				Number.parseFloat(getComputedStyle(button).fontSize)
			)
		);
		await add.click();
		await expectLocator(page.getByTestId("draft-action-status")).toHaveText(
			"Added a draft block."
		);
		await page.keyboard.press("ArrowRight");
		await expectLocator(duplicate).toBeFocused();
		await duplicate.click();
		await expectLocator(page.getByTestId("draft-action-status")).toHaveText(
			"Duplicated the draft."
		);
		const drawing = page.getByRole("toolbar", { name: "Drawing tools" });
		await drawing.getByRole("button", { name: "Select object" }).focus();
		await page.keyboard.press("ArrowDown");
		await expectLocator(
			drawing.getByRole("button", { name: "Draw shape" })
		).toBeFocused();
	});
	it("keeps single selection and allows clearing the selected segment", async () => {
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		const view = page.getByRole("group", { exact: true, name: "Project view" });
		const list = view.getByRole("button", { exact: true, name: "List" });
		const board = view.getByRole("button", { exact: true, name: "Board" });
		await expectLocator(list).toHaveAttribute("aria-pressed", "true");
		await list.focus();
		await page.keyboard.press("ArrowRight");
		await expectLocator(board).toBeFocused();
		await page.keyboard.press("Space");
		await expectLocator(board).toHaveAttribute("aria-pressed", "true");
		await expectLocator(list).toHaveAttribute("aria-pressed", "false");
		await expectLocator(page.getByTestId("project-view-status")).toHaveText(
			"Selected view: board"
		);
		await board.click();
		await expectLocator(page.getByTestId("project-view-status")).toHaveText(
			"No view selected."
		);
		await expectLocator(
			view.getByRole("button", { name: "Timeline" })
		).toBeDisabled();
	});
	it.each(["light", "dark"] as const)(
		"preserves readable controls and focus clearance in narrow enlarged %s layouts",
		async (theme) => {
			await page.setViewportSize({ height: 844, width: 390 });
			await page.emulateMedia({ reducedMotion: "reduce" });
			await page.goto(`${handle.url}/internal/specimens`, {
				waitUntil: "networkidle",
			});
			await setDocsTheme(page, theme);
			await page.addStyleTag({
				content:
					"html { font-size: 32px !important; } main p { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }",
			});
			const section = page.locator(
				'section[aria-labelledby="compound-actions-heading"]'
			);
			expect(
				await section.evaluate(
					(element) =>
						element.getBoundingClientRect().right <= window.innerWidth
				)
			).toBe(true);
			expect(
				await page.evaluate(
					() => document.documentElement.scrollWidth <= window.innerWidth
				)
			).toBe(true);
			const last = section
				.getByRole("group", { exact: true, name: "Publication actions" })
				.getByRole("button", { exact: true, name: "Save draft" });
			await last.focus();
			await expectLocator(last).toBeInViewport();
			await section.screenshot({
				path: `/private/tmp/mizen-compound-${theme}-enlarged.png`,
			});
		}
	);
});
