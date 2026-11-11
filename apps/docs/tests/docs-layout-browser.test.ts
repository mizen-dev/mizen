import { type Browser, chromium, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import {
	setDocsTheme,
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
let handle: TestServerHandle;
let browser: Browser;
let page: Page;

describe("Docs layout resilience", () => {
	it.each(
		[
			"input",
			"select",
			"combobox",
			"otp-field",
			"tabs",
			"toggle-group",
			"radio-group",
			"checkbox-group",
		].flatMap((slug) => ["light", "dark"].map((theme) => ({ slug, theme })))
	)(
		"contains $slug controls inside the phone preview in $theme",
		async ({ slug, theme }) => {
			await page.setViewportSize({ height: 900, width: 320 });
			await page.goto(`${handle.url}/components/${slug}`, {
				waitUntil: "networkidle",
			});
			await page.evaluate(
				(value) => localStorage.setItem("mizen-theme", value),
				theme
			);
			await page.reload({ waitUntil: "networkidle" });
			const frame = page.locator("[data-slot=component-preview]").first();
			const widths = await frame.evaluate((element) => ({
				content: element.scrollWidth,
				visible: element.clientWidth,
			}));
			expect(widths.content).toBeLessThanOrEqual(widths.visible + 1);
		}
	);

	it.each(["light", "dark"])(
		"keeps all six OTP slots square and visible at 320px in %s",
		async (theme) => {
			await page.setViewportSize({ height: 900, width: 320 });
			await page.goto(`${handle.url}/components/otp-field`, {
				waitUntil: "networkidle",
			});
			await page.evaluate(
				(value) => localStorage.setItem("mizen-theme", value),
				theme
			);
			await page.reload({ waitUntil: "networkidle" });
			const field = page.getByTestId("otp-field-size-lg");
			const geometry = await field.evaluate((element) => ({
				content: element.scrollWidth,
				slots: [...element.querySelectorAll("input")].map((input) => ({
					height: input.getBoundingClientRect().height,
					width: input.getBoundingClientRect().width,
				})),
				width: element.clientWidth,
			}));
			expect(geometry.content).toBeLessThanOrEqual(geometry.width + 1);
			expect(geometry.slots).toHaveLength(6);
			for (const slot of geometry.slots) {
				expect(slot.width).toBeGreaterThanOrEqual(24);
				expect(slot.height).toBeCloseTo(slot.width, 1);
			}
		}
	);

	it("keeps joined button heights equal and scrolls the focused end action into view", async () => {
		await page.setViewportSize({ height: 900, width: 320 });
		await page.goto(`${handle.url}/components/button-group`, {
			waitUntil: "networkidle",
		});
		const group = page
			.getByRole("region", {
				exact: true,
				name: "Button Group: Publish a release example",
			})
			.locator("[data-slot=button-group][data-orientation=horizontal]");
		// The example sits below the fold, and the docs scroll smoothly.
		await group.scrollIntoViewIfNeeded();
		const heights = await group
			.locator("button")
			.evaluateAll((elements) =>
				elements.map((element) => element.getBoundingClientRect().height)
			);
		expect(Math.max(...heights) - Math.min(...heights)).toBeLessThan(1);
		const end = group.getByRole("button", { exact: true, name: "Save draft" });
		await end.focus();
		expect(
			await end.evaluate((element) => {
				const box = element.getBoundingClientRect();
				return element.contains(
					document.elementFromPoint(
						box.x + box.width / 2,
						box.y + box.height / 2
					)
				);
			})
		).toBe(true);
	});
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
	}, 120_000);

	afterAll(async () => {
		try {
			await browser?.close();
		} finally {
			await teardownTestServer(handle);
		}
	});

	it("gives tablet content full width and dismisses Browse after navigation", async () => {
		await page.setViewportSize({ height: 900, width: 768 });
		await page.goto(`${handle.url}/components/button`, {
			waitUntil: "networkidle",
		});
		expect(
			await page.locator('[data-slot="desktop-sidebar"]').isVisible()
		).toBe(false);
		const browse = page.getByRole("button", { exact: true, name: "Browse" });
		const popup = page.locator('[data-slot="drawer-popup"]');
		await browse.click();
		await popup.getByRole("link", { exact: true, name: "Button" }).click();
		await popup.waitFor({ state: "hidden" });
		await browse.click();
		await popup.getByRole("link", { exact: true, name: "Checkbox" }).click();
		await page.waitForURL("**/components/checkbox");
		await popup.waitFor({ state: "hidden" });
		await page.goto(`${handle.url}/docs/components/button`, {
			waitUntil: "networkidle",
		});
		await page.setViewportSize({ height: 900, width: 1280 });
		expect(
			await page.locator('[data-slot="desktop-sidebar"]').isVisible()
		).toBe(true);
		// The sidebar starts below the floating header and its bottom margin.
		const edges = await page.evaluate(() => {
			const header = document.querySelector("header");
			return {
				header: header
					? header.getBoundingClientRect().bottom +
						Number.parseFloat(getComputedStyle(header).marginBlockEnd)
					: 0,
				sidebar: document
					.querySelector('[data-slot="desktop-sidebar"]')
					?.getBoundingClientRect().top,
			};
		});
		expect(edges.header).toBeGreaterThan(0);
		expect(edges.sidebar).toBe(edges.header);
	});

	it.each(
		["number-field", "otp-field", "input-group"].flatMap((slug) =>
			[320, 375, 640, 768, 1280].map((width) => [slug, width] as const)
		)
	)(
		"keeps %s at %ipx contained with doubled root text",
		async (slug, width) => {
			await page.setViewportSize({ height: 900, width });
			await page.goto(`${handle.url}/components/${slug}`, {
				waitUntil: "networkidle",
			});
			await page.addStyleTag({ content: "html {font-size:32px!important}" });
			expect(
				await page.evaluate(() => document.documentElement.scrollWidth)
			).toBeLessThanOrEqual(width);
			if (width < 1280) {
				expect(
					await page.getByRole("button", { name: "Browse" }).isVisible()
				).toBe(true);
			}
		},
		20_000
	);

	it("links the document sections and filters component navigation", async () => {
		await page.setViewportSize({ height: 900, width: 1440 });
		await page.goto(`${handle.url}/components/button`, {
			waitUntil: "networkidle",
		});
		const outline = page.getByRole("navigation", { name: "On this page" });
		const anchors = await outline
			.locator('a[href^="#"]')
			.evaluateAll((elements) =>
				elements.map(
					(element) =>
						document.querySelector(element.getAttribute("href") ?? "")?.id
				)
			);
		expect(anchors).toEqual([
			"preview",
			"usage",
			"examples",
			"IconAction",
			"LoadingAction",
			"DisabledAction",
			"ButtonReleaseReviewExample1",
			"ButtonActionHierarchyExample2",
			"ButtonDestructiveActionsExample3",
			"ButtonActionStatesExample4",
			"ButtonControlSizesExample5",
			"ButtonIconActionsExample6",
			"recommendations",
			"boundaries",
			"api",
		]);
		const iconSection = outline.getByRole("link", {
			exact: true,
			name: "Icon action",
		});
		await iconSection.focus();
		await page.keyboard.press("Enter");
		await expect
			.poll(() => iconSection.getAttribute("aria-current"))
			.toBe("location");
		await page
			.locator("#api")
			.evaluate((element) => element.scrollIntoView({ behavior: "instant" }));
		await expect
			.poll(() =>
				outline
					.getByRole("link", { exact: true, name: "API reference" })
					.getAttribute("aria-current")
			)
			.toBe("location");
		await page.evaluate(() => window.scrollTo({ behavior: "instant", top: 0 }));
		await expect
			.poll(() =>
				outline
					.getByRole("link", { exact: true, name: "Preview" })
					.getAttribute("aria-current")
			)
			.toBe("location");
		const search = page.getByRole("searchbox", { name: "Find a component" });
		await search.fill("data table");
		const navigation = page.getByRole("navigation", {
			name: "Component index",
		});
		expect(await navigation.getByRole("link").count()).toBe(1);
		expect(await navigation.getByRole("link").getAttribute("href")).toBe(
			"/docs/components/data-table"
		);
		await search.fill("no such component");
		expect(await navigation.getByRole("status").textContent()).toBe(
			"No matching components."
		);
		await search.fill("");
		expect(await navigation.getByRole("link").count()).toBeGreaterThan(100);
		const response = await page.request.get(
			`${handle.url}/components/button/markdown`
		);
		expect(await response.text()).toContain("## Usage boundaries");
		await page.setViewportSize({ height: 900, width: 320 });
		expect(await outline.isVisible()).toBe(false);
		const api = page.getByRole("region", { name: "Button API properties" });
		await api.focus();
		await page.keyboard.press("ArrowRight");
		await expect
			.poll(() => api.evaluate((element) => element.scrollLeft))
			.toBeGreaterThan(0);
		await page.getByRole("button", { name: "Browse" }).click();
		await page
			.getByRole("searchbox", { name: "Find a component" })
			.fill("tooltip");
		expect(
			await page
				.getByRole("navigation", { name: "Component index" })
				.getByRole("link", { exact: true, name: "Tooltip" })
				.getAttribute("href")
		).toBe("/docs/components/tooltip");
	});

	it.each(["light", "dark"] as const)(
		"keeps the long TOC vertical and reserves scrollbar space in %s",
		async (theme) => {
			await page.setViewportSize({ height: 900, width: 1280 });
			await page.goto(`${handle.url}/components/combobox`, {
				waitUntil: "networkidle",
			});
			await setDocsTheme(page, theme);
			const outline = page.getByRole("navigation", { name: "On this page" });
			const viewport = outline.locator('[data-slot="scroll-area-viewport"]');
			expect(
				await outline.evaluate(
					(element) => element.getBoundingClientRect().width
				)
			).toBe(288);
			const identifier = outline.getByRole("link", {
				exact: true,
				name: "ComboboxChipRemove",
			});
			expect(
				await identifier.evaluate((element) => {
					const range = document.createRange();
					range.selectNodeContents(element);
					return (
						range.getBoundingClientRect().height <=
						Number.parseFloat(getComputedStyle(element).lineHeight) + 1
					);
				})
			).toBe(true);
			await outline.hover();
			await expect
				.poll(() =>
					viewport.evaluate(
						(element) => element.scrollWidth - element.clientWidth
					)
				)
				.toBeLessThanOrEqual(1);
			const metrics = await outline.evaluate((element) => {
				const viewportElement = element.querySelector(
					'[data-slot="scroll-area-viewport"]'
				);
				const scrollbar = element.querySelector(
					'[data-slot="scroll-area-scrollbar"][data-orientation="vertical"]'
				);
				if (!(viewportElement && scrollbar)) {
					throw new Error("TOC scroll elements are missing");
				}
				const scrollbarLeft = scrollbar.getBoundingClientRect().left;
				return {
					canScroll:
						viewportElement.scrollHeight > viewportElement.clientHeight,
					gutter: getComputedStyle(viewportElement).paddingInlineEnd,
					linksClearScrollbar: Array.from(
						element.querySelectorAll('a[href^="#"]')
					).every(
						(link) => link.getBoundingClientRect().right <= scrollbarLeft
					),
				};
			});
			expect(metrics.canScroll).toBe(true);
			expect(Number.parseFloat(metrics.gutter)).toBeGreaterThan(0);
			expect(metrics.linksClearScrollbar).toBe(true);
			await viewport.evaluate((element) => {
				element.scrollTop = element.scrollHeight;
			});
			const lastLink = outline.getByRole("link", {
				exact: true,
				name: "SelectButton",
			});
			await lastLink.focus();
			expect(
				await lastLink.evaluate((element) => element === document.activeElement)
			).toBe(true);
			expect(await viewport.evaluate((element) => element.scrollLeft)).toBe(0);
			expect(
				await outline
					.locator(
						'[data-slot="scroll-area-scrollbar"][data-orientation="horizontal"]'
					)
					.isVisible()
			).toBe(false);
			await outline.screenshot({
				path: `/private/tmp/mizen-toc-scroll-${theme}.png`,
			});
		}
	);

	it.each([16, 32])(
		"keeps the TOC trail separate and follows nesting at %ipx text",
		async (fontSize) => {
			await page.setViewportSize({ height: 1000, width: fontSize * 90 });
			await page.goto(`${handle.url}/components/button`, {
				waitUntil: "networkidle",
			});
			await page.addStyleTag({
				content: `html {font-size:${fontSize}px!important}`,
			});
			const outline = page.getByRole("navigation", { name: "On this page" });
			const paths = outline.locator(
				'[data-slot="scroll-area-content"] > div > svg path'
			);
			await expect.poll(() => paths.count()).toBe(2);
			expect(await paths.first().getAttribute("d")).toContain(" C ");
			expect(await paths.first().getAttribute("stroke-linecap")).toBe("round");
			const previewX = await paths
				.last()
				.evaluate((element) => element.getBoundingClientRect().left);
			const nested = outline.getByRole("link", {
				exact: true,
				name: "Icon action",
			});
			await nested.click();
			await expect
				.poll(() => nested.getAttribute("aria-current"), { timeout: 3000 })
				.toBe("location");
			const marker = await paths.last().boundingBox();
			const link = await nested.boundingBox();
			expect(marker?.x).toBeGreaterThan(previewX);
			expect((marker?.x ?? 0) + (marker?.width ?? 0)).toBeLessThan(
				link?.x ?? 0
			);
		}
	);

	it("separates the dark input fill from its preview surface", async () => {
		await page.emulateMedia({ colorScheme: "dark" });
		await page.goto(`${handle.url}/components/input`, {
			waitUntil: "networkidle",
		});
		expect(await page.locator("html").getAttribute("data-theme")).toBe("dark");
		const fills = await page
			.locator("#docs-content input")
			.first()
			.evaluate((input) => {
				const stage = document.querySelector('[data-slot="component-preview"]');
				return {
					input: getComputedStyle(input).borderColor,
					stage: stage ? getComputedStyle(stage).backgroundColor : null,
				};
			});
		expect(fills.stage).not.toBeNull();
		expect(fills.input).not.toBe(fills.stage);
	});

	it("keeps guidance dividers separate from the table's outer bottom border", async () => {
		await page.setViewportSize({ height: 900, width: 1440 });
		await page.goto(`${handle.url}/components/button`, {
			waitUntil: "networkidle",
		});
		const tables = await page
			.locator("#recommendations tbody, #boundaries tbody")
			.evaluateAll((bodies) =>
				bodies.map((body) =>
					Array.from(
						body.querySelectorAll("td"),
						(cell) => getComputedStyle(cell).borderBottomWidth
					)
				)
			);
		for (const widths of tables) {
			expect(widths.slice(-2)).toEqual(["0px", "0px"]);
			if (widths.length > 2) {
				expect(widths[0]).toBe("1px");
			}
		}
	});

	it("scrolls the page while hovering an API table without vertical overflow", async () => {
		await page.setViewportSize({ height: 900, width: 1440 });
		await page.goto(`${handle.url}/components/button`, {
			waitUntil: "networkidle",
		});
		const table = page.locator('#api [data-slot="table-container"]');
		await table.scrollIntoViewIfNeeded();
		expect(
			await table.evaluate(
				(element) => element.scrollHeight - element.clientHeight
			)
		).toBe(0);
		await table.hover();
		const initialScroll = await page.evaluate(() => window.scrollY);
		await page.mouse.wheel(0, -300);
		await expect
			.poll(() => page.evaluate(() => window.scrollY))
			.toBeLessThan(initialScroll);
	});

	it.each([16, 32])(
		"fits short code blocks without a bottom gap at %ipx root text",
		async (fontSize) => {
			await page.setViewportSize({ height: 1000, width: 1440 });
			await page.goto(`${handle.url}/components/button`, {
				waitUntil: "networkidle",
			});
			await page.addStyleTag({
				content: `html {font-size:${fontSize}px!important}`,
			});
			const example = page.locator("#IconAction");
			await example.getByRole("tab", { exact: true, name: "Code" }).click();
			const geometry = await example.evaluate((element) => {
				const viewport = element.querySelector(
					'[data-slot="scroll-area-viewport"]'
				);
				const content = element.querySelector("pre");
				if (!(viewport && content)) {
					throw new Error("Code block anatomy is missing.");
				}
				return {
					gap:
						viewport.getBoundingClientRect().bottom -
						content.getBoundingClientRect().bottom,
					header: element.querySelector('[data-slot="code-block-header"]'),
					overflow: viewport.scrollHeight - viewport.clientHeight,
				};
			});
			expect(Math.abs(geometry.gap)).toBeLessThanOrEqual(1);
			expect(geometry.overflow).toBe(0);
			// Example code carries no language header; Copy floats instead.
			expect(geometry.header).toBeNull();
		}
	);

	it.each([16, 32])(
		"reveals and copies preview source with %ipx root text",
		async (fontSize) => {
			await page.setViewportSize({ height: 900, width: 320 });
			await page.goto(`${handle.url}/components/button`, {
				waitUntil: "networkidle",
			});
			await page.addStyleTag({
				content: `html {font-size:${fontSize}px!important}`,
			});
			await page.evaluate(() => {
				Object.defineProperty(navigator, "clipboard", {
					configurable: true,
					value: {
						writeText: (value: string) => {
							document.documentElement.setAttribute(
								"data-copied-source",
								value
							);
							return Promise.resolve();
						},
					},
				});
			});
			const presentation = page.locator("#ButtonReleaseReviewExample1");
			await presentation
				.getByRole("tab", { exact: true, name: "Preview" })
				.focus();
			await page.keyboard.press("ArrowRight");
			await page.keyboard.press("Enter");
			const codePanel = presentation.getByRole("tabpanel");
			const source = codePanel.getByRole("region").first();
			expect(await source.isVisible()).toBe(true);
			const block = codePanel.locator('[data-slot="code-block"]').first();
			const copy = block.locator('[data-slot="code-block-copy"]');
			expect(
				await block.locator('[data-slot="code-block-header"]').count()
			).toBe(0);
			const copyTop = await copy.evaluate(
				(element) =>
					element.getBoundingClientRect().top -
					(element.parentElement?.getBoundingClientRect().top ?? 0)
			);
			const viewport = block.locator('[data-slot="scroll-area-viewport"]');
			expect(
				await viewport.evaluate(
					(element) => getComputedStyle(element).borderBottomLeftRadius
				)
			).toBe(
				await block.evaluate(
					(element) =>
						`${Number.parseFloat(getComputedStyle(element).borderBottomLeftRadius) - Number.parseFloat(getComputedStyle(element).borderLeftWidth)}px`
				)
			);
			expect(
				await source.evaluate(
					(element) => getComputedStyle(element).borderTopLeftRadius
				)
			).not.toBe("0px");
			await viewport.evaluate((element) => {
				element.scrollTop = 200;
			});
			expect(
				await viewport.evaluate((element) => element.scrollTop)
			).toBeGreaterThan(0);
			// Copy stays pinned in the corner while the code scrolls.
			expect(
				await copy.evaluate(
					(element) =>
						element.getBoundingClientRect().top -
						(element.parentElement?.getBoundingClientRect().top ?? 0)
				)
			).toBe(copyTop);
			expect(await source.locator("code span").count()).toBeGreaterThan(0);
			await codePanel
				.getByRole("button", { name: "Copy code" })
				.first()
				.click();
			await expect
				.poll(() => codePanel.getByRole("status").first().textContent())
				.toBe("Copied");
			expect(
				await page.locator("html").getAttribute("data-copied-source")
			).toBe(await source.textContent());
			// ScrollArea owns both axes; the code itself never scrolls natively.
			expect(
				await source.evaluate(
					(element) => element.scrollWidth - element.clientWidth
				)
			).toBe(0);
			await source.focus();
			await page.keyboard.press("ArrowRight");
			await expect
				.poll(() => viewport.evaluate((element) => element.scrollLeft))
				.toBeGreaterThan(0);
			expect(
				await page.evaluate(() => document.documentElement.scrollWidth)
			).toBeLessThanOrEqual(320);
		}
	);

	it("edits the controlled input and preserves read-only and disabled behavior", async () => {
		await page.goto(`${handle.url}/components/input`, {
			waitUntil: "networkidle",
		});
		const input = page
			.locator("#ControlledInput")
			.getByRole("textbox", { name: "Project name" });
		await input.fill("Field notes");
		const example = page.locator("#ControlledInput");
		await example.getByRole("tab", { exact: true, name: "Code" }).click();
		await expect.poll(() => input.isVisible()).toBe(false);
		await example.getByRole("tab", { exact: true, name: "Preview" }).click();
		expect(await input.inputValue()).toBe("Field notes");
		expect(
			await page
				.locator("#ControlledInput")
				.getByRole("tabpanel", { exact: true, name: "Preview" })
				.textContent()
		).toContain("Current value: Field notes");
		expect(
			await page.locator("#ReadOnlyInput input").getAttribute("readonly")
		).not.toBeNull();
		expect(await page.locator("#DisabledInput input").isDisabled()).toBe(true);
	});

	it.each(["button", "field", "input", "select", "dialog"])(
		"contains %s usage examples at doubled text on a narrow screen",
		async (slug) => {
			await page.setViewportSize({ height: 900, width: 320 });
			await page.goto(`${handle.url}/components/${slug}`, {
				waitUntil: "networkidle",
			});
			await page.addStyleTag({ content: "html {font-size:32px!important}" });
			expect(
				await page.evaluate(() => document.documentElement.scrollWidth)
			).toBeLessThanOrEqual(320);
		}
	);

	it("connects field names, descriptions, and displayed errors", async () => {
		await page.goto(`${handle.url}/components/field`, {
			waitUntil: "networkidle",
		});
		const email = page
			.locator("#LabeledField")
			.getByRole("textbox", { name: "Contact email" });
		await page.locator("#LabeledField label").click();
		expect(
			await email.evaluate((element) => element === document.activeElement)
		).toBe(true);
		const descriptions = await email.getAttribute("aria-describedby");
		expect(descriptions).toBeTruthy();
		const invalid = page
			.locator("#InvalidField")
			.getByRole("textbox", { name: "Project name" });
		expect(await invalid.getAttribute("aria-invalid")).toBe("true");
		expect(
			await page
				.locator("#InvalidField")
				.getByRole("tabpanel", { exact: true, name: "Preview" })
				.textContent()
		).toContain("Enter a project name.");
	});

	it("selects options and updates controlled multiple selection", async () => {
		await page.goto(`${handle.url}/components/select`, {
			waitUntil: "networkidle",
		});
		const single = page
			.locator("#WorkspaceSelect")
			.getByRole("combobox", { name: "Workspace" });
		await single.click();
		await page.getByRole("option", { name: "Product team" }).click();
		expect(await single.textContent()).toContain("Product team");
		const multiple = page
			.locator("#MultipleSelect")
			.getByRole("combobox", { name: "Notification channels" });
		await multiple.click();
		await page.getByRole("option", { name: "Push notifications" }).click();
		await page.keyboard.press("Escape");
		expect(await multiple.textContent()).toContain("Email");
		expect(await multiple.textContent()).toContain("Push notifications");
	});

	it("dismisses both dialog examples and returns focus to their triggers", async () => {
		await page.goto(`${handle.url}/components/dialog`, {
			waitUntil: "networkidle",
		});
		const trigger = page
			.locator("#BasicDialog")
			.getByRole("button", { name: "About this workspace" });
		await trigger.click();
		expect(
			await page.getByRole("dialog", { name: "Product workspace" }).isVisible()
		).toBe(true);
		await page.keyboard.press("Escape");
		await expect
			.poll(() =>
				trigger.evaluate((element) => element === document.activeElement)
			)
			.toBe(true);
		const controlled = page
			.locator("#ControlledDialog")
			.getByRole("button", { name: "Review notifications" });
		await controlled.click();
		await page.getByRole("button", { name: "Close review" }).click();
		await expect
			.poll(() =>
				controlled.evaluate((element) => element === document.activeElement)
			)
			.toBe(true);
	});
});
