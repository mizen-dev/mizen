import type {
	FrameDescriptionProps,
	FrameFooterProps,
	FrameHeaderProps,
	FramePanelProps,
	FrameProps,
	FrameTitleProps,
} from "@mizen-labs/ui/frame";
import { type Browser, chromium, type Page } from "playwright";
import { type ComponentPropsWithRef, createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it, vi } from "vite-plus/test";
import {
	Frame,
	FrameDescription,
	FrameFooter,
	FrameHeader,
	FramePanel,
	FrameTitle,
} from "../../../packages/ui/src/components/frame/frame";
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

type Exact<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
type ClosedProps<P, E extends "div" | "header" | "footer"> = Exact<
	Exclude<keyof ComponentPropsWithRef<E>, keyof P>,
	"className" | "style"
>;
type AcceptsRole<P> = "role" extends keyof P ? true : false;

const contractChecks = [
	true satisfies ClosedProps<FrameProps, "div">,
	true satisfies ClosedProps<FramePanelProps, "div">,
	true satisfies ClosedProps<FrameHeaderProps, "header">,
	true satisfies ClosedProps<FrameTitleProps, "div">,
	true satisfies ClosedProps<FrameDescriptionProps, "div">,
	true satisfies ClosedProps<FrameFooterProps, "footer">,
	true satisfies AcceptsRole<FrameProps>,
	true satisfies AcceptsRole<FramePanelProps>,
	true satisfies AcceptsRole<FrameHeaderProps>,
	true satisfies AcceptsRole<FrameTitleProps>,
	true satisfies AcceptsRole<FrameDescriptionProps>,
	true satisfies AcceptsRole<FrameFooterProps>,
] as const;

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
const NON_TRANSPARENT_REGEX = /transparent|rgba\(0, 0, 0, 0\)/u;
const PIXEL_VALUE_REGEX = /^\d+(?:\.\d+)?px$/u;
const NONE_REGEX = /^none$/u;
const PERSONAL_WORKSPACE_EXAMPLE =
	'[aria-label="Frame: Personal workspace example"]';
let handle: TestServerHandle, browser: Browser, page: Page;

function throwTeardownFailures(
	results: readonly PromiseSettledResult<unknown>[]
): void {
	const failures = results
		.filter((r): r is PromiseRejectedResult => r.status === "rejected")
		.map((r) => r.reason);
	if (failures.length === 1) {
		throw failures[0];
	}
	if (failures.length > 1) {
		throw new AggregateError(failures, "Failed to tear down the frame test");
	}
}

const parts = [
	[Frame, "frame", "<div"],
	[FramePanel, "frame-panel", "<div"],
	[FrameHeader, "frame-panel-header", "<header"],
	[FrameTitle, "frame-panel-title", "<div"],
	[FrameDescription, "frame-panel-description", "<div"],
	[FrameFooter, "frame-panel-footer", "<footer"],
] as const;

async function gotoFrame(width: number, height: number): Promise<void> {
	await page.setViewportSize({ height, width });
	await page.goto(`${handle.url}/components/frame`, {
		waitUntil: "networkidle",
	});
}

