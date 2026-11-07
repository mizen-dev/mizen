import type { BadgeProps } from "@mizen-labs/ui/badge";
import { type Browser, chromium, type Locator, type Page } from "playwright";
import type { ComponentPropsWithRef, RefObject } from "react";
import { createElement, createRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Badge } from "../../../packages/ui/src/components/badge/badge";
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
type ClosedProps<Props> = Exact<
	Exclude<keyof ComponentPropsWithRef<"span">, keyof Props>,
	"className" | "style"
>;
type Accepts<Props, Key extends PropertyKey> = Key extends keyof Props
	? true
	: false;

const variants = [
	"default",
	"destructive",
	"info",
	"outline",
	"secondary",
	"success",
	"warning",
	"brand",
] as const;
const sizes = ["default", "sm", "lg"] as const;
const transparentColor = /transparent|rgba\(0, 0, 0, 0\)/;

const contractChecks = [
	true satisfies ClosedProps<BadgeProps>,
	false satisfies Accepts<BadgeProps, "className">,
	false satisfies Accepts<BadgeProps, "style">,
	true satisfies Accepts<BadgeProps, "children">,
	true satisfies Accepts<BadgeProps, "variant">,
	true satisfies Accepts<BadgeProps, "size">,
	true satisfies Accepts<BadgeProps, "render">,
	true satisfies Accepts<BadgeProps, "ref">,
] as const;

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
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
		throw new AggregateError(failures, "Failed to tear down the badge test");
	}
}

async function gotoBadge(width = 375, height = 812): Promise<void> {
	await page.setViewportSize({ height, width });
	await page.goto(`${handle.url}/components/badge`, {
		waitUntil: "networkidle",
	});
}

