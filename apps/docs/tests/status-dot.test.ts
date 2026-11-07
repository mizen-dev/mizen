import type { StatusDotProps } from "@mizen-labs/ui/status-dot";
import { type Browser, chromium, type Page } from "playwright";
import type { ComponentPropsWithRef, RefObject } from "react";
import { createElement, createRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { StatusDot } from "../../../packages/ui/src/components/status-dot/status-dot";
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
	keyframes: () => "keyframes",
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

type Exact<Actual, Expected> = [Actual] extends [Expected]
	? [Expected] extends [Actual]
		? true
		: false
	: false;
type FixedProps<Props> = Exact<
	Exclude<keyof ComponentPropsWithRef<"span">, keyof Props>,
	| "aria-label"
	| "children"
	| "className"
	| "dangerouslySetInnerHTML"
	| "role"
	| "style"
>;
type Accepts<Props, Key extends PropertyKey> = Key extends keyof Props
	? true
	: false;
type Requires<Props, Key extends keyof Props> =
	object extends Pick<Props, Key> ? false : true;

const variants = ["success", "warning", "error", "accent", "neutral"] as const;
const transparentColor = /transparent|rgba\(0, 0, 0, 0\)/;
const contractChecks = [
	true satisfies FixedProps<StatusDotProps>,
	false satisfies Accepts<StatusDotProps, "children">,
	false satisfies Accepts<StatusDotProps, "pulse">,
	false satisfies Accepts<StatusDotProps, "tooltip">,
	false satisfies Accepts<StatusDotProps, "icon">,
	false satisfies Accepts<StatusDotProps, "size">,
	false satisfies Accepts<StatusDotProps, "render">,
	false satisfies Accepts<StatusDotProps, "className">,
	false satisfies Accepts<StatusDotProps, "style">,
	false satisfies Accepts<StatusDotProps, "dangerouslySetInnerHTML">,
	true satisfies Accepts<StatusDotProps, "ref">,
	true satisfies Requires<StatusDotProps, "variant">,
	true satisfies Requires<StatusDotProps, "label">,
] as const;

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const SERVICE_STATES_EXAMPLE =
	'[aria-label="Status dot: Service states example"]';
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
		throw new AggregateError(
			failures,
			"Failed to tear down the status dot test"
		);
	}
}

async function gotoStatusDot(width = 375, height = 812): Promise<void> {
	await page.setViewportSize({ height, width });
	await page.goto(`${handle.url}/components/status-dot`, {
		waitUntil: "networkidle",
	});
}

function measureStatusDotContrasts(
	browserPage: Page
): Promise<readonly number[]> {
	return browserPage
		.locator(`${SERVICE_STATES_EXAMPLE} [data-slot="status-dot"]`)
		.evaluateAll((nodes) => {
			type Color = readonly [number, number, number, number];
			const canvas = document.createElement("canvas");
			canvas.width = 1;
			canvas.height = 1;
			const context = canvas.getContext("2d");
			if (!context) {
				throw new Error("Canvas 2D context is unavailable");
			}

			const readColor = (cssColor: string): Color => {
				context.clearRect(0, 0, 1, 1);
				context.fillStyle = cssColor;
				context.fillRect(0, 0, 1, 1);
				const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;
				return [red ?? 0, green ?? 0, blue ?? 0, alpha ?? 0];
			};
			const luminance = (color: Color): number => {
				const linearize = (channel: number): number => {
					const normalized = channel / 255;
					return normalized <= 0.039_28
						? normalized / 12.92
						: ((normalized + 0.055) / 1.055) ** 2.4;
				};
				return (
					0.2126 * linearize(color[0]) +
					0.7152 * linearize(color[1]) +
					0.0722 * linearize(color[2])
				);
			};
			const findSurface = (node: Element): Color => {
				let ancestor = node.parentElement;
				while (ancestor) {
					const surface = readColor(getComputedStyle(ancestor).backgroundColor);
					if (surface[3] > 0) {
						return surface;
					}
					ancestor = ancestor.parentElement;
				}
				return [255, 255, 255, 255];
			};

			return nodes.map((node) => {
				const dot = luminance(
					readColor(getComputedStyle(node).backgroundColor)
				);
				const surface = luminance(findSurface(node));
				return (
					(Math.max(dot, surface) + 0.05) / (Math.min(dot, surface) + 0.05)
				);
			});
		});
}

describe("StatusDot component contract", () => {
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

	it("resolves root and subpath exports with a fixed prop contract", () => {
		expect(import.meta.resolve("@mizen-labs/ui")).toContain(
			"packages/ui/dist/index.js"
		);
		expect(import.meta.resolve("@mizen-labs/ui/status-dot")).toContain(
			"packages/ui/dist/components/status-dot/status-dot.js"
		);
		expect(contractChecks).toEqual([
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
			true,
			true,
			true,
		]);
	});

	it("renders a protected accessible span without children", () => {
		const ref: RefObject<HTMLSpanElement | null> = createRef<HTMLSpanElement>();
		const statusDotProps = {
			"data-slot": "custom-status-dot",
			label: "Healthy",
			ref,
			variant: "success" as const,
		};
		const markup = renderToStaticMarkup(
			createElement(StatusDot, statusDotProps)
		);
		expect(markup).toContain("<span");
		expect(markup).toContain('data-slot="status-dot"');
		expect(markup).not.toContain('data-slot="custom-status-dot"');
		expect(markup).toContain('role="img"');
		expect(markup).toContain('aria-label="Healthy"');
	});

	it("accepts every documented semantic variant", () => {
		for (const variant of variants) {
			const markup = renderToStaticMarkup(
				createElement(StatusDot, { label: variant, variant })
			);
			expect(markup).toContain('data-slot="status-dot"');
			expect(markup).toContain(`aria-label="${variant}"`);
		}
	});

	it("uses an eight-pixel semantic dot with token-backed color", async () => {
		await gotoStatusDot(1280, 900);
		const style = await page
			.locator('[data-slot="component-preview"] [data-slot="status-dot"]')
			.first()
			.evaluate((node) => {
				const computed = getComputedStyle(node);
				return {
					backgroundColor: computed.backgroundColor,
					height: computed.height,
					width: computed.width,
				};
			});
		expect(style).toEqual({
			backgroundColor: expect.not.stringMatching(transparentColor),
			height: "8px",
			width: "8px",
		});
	});

	it("keeps every status dot readable against its rendered surface", async () => {
		await gotoStatusDot(1280, 900);
		const contrasts = await measureStatusDotContrasts(page);
		expect(contrasts.length).toBe(5);
		for (const contrast of contrasts) {
			expect(contrast).toBeGreaterThanOrEqual(3);
		}
	});

	it("fits a narrow viewport without horizontal overflow", async () => {
		await gotoStatusDot();
		const widths = await page.evaluate(() => [
			document.body.scrollWidth,
			document.body.clientWidth,
		]);
		expect(widths[0]).toBe(widths[1]);
	});
});
