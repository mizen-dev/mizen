// @vitest-environment happy-dom

import type { HTMLAttributes } from "react";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
	ScrollArea,
	ScrollAreaPrimitive,
	type ScrollAreaProps,
	ScrollAreaScrollbar,
	type ScrollAreaScrollbarProps,
} from "../../../packages/ui/src/components/scroll-area/scroll-area";
import { scrollAreaStyles } from "../../../packages/ui/src/components/scroll-area/scroll-area.styles";
import { colors } from "../../../packages/ui/src/styles/colors.stylex";
import { shape } from "../../../packages/ui/src/styles/shape.stylex";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
const propsSpy = vi.fn((..._args: unknown[]) => ({}));
vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(c: T): T => c,
	defineMarker: () => ({}),
	defineVars: <T extends object>(v: T): T => v,
	keyframes: <T extends object>(k: T): T => k,
	props: (...args: unknown[]) => propsSpy(...args),
	when: { ancestor: () => ":where(*)" },
}));

type Accepts<T, K extends PropertyKey> = K extends keyof T ? true : false;
type RejectsAll<T, K extends PropertyKey> = [Extract<keyof T, K>] extends [
	never,
]
	? true
	: false;

type Omitted = "className" | "data-slot" | "style";
type ClosedContract = [
	RejectsAll<ScrollAreaProps, Omitted>,
	Accepts<ScrollAreaProps, "scrollFade">,
	Accepts<ScrollAreaProps, "scrollbarGutter">,
	Accepts<ScrollAreaProps, "fill">,
	Accepts<ScrollAreaProps, "clampContentMinWidth">,
	Accepts<ScrollAreaProps, "overscrollContain">,
	Accepts<ScrollAreaProps, "overflowEdgeThreshold">,
	Accepts<ScrollAreaProps, "ref">,
	RejectsAll<ScrollAreaScrollbarProps, Omitted>,
	Accepts<ScrollAreaScrollbarProps, "orientation">,
	Accepts<ScrollAreaScrollbarProps, "keepMounted">,
	Accepts<ScrollAreaScrollbarProps, "render">,
	Accepts<ScrollAreaScrollbarProps, "ref">,
];

const contractChecks: ClosedContract = [
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
];

