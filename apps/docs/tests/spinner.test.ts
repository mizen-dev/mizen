import type { SpinnerProps } from "@mizen-labs/ui/spinner";
import { type Browser, chromium, type Page } from "playwright";
import type { ComponentPropsWithRef, RefObject } from "react";
import { createElement, createRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it, vi } from "vite-plus/test";
import { Spinner } from "../../../packages/ui/src/components/spinner/spinner";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

vi.mock("@stylexjs/stylex", () => ({
	create: (styles: unknown) => styles,
	defineConsts: (constants: unknown) => constants,
	defineMarker: () => ({}),
	defineVars: (vars: unknown) => vars,
	keyframes: (frames: unknown) => frames,
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

type Exact<Actual, Expected> = [Actual] extends [Expected]
	? [Expected] extends [Actual]
		? true
		: false
	: false;
type FixedProps<Props> = Exact<
	Exclude<keyof ComponentPropsWithRef<"svg">, keyof Props>,
	| "children"
	| "className"
	| "dangerouslySetInnerHTML"
	| "fill"
	| "focusable"
	| "height"
	| "role"
	| "style"
	| "viewBox"
	| "width"
>;
type Accepts<Props, Key extends PropertyKey> = Key extends keyof Props
	? true
	: false;

const contractChecks = [
	true satisfies FixedProps<SpinnerProps>,
	false satisfies Accepts<SpinnerProps, "children">,
	false satisfies Accepts<SpinnerProps, "role">,
	true satisfies Accepts<SpinnerProps, "aria-label">,
	true satisfies Accepts<SpinnerProps, "variant">,
	false satisfies Accepts<SpinnerProps, "size">,
	false satisfies Accepts<SpinnerProps, "shade">,
	false satisfies Accepts<SpinnerProps, "label">,
	false satisfies Accepts<SpinnerProps, "className">,
	false satisfies Accepts<SpinnerProps, "style">,
	false satisfies Accepts<SpinnerProps, "dangerouslySetInnerHTML">,
	false satisfies Accepts<SpinnerProps, "fill">,
	false satisfies Accepts<SpinnerProps, "focusable">,
	false satisfies Accepts<SpinnerProps, "height">,
	false satisfies Accepts<SpinnerProps, "viewBox">,
	false satisfies Accepts<SpinnerProps, "width">,
	true satisfies Accepts<SpinnerProps, "ref">,
] as const;
const transparentColor = /transparent|rgba\(0, 0, 0, 0\)/u;

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
let handle: TestServerHandle;
let browser: Browser;
let page: Page;

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
		throw new AggregateError(failures, "Failed to tear down the spinner test");
	}
}

async function gotoSpinner(width = 375, height = 812): Promise<void> {
	await page.setViewportSize({ height, width });
	await page.goto(`${handle.url}/components/spinner`, {
		waitUntil: "networkidle",
	});
}

describe("Spinner component contract", () => {
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
		const results = await Promise.allSettled([
			Promise.resolve().then(() => browser?.close()),
			Promise.resolve().then(() => teardownTestServer(handle)),
		]);
		throwTeardownFailures(results);
	}, 120_000);

	it("resolves root and subpath exports with a closed SVG prop contract", () => {
		expect(import.meta.resolve("@mizen-labs/ui")).toContain(
			"packages/ui/dist/index.js"
		);
		expect(import.meta.resolve("@mizen-labs/ui/spinner")).toContain(
			"packages/ui/dist/components/spinner/spinner.js"
		);
		expect(contractChecks).toEqual([
			true,
			false,
			false,
			true,
			true,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			true,
		]);
	});

	it("names the status, accepts a custom label, and turns decorative when hidden", () => {
		const named = renderToStaticMarkup(
			createElement(Spinner, { "aria-label": "Thinking" })
		);
		expect(named).toContain('aria-label="Thinking"');
		expect(named).toContain('role="status"');
		expect(
			renderToStaticMarkup(createElement(Spinner, { variant: "typing" }))
		).toContain('aria-label="Typing"');
		expect(
			renderToStaticMarkup(createElement(Spinner, { variant: "thinking" }))
		).toContain('aria-label="Thinking"');
		const hidden = renderToStaticMarkup(
			createElement(Spinner, { "aria-hidden": true, "aria-label": "Loading" })
		);
		expect(hidden).toContain('aria-hidden="true"');
		expect(hidden).not.toContain("role=");
		expect(hidden).not.toContain("aria-label");
		expect(() =>
			renderToStaticMarkup(createElement(Spinner, { "aria-label": " " }))
		).toThrow(TypeError);
	});

	it("slides the thinking dots through one gap and holds still under reduced motion", async () => {
		await gotoSpinner(1280, 900);
		const thinking = page.locator(
			'[data-slot="spinner"][data-variant="thinking"]'
		);
		expect(await thinking.getAttribute("aria-label")).toBe("Thinking");
		const animated = await thinking
			.locator("circle")
			.evaluateAll((elements) =>
				elements.map(
					(element) => getComputedStyle(element).animationName !== "none"
				)
			);
		// Seven ring dots move; the centre dot holds still.
		expect(animated).toEqual([true, true, true, true, true, true, true, false]);

		const reducedPage = await browser.newPage({ reducedMotion: "reduce" });
		reducedPage.setDefaultTimeout(6000);
		await reducedPage.goto(`${handle.url}/components/spinner`, {
			waitUntil: "networkidle",
		});
		const still = await reducedPage
			.locator('[data-slot="spinner"][data-variant="thinking"] circle')
			.evaluateAll((elements) =>
				elements.map((element) => {
					const style = getComputedStyle(element);
					return `${style.animationName} ${style.opacity}`;
				})
			);
		expect(new Set(still)).toEqual(new Set(["none 0.7"]));
		await reducedPage.close();
	});

	it("staggers the typing dots and holds them still under reduced motion", async () => {
		await gotoSpinner(1280, 900);
		const typing = page.locator('[data-slot="spinner"][data-variant="typing"]');
		const dots = () =>
			typing.locator("circle").evaluateAll((elements) =>
				elements.map((element) => {
					const style = getComputedStyle(element);
					return [style.animationName !== "none", style.animationDelay];
				})
			);
		expect(await dots()).toEqual([
			[true, "0s"],
			[true, "0.1s"],
			[true, "0.2s"],
		]);
		expect(
			await typing.evaluate((node) => getComputedStyle(node).overflow)
		).toBe("visible");

		const reducedPage = await browser.newPage({ reducedMotion: "reduce" });
		reducedPage.setDefaultTimeout(6000);
		await reducedPage.goto(`${handle.url}/components/spinner`, {
			waitUntil: "networkidle",
		});
		const still = await reducedPage
			.locator('[data-slot="spinner"][data-variant="typing"] circle')
			.evaluateAll((elements) =>
				elements.map((element) => {
					const style = getComputedStyle(element);
					return [style.animationName, style.opacity];
				})
			);
		expect(still).toEqual([
			["none", "0.4"],
			["none", "0.7"],
			["none", "1"],
		]);
		await reducedPage.close();
	});

	it("renders a protected SVG status root with the fixed accessible name", () => {
		const ref: RefObject<SVGSVGElement | null> = createRef<SVGSVGElement>();
		const spinnerProps = { "data-slot": "custom-spinner", ref };
		const markup = renderToStaticMarkup(createElement(Spinner, spinnerProps));
		expect(markup).toContain("<svg");
		expect(markup).toContain('data-slot="spinner"');
		expect(markup).not.toContain('data-slot="custom-spinner"');
		expect(markup).toContain('role="status"');
		expect(markup).toContain('aria-label="Loading"');
		expect(markup).toContain("currentColor");
		expect(markup).toContain('viewBox="0 0 24 24"');
	});

	it("chases a bright head round the ring and freezes its trail under reduced motion", async () => {
		await gotoSpinner(1280, 900);
		const animation = await page
			.locator('[data-slot="component-preview"] [data-slot="spinner"]')
			.evaluate((node) => ({
				dots: Array.from(node.querySelectorAll("circle"), (child) => {
					const style = getComputedStyle(child);
					return [style.animationName !== "none", style.animationDelay];
				}),
				root: getComputedStyle(node).animationName,
			}));
		// The glyph holds still; each dot runs 125ms behind the next.
		expect(animation.root).toBe("none");
		expect(animation.dots).toEqual(
			[-1, -0.875, -0.75, -0.625, -0.5, -0.375, -0.25, -0.125].map((delay) => [
				true,
				`${delay}s`,
			])
		);

		const reducedPage = await browser.newPage({ reducedMotion: "reduce" });
		reducedPage.setDefaultTimeout(6000);
		await reducedPage.goto(`${handle.url}/components/spinner`, {
			waitUntil: "networkidle",
		});
		expect(
			await reducedPage
				.locator('[data-slot="component-preview"] [data-slot="spinner"] circle')
				.evaluateAll((elements) =>
					elements.map((element) => {
						const style = getComputedStyle(element);
						return `${style.animationName} ${style.opacity}`;
					})
				)
		).toEqual([
			"none 1",
			"none 0.4",
			"none 0.4",
			"none 0.4",
			"none 0.4",
			"none 0.55",
			"none 0.7",
			"none 0.85",
		]);
		await reducedPage.close();
	});

	it("uses currentColor and fits a narrow viewport", async () => {
		await gotoSpinner();
		const previousFontSize = await page.evaluate(() => {
			const root = document.documentElement;
			const previous = root.style.fontSize;
			root.style.fontSize = "20px";
			return previous;
		});
		try {
			const style = await page
				.locator('[data-slot="component-preview"] [data-slot="spinner"]')
				.evaluate((node) => {
					const computed = getComputedStyle(node);
					return {
						color: computed.color,
						display: computed.display,
						height: computed.height,
						width: computed.width,
					};
				});
			expect(style.color).not.toMatch(transparentColor);
			expect(style.display).not.toBe("inline");
			expect(style.width).toBe("17.5px");
			expect(style.height).toBe("17.5px");
			const widths = await page.evaluate(() => [
				document.body.scrollWidth,
				document.body.clientWidth,
			]);
			expect(widths[0]).toBe(widths[1]);
		} finally {
			await page.evaluate((fontSize) => {
				document.documentElement.style.fontSize = fontSize;
			}, previousFontSize);
		}
	});
	it("renders the supplied eight-dot geometry", async () => {
		await gotoSpinner();
		const spinner = page
			.locator('[data-slot="component-preview"] [data-slot="spinner"]')
			.first();
		const dots = await spinner
			.locator("circle")
			.evaluateAll((elements) =>
				elements.map((el) => [
					el.getAttribute("cx"),
					el.getAttribute("cy"),
					el.getAttribute("r"),
				])
			);
		// The eight ring positions, clockwise from the top.
		expect(dots).toEqual([
			["12", "3", "2.5"],
			["18.36", "5.64", "2.5"],
			["21", "12", "2.5"],
			["18.36", "18.36", "2.5"],
			["12", "21", "2.5"],
			["5.64", "18.36", "2.5"],
			["3", "12", "2.5"],
			["5.64", "5.64", "2.5"],
		]);
		expect(await spinner.getAttribute("fill")).toBe("currentColor");
		expect(await spinner.locator("path").count()).toBe(0);
	});

	it("matches the loading button glyph and animation", async () => {
		await gotoSpinner(1440, 1000);
		const spinner = page
			.locator('[data-slot="component-preview"] [data-slot="spinner"]')
			.first();
		const expected = await spinner.evaluate((element) => {
			const style = getComputedStyle(element);
			return {
				animation: style.animationName,
				duration: style.animationDuration,
				glyph: element.innerHTML,
				height: style.height,
				timing: style.animationTimingFunction,
				width: style.width,
			};
		});
		await page.goto(`${handle.url}/components/button`, {
			waitUntil: "networkidle",
		});
		const indicator = page
			.getByRole("button", { exact: true, name: "Saving" })
			.locator('[data-slot="button-loading-indicator"]');
		const actual = await indicator.evaluate((element) => {
			const style = getComputedStyle(element);
			return {
				animation: style.animationName,
				duration: style.animationDuration,
				glyph: element.innerHTML,
				height: style.height,
				timing: style.animationTimingFunction,
				width: style.width,
			};
		});
		expect(actual).toEqual({ ...expected, height: "16px", width: "16px" });
	});
});
