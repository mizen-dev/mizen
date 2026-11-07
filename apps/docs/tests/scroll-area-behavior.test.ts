// @vitest-environment happy-dom

import type { HTMLAttributes } from "react";
import { act, createRef, createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import {
	ScrollArea,
	ScrollAreaPrimitive,
	ScrollAreaScrollbar,
	ScrollAreaThumb,
	ScrollAreaViewport,
} from "../../../packages/ui/src/components/scroll-area/scroll-area";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(c: T): T => c,
	defineMarker: () => ({}),
	defineVars: <T extends object>(v: T): T => v,
	keyframes: <T extends object>(k: T): T => k,
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

const MIN_WIDTH_ZERO_STYLE_REGEX = /min-width:\s*0/;

function mount(
	element: Parameters<ReturnType<typeof createRoot>["render"]>[0]
) {
	const container = document.body.appendChild(document.createElement("div"));
	const root = createRoot(container);
	act(() => root.render(element));
	return {
		content: () =>
			container.querySelector<HTMLDivElement>(
				'[data-slot="scroll-area-content"]'
			),
		corner: () =>
			container.querySelector<HTMLDivElement>(
				'[data-slot="scroll-area-corner"]'
			),
		horizontalScrollBar: () =>
			container.querySelector<HTMLDivElement>(
				'[data-slot="scroll-area-scrollbar"][data-orientation="horizontal"]'
			),
		rerender: (next: typeof element) => act(() => root.render(next)),
		rootEl: () =>
			container.querySelector<HTMLDivElement>('[data-slot="scroll-area"]'),
		scrollBars: () =>
			container.querySelectorAll<HTMLDivElement>(
				'[data-slot="scroll-area-scrollbar"]'
			),
		unmount: () => {
			act(() => root.unmount());
			container.remove();
		},
		verticalScrollBar: () =>
			container.querySelector<HTMLDivElement>(
				'[data-slot="scroll-area-scrollbar"][data-orientation="vertical"]'
			),
		viewport: () =>
			container.querySelector<HTMLDivElement>(
				'[data-slot="scroll-area-viewport"]'
			),
	};
}

describe("ScrollArea behavior", () => {
	it("composes named viewport, scrollbar, and thumb parts with native refs", () => {
		const viewportRef = createRef<HTMLDivElement>();
		const thumbRef = createRef<HTMLDivElement>();
		const mounted = mount(
			h(
				ScrollAreaPrimitive.Root,
				null,
				h(
					ScrollAreaViewport,
					{ "aria-label": "Scrollable records", ref: viewportRef },
					"Records"
				),
				h(
					ScrollAreaScrollbar,
					{ keepMounted: true },
					h(ScrollAreaThumb, { ref: thumbRef })
				)
			)
		);
		expect(viewportRef.current).toBe(mounted.viewport());
		expect(thumbRef.current?.getAttribute("data-slot")).toBe(
			"scroll-area-thumb"
		);
		expect(
			mounted
				.verticalScrollBar()
				?.querySelectorAll('[data-slot="scroll-area-thumb"]').length
		).toBe(1);
		mounted.unmount();
	});

	it("forwards refs to root and scrollbar host elements", () => {
		const rootRef = createRef<HTMLDivElement>();
		const rootMount = mount(h(ScrollArea, { ref: rootRef }, "Panel"));
		expect(rootRef.current).toBe(rootMount.rootEl());
		expect(rootRef.current?.getAttribute("data-slot")).toBe("scroll-area");
		rootMount.unmount();

		const scrollBarRef = createRef<HTMLDivElement>();
		const scrollBarMount = mount(
			h(
				ScrollAreaPrimitive.Root,
				null,
				h(ScrollAreaScrollbar, {
					keepMounted: true,
					orientation: "vertical",
					ref: scrollBarRef,
				})
			)
		);
		expect(scrollBarRef.current).toBe(scrollBarMount.verticalScrollBar());
		expect(scrollBarRef.current?.getAttribute("data-slot")).toBe(
			"scroll-area-scrollbar"
		);
		scrollBarMount.unmount();
	});

	it("does not force-mount scrollbar tracks when there is no overflow", () => {
		const { horizontalScrollBar, unmount, verticalScrollBar } = mount(
			h(ScrollArea, null, "Text")
		);
		expect(verticalScrollBar()).toBeNull();
		expect(horizontalScrollBar()).toBeNull();
		unmount();
	});

	it("supports vertical and horizontal standalone keepMounted scrollbars", () => {
		const { horizontalScrollBar, unmount, verticalScrollBar } = mount(
			h(
				ScrollAreaPrimitive.Root,
				null,
				h(ScrollAreaScrollbar, { keepMounted: true, orientation: "vertical" }),
				h(ScrollAreaScrollbar, { keepMounted: true, orientation: "horizontal" })
			)
		);
		expect(verticalScrollBar()?.getAttribute("data-orientation")).toBe(
			"vertical"
		);
		expect(horizontalScrollBar()?.getAttribute("data-orientation")).toBe(
			"horizontal"
		);
		unmount();
	});

	it("applies default min-width 0 clamp and allows opting out", () => {
		const defaultMounted = mount(h(ScrollArea, null, "Clamped content"));
		expect(defaultMounted.content()?.getAttribute("data-slot")).toBe(
			"scroll-area-content"
		);
		expect(defaultMounted.content()?.getAttribute("style")).toMatch(
			MIN_WIDTH_ZERO_STYLE_REGEX
		);
		defaultMounted.unmount();

		const unclamped = mount(
			h(ScrollArea, { clampContentMinWidth: false }, "Unclamped content")
		);
		expect(unclamped.content()?.getAttribute("data-slot")).toBe(
			"scroll-area-content"
		);
		expect(unclamped.content()?.getAttribute("style") ?? "").not.toMatch(
			MIN_WIDTH_ZERO_STYLE_REGEX
		);
		unclamped.unmount();
	});

	it("keeps the viewport semantically neutral and initially non-scrollable", () => {
		const { unmount, viewport } = mount(
			h(ScrollArea, null, "Viewport content")
		);
		expect(viewport()?.getAttribute("role")).toBeNull();
		expect(viewport()?.getAttribute("tabindex")).toBe("-1");
		expect(viewport()?.getAttribute("data-slot")).toBe("scroll-area-viewport");
		unmount();
	});

	it("supports custom render elements on ScrollArea and ScrollBar", () => {
		const rootMount = mount(
			h(
				ScrollArea,
				{
					render: (p: HTMLAttributes<HTMLElement>) => h("section", p),
				},
				"Polymorphic"
			)
		);
		expect(rootMount.rootEl()?.tagName).toBe("SECTION");
		expect(rootMount.rootEl()?.getAttribute("data-slot")).toBe("scroll-area");
		rootMount.unmount();

		const scrollBarMount = mount(
			h(
				ScrollAreaPrimitive.Root,
				null,
				h(ScrollAreaScrollbar, {
					keepMounted: true,
					orientation: "vertical",
					render: (p: HTMLAttributes<HTMLElement>) => h("aside", p),
				})
			)
		);
		expect(scrollBarMount.verticalScrollBar()?.tagName).toBe("ASIDE");
		expect(scrollBarMount.verticalScrollBar()?.getAttribute("data-slot")).toBe(
			"scroll-area-scrollbar"
		);
		scrollBarMount.unmount();
	});

	it("forwards overflowEdgeThreshold and supports standalone ScrollBar", () => {
		const { rootEl, unmount } = mount(
			h(ScrollArea, { overflowEdgeThreshold: 12 }, "Threshold")
		);
		expect(rootEl()?.getAttribute("data-slot")).toBe("scroll-area");
		unmount();

		const standalone = mount(
			h(
				ScrollAreaPrimitive.Root,
				null,
				h(ScrollAreaPrimitive.Viewport, null, "Standalone"),
				h(ScrollAreaScrollbar, { keepMounted: true, orientation: "horizontal" })
			)
		);
		expect(standalone.horizontalScrollBar()?.getAttribute("data-slot")).toBe(
			"scroll-area-scrollbar"
		);
		expect(
			standalone.horizontalScrollBar()?.getAttribute("data-orientation")
		).toBe("horizontal");
		standalone.unmount();
	});
});