describe("Frame compound component and docs specimen", () => {
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

	it("resolves root and subpath exports with six closed native prop contracts", () => {
		expect(import.meta.resolve("@mizen-labs/ui")).toContain(
			"packages/ui/dist/index.js"
		);
		expect(import.meta.resolve("@mizen-labs/ui/frame")).toContain(
			"packages/ui/dist/components/frame/frame.js"
		);
		expect(contractChecks).toEqual(Array.from({ length: 12 }, () => true));
	});

	it("renders each part with its native tag and protected slot", () => {
		for (const [Component, slot, tag] of parts) {
			const markup = renderToStaticMarkup(
				createElement(Component, { role: "group" })
			);
			expect(markup).toContain(tag);
			expect(markup).toContain(`data-slot="${slot}"`);
			expect(markup).toContain('role="group"');
		}

		const customSlotProps = { "data-slot": "custom-frame", role: "group" };
		const protectedMarkup = renderToStaticMarkup(
			createElement(Frame, customSlotProps)
		);
		expect(protectedMarkup).not.toContain('data-slot="custom-frame"');
	});

	it("renders the documented route with canonical compound nesting", async () => {
		const response = await page.goto(`${handle.url}/components/frame`, {
			waitUntil: "networkidle",
		});
		expect(response?.status()).toBe(200);
		expect(
			await page.getByRole("heading", { level: 1, name: "Frame" }).isVisible()
		).toBe(true);
		const nesting = await page
			.locator(`${PERSONAL_WORKSPACE_EXAMPLE} [data-slot="frame"]`)
			.evaluate((node) => {
				const slot = (el?: Element | null) =>
					el?.getAttribute("data-slot") ?? null;
				return {
					children: Array.from(node.children).map(slot),
					footer: slot(node.children[2]),
					header: Array.from(node.children[0]?.children ?? []).map(slot),
					panel: slot(node.children[1]),
				};
			});
		expect(nesting).toEqual({
			children: ["frame-panel-header", "frame-panel", "frame-panel-footer"],
			footer: "frame-panel-footer",
			header: ["frame-panel-title", "frame-panel-description"],
			panel: "frame-panel",
		});
	});

	it("applies token-backed desktop layout and typography", async () => {
		await gotoFrame(1280, 900);
		const styles = await page
			.locator(`${PERSONAL_WORKSPACE_EXAMPLE} [data-slot="frame"]`)
			.evaluate((node) => {
				const computed = getComputedStyle(node);
				const read = (slot: string) => {
					const el = node.querySelector(`[data-slot="${slot}"]`);
					return el ? getComputedStyle(el) : null;
				};
				const panel = read("frame-panel");
				const header = read("frame-panel-header");
				const title = read("frame-panel-title");
				const description = read("frame-panel-description");
				const footer = read("frame-panel-footer");
				return {
					description: description && [
						description.color,
						description.fontSize,
						description.fontWeight,
					],
					footer: footer && [footer.paddingBlock, footer.paddingInline],
					frame: [
						computed.backgroundColor,
						computed.borderRadius,
						computed.display,
						computed.flexDirection,
						computed.gap,
						computed.minWidth,
						computed.padding,
						computed.position,
						computed.width,
					],
					header: header && [
						header.display,
						header.flexDirection,
						header.paddingBlock,
						header.paddingInline,
					],
					panel: panel && [
						panel.backgroundColor,
						panel.backgroundClip,
						panel.borderStyle,
						panel.borderWidth,
						panel.borderRadius,
						panel.boxShadow,
						panel.minWidth,
						panel.padding,
					],
					title: title && [title.color, title.fontSize, title.fontWeight],
				};
			});
		expect(styles.frame).toEqual([
			expect.not.stringMatching(NON_TRANSPARENT_REGEX),
			"20px",
			"flex",
			"column",
			"4px",
			"0px",
			"4px",
			"relative",
			expect.stringMatching(PIXEL_VALUE_REGEX),
		]);
		expect(styles.panel?.slice(1)).toEqual([
			"padding-box",
			"solid",
			"1px",
			"16px",
			expect.not.stringMatching(NONE_REGEX),
			"0px",
			"20px",
		]);
		expect(styles.header).toEqual(["flex", "column", "16px", "20px"]);
		expect(styles.title?.slice(1)).toEqual(["14px", "600"]);
		expect(styles.description?.slice(1)).toEqual(["14px", "400"]);
		expect(styles.footer).toEqual(["16px", "20px"]);
	});

	it("fits a 375px viewport without horizontal overflow", async () => {
		await gotoFrame(375, 812);
		expect(await page.evaluate(() => document.body.scrollWidth)).toBe(
			await page.evaluate(() => document.body.clientWidth)
		);
	});
});
