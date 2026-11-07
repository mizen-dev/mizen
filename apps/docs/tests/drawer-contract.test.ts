// @vitest-environment happy-dom
import { act, createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	Drawer,
	type DrawerBarProps,
	DrawerClose,
	type DrawerCloseProps,
	DrawerContent,
	type DrawerContentProps,
	DrawerDescription,
	type DrawerDescriptionProps,
	DrawerFooter,
	type DrawerFooterProps,
	DrawerHeader,
	type DrawerHeaderProps,
	DrawerPanel,
	type DrawerPanelProps,
	DrawerPopup,
	type DrawerPopupProps,
	type DrawerProps,
	DrawerTitle,
	type DrawerTitleProps,
	DrawerTrigger,
	type DrawerTriggerProps,
} from "../../../packages/ui/src/components/drawer/drawer";
import { drawerStyles } from "../../../packages/ui/src/components/drawer/drawer.styles";
import { drawerPositionsStyles } from "../../../packages/ui/src/components/drawer/drawer-positions.styles";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
const VIEWPORT_INSET_PATTERN = /var\(--drawer-viewport-inset/;
const VIEWPORT_INSET_KEY_PATTERN = /--drawer-viewport-inset/;
const ENDING_DURATION_PATTERN = /var\(--drawer-ending-duration/;
const propsSpy = vi.fn((_style?: readonly (object | undefined)[]) => ({}));
vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	createTheme: <T extends object>(_v: T, overrides: object): object =>
		overrides,
	defaultMarker: () => ({}),
	defineConsts: <T extends object>(c: T): T => c,
	defineMarker: () => ({}),
	defineVars: <T extends object>(v: T): T => v,
	keyframes: <T extends object>(k: T): T => k,
	props: (...styles: (object | undefined)[]) => propsSpy(styles),
	when: { ancestor: (selector: string) => selector },
}));

function mount(
	element: Parameters<ReturnType<typeof createRoot>["render"]>[0]
) {
	const container = document.body.appendChild(document.createElement("div"));
	const root = createRoot(container);
	act(() => root.render(element));
	return {
		container,
		rerender: (next: typeof element) => act(() => root.render(next)),
		unmount: () => {
			act(() => root.unmount());
			container.remove();
		},
	};
}

type Accepts<T, K extends PropertyKey> = K extends keyof T ? true : false;
type RejectsAll<T, K extends PropertyKey> = [Extract<keyof T, K>] extends [
	never,
]
	? true
	: false;
type Omitted = "className" | "style";

type ClosedContract = [
	RejectsAll<DrawerProps, Omitted>,
	Accepts<
		DrawerProps,
		| "open"
		| "defaultOpen"
		| "onOpenChange"
		| "position"
		| "swipeDirection"
		| "snapPoints"
	>,
	RejectsAll<DrawerTriggerProps, Omitted>,
	Accepts<DrawerTriggerProps, "render" | "ref">,
	Accepts<DrawerPopupProps, "position">,
	Accepts<
		DrawerPopupProps,
		| "variant"
		| "showCloseButton"
		| "showBar"
		| "closeProps"
		| "portalProps"
		| "ref"
	>,
	RejectsAll<DrawerContentProps, Omitted>,
	Accepts<DrawerContentProps, "render">,
	Accepts<DrawerBarProps, "position" | "render">,
	RejectsAll<DrawerTitleProps, Omitted>,
	RejectsAll<DrawerDescriptionProps, Omitted>,
	RejectsAll<DrawerCloseProps, Omitted>,
	RejectsAll<DrawerHeaderProps, Omitted>,
	Accepts<DrawerHeaderProps, "allowSelection" | "render">,
	RejectsAll<DrawerPanelProps, Omitted>,
	Accepts<
		DrawerPanelProps,
		"scrollable" | "scrollFade" | "allowSelection" | "render"
	>,
	RejectsAll<DrawerFooterProps, Omitted>,
	Accepts<DrawerFooterProps, "variant" | "allowSelection" | "render">,
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
	true,
	true,
	true,
	true,
	true,
];

function assertSelectionSeam(el: Element | null, tag: string, slot: string) {
	if (!el) {
		throw new Error(`Element for slot ${slot} not found`);
	}
	expect(el.tagName.toLowerCase()).toBe(tag);
	expect(el.getAttribute("data-slot")).toBe(slot);
	expect(el.hasAttribute("data-drawer-content")).toBe(true);
	expect(el.parentElement?.getAttribute("data-slot")).not.toBe(
		"drawer-content"
	);
}

