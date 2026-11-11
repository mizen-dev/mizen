import { type Browser, chromium, type Locator, type Page } from "playwright";
import { expect as expectLocator } from "playwright/test";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import {
	setDocsTheme,
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
const SAVE_FAILURE = /Could not save your changes\. Your draft is preserved/u;
const SETTINGS_SAVE_FAILURE = /Your draft is still here/u;
const NORTHSTAR_SELECTION = /Select Northstar launch/u;
const browserErrors: string[] = [];
let handle: TestServerHandle;
let browser: Browser;
let page: Page;

async function focusWithKeyboard(locator: Locator): Promise<void> {
	await page.keyboard.press("Tab");
	await locator.focus();
	if (
		!(await locator.evaluate((element) => element.matches(":focus-visible")))
	) {
		throw new Error("Keyboard focus did not activate the focus ring");
	}
}

async function settleAnimations(locator: Locator): Promise<void> {
	await locator.evaluate(async (element) => {
		await Promise.allSettled(
			element.getAnimations().map((animation) => animation.finished)
		);
	});
}

async function focusContrast(locator: Locator, surfaceSelector: string) {
	await focusWithKeyboard(locator);
	await settleAnimations(locator);
	const colors = await locator.evaluate((element, selector) => {
		const surface = document.querySelector(selector);
		if (!surface) {
			throw new Error(`Missing focus contrast surface: ${selector}`);
		}
		const outline = getComputedStyle(element).outlineColor;
		const canvas = document.createElement("canvas");
		const context = canvas.getContext("2d", { willReadFrequently: true });
		if (!context) {
			throw new Error("Canvas color conversion is unavailable");
		}
		let background = "transparent";
		for (
			let current: Element | null = surface;
			current;
			current = current.parentElement
		) {
			const candidate = getComputedStyle(current).backgroundColor;
			context.clearRect(0, 0, 1, 1);
			context.fillStyle = candidate;
			context.fillRect(0, 0, 1, 1);
			if (context.getImageData(0, 0, 1, 1).data[3] > 0) {
				background = candidate;
				break;
			}
		}
		return { background, outline };
	}, surfaceSelector);
	return {
		...colors,
		contrast: await contrastRatio(colors.outline, colors.background),
	};
}

function contrastRatio(foreground: string, background: string) {
	return page.evaluate(
		([foregroundColor, backgroundColor]) => {
			const context = document.createElement("canvas").getContext("2d");
			if (!context) {
				throw new Error("Canvas color conversion is unavailable");
			}
			const luminance = (color: string, backdrop?: string) => {
				context.clearRect(0, 0, 1, 1);
				if (backdrop) {
					context.fillStyle = backdrop;
					context.fillRect(0, 0, 1, 1);
				}
				context.fillStyle = color;
				context.fillRect(0, 0, 1, 1);
				const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
				const linear = (channel: number) => {
					const value = channel / 255;
					return value <= 0.040_45
						? value / 12.92
						: ((value + 0.055) / 1.055) ** 2.4;
				};
				return (
					0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue)
				);
			};
			const first = luminance(foregroundColor, backgroundColor);
			const second = luminance(backgroundColor);
			return (
				(Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
			);
		},
		[foreground, background] as const
	);
}

describe("main page compositions", { timeout: 30_000 }, () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage({ viewport: { height: 900, width: 1280 } });
		page.setDefaultTimeout(8000);
		page.on("pageerror", (error) => browserErrors.push(error.message));
		page.on("console", (message) => {
			if (message.type() === "error") {
				browserErrors.push(message.text());
			}
		});
	}, 120_000);

	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
		expect(browserErrors).toEqual([]);
	}, 120_000);

	it("saves settings after retry, validates, and confirms draft discard", async () => {
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		const settingsForm = page.locator(
			'section[aria-labelledby="settings-heading"] form'
		);
		const name = settingsForm.getByRole("textbox", {
			exact: true,
			name: "Workspace name",
		});
		await name.fill("");
		await page.getByRole("button", { name: "Save changes" }).click();
		await expectLocator(
			page.getByText("Workspace name is required")
		).toBeVisible();
		expect(
			await name.evaluate((element) => document.activeElement === element)
		).toBe(true);

		await name.fill("Mizen Product Studio");
		const contact = settingsForm.getByRole("textbox", {
			exact: true,
			name: "Contact email",
		});
		await contact.fill("team@@mizen.dev");
		await page.getByRole("button", { name: "Save changes" }).click();
		await expectLocator(
			settingsForm.getByText("Enter a valid contact email", { exact: true })
		).toBeVisible();
		await expectLocator(contact).toBeFocused();
		await contact.fill("hello@mizen.dev");
		await page.getByRole("combobox", { name: "Time zone" }).click();
		await page.getByRole("option", { name: "London" }).click();
		await page.getByRole("checkbox", { name: "Product updates" }).check();
		await page.getByRole("button", { name: "Save changes" }).click();
		await expectLocator(name).toBeDisabled();
		await expectLocator(page.getByText(SETTINGS_SAVE_FAILURE)).toBeVisible();
		expect(await name.inputValue()).toBe("Mizen Product Studio");
		await page.getByRole("button", { name: "Save changes" }).click();
		await expectLocator(
			page.getByText("Workspace settings saved.")
		).toBeVisible();

		await contact.fill("team@mizen.dev");
		await page.getByRole("button", { name: "Discard changes" }).click();
		const confirm = page.getByRole("dialog", {
			name: "Discard unsaved changes?",
		});
		await expectLocator(confirm).toBeVisible();
		await confirm.getByRole("button", { name: "Discard changes" }).click();
		await expectLocator(contact).toHaveValue("hello@mizen.dev");
		await expectLocator(
			page.getByRole("combobox", { name: "Time zone" })
		).toHaveText("London");
		await expectLocator(
			page.getByRole("checkbox", { name: "Product updates" })
		).toBeChecked();
		await expectLocator(confirm).toBeHidden();
		await expectLocator(
			page.getByRole("button", { name: "Save changes" })
		).toBeFocused();
	});

	it("keeps control surfaces themed, interactive, and within the viewport", async () => {
		await page.setViewportSize({ height: 900, width: 1280 });
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		await setDocsTheme(page, "light");
		const comparison = page.getByTestId("settings-surface-comparison");
		const comparisonTrigger = comparison.getByRole("button", {
			exact: true,
			name: "Compare fields on the canvas and in a Card",
		});
		await comparisonTrigger.focus();
		await page.keyboard.press("Enter");
		await expectLocator(comparisonTrigger).toHaveAttribute(
			"aria-expanded",
			"true"
		);
		await expectLocator(
			comparison.getByRole("heading", { level: 3, name: "Canvas" })
		).toHaveCount(1);
		await expectLocator(
			comparison.getByRole("heading", { level: 3, name: "Card" })
		).toHaveCount(1);
		const canvas = comparison.getByTestId("settings-surface-canvas");
		const cardFields = comparison.getByTestId("settings-surface-card-fields");
		const surfaceGrid = comparison.locator('[data-slot="grid-track"]');
		expect(
			await surfaceGrid.evaluate(
				(element) =>
					getComputedStyle(element).gridTemplateColumns.split(" ").length
			)
		).toBe(2);
		const canvasInput = canvas.getByRole("textbox", { name: "Workspace name" });
		const cardInput = cardFields.getByRole("textbox", {
			name: "Workspace name",
		});
		const lightCanvasFill = await canvasInput.evaluate(
			(element) => getComputedStyle(element).backgroundColor
		);
		const lightCardFill = await cardInput.evaluate(
			(element) => getComputedStyle(element).backgroundColor
		);
		expect(lightCanvasFill).toBe(lightCardFill);
		const lightCanvasRing = await focusContrast(canvasInput, "main");
		const lightCardRing = await focusContrast(
			cardInput,
			'[data-testid="settings-surface-card"]'
		);
		expect(
			lightCanvasRing.contrast,
			"canvas focus ring"
		).toBeGreaterThanOrEqual(3);
		expect(
			lightCardRing.contrast,
			"workarea focus ring"
		).toBeGreaterThanOrEqual(3);
		expect(
			await cardFields
				.getByRole("combobox", { name: "Default visibility" })
				.textContent()
		).toContain("Team");

		const restingBorder = await canvasInput.evaluate(
			(element) => getComputedStyle(element).borderColor
		);
		await canvasInput.hover();
		await settleAnimations(canvasInput);
		expect(await canvasInput.getAttribute("data-hovered")).toBe("true");
		expect(
			await canvasInput.evaluate(
				(element) => getComputedStyle(element).backgroundColor
			)
		).toBe(lightCanvasFill);
		expect(
			await canvasInput.evaluate(
				(element) => getComputedStyle(element).borderColor
			)
		).not.toBe(restingBorder);
		const canvasSwitch = canvas.getByRole("switch", { name: "Weekly summary" });
		await expectLocator(canvasSwitch).not.toBeChecked();
		const switchThumb = canvasSwitch.locator('[data-slot="switch-thumb"]');
		// The thumb stays white; the track carries the checked state.
		const uncheckedTrack = await canvasSwitch.evaluate(
			(element) => getComputedStyle(element).backgroundColor
		);
		await canvasSwitch.check();
		await expectLocator(canvasSwitch).toBeChecked();
		await settleAnimations(canvasSwitch);
		await settleAnimations(switchThumb);
		const lightSwitchColors = {
			thumb: await switchThumb.evaluate(
				(element) => getComputedStyle(element).backgroundColor
			),
			track: await canvasSwitch.evaluate(
				(element) => getComputedStyle(element).backgroundColor
			),
		};
		const lightSwitchContrast = await contrastRatio(
			lightSwitchColors.thumb,
			lightSwitchColors.track
		);
		expect(lightSwitchContrast).toBeGreaterThanOrEqual(3);
		expect(lightSwitchColors.track).not.toBe(uncheckedTrack);
		await canvasSwitch.uncheck();
		const disabledInput = canvas.getByRole("textbox", { name: "Workspace ID" });
		const disabledFill = await disabledInput.evaluate(
			(element) => getComputedStyle(element).backgroundColor
		);
		await disabledInput.hover();
		expect(await disabledInput.getAttribute("data-hovered")).toBeNull();
		expect(
			await disabledInput.evaluate(
				(element) => getComputedStyle(element).backgroundColor
			)
		).toBe(disabledFill);
		await expectLocator(disabledInput).toBeDisabled();
		await expectLocator(
			canvas.getByRole("textbox", { name: "Email error preview" })
		).toHaveAttribute("aria-invalid", "true");

		await setDocsTheme(page, "dark");
		await expect
			.poll(() => page.locator("html").getAttribute("data-theme"))
			.toBe("dark");
		const darkCanvasRing = await focusContrast(canvasInput, "main");
		const darkCardRing = await focusContrast(
			cardInput,
			'[data-testid="settings-surface-card"]'
		);
		expect(
			darkCanvasRing.contrast,
			`dark canvas focus ring: ${JSON.stringify(darkCanvasRing)}`
		).toBeGreaterThanOrEqual(3);
		expect(
			darkCardRing.contrast,
			`dark workarea focus ring: ${JSON.stringify(darkCardRing)}`
		).toBeGreaterThanOrEqual(3);
		const darkSwitch = canvas.getByRole("switch", { name: "Weekly summary" });
		await darkSwitch.check();
		await settleAnimations(darkSwitch);
		const darkSwitchThumb = darkSwitch.locator('[data-slot="switch-thumb"]');
		await settleAnimations(darkSwitchThumb);
		const darkSwitchColors = {
			thumb: await darkSwitchThumb.evaluate(
				(element) => getComputedStyle(element).backgroundColor
			),
			track: await darkSwitch.evaluate(
				(element) => getComputedStyle(element).backgroundColor
			),
		};
		const darkSwitchContrast = await contrastRatio(
			darkSwitchColors.thumb,
			darkSwitchColors.track
		);
		expect(darkSwitchContrast).toBeGreaterThanOrEqual(3);
		const darkCardFill = await cardInput.evaluate(
			(element) => getComputedStyle(element).backgroundColor
		);
		expect(darkCardFill).not.toBe("rgb(255, 255, 255)");
		expect(darkCardFill).not.toBe(lightCardFill);
		await page.setViewportSize({ height: 844, width: 390 });
		expect(
			await surfaceGrid.evaluate(
				(element) =>
					getComputedStyle(element).gridTemplateColumns.split(" ").length
			)
		).toBe(1);
		expect(
			await page.evaluate(
				() => document.documentElement.scrollWidth <= window.innerWidth
			)
		).toBe(true);
		await setDocsTheme(page, "light");
		await expect
			.poll(() => page.locator("html").getAttribute("data-theme"))
			.toBe("light");
		await page.goto(`${handle.url}/components/card`, {
			waitUntil: "networkidle",
		});
		await page.goto(`${handle.url}/internal/theme-fixtures`, {
			waitUntil: "networkidle",
		});
		const explicitDarkField = page
			.getByTestId("card-dark-theme")
			.getByRole("textbox", { name: "Theme preference" });
		expect(
			await explicitDarkField.evaluate(
				(element) => getComputedStyle(element).backgroundColor
			)
		).not.toBe(lightCardFill);
	});

	it("keeps nested popup and dialog dismissal scoped to the active layer", async () => {
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		const trigger = page.getByRole("button", {
			name: "Edit workspace details",
		});
		await trigger.click();
		const dialog = page.getByRole("dialog", { name: "Workspace details" });
		await expectLocator(dialog).toBeVisible();
		await dialog.getByRole("combobox", { name: "Default team" }).click();
		await page.getByRole("option", { name: "Design team" }).click();
		await expectLocator(dialog).toBeVisible();

		await dialog.getByRole("button", { name: "More actions" }).click();
		await page.getByRole("menuitem", { name: "Workspace display" }).hover();
		await expectLocator(
			page.getByRole("menuitem", { name: "Show project ID" })
		).toBeVisible();
		await page.keyboard.press("Escape");
		await expectLocator(
			page.getByRole("menuitem", { name: "Show project ID" })
		).toBeHidden();
		await expectLocator(
			page.getByRole("menuitem", { name: "Workspace display" })
		).toBeVisible();
		await page.keyboard.press("Escape");
		await expectLocator(
			page.getByRole("menuitem", { name: "Workspace display" })
		).toBeHidden();
		await expectLocator(dialog).toBeVisible();
		await page.keyboard.press("Escape");
		await expectLocator(dialog).toBeHidden();
		expect(
			await trigger.evaluate((element) => document.activeElement === element)
		).toBe(true);
	});

	it("filters, selects, edits, recovers a failed save, and archives with confirmation", async () => {
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		const projects = page.locator('section[aria-labelledby="records-heading"]');
		const search = projects.getByRole("textbox", { name: "Search projects" });
		await search.fill("missing project");
		await expectLocator(page.getByText("No matching projects")).toBeVisible();
		await search.clear();
		await projects.getByRole("combobox", { name: "Status" }).click();
		await page.getByRole("option", { name: "Paused" }).click();
		await expectLocator(page.getByText("No owner assigned")).toBeVisible();

		await page
			.getByRole("button", { name: "Edit Интеграция с партнёрами" })
			.click();
		const drawer = page.getByRole("dialog", { name: "Project details" });
		const projectName = drawer.getByRole("textbox", { name: "Project name" });
		await projectName.fill("");
		await drawer.getByRole("button", { name: "Save project" }).click();
		await expectLocator(
			drawer.getByText("Project name is required.")
		).toBeVisible();
		await projectName.fill("Partner integration");
		await drawer.getByRole("button", { name: "Save project" }).click();
		await expectLocator(projectName).toBeDisabled();
		await expectLocator(
			drawer.getByRole("button", { exact: true, name: "Close" }).last()
		).toBeDisabled();
		await expectLocator(drawer.getByText(SAVE_FAILURE)).toBeVisible();
		expect(await projectName.inputValue()).toBe("Partner integration");
		await drawer.getByRole("button", { name: "Save project" }).click();
		await expectLocator(page.getByText("Project saved.")).toBeVisible();
		await expectLocator(
			page.getByText("Partner integration", { exact: true })
		).toBeVisible();

		const statePreview = projects.getByRole("button", {
			exact: true,
			name: "Preview collection states",
		});
		await statePreview.focus();
		await page.keyboard.press("Enter");
		await expectLocator(statePreview).toBeFocused();
		const collectionState = projects.getByRole("combobox", {
			name: "Collection state",
		});
		await collectionState.click();
		await page.getByRole("option", { name: "Error" }).click();
		await page
			.locator('section[aria-labelledby="records-heading"]')
			.getByRole("button", { exact: true, name: "Retry" })
			.click();
		await expectLocator(
			page.getByText("1 of 4 projects · 0 selected")
		).toBeVisible();
		await collectionState.click();
		await page.getByRole("option", { name: "Loading" }).click();
		await expectLocator(page.getByText("Loading projects…")).toBeVisible();
		await collectionState.scrollIntoViewIfNeeded();
		await page.evaluate(() => window.scrollBy(0, -300));
		await collectionState.click();
		await page.getByRole("option", { name: "Empty collection" }).click();
		await expectLocator(
			page.getByText("No projects are available")
		).toBeVisible();
		await collectionState.click();
		await page.getByRole("option", { name: "Loaded" }).click();
		await projects.getByRole("combobox", { name: "Status" }).click();
		await page.getByRole("option", { name: "All statuses" }).click();
		const selection = page.getByRole("checkbox", { name: NORTHSTAR_SELECTION });
		await selection.focus();
		await page.keyboard.press("Space");
		await expectLocator(selection).toBeChecked();
		await page.getByRole("button", { name: "Archive selected (1)" }).click();
		const archive = page.getByRole("dialog", { name: "Archive 1 project?" });
		await archive.getByRole("button", { name: "Archive projects" }).click();
		await expectLocator(
			page.getByText("3 of 3 projects · 0 selected")
		).toBeVisible();
	});

	it("keeps an editing draft through canceled dismissal and discards only after confirmation", async () => {
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		await page.getByRole("button", { name: "Edit Northstar launch" }).click();
		const editor = page.getByRole("dialog", { name: "Project details" });
		const name = editor.getByRole("textbox", { name: "Project name" });
		await name.fill("Draft project name");
		await page.keyboard.press("Escape");
		const confirmation = page.getByRole("dialog", {
			name: "Discard project changes?",
		});
		await expectLocator(confirmation).toBeVisible();
		await confirmation.getByRole("button", { name: "Keep editing" }).click();
		await expectLocator(confirmation).toBeHidden();
		await expectLocator(name).toHaveValue("Draft project name");
		await editor
			.getByRole("button", { exact: true, name: "Close" })
			.last()
			.click();
		await confirmation.getByRole("button", { name: "Discard changes" }).click();
		await expectLocator(editor).toBeHidden();
		await page.getByRole("button", { name: "Edit Northstar launch" }).click();
		await expectLocator(name).toHaveValue("Northstar launch");
		await page.keyboard.press("Escape");
		await expectLocator(editor).toBeHidden();
	});

	describe.each(["light", "dark"] as const)("%s theme", (theme) => {
		it(`keeps ${theme} compositions usable with narrow, enlarged text`, async () => {
			await page.setViewportSize({ height: 844, width: 390 });
			await page.emulateMedia({ reducedMotion: "reduce" });
			await page.goto(`${handle.url}/internal/specimens`, {
				waitUntil: "networkidle",
			});
			await setDocsTheme(page, theme);
			await page.addStyleTag({
				content:
					"html { font-size: 32px !important; } main p, main label { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }",
			});
			expect(
				await page.evaluate(
					() => document.documentElement.scrollWidth <= window.innerWidth
				)
			).toBe(true);
			await page
				.getByRole("button", { name: "Edit workspace details" })
				.click();
			const dialog = page.getByRole("dialog", { name: "Workspace details" });
			await expectLocator(dialog).toBeVisible();
			expect(
				await dialog.evaluate(
					(element) => element.scrollWidth <= element.clientWidth
				)
			).toBe(true);
			await page.keyboard.press("Escape");
			await expectLocator(dialog).toBeHidden();
			await page.screenshot({
				fullPage: true,
				path: `/private/tmp/mizen-compositions-${theme}-enlarged.png`,
			});
			await page.setViewportSize({ height: 844, width: 320 });
			await page.locator("html").evaluate((element) => {
				element.setAttribute("dir", "rtl");
			});
			expect(
				await page.evaluate(
					() =>
						document.documentElement.scrollWidth <=
							document.documentElement.clientWidth &&
						document.documentElement.clientWidth <= window.innerWidth
				)
			).toBe(true);
			const sections = await page.evaluate(() =>
				[
					'section[aria-labelledby="settings-heading"]',
					'section[aria-labelledby="records-heading"]',
					'[data-testid="analytics-workspace-example"]',
				].map((selector) => {
					const element = document.querySelector(selector);
					if (!element) {
						throw new Error(`Missing workflow section: ${selector}`);
					}
					const rect = element.getBoundingClientRect();
					return { left: rect.left, right: rect.right };
				})
			);
			for (const bounds of sections) {
				expect(bounds.left).toBeGreaterThanOrEqual(0);
				expect(bounds.right).toBeLessThanOrEqual(320);
			}
			const rowBounds = await page
				.locator(
					'section[aria-labelledby="records-heading"] [data-slot="list-item"]'
				)
				.evaluateAll((rows) =>
					rows.map((row) => {
						const actions = row.querySelector('[data-slot="list-actions"]');
						if (!actions) {
							throw new Error("Project row is missing its actions");
						}
						const actionRect = actions.getBoundingClientRect();
						return {
							actionsLeft: actionRect.left,
							actionsRight: actionRect.right,
							controls: Array.from(
								actions.querySelectorAll(
									'[role="checkbox"], [data-slot="badge"], button'
								)
							).map((control) => {
								const rect = control.getBoundingClientRect();
								return { left: rect.left, right: rect.right };
							}),
						};
					})
				);
			for (const row of rowBounds) {
				expect(row.actionsLeft).toBeGreaterThanOrEqual(0);
				expect(row.actionsRight).toBeLessThanOrEqual(320);
				for (const control of row.controls) {
					expect(control.left).toBeGreaterThanOrEqual(row.actionsLeft);
					expect(control.right).toBeLessThanOrEqual(row.actionsRight);
				}
			}
			const recordsSearch = page.getByRole("textbox", {
				name: "Search projects",
			});
			await recordsSearch.focus();
			await expectLocator(recordsSearch).toBeFocused();
			await expectLocator(recordsSearch).toHaveValue("");
			await page.screenshot({
				fullPage: true,
				path: `/private/tmp/mizen-compositions-${theme}-rtl-320-enlarged.png`,
			});
		});
	});
});
