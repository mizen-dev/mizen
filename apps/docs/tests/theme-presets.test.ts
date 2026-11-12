import { readdirSync, readFileSync } from "node:fs";
import { type Browser, chromium, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

// A preset is a theme file `mizen init --preset` writes into an app. Each one
// sets only tokens the stylesheet lets an app replace, and keeps text
// readable on the fills it changes, in both themes.
const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
const presetDirectory = new URL(
	"../../../packages/cli/presets/",
	import.meta.url
);
const presets = readdirSync(presetDirectory).map((file) => ({
	css: readFileSync(new URL(file, presetDirectory), "utf8"),
	name: file.replace(".css", ""),
}));
const stylesheet = readFileSync(
	new URL("../../../packages/ui/dist/styles.css", import.meta.url),
	"utf8"
);
const DECLARED = /(?<name>--mizen-[\da-z-]+)\s*:/gu;
// Text token, then the fill it sits on.
const pairs = [
	["primary-content", "primary"],
	["accent-content", "accent"],
	["content", "selected"],
	["success-content", "success"],
	["warning-content", "warning"],
	["info-content", "info"],
	["destructive-text", "destructive-subtle"],
	["destructive-text", "surface"],
] as const;

let handle: TestServerHandle;
let browser: Browser;
let page: Page;

async function openButtonPage(theme: "dark" | "light", css?: string) {
	await page.evaluate(
		(value) => localStorage.setItem("mizen-theme", value),
		theme
	);
	await page.goto(`${handle.url}/docs/components/button`, {
		waitUntil: "networkidle",
	});
	if (css) {
		await page.addStyleTag({ content: css });
	}
}

// WCAG contrast of each pair, as an application-owned element resolves them.
function contrasts() {
	return page.evaluate((list) => {
		const canvas = document.createElement("canvas");
		canvas.width = 1;
		canvas.height = 1;
		const context = canvas.getContext("2d", { willReadFrequently: true });
		if (!context) {
			throw new Error("Canvas 2D context is unavailable");
		}
		const probe = document.createElement("div");
		document.body.append(probe);
		const luminance = (token: string): number => {
			probe.style.color = `var(--mizen-color-${token})`;
			context.clearRect(0, 0, 1, 1);
			context.fillStyle = getComputedStyle(probe).color;
			context.fillRect(0, 0, 1, 1);
			const [red = 0, green = 0, blue = 0] = context.getImageData(
				0,
				0,
				1,
				1
			).data;
			const [r, g, b] = [red, green, blue].map((channel) => {
				const value = channel / 255;
				return value <= 0.039_28
					? value / 12.92
					: ((value + 0.055) / 1.055) ** 2.4;
			});
			return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
		};
		const result = list.map(([text, fill]) => {
			const [light, dark] = [luminance(text), luminance(fill)].sort(
				(a, b) => b - a
			);
			return {
				pair: `${text} on ${fill}`,
				ratio: ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05),
			};
		});
		probe.remove();
		return result;
	}, pairs);
}

function buttonFill(name: string) {
	return page
		.getByRole("button", { exact: true, name })
		.first()
		.evaluate((button) => getComputedStyle(button, "::before").backgroundColor);
}

describe("Theme presets", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		page.setDefaultTimeout(6000);
		await page.goto(`${handle.url}/docs/components/button`, {
			waitUntil: "networkidle",
		});
	}, 120_000);

	afterAll(async () => {
		await Promise.all([browser?.close(), teardownTestServer(handle)]);
	}, 120_000);

	it.each(presets)(
		"$name sets only tokens an application can replace",
		({ css }) => {
			const names = [...css.matchAll(DECLARED)].map(
				(match) => match.groups?.name ?? ""
			);
			expect(names.length).toBeGreaterThan(0);
			expect(
				names.filter((name) => !stylesheet.includes(`:var(${name})`))
			).toEqual([]);
		}
	);

	it.each(
		presets.flatMap((preset) =>
			(["light", "dark"] as const).map((theme) => ({ ...preset, theme }))
		)
	)(
		"$name keeps text readable on its fills in the $theme theme",
		async ({ css, theme }) => {
			await openButtonPage(theme, css);
			expect((await contrasts()).filter(({ ratio }) => ratio < 4.5)).toEqual(
				[]
			);
		}
	);

	it("vivid fills the primary action with the accent", async () => {
		const vivid = presets.find(({ name }) => name === "vivid");
		await openButtonPage("light");
		expect(await buttonFill("Default")).not.toBe(await buttonFill("Brand"));
		await page.addStyleTag({ content: vivid?.css ?? "" });
		await expect
			.poll(() => buttonFill("Default"))
			.toBe(await buttonFill("Brand"));
	});
});
