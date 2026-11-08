// @vitest-environment happy-dom

import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vite-plus/test";
import { DirectionProvider } from "../../../packages/ui/node_modules/@base-ui/react/direction-provider";
import {
	ContextMenu,
	ContextMenuGroup,
	ContextMenuGroupLabel,
	ContextMenuItem,
	ContextMenuLinkItem,
	ContextMenuPopup,
	ContextMenuSeparator,
	ContextMenuShortcut,
	ContextMenuSub,
	ContextMenuSubPopup,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
} from "../../../packages/ui/src/components/context-menu/context-menu";
import { menuStyles } from "../../../packages/ui/src/components/menu/menu.styles";

const h = createElement;
Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
const styleMap = new Map<object, string>([
	[menuStyles.item, "menu-item"],
	[menuStyles.itemDefault, "menu-item-default"],
	[menuStyles.itemDestructive, "menu-item-destructive"],
	[menuStyles.inset, "menu-inset"],
	[menuStyles.popup, "menu-popup"],
	[menuStyles.positioner, "menu-positioner"],
]);
const propsSpy = vi.fn((...styles: unknown[]) => ({
	className: styles
		.flat()
		.filter((s): s is object => typeof s === "object" && s !== null)
		.map((s) => styleMap.get(s) ?? "menu-style")
		.join(" "),
}));

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(c: T): T => c,
	defineMarker: () => ({}),
	defineVars: <T extends object>(v: T): T => v,
	keyframes: <T extends object>(k: T): T => k,
	props: (...styles: unknown[]) => propsSpy(...styles),
	when: { ancestor: () => ":where(*)" },
}));

function mount(
	element: Parameters<ReturnType<typeof createRoot>["render"]>[0]
) {
	const container = document.body.appendChild(document.createElement("div"));
	const root = createRoot(container);
	act(() => root.render(element));
	return {
		container,
		unmount: () => {
			act(() => root.unmount());
			container.remove();
		},
	};
}

describe("ContextMenu contract and runtime semantics", () => {
	it("renders popup composition with canonical slots and positioner styles", () => {
		propsSpy.mockClear();
		const { unmount } = mount(
			h(
				ContextMenu,
				{ defaultOpen: true },
				h(ContextMenuTrigger, null, "Workspace"),
				h(
					ContextMenuPopup,
					null,
					h(
						ContextMenuGroup,
						null,
						h(ContextMenuGroupLabel, null, "File operations"),
						h(ContextMenuItem, null, "Open"),
						h(ContextMenuLinkItem, { href: "/docs" }, "Docs"),
						h(ContextMenuSeparator, null),
						h(ContextMenuShortcut, null, "Cmd+K")
					)
				)
			)
		);

		for (const slot of [
			"context-menu-positioner",
			"context-menu-popup",
			"context-menu-group",
			"context-menu-label",
			"context-menu-item",
			"context-menu-link-item",
			"context-menu-separator",
			"context-menu-shortcut",
		]) {
			expect(
				document.body.querySelector(`[data-slot="${slot}"]`)
			).not.toBeNull();
		}
		expect(
			document.body.querySelector('[data-slot="context-menu-shortcut"]')
				?.tagName
		).toBe("KBD");
		expect(propsSpy).toHaveBeenCalledWith(menuStyles.positioner);
		expect(propsSpy).toHaveBeenCalledWith(menuStyles.popup);
		unmount();
	});

	it("renders submenu hierarchy with canonical sub-trigger and sub-content slots", () => {
		const { unmount } = mount(
			h(
				ContextMenu,
				{ defaultOpen: true },
				h(ContextMenuTrigger, null, "Canvas"),
				h(
					ContextMenuPopup,
					null,
					h(
						ContextMenuSub,
						{ defaultOpen: true },
						h(ContextMenuSubTrigger, null, "Export format"),
						h(ContextMenuSubPopup, null, h(ContextMenuItem, null, "PNG"))
					)
				)
			)
		);

		const subTrigger = document.body.querySelector(
			'[data-slot="context-menu-sub-trigger"]'
		);
		const subContent = document.body.querySelector(
			'[data-slot="context-menu-sub-content"]'
		);

		expect(subTrigger).not.toBeNull();
		expect(subContent).not.toBeNull();
		expect(subTrigger?.querySelector("svg")).not.toBeNull();
		unmount();
	});

	it("applies exact StyleX item variant and inset styling contracts", () => {
		propsSpy.mockClear();
		const { unmount } = mount(
			h(
				ContextMenu,
				{ defaultOpen: true },
				h(ContextMenuTrigger, null, "Area"),
				h(
					ContextMenuPopup,
					null,
					h(ContextMenuItem, { inset: true, variant: "destructive" }, "Delete")
				)
			)
		);

		expect(propsSpy).toHaveBeenCalledWith(
			menuStyles.item,
			menuStyles.itemDestructive,
			menuStyles.inset
		);
		unmount();
	});

	it("preserves base item styles in composed className when variant and inset are applied", () => {
		// Given: ContextMenuItem rendered with destructive variant and inset
		const { unmount } = mount(
			h(
				ContextMenu,
				{ defaultOpen: true },
				h(ContextMenuTrigger, null, "Area"),
				h(
					ContextMenuPopup,
					null,
					h(ContextMenuItem, { inset: true, variant: "destructive" }, "Delete")
				)
			)
		);

		// When: inspecting the rendered element className at the public component seam
		const item = document.body.querySelector('[data-slot="context-menu-item"]');

		// Then: base menu item styles are composed into className without being overwritten by variant or inset
		expect(item?.className).toContain("menu-item");
		expect(item?.className).toContain("menu-item-destructive");
		expect(item?.className).toContain("menu-inset");
		unmount();
	});

	it("proves submenu chevron changes direction under Base UI DirectionProvider rtl", () => {
		const renderSubmenu = (direction: "ltr" | "rtl") =>
			mount(
				h(
					DirectionProvider,
					{ direction },
					h(
						ContextMenu,
						{ defaultOpen: true },
						h(ContextMenuTrigger, null, "Surface"),
						h(
							ContextMenuPopup,
							null,
							h(
								ContextMenuSub,
								{ defaultOpen: true },
								h(ContextMenuSubTrigger, null, "Submenu"),
								h(ContextMenuSubPopup, null, h(ContextMenuItem, null, "Child"))
							)
						)
					)
				)
			);

		// Given: submenu trigger rendered in LTR direction
		const ltr = renderSubmenu("ltr");
		const ltrPath = document.body
			.querySelector('[data-slot="context-menu-sub-trigger"] svg path')
			?.getAttribute("d");
		ltr.unmount();

		// When: submenu trigger is rendered under DirectionProvider direction="rtl"
		const rtl = renderSubmenu("rtl");
		const rtlPath = document.body
			.querySelector('[data-slot="context-menu-sub-trigger"] svg path')
			?.getAttribute("d");
		rtl.unmount();

		// Then: chevron path must change direction rather than staying hard-coded right
		expect(rtlPath).not.toBe(ltrPath);
	});
});