describe("Drawer contract and runtime semantics", () => {
	afterEach(() => {
		document.body.innerHTML = "";
	});
	it("resolves @mizen-labs/ui/drawer as a public subpath", () => {
		const resolved = import.meta.resolve("@mizen-labs/ui/drawer");
		expect(resolved).toContain("drawer");
	});

	it("tracks Base UI gesture variables and never returns resting transform to none", () => {
		const positionsJson = JSON.stringify(drawerPositionsStyles);
		const drawerStylesJson = JSON.stringify(drawerStyles);

		expect(positionsJson).toContain("var(--drawer-snap-point-offset");
		expect(positionsJson).toContain("var(--drawer-swipe-movement-y");
		expect(positionsJson).toContain("var(--drawer-swipe-movement-x");
		expect(positionsJson).not.toContain('"default":"none"');

		expect(drawerStylesJson).toContain("var(--drawer-swipe-progress");
		expect(drawerStylesJson).toContain("[data-swiping]");
		expect(drawerStyles.popup.opacity).toEqual({
			"[data-nested-drawer-open]": 0,
			default: 1,
		});
	});

	it("exports runtime members and guarantees DrawerContent is distinct from DrawerPopup", async () => {
		const mod = await import(
			"../../../packages/ui/src/components/drawer/drawer"
		);
		expect(Object.keys(mod).sort()).toEqual([
			"Drawer",
			"DrawerBackdrop",
			"DrawerBar",
			"DrawerClose",
			"DrawerContent",
			"DrawerCreateHandle",
			"DrawerDescription",
			"DrawerFooter",
			"DrawerHeader",
			"DrawerMenu",
			"DrawerMenuCheckboxItem",
			"DrawerMenuGroup",
			"DrawerMenuGroupLabel",
			"DrawerMenuItem",
			"DrawerMenuRadioGroup",
			"DrawerMenuRadioItem",
			"DrawerMenuSeparator",
			"DrawerMenuTrigger",
			"DrawerPanel",
			"DrawerPopup",
			"DrawerPortal",
			"DrawerPrimitive",
			"DrawerSwipeArea",
			"DrawerTitle",
			"DrawerTrigger",
			"DrawerViewport",
		]);
		expect(mod.DrawerContent).not.toBe(mod.DrawerPopup);
		expect(DrawerContent).not.toBe(DrawerPopup);
		expect(typeof mod.DrawerCreateHandle).toBe("function");
		expect(mod.DrawerPrimitive).toBeDefined();
		expect(contractChecks.every((c) => c === true)).toBe(true);

		const rootMod = await import("../../../packages/ui/src/index");
		expect(rootMod.Drawer).toBe(mod.Drawer);
		expect(rootMod.DrawerPopup).toBe(mod.DrawerPopup);
		expect(rootMod.DrawerContent).toBe(mod.DrawerContent);
		expect(rootMod.DrawerBar).toBe(mod.DrawerBar);
	});

	it("renders drawer trigger into static markup with canonical data-slot", () => {
		const markup = renderToStaticMarkup(
			h(Drawer, null, h(DrawerTrigger, null, "Open"))
		);
		expect(markup).toContain('data-slot="drawer-trigger"');
		expect(markup).toContain('type="button"');
	});

	it("renders drawer structure with DrawerContent, DrawerPanel, and ScrollArea in DOM", () => {
		const { unmount } = mount(
			h(
				Drawer,
				{ defaultOpen: true },
				h(DrawerTrigger, null, "Open Drawer"),
				h(
					DrawerPopup,
					{ showBar: true },
					h(
						DrawerHeader,
						null,
						h(DrawerTitle, null, "Drawer Title"),
						h(DrawerDescription, null, "Drawer Description")
					),
					h(DrawerContent, null, h(DrawerPanel, null, "Drawer Panel Body")),
					h(DrawerFooter, null, h(DrawerClose, null, "Done"))
				)
			)
		);

		expect(
			document.body.querySelector('[data-slot="drawer-backdrop"]')
		).not.toBeNull();
		expect(
			document.body.querySelector('[data-slot="drawer-viewport"]')
		).not.toBeNull();
		expect(
			document.body.querySelector('[data-slot="drawer-popup"]')
		).not.toBeNull();
		expect(
			document.body.querySelector('[data-slot="drawer-bar"]')
		).not.toBeNull();
		expect(
			document.body
				.querySelector('[data-slot="drawer-bar"]')
				?.getAttribute("aria-hidden")
		).toBe("true");
		expect(
			document.body.querySelector('[data-slot="drawer-content"]')
		).not.toBeNull();
		expect(
			document.body.querySelector('[data-slot="drawer-header"]')
		).not.toBeNull();
		expect(
			document.body.querySelector('[data-slot="drawer-title"]')
		).not.toBeNull();
		expect(
			document.body.querySelector('[data-slot="drawer-description"]')
		).not.toBeNull();
		expect(
			document.body.querySelector('[data-slot="drawer-panel"]')
		).not.toBeNull();
		expect(
			document.body.querySelector('[data-slot="scroll-area"]')
		).not.toBeNull();
		expect(
			document.body.querySelector('[data-slot="drawer-footer"]')
		).not.toBeNull();
		expect(
			document.body.querySelector('[data-slot="drawer-close"]')
		).not.toBeNull();
		expect(
			propsSpy.mock.calls.some((call) =>
				call[0]?.includes(drawerStyles.scrollArea)
			)
		).toBe(true);
		unmount();
	});

	it("supports polymorphic render prop while protecting component data-slots", () => {
		const { unmount } = mount(
			h(
				Drawer,
				{ defaultOpen: true },
				h(
					DrawerPopup,
					null,
					h(
						DrawerHeader,
						{
							render: h("section", {
								"aria-label": "custom-drawer-header",
							}),
						},
						h(DrawerTitle, null, "Title")
					),
					h(
						DrawerPanel,
						{
							render: h("article", {
								"aria-label": "custom-drawer-panel",
							}),
						},
						"Body"
					),
					h(
						DrawerFooter,
						{
							render: h("footer", {
								"aria-label": "custom-drawer-footer",
							}),
						},
						h(DrawerClose, null, "Done")
					)
				)
			)
		);

		const header = document.body.querySelector(
			'[aria-label="custom-drawer-header"]'
		);
		expect(header?.tagName.toLowerCase()).toBe("section");
		expect(header?.getAttribute("data-slot")).toBe("drawer-header");

		const panel = document.body.querySelector(
			'[aria-label="custom-drawer-panel"]'
		);
		expect(panel?.tagName.toLowerCase()).toBe("article");
		expect(panel?.getAttribute("data-slot")).toBe("drawer-panel");

		const footer = document.body.querySelector(
			'[aria-label="custom-drawer-footer"]'
		);
		expect(footer?.tagName.toLowerCase()).toBe("footer");
		expect(footer?.getAttribute("data-slot")).toBe("drawer-footer");
		unmount();
	});

	it("honors closeProps, variants, and showCloseButton on DrawerPopup", () => {
		const { unmount } = mount(
			h(
				Drawer,
				{ defaultOpen: true },
				h(
					DrawerPopup,
					{
						closeProps: { "aria-label": "Close drawer window" },
						showBar: false,
						showCloseButton: true,
						variant: "inset",
					},
					h(DrawerTitle, null, "Title"),
					h(DrawerFooter, { variant: "bare" }, "Footer")
				)
			)
		);
		expect(
			document.body.querySelector('[data-slot="drawer-popup"]')
		).not.toBeNull();
		expect(
			document.body.querySelector('[data-slot="drawer-default-close"]')
		).not.toBeNull();
		expect(
			document.body
				.querySelector('[data-slot="drawer-default-close"]')
				?.getAttribute("aria-label")
		).toBe("Close drawer window");
		expect(document.body.querySelector('[data-slot="drawer-bar"]')).toBeNull();
		unmount();
	});

	it("supports interactive open and close transitions with controlled callbacks", () => {
		const onOpenChange = vi.fn();
		const { container, unmount } = mount(
			h(
				Drawer,
				{ onOpenChange },
				h(DrawerTrigger, null, "Toggle"),
				h(DrawerPopup, null, h(DrawerClose, null, "Dismiss"))
			)
		);
		const trigger = container.querySelector<HTMLButtonElement>("button");
		expect(trigger?.getAttribute("data-slot")).toBe("drawer-trigger");
		expect(trigger?.getAttribute("type")).toBe("button");
		act(() => trigger?.click());
		expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything());
		unmount();
	});

	it("includes viewport inset in closed and ending transforms on all four drawer positions", () => {
		const bottomEnding = (
			drawerPositionsStyles.popup_bottom.transform as unknown as Record<
				string,
				string
			>
		)["[data-ending-style]"];
		const bottomStarting = (
			drawerPositionsStyles.popup_bottom.transform as unknown as Record<
				string,
				string
			>
		)["[data-starting-style]"];
		const topEnding = (
			drawerPositionsStyles.popup_top.transform as unknown as Record<
				string,
				string
			>
		)["[data-ending-style]"];
		const topStarting = (
			drawerPositionsStyles.popup_top.transform as unknown as Record<
				string,
				string
			>
		)["[data-starting-style]"];
		const leftEnding = (
			drawerPositionsStyles.popup_left.transform as unknown as Record<
				string,
				string
			>
		)["[data-ending-style]"];
		const leftStarting = (
			drawerPositionsStyles.popup_left.transform as unknown as Record<
				string,
				string
			>
		)["[data-starting-style]"];
		const rightEnding = (
			drawerPositionsStyles.popup_right.transform as unknown as Record<
				string,
				string
			>
		)["[data-ending-style]"];
		const rightStarting = (
			drawerPositionsStyles.popup_right.transform as unknown as Record<
				string,
				string
			>
		)["[data-starting-style]"];

		expect(bottomEnding).toMatch(VIEWPORT_INSET_PATTERN);
		expect(bottomStarting).toMatch(VIEWPORT_INSET_PATTERN);
		expect(topEnding).toMatch(VIEWPORT_INSET_PATTERN);
		expect(topStarting).toMatch(VIEWPORT_INSET_PATTERN);
		expect(leftEnding).toMatch(VIEWPORT_INSET_PATTERN);
		expect(leftStarting).toMatch(VIEWPORT_INSET_PATTERN);
		expect(rightEnding).toMatch(VIEWPORT_INSET_PATTERN);
		expect(rightStarting).toMatch(VIEWPORT_INSET_PATTERN);

		const viewportInsetJson = JSON.stringify(
			drawerPositionsStyles.viewport_inset
		);
		expect(viewportInsetJson).toMatch(VIEWPORT_INSET_KEY_PATTERN);
	});

	it("provides complete border style for inset drawer variant", () => {
		expect(drawerPositionsStyles.popup_inset).toHaveProperty("borderStyle");
		const popupInsetJson = JSON.stringify(drawerPositionsStyles.popup_inset);
		expect(popupInsetJson).toContain("solid");
	});

	it("resolves reduced-motion ending state to zero duration without attribute override", () => {
		const popupStyles = drawerStyles.popup;
		const popupJson = JSON.stringify(popupStyles);
		expect(popupJson).toContain("--drawer-ending-duration");
		const endingDuration = (
			popupStyles.transitionDuration as unknown as Record<string, string>
		)["[data-ending-style]"];
		expect(endingDuration).toMatch(ENDING_DURATION_PATTERN);
	});

	it("produces a single polymorphic element carrying selection contract when allowSelection is true", () => {
		const { unmount } = mount(
			h(
				Drawer,
				{ defaultOpen: true },
				h(
					DrawerPopup,
					null,
					h(
						DrawerHeader,
						{
							allowSelection: true,
							render: h("section", { "aria-label": "selectable-header" }),
						},
						h(DrawerTitle, null, "Header Title")
					),
					h(
						DrawerPanel,
						{
							allowSelection: true,
							render: h("article", { "aria-label": "selectable-panel" }),
							scrollable: false,
						},
						"Panel content"
					),
					h(
						DrawerFooter,
						{
							allowSelection: true,
							render: h("footer", { "aria-label": "selectable-footer" }),
						},
						h(DrawerClose, null, "Dismiss")
					)
				)
			)
		);

		assertSelectionSeam(
			document.body.querySelector('[aria-label="selectable-header"]'),
			"section",
			"drawer-header"
		);
		assertSelectionSeam(
			document.body.querySelector('[aria-label="selectable-panel"]'),
			"article",
			"drawer-panel"
		);
		assertSelectionSeam(
			document.body.querySelector('[aria-label="selectable-footer"]'),
			"footer",
			"drawer-footer"
		);
		unmount();
	});

	it("adjusts DrawerHeader padding conditionally based on showCloseButton", () => {
		propsSpy.mockClear();
		const noClose = mount(
			h(
				Drawer,
				{ defaultOpen: true },
				h(
					DrawerPopup,
					{ showCloseButton: false },
					h(DrawerHeader, null, h(DrawerTitle, null, "No Close"))
				)
			)
		);
		const noCloseHeaderCalls = propsSpy.mock.calls.filter((call) =>
			call[0]?.includes(drawerStyles.header)
		);
		expect(noCloseHeaderCalls.length).toBeGreaterThan(0);
		expect(
			noCloseHeaderCalls.some((call) =>
				call[0]?.includes(drawerStyles.headerWithClose)
			)
		).toBe(false);
		noClose.unmount();

		propsSpy.mockClear();
		const withClose = mount(
			h(
				Drawer,
				{ defaultOpen: true },
				h(
					DrawerPopup,
					{ showCloseButton: true },
					h(DrawerHeader, null, h(DrawerTitle, null, "With Close"))
				)
			)
		);
		const withCloseHeaderCalls = propsSpy.mock.calls.filter((call) =>
			call[0]?.includes(drawerStyles.header)
		);
		expect(
			withCloseHeaderCalls.some((call) =>
				call[0]?.includes(drawerStyles.headerWithClose)
			)
		).toBe(true);
		withClose.unmount();
	});
});