describe("ScrollArea contract and runtime semantics", () => {
	it("exports exact runtime members and matches primitive properties", async () => {
		const mod = await import(
			"../../../packages/ui/src/components/scroll-area/scroll-area"
		);
		expect(Object.keys(mod).sort()).toEqual([
			"ScrollArea",
			"ScrollAreaCorner",
			"ScrollAreaPrimitive",
			"ScrollAreaScrollbar",
			"ScrollAreaThumb",
			"ScrollAreaViewport",
		]);
		expect(ScrollAreaPrimitive).toBe(mod.ScrollAreaPrimitive);
		for (const part of [
			"Root",
			"Viewport",
			"Content",
			"Scrollbar",
			"Thumb",
			"Corner",
		]) {
			expect(mod.ScrollAreaPrimitive).toHaveProperty(part);
		}
		expect(contractChecks.every((c) => c === true)).toBe(true);
	});

	it("renders canonical anatomy with composition", () => {
		const markup = renderToStaticMarkup(
			h(ScrollArea, null, h("div", null, "Scroll content"))
		);
		expect(markup).toContain('data-slot="scroll-area"');
		expect(markup).toContain('data-slot="scroll-area-viewport"');
		expect(markup).toContain('data-slot="scroll-area-content"');
		expect(markup).toContain("Scroll content");
		expect(markup).not.toContain('data-slot="scroll-area-scrollbar"');
		expect(markup).not.toContain('data-slot="scroll-area-thumb"');

		const standalone = renderToStaticMarkup(
			h(
				ScrollAreaPrimitive.Root,
				null,
				h(ScrollAreaScrollbar, { keepMounted: true, orientation: "vertical" })
			)
		);
		expect(standalone).toContain('data-slot="scroll-area-scrollbar"');
		expect(standalone).toContain('data-slot="scroll-area-thumb"');
		expect(standalone).toContain('data-orientation="vertical"');
	});

	it("protects data-slot against direct prop and render overrides across wrappers", () => {
		const bad = {
			className: "bad",
			"data-slot": "bad",
			style: { color: "red" },
		};
		const root = renderToStaticMarkup(
			Reflect.apply(ScrollArea, undefined, [bad])
		);
		const elem = renderToStaticMarkup(
			h(ScrollArea, {
				render: (p: HTMLAttributes<HTMLElement>) =>
					h("section", { ...p, "data-slot": "bad" }),
			})
		);
		expect(`${root}${elem}`).not.toContain("bad");
		expect(root).toContain('data-slot="scroll-area"');
		expect(elem).toContain('data-slot="scroll-area"');

		const scrollBarDirect = renderToStaticMarkup(
			h(
				ScrollAreaPrimitive.Root,
				null,
				Reflect.apply(ScrollAreaScrollbar, undefined, [
					{ ...bad, keepMounted: true },
				])
			)
		);
		const scrollBarRender = renderToStaticMarkup(
			h(
				ScrollAreaPrimitive.Root,
				null,
				h(ScrollAreaScrollbar, {
					keepMounted: true,
					render: (p: HTMLAttributes<HTMLElement>) =>
						h("aside", { ...p, "data-slot": "bad" }),
				})
			)
		);
		expect(`${scrollBarDirect}${scrollBarRender}`).not.toContain("bad");
		expect(scrollBarDirect).toContain('data-slot="scroll-area-scrollbar"');
		expect(scrollBarRender).toContain('data-slot="scroll-area-scrollbar"');
	});

	it("applies exact StyleX styles for base anatomy and custom booleans", () => {
		propsSpy.mockClear();
		renderToStaticMarkup(h(ScrollArea, null, "Item"));
		expect(
			propsSpy.mock.calls.some((c) => c.includes(scrollAreaStyles.root))
		).toBe(true);
		expect(
			propsSpy.mock.calls.some((c) => c.includes(scrollAreaStyles.viewport))
		).toBe(true);
		expect(
			propsSpy.mock.calls.some((c) => c.includes(scrollAreaStyles.content))
		).toBe(true);
		expect(
			propsSpy.mock.calls.some((c) => c.includes(scrollAreaStyles.scrollbar))
		).toBe(true);
		expect(
			propsSpy.mock.calls.some((c) =>
				c.includes(scrollAreaStyles.scrollbarVertical)
			)
		).toBe(true);
		expect(
			propsSpy.mock.calls.some((c) =>
				c.includes(scrollAreaStyles.scrollbarHorizontal)
			)
		).toBe(true);
		renderToStaticMarkup(
			h(
				ScrollAreaPrimitive.Root,
				null,
				h(ScrollAreaScrollbar, { keepMounted: true })
			)
		);
		expect(
			propsSpy.mock.calls.some((c) => c.includes(scrollAreaStyles.thumb))
		).toBe(true);
		expect(
			propsSpy.mock.calls.some((c) => c.includes(scrollAreaStyles.corner))
		).toBe(true);
		expect(
			propsSpy.mock.calls.some((c) => c.includes(scrollAreaStyles.contentFill))
		).toBe(false);
		expect(
			propsSpy.mock.calls.some((c) => c.includes(scrollAreaStyles.viewportFade))
		).toBe(false);
		expect(
			propsSpy.mock.calls.some((c) =>
				c.includes(scrollAreaStyles.viewportGutter)
			)
		).toBe(false);
		expect(
			propsSpy.mock.calls.some((c) =>
				c.includes(scrollAreaStyles.viewportOverscrollContain)
			)
		).toBe(false);

		propsSpy.mockClear();
		renderToStaticMarkup(
			h(
				ScrollArea,
				{
					fill: true,
					overscrollContain: true,
					scrollbarGutter: true,
					scrollFade: true,
				},
				"Styled"
			)
		);
		expect(
			propsSpy.mock.calls.some((c) => c.includes(scrollAreaStyles.contentFill))
		).toBe(true);
		expect(
			propsSpy.mock.calls.some((c) => c.includes(scrollAreaStyles.viewportFade))
		).toBe(true);
		expect(
			propsSpy.mock.calls.some((c) =>
				c.includes(scrollAreaStyles.viewportGutter)
			)
		).toBe(true);
		expect(
			propsSpy.mock.calls.some((c) =>
				c.includes(scrollAreaStyles.viewportOverscrollContain)
			)
		).toBe(true);
	});

	it("uses the softer control border color and tokenized thumb radius", () => {
		expect(scrollAreaStyles.thumb).toMatchObject({
			backgroundColor: { default: colors.controlBorderStrong },
			borderRadius: shape.controlRadius,
		});
	});
});