function measureTextContrast(locator: Locator): Promise<number> {
	return locator.evaluate((node) => {
		const canvas = document.createElement("canvas");
		canvas.width = 1;
		canvas.height = 1;
		const context = canvas.getContext("2d");
		if (!context) {
			throw new Error("Canvas 2D context is unavailable");
		}

		const readColor = (cssColor: string): readonly [number, number, number] => {
			context.clearRect(0, 0, 1, 1);
			context.fillStyle = cssColor;
			context.fillRect(0, 0, 1, 1);
			const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
			return [red ?? 0, green ?? 0, blue ?? 0];
		};
		const luminance = (color: readonly [number, number, number]): number => {
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
		const computed = getComputedStyle(
			node.closest('[data-slot="badge"]') ?? node
		);
		const foreground = luminance(readColor(computed.color));
		const background = luminance(readColor(computed.backgroundColor));
		return (
			(Math.max(foreground, background) + 0.05) /
			(Math.min(foreground, background) + 0.05)
		);
	});
}

describe("Badge component contract", () => {
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

	it("resolves root and subpath exports with a closed prop contract", () => {
		expect(import.meta.resolve("@mizen-labs/ui")).toContain(
			"packages/ui/dist/index.js"
		);
		expect(import.meta.resolve("@mizen-labs/ui/badge")).toContain(
			"packages/ui/dist/components/badge/badge.js"
		);
		expect(contractChecks).toEqual([
			true,
			false,
			false,
			true,
			true,
			true,
			true,
			true,
		]);
	});

	it("renders a protected span root with children and forwards refs", () => {
		const ref: RefObject<HTMLSpanElement | null> = createRef<HTMLSpanElement>();
		const badgeProps = { "data-slot": "custom-badge", ref };
		const markup = renderToStaticMarkup(
			createElement(Badge, badgeProps, "Beta")
		);
		expect(markup).toContain("<span");
		expect(markup).toContain('data-slot="badge"');
		expect(markup).not.toContain('data-slot="custom-badge"');
		expect(markup).toContain("Beta");
	});

	it("accepts every documented variant and size", () => {
		for (const variant of variants) {
			const markup = renderToStaticMarkup(
				createElement(Badge, { variant }, variant)
			);
			expect(markup).toContain('data-slot="badge"');
		}
		for (const size of sizes) {
			const markup = renderToStaticMarkup(createElement(Badge, { size }, size));
			expect(markup).toContain('data-slot="badge"');
		}
	});

	it("supports Base UI render polymorphism to a link", () => {
		const markup = renderToStaticMarkup(
			createElement(
				Badge,
				{
					render: createElement("a", { href: "/status" }),
				},
				"Read more"
			)
		);
		expect(markup).toContain("<a");
		expect(markup).toContain('href="/status"');
		expect(markup).toContain("Read more");
	});

	it("protects the badge slot when the render element supplies one", () => {
		const markup = renderToStaticMarkup(
			createElement(
				Badge,
				{
					render: createElement("a", { "data-slot": "custom-badge" }),
				},
				"Review status"
			)
		);
		expect(markup).toContain('data-slot="badge"');
		expect(markup).not.toContain('data-slot="custom-badge"');
	});

	it("uses token-backed styles for the default badge and all documented sizes", async () => {
		await gotoBadge(1280, 900);
		const styles = await page
			.locator('[data-slot="badge"]')
			.evaluateAll((nodes) =>
				nodes.map((node) => {
					const computed = getComputedStyle(node);
					return {
						backgroundColor: computed.backgroundColor,
						borderRadius: computed.borderRadius,
						color: computed.color,
						height: computed.height,
						paddingInline: computed.paddingInline,
					};
				})
			);
		expect(styles.length).toBeGreaterThanOrEqual(3);
		expect(styles[0]).toMatchObject({
			backgroundColor: expect.not.stringMatching(transparentColor),
			color: expect.not.stringMatching(transparentColor),
		});
		expect(Number.parseFloat(styles[0]?.borderRadius ?? "0")).toBeGreaterThan(
			0
		);
		expect(Number.parseFloat(styles[0]?.paddingInline ?? "0")).toBeGreaterThan(
			0
		);
		expect(new Set(styles.map(({ height }) => height)).size).toBeGreaterThan(1);
	});

	it("wraps a long label inside a narrow flex row", async () => {
		await gotoBadge(1280, 900);
		const layout = await page
			.locator('[data-slot="badge"]')
			.first()
			.evaluate((badge) => {
				const row = document.createElement("div");
				row.style.display = "flex";
				row.style.width = "6rem";
				const item = badge.cloneNode(true) as HTMLElement;
				item.textContent =
					"A very long category label that must wrap within its row";
				row.append(item);
				document.body.append(row);
				return {
					badgeHeight: item.getBoundingClientRect().height,
					badgeWidth: item.getBoundingClientRect().width,
					minHeight: Number.parseFloat(getComputedStyle(item).minHeight),
					rowWidth: row.getBoundingClientRect().width,
				};
			});
		expect(layout.badgeWidth).toBeLessThanOrEqual(layout.rowWidth);
		expect(layout.badgeHeight).toBeGreaterThan(layout.minHeight);
	});

	it("keeps destructive text readable against its rendered fill", async () => {
		await gotoBadge(1280, 900);
		await page.evaluate(() => localStorage.setItem("mizen-theme", "light"));
		await page.reload({ waitUntil: "networkidle" });
		let destructive = page.getByText("Failed", { exact: true });
		expect(await destructive.count()).toBe(1);
		expect(await measureTextContrast(destructive)).toBeGreaterThanOrEqual(4.5);

		await page.evaluate(() => localStorage.setItem("mizen-theme", "dark"));
		await page.reload({ waitUntil: "networkidle" });
		destructive = page.getByText("Failed", { exact: true });
		expect(await destructive.count()).toBe(1);
		expect(await measureTextContrast(destructive)).toBeGreaterThanOrEqual(4.5);
	});

	it("fits a narrow viewport without horizontal overflow", async () => {
		await gotoBadge();
		const widths = await page.evaluate(() => [
			document.body.scrollWidth,
			document.body.clientWidth,
		]);
		expect(widths[0]).toBe(widths[1]);
	});
});
