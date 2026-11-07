import { type Browser, chromium, firefox, type Page, webkit } from "playwright";
import { expect as expectLocator } from "playwright/test";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
let handle: TestServerHandle;
let browser: Browser;
const docsPage = "/docs/components/composer";
// States the docs no longer show live, kept on an internal page for tests.
const fixtures = "/internal/composer-fixtures";
const MODEL = /^Model/;
const PERMISSIONS = /^Permissions/;
const DICTATED = /Add a dark/;
async function openComposer(
	theme: "light" | "dark",
	width = 1280,
	path = docsPage
): Promise<Page> {
	const page = await browser.newPage({
		reducedMotion: "reduce",
		viewport: { height: 900, width },
	});
	await page.addInitScript(
		(value) => localStorage.setItem("mizen-theme", value),
		theme
	);
	await page.goto(`${handle.url}${path}`, { waitUntil: "networkidle" });
	return page;
}
async function insertMaya(page: Page) {
	const input = page
		.locator("#ComposerMentionsExample")
		.getByRole("textbox", { name: "Team message" });
	await input.fill("Hello @ma");
	const list = page.locator('[data-slot="composer-list"]');
	await expectLocator(
		list.getByRole("option", { name: "Maya Chen" })
	).toBeVisible();
	await input.press("Enter");
	await expectLocator(
		page.locator('#ComposerMentionsExample [data-composer-token="mention"]')
	).toHaveAttribute("data-id", "maya");
	return input;
}
describe("Composer full editing API", { timeout: 30_000 }, () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		const engine = process.env.MIZEN_COMPOSER_BROWSER ?? "chromium";
		const browsers = { chromium, firefox, webkit };
		browser = await browsers[engine as keyof typeof browsers].launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
	}, 120_000);
	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
	});
	it("preserves custom rendering, cancellation, and ref cleanup", async () => {
		const page = await openComposer("light", 1280, fixtures);
		const fixture = page.getByRole("region", {
			name: "Presentation contracts",
		});
		const draft = fixture.getByRole("textbox", { name: "Presentation draft" });
		const sends = fixture.getByLabel("Presentation sends");
		const bindings = fixture.getByLabel("Presentation bindings");
		await fixture.getByRole("button", { name: "Toggle presentation" }).click();
		await expectLocator(bindings).toHaveText("1");
		await fixture
			.locator('[data-slot="composer"]')
			.click({ position: { x: 100, y: 2 } });
		await expectLocator(draft).toBeFocused();
		await draft.fill("Hello");
		await draft.press("Enter");
		await expectLocator(sends).toHaveText("0");
		await fixture.getByRole("button", { name: "Send message" }).click();
		await expectLocator(sends).toHaveText("0");
		await expectLocator(draft).toBeFocused();
		await fixture.getByRole("button", { name: "Allow submission" }).click();
		await draft.fill("@ma");
		await expectLocator(
			page.getByRole("status").filter({ hasText: "2 suggestions available." })
		).toHaveText(
			"2 suggestions available. Use the up and down arrow keys to navigate."
		);
		const list = page.getByRole("listbox");
		await expectLocator(list).toHaveAttribute("data-custom", "list");
		await expectLocator(
			list.getByRole("option", { name: "Maya" })
		).toHaveAttribute("data-active", "true");
		await draft.press("ArrowDown");
		await expectLocator(
			list.getByRole("option", { name: "Max" })
		).toHaveAttribute("data-active", "true");
		await draft.press("Enter");
		await expectLocator(
			draft.locator('[data-slot="composer-token"] strong')
		).toHaveText("Max");
		await expectLocator(
			fixture.getByRole("status").filter({ hasText: "Ready" })
		).toHaveJSProperty("tagName", "ASIDE");
		await fixture.getByRole("button", { name: "Send message" }).click();
		await expectLocator(sends).toHaveText("1");
		await fixture.getByRole("button", { name: "Toggle presentation" }).click();
		await expectLocator(bindings).toHaveText("0");
		await fixture.getByRole("button", { name: "Toggle presentation" }).click();
		await expectLocator(bindings).toHaveText("1");
		await expectLocator(draft).toHaveText("");
		await page.close();
	});

	it("turns Send into Stop while the agent works", async () => {
		const page = await browser.newPage({ reducedMotion: "reduce" });
		await page.goto(`${handle.url}/docs/components/composer`, {
			waitUntil: "networkidle",
		});
		const example = page.locator("#ProjectPromptComposer");
		const draft = example.getByRole("textbox", {
			name: "Ask about this project",
		});
		const frame = example.locator('[data-slot="composer"]');
		const glow = frame.locator('[data-slot="composer-glow"]');
		const border = () =>
			frame.evaluate((element) => getComputedStyle(element).borderColor);
		const restingBorder = await border();
		await draft.fill("Summarize the release");
		await draft.press("Enter");
		await expectLocator(frame).toHaveAttribute("data-working", "");
		// The light stays while the draft has focus; the caret alone marks it.
		await expectLocator(glow).toHaveCSS("opacity", "1");
		expect(await border()).toBe(restingBorder);
		await expectLocator(frame).toHaveCSS("outline-style", "none");
		await draft.pressSequentially("Also update the footer");
		await draft.press("Enter");
		// Enter does not send while Stop is the action.
		await expectLocator(draft).toHaveValue("Also update the footer");
		await example.getByRole("button", { name: "Stop" }).click();
		await expectLocator(draft).toBeFocused();
		await expectLocator(frame).not.toHaveAttribute("data-working");
		await expectLocator(
			example.getByRole("button", { name: "Send message" })
		).toBeVisible();
		await page.close();
	});
	it.each(["light", "dark"] as const)(
		"keeps plain-text editing, attachments, and submission correct in %s",
		async (theme) => {
			const page = await openComposer(theme);
			const errors: string[] = [];
			page.on("pageerror", (error) => errors.push(error.message));
			const example = page.locator("#ProjectPromptComposer");
			const input = example.getByRole("textbox", {
				name: "Ask about this project",
			});
			const frame = example.locator('[data-slot="composer"]');
			const tiles = example.locator('[data-slot="composer-attachment"]');
			const send = example.getByRole("button", { name: "Send message" });
			await expectLocator(send).toBeDisabled();
			await input.fill("  ");
			await expectLocator(send).toBeDisabled();
			await input.fill("Review the release.");
			await input.press("Shift+Enter");
			await input.pressSequentially("Keep the notes.");
			await input.press("Enter");
			await expectLocator(input).toHaveValue("");
			await expectLocator(input).toBeFocused();
			await expectLocator(frame).toHaveAttribute("data-working", "");
			await example.getByRole("button", { name: "Stop" }).click();
			await example.getByLabel("Choose context files").setInputFiles({
				buffer: Buffer.from("Notes"),
				mimeType: "text/plain",
				name: "release-notes.txt",
			});
			await expectLocator(tiles).toHaveCount(1);
			// A file alone is enough to send.
			await expectLocator(send).toBeEnabled();
			await send.click();
			await expectLocator(tiles).toHaveCount(0);
			await example
				.locator('[data-slot="composer"]')
				.screenshot({ path: `/private/tmp/mizen-composer-plain-${theme}.png` });
			expect(errors).toEqual([]);
			await page.close();
		}
	);
	it.each(["light", "dark"] as const)(
		"inserts mention tokens, supports undo, and invokes slash actions in %s",
		async (theme) => {
			const page = await openComposer(theme);
			const errors: string[] = [];
			page.on("pageerror", (error) => errors.push(error.message));
			const input = await insertMaya(page);
			const example = page.locator("#ComposerMentionsExample");
			await expectLocator(
				example.getByRole("status", { name: "Message result" })
			).toBeEmpty();
			await input.press("ControlOrMeta+z");
			await expectLocator(example.locator("[data-composer-token]")).toHaveCount(
				0
			);
			await input.press("ControlOrMeta+Shift+z");
			await expectLocator(example.locator("[data-composer-token]")).toHaveCount(
				1
			);
			await example
				.locator('[data-slot="composer"]')
				.screenshot({ path: `/private/tmp/mizen-composer-rich-${theme}.png` });
			await input.press("Escape");
			await input.press("Enter");
			await expectLocator(
				example.getByRole("status", { name: "Message result" })
			).toContainText("@Maya Chen");
			await input.fill("Please /sum");
			await expectLocator(
				page
					.locator('[data-slot="composer-list"]')
					.getByRole("option", { name: "Summarize" })
			).toBeVisible();
			await input.press("Enter");
			await expectLocator(
				example.getByRole("status", { name: "Message result" })
			).toHaveText("Action: Summarize");
			await expectLocator(input).toHaveText("Please ");
			expect(errors).toEqual([]);
			await page.close();
		}
	);
	it("preserves structured clipboard data and ignores pasted HTML", async () => {
		const page = await openComposer("light");
		const input = await insertMaya(page);
		const copied = await input.evaluate((el) => {
			const range = document.createRange();
			range.selectNodeContents(el);
			const selection = window.getSelection();
			selection?.removeAllRanges();
			selection?.addRange(range);
			const clipboard = new DataTransfer();
			el.dispatchEvent(
				new ClipboardEvent("copy", {
					bubbles: true,
					cancelable: true,
					clipboardData: clipboard,
				})
			);
			return {
				structured: clipboard.getData("application/x-mizen-composer"),
				text: clipboard.getData("text/plain"),
			};
		});
		expect(copied.text).toContain("@Maya Chen");
		expect(JSON.parse(copied.structured)).toContainEqual(
			expect.objectContaining({ id: "maya", kind: "person", type: "mention" })
		);
		await input.fill("");
		await input.evaluate((el, data) => {
			const clipboard = new DataTransfer();
			clipboard.setData("application/x-mizen-composer", data);
			el.dispatchEvent(
				new ClipboardEvent("paste", {
					bubbles: true,
					cancelable: true,
					clipboardData: clipboard,
				})
			);
		}, copied.structured);
		await expectLocator(
			page.locator('#ComposerMentionsExample [data-composer-token="mention"]')
		).toHaveAttribute("data-id", "maya");
		await input.fill("");
		await input.evaluate((el) => {
			const clipboard = new DataTransfer();
			clipboard.setData("text/plain", "<img src=x onerror=alert(1)>");
			clipboard.setData("text/html", "<img src=x onerror=alert(1)>");
			clipboard.setData("application/x-mizen-composer", '[{"type":"unknown"}]');
			el.dispatchEvent(
				new ClipboardEvent("paste", {
					bubbles: true,
					cancelable: true,
					clipboardData: clipboard,
				})
			);
		});
		await expectLocator(input).toHaveText("<img src=x onerror=alert(1)>");
		await expectLocator(input.locator("img")).toHaveCount(0);
		await page.close();
	});
	it("keeps one native form, canonical FormData, and reset behavior", async () => {
		const page = await openComposer("light", 1280, fixtures);
		const example = page.locator("#ComposerNestedFormExample");
		const input = example.getByRole("textbox", { name: "Saved message" });
		await expectLocator(example.locator("form")).toHaveCount(1);
		await input.fill("Edited notes");
		await input.press("Enter");
		await expectLocator(
			example.getByRole("status", { name: "Message result" })
		).toBeEmpty();
		await example.getByRole("button", { name: "Save message" }).click();
		await expectLocator(
			example.getByRole("status", { name: "Message result" })
		).toContainText("Edited notes");
		await example
			.locator("form")
			.evaluate((form) => (form as HTMLFormElement).reset());
		await expectLocator(input).toHaveValue("Meeting notes");
		await page.close();
	});
	it("separates sending, read-only, disabled, and loading suggestion states", async () => {
		const page = await openComposer("dark", 1280, fixtures);
		const states = page.locator("#ComposerStatesExample");
		await states
			.getByRole("textbox", { name: "Sending draft" })
			.fill("Still editable");
		await expectLocator(
			states.getByRole("textbox", { name: "Read-only draft" })
		).toHaveAttribute("aria-readonly", "true");
		await expectLocator(
			states.getByRole("textbox", { name: "Disabled draft" })
		).toHaveAttribute("aria-disabled", "true");
		expect(
			await states
				.locator('[data-slot="composer-submit"]')
				.evaluateAll(
					(buttons) =>
						buttons.filter(
							(button) =>
								(button as HTMLButtonElement).disabled ||
								button.getAttribute("aria-disabled") === "true"
						).length
				)
		).toBe(3);
		const loading = page
			.locator("#ComposerSuggestionsStatesExample")
			.getByRole("textbox", { name: "Searching mentions" });
		await loading.click();
		await loading.pressSequentially("@zz");
		await expectLocator(
			page.locator('[data-slot="composer-status"]')
		).toContainText("Searching teammates");
		await loading.press("Enter");
		await expectLocator(loading).toHaveText("@zz");
		await loading.press("Escape");
		await expectLocator(
			page.locator('[data-slot="composer-popup"][data-open]')
		).toHaveCount(0);
		await page.close();
	});
	it("waits for IME composition to finish before submitting a draft", async () => {
		const page = await openComposer("light");
		const example = page.locator("#ComposerMentionsExample");
		const input = example.getByRole("textbox", { name: "Team message" });
		await input.fill("你好");
		await input.dispatchEvent("compositionstart", { data: "你好" });
		await input.press("Enter");
		await expectLocator(input).toHaveText("你好");
		await expectLocator(
			example.getByRole("status", { name: "Message result" })
		).toBeEmpty();
		await input.dispatchEvent("compositionend", { data: "你好" });
		await input.press("Enter");
		await expectLocator(
			example.getByRole("status", { name: "Message result" })
		).toContainText("Sent: 你好");
		await page.close();
	});
	it.each(["light", "dark"] as const)(
		"keeps adaptive controls and long drafts usable at narrow widths in %s",
		async (theme) => {
			const page = await openComposer(theme, 360);
			const example = page.locator("#ComposerAdaptiveExample");
			const frame = example.locator('[data-slot="composer"]');
			const input = example.getByRole("textbox", { name: "Quick message" });
			await input.fill("Hi");
			await expectLocator(frame).not.toHaveAttribute("data-multiline");
			await input.fill("Long text ".repeat(80));
			await expectLocator(frame).toHaveAttribute("data-multiline", "");
			const fits = await frame.evaluate((el) => {
				const viewport = el.querySelector('[data-slot="composer-viewport"]');
				const actions = el.querySelector('[data-slot="composer-actions"]');
				if (!(viewport && actions)) {
					return false;
				}
				const bounds = el.getBoundingClientRect();
				return (
					viewport.clientHeight <= window.innerHeight / 2 &&
					actions.getBoundingClientRect().bottom <= bounds.bottom &&
					el.scrollWidth <= el.clientWidth
				);
			});
			expect(fits).toBe(true);
			await frame.screenshot({
				path: `/private/tmp/mizen-composer-adaptive-${theme}.png`,
			});
			await input.fill("Hi");
			await expectLocator(frame).not.toHaveAttribute("data-multiline");
			await page.close();
		}
	);
	it("groups models by provider and shows the chosen icon on the trigger", async () => {
		const page = await openComposer("light");
		const example = page.locator("#ProjectPromptComposer");
		await example.getByRole("button", { name: MODEL }).click();
		const menu = page.getByRole("menu");
		await expectLocator(
			menu.getByText("OpenAI", { exact: true })
		).toBeVisible();
		await menu
			.getByRole("menuitemradio", { exact: true, name: "GPT-6 Astra" })
			.click();
		const trigger = example.getByRole("button", { name: MODEL });
		await expectLocator(trigger).toContainText("GPT-6 Astra");
		await expectLocator(trigger.locator("svg").first()).toBeVisible();
		await example.getByRole("button", { name: PERMISSIONS }).click();
		await expectLocator(
			page.getByRole("menuitem", { name: "Learn more" })
		).toHaveAttribute("href", "/docs/components/approval-card");
		await page.close();
	});
	it("sets the chosen model's effort from its row, and keeps it valid across models", async () => {
		const page = await openComposer("light");
		const example = page.locator("#ProjectPromptComposer");
		const trigger = example.getByRole("button", { name: MODEL });
		await expectLocator(trigger).toContainText("Claude Opus 5.5 · High");
		await trigger.click();
		await page.locator('[data-slot="composer-picker-effort"]').hover();
		await page
			.getByRole("menu", { name: "Effort" })
			.or(page.locator('[data-slot="menu-sub-content"]'))
			.getByRole("menuitemradio", { name: "Max" })
			.click();
		await expectLocator(trigger).toContainText("Claude Opus 5.5 · Max");
		// Gemini has no Max, so the level falls back to Medium.
		await trigger.click();
		await page.getByRole("menuitemradio", { name: "Gemini 4 Argon" }).click();
		await expectLocator(trigger).toContainText("Gemini 4 Argon · Medium");
		await page.close();
	});
	it("opens the context card with counts, the breakdown, and the total", async () => {
		const page = await openComposer("light");
		const meter = page
			.locator("#ProjectPromptComposer")
			.getByRole("button", { name: "57% context" });
		await meter.hover();
		const card = page.locator('[data-slot="popover-popup"]');
		await expectLocator(card).toContainText("114K / 200K");
		await expectLocator(card.getByRole("progressbar")).toHaveAttribute(
			"aria-valuenow",
			"57"
		);
		await expectLocator(card).toContainText("Reasoning");
		await expectLocator(card).toContainText("$0.70");
		await page.close();
	});
	it("toggles dictation and lets the app fill the draft", async () => {
		const page = await openComposer("light");
		const example = page.locator("#ProjectPromptComposer");
		const mic = example.getByRole("button", { name: "Dictate" });
		await expectLocator(mic).toHaveAttribute("aria-pressed", "false");
		await mic.click();
		await expectLocator(mic).toHaveAttribute("aria-pressed", "true");
		await expectLocator(
			example.getByRole("textbox", { name: "Ask about this project" })
		).toHaveValue(DICTATED);
		await mic.click();
		await expectLocator(mic).toHaveAttribute("aria-pressed", "false");
		await page.close();
	});
	it("moves the light around the rim while the agent works", async () => {
		const page = await browser.newPage();
		await page.goto(`${handle.url}${docsPage}`, { waitUntil: "networkidle" });
		const example = page.locator("#ComposerWorkingExample");
		await expectLocator(
			example.locator('[data-slot="composer"]')
		).toHaveAttribute("data-working", "");
		const band = example
			.locator('[data-slot="composer-glow"] > span > span')
			.first();
		expect(
			await band.evaluate((el) => getComputedStyle(el).animationPlayState)
		).toBe("running");
		await example.getByRole("button", { name: "Stop" }).click();
		expect(
			await band.evaluate((el) => getComputedStyle(el).animationPlayState)
		).toBe("paused");
		await page.close();
	});
	it("reconciles rejected edits and external replacements without duplicate callbacks", async () => {
		const page = await openComposer("light", 1280, fixtures);
		const input = page.getByRole("textbox", { name: "Regression draft" });
		await page
			.getByRole("button", { exact: true, name: "Reject edits" })
			.click();
		await input.fill("Rejected");
		await expectLocator(input).toHaveText("Initial");
		await expectLocator(page.getByLabel("Owned draft")).toHaveText("Initial");
		await expectLocator(page.getByLabel("Change log")).toHaveText(
			'["input:Rejected"]'
		);
		await page
			.getByRole("button", { exact: true, name: "Replace value" })
			.click();
		await expectLocator(input).toHaveText("External");
		await page
			.getByRole("button", { exact: true, name: "Accept edits" })
			.click();
		await input.fill("Accepted");
		await expectLocator(page.getByLabel("Owned draft")).toHaveText("Accepted");
		await expectLocator(page.getByLabel("Change log")).toHaveText(
			'["input:Rejected","input:Accepted"]'
		);
		await page.close();
	});
	it("groups typing and separates history after moving the caret", async () => {
		const page = await openComposer("light", 1280, fixtures);
		const input = page.getByRole("textbox", { name: "Regression draft" });
		await input.fill("");
		await input.pressSequentially("abc");
		await input.press("ControlOrMeta+z");
		await expectLocator(input).toBeEmpty();
		await input.press("ControlOrMeta+Shift+z");
		await expectLocator(input).toHaveText("abc");
		await input.press("ArrowLeft");
		await input.pressSequentially("X");
		await input.press("ControlOrMeta+z");
		await expectLocator(input).toHaveText("abc");
		await page.close();
	});
	it("preserves backward selections across tokens through cut and undo", async () => {
		const page = await openComposer("light", 1280, fixtures);
		await page.getByRole("button", { exact: true, name: "Load token" }).click();
		const input = page.getByRole("textbox", { name: "Regression draft" });
		await input.focus();
		await input.evaluate((element) => {
			const first = element.firstChild;
			const last = element.lastChild;
			if (!(first && last)) {
				throw new Error("Missing draft nodes");
			}
			getSelection()?.setBaseAndExtent(last, 1, first, 1);
			const data = new DataTransfer();
			element.dispatchEvent(
				new ClipboardEvent("cut", {
					bubbles: true,
					cancelable: true,
					clipboardData: data,
				})
			);
		});
		await expectLocator(input).toHaveText("A");
		await input.press("ControlOrMeta+z");
		await expectLocator(page.getByLabel("Owned draft")).toHaveText("A😀@mayaZ");
		await expectLocator(input.locator("[data-composer-token]")).toHaveAttribute(
			"data-id",
			"maya"
		);
		expect(
			await input.evaluate(() => {
				const selection = getSelection();
				return [
					selection?.anchorNode?.textContent,
					selection?.anchorOffset,
					selection?.focusNode?.textContent,
					selection?.focusOffset,
				];
			})
		).toEqual(["Z", 1, "A😀", 1]);
		await page.close();
	});
	it("commits IME once and lets an external replacement win during composition", async () => {
		const page = await openComposer("light", 1280, fixtures);
		const input = page.getByRole("textbox", { name: "Regression draft" });
		await input.focus();
		await input.dispatchEvent("compositionstart", { data: "" });
		await input.evaluate((element) => {
			element.textContent = "你好😀";
			element.dispatchEvent(
				new InputEvent("input", {
					bubbles: true,
					inputType: "insertCompositionText",
					isComposing: true,
				})
			);
		});
		await expectLocator(page.getByLabel("Owned draft")).toHaveText("Initial");
		await input.dispatchEvent("compositionend", { data: "你好😀" });
		await expectLocator(page.getByLabel("Change log")).toHaveText(
			'["input:你好😀"]'
		);
		await input.dispatchEvent("compositionstart", { data: "" });
		await input.evaluate((element) => {
			element.textContent = "未完成";
		});
		await page
			.getByRole("button", { exact: true, name: "Replace value" })
			.evaluate((button) => (button as HTMLButtonElement).click());
		await expectLocator(input).toHaveText("未完成");
		await input.dispatchEvent("compositionend", { data: "未完成" });
		await expectLocator(input).toHaveText("External");
		await expectLocator(page.getByLabel("Change log")).toHaveText(
			'["input:你好😀"]'
		);
		await page.close();
	});
	it("binds reset to remounted inputs and honors cancellation", async () => {
		const page = await openComposer("light", 1280, fixtures);
		const input = page.getByRole("textbox", { name: "Regression draft" });
		await input.fill("Changed");
		await page
			.getByRole("button", { exact: true, name: "Toggle input" })
			.click();
		await expectLocator(input).toHaveCount(0);
		await page
			.getByRole("button", { exact: true, name: "Toggle input" })
			.click();
		await expectLocator(input).toHaveText("Changed");
		await page
			.getByRole("button", { name: "Toggle reset cancellation" })
			.click();
		await page.getByRole("button", { name: "Reset regression draft" }).click();
		await expectLocator(input).toHaveText("Changed");
		await page
			.getByRole("button", { name: "Toggle reset cancellation" })
			.click();
		await page.getByRole("button", { name: "Reset regression draft" }).click();
		await expectLocator(input).toHaveText("Initial");
		await expectLocator(page.getByLabel("Change log")).toHaveText(
			'["input:Changed","reset:Initial"]'
		);
		await page.getByRole("button", { name: "Toggle input mode" }).click();
		await input.fill("Native");
		await page.getByRole("button", { name: "Reset regression draft" }).click();
		await expectLocator(input).toHaveValue("Initial");
		await page.close();
	});
	it("dismisses suggestions until the query changes and navigates options", async () => {
		const page = await openComposer("light", 1280, fixtures);
		const input = page.getByRole("textbox", { name: "Regression draft" });
		await input.fill("@ma");
		await expectLocator(
			page.getByRole("option", { exact: true, name: "Maya" })
		).toBeVisible();
		await input.press("Escape");
		await expectLocator(page.getByRole("listbox")).toHaveCount(0);
		await input.pressSequentially("x");
		await expectLocator(
			page.getByRole("option", { exact: true, name: "Max" })
		).toBeVisible();
		await input.press("Backspace");
		await input.press("ArrowDown");
		await input.press("Enter");
		await expectLocator(input.locator("[data-composer-token]")).toHaveAttribute(
			"data-id",
			"max"
		);
		await page.close();
	});
	it("replaces an input during composition without leaving editing suspended", async () => {
		const page = await openComposer("light", 1280, fixtures);
		const input = page.getByRole("textbox", { name: "Regression draft" });
		await input.focus();
		await input.dispatchEvent("compositionstart", { data: "" });
		await input.evaluate((element) => {
			element.textContent = "未完成";
		});
		await page
			.getByRole("button", { name: "Toggle input mode" })
			.evaluate((button) => (button as HTMLButtonElement).click());
		await expectLocator(input).toHaveValue("Initial");
		await input.fill("Next");
		await expectLocator(page.getByLabel("Owned draft")).toHaveText("Next");
		await expectLocator(page.getByLabel("Change log")).toHaveText(
			'["input:Next"]'
		);
		await page.close();
	});
	it("retains native textarea undo and redo", async () => {
		const page = await openComposer("light", 1280, fixtures);
		await page.evaluate(() => {
			const reference = document.createElement("textarea");
			reference.setAttribute("aria-label", "Native reference");
			document.body.append(reference);
			reference.value = "Initial";
		});
		const reference = page.getByRole("textbox", { name: "Native reference" });
		await reference.focus();
		await reference.press("End");
		await reference.press("x");
		await reference.press("ControlOrMeta+z");
		const nativeUndo = await reference.inputValue();
		expect(nativeUndo).toBe("Initial");
		await reference.press("ControlOrMeta+Shift+z");
		await expectLocator(reference).toHaveValue("Initialx");
		await page.getByRole("button", { name: "Toggle input mode" }).click();
		const input = page.getByRole("textbox", { name: "Regression draft" });
		await input.focus();
		await input.press("End");
		await input.press("x");
		await input.press("ControlOrMeta+z");
		await expectLocator(input).toHaveValue(nativeUndo);
		await expectLocator(page.getByLabel("Owned draft")).toHaveText(nativeUndo);
		await input.press("ControlOrMeta+Shift+z");
		await expectLocator(input).toHaveValue("Initialx");
		await expectLocator(page.getByLabel("Owned draft")).toHaveText("Initialx");
		await page.close();
	});
	it("discards the redo branch after a new rich edit", async () => {
		const page = await openComposer("light", 1280, fixtures);
		const input = page.getByRole("textbox", { name: "Regression draft" });
		await input.fill("First");
		await input.fill("Second");
		await input.press("ControlOrMeta+z");
		await expectLocator(input).toHaveText("First");
		await input.pressSequentially(" branch");
		const branched = await input.textContent();
		await input.press("ControlOrMeta+Shift+z");
		await expectLocator(input).toHaveText(branched ?? "");
		await page.close();
	});
});
