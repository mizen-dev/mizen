// @vitest-environment happy-dom
import { type HTMLAttributes, createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

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

import {
	ContextMenu,
	type ContextMenuCheckboxItemProps,
	type ContextMenuCheckboxItemVariant,
	type ContextMenuGroupLabelProps,
	type ContextMenuGroupProps,
	type ContextMenuItemProps,
	type ContextMenuItemVariant,
	type ContextMenuLinkItemProps,
	type ContextMenuPopupProps,
	ContextMenuPortal,
	ContextMenuPrimitive,
	type ContextMenuProps,
	type ContextMenuRadioGroupProps,
	type ContextMenuRadioItemProps,
	type ContextMenuSeparatorProps,
	type ContextMenuShortcutProps,
	type ContextMenuSubPopupProps,
	type ContextMenuSubProps,
	type ContextMenuSubTriggerProps,
	ContextMenuTrigger,
	type ContextMenuTriggerProps,
} from "../../../packages/ui/src/components/context-menu/context-menu";

type Accepts<T, K extends PropertyKey> = K extends keyof T ? true : false;
type RejectsAll<T, K extends PropertyKey> = [Extract<keyof T, K>] extends [
	never,
]
	? true
	: false;

type Omitted = "className" | "style";
type ApiContract = [
	RejectsAll<ContextMenuProps, Omitted>,
	Accepts<ContextMenuProps, "open" | "defaultOpen" | "onOpenChange">,
	RejectsAll<ContextMenuTriggerProps, Omitted>,
	Accepts<ContextMenuTriggerProps, "render" | "ref">,
	RejectsAll<ContextMenuPopupProps, Omitted>,
	Accepts<
		ContextMenuPopupProps,
		| "align"
		| "alignOffset"
		| "anchor"
		| "portalProps"
		| "ref"
		| "side"
		| "sideOffset"
	>,
	RejectsAll<ContextMenuItemProps, Omitted>,
	Accepts<
		ContextMenuItemProps,
		"closeOnClick" | "disabled" | "inset" | "ref" | "variant"
	>,
	RejectsAll<ContextMenuLinkItemProps, Omitted>,
	Accepts<
		ContextMenuLinkItemProps,
		"closeOnClick" | "href" | "inset" | "ref" | "variant"
	>,
	RejectsAll<ContextMenuCheckboxItemProps, Omitted>,
	Accepts<
		ContextMenuCheckboxItemProps,
		"checked" | "defaultChecked" | "onCheckedChange" | "ref" | "variant"
	>,
	RejectsAll<ContextMenuRadioGroupProps, Omitted>,
	Accepts<
		ContextMenuRadioGroupProps,
		"defaultValue" | "onValueChange" | "value"
	>,
	RejectsAll<ContextMenuRadioItemProps, Omitted>,
	Accepts<ContextMenuRadioItemProps, "ref" | "value">,
	RejectsAll<ContextMenuGroupProps, Omitted>,
	RejectsAll<ContextMenuGroupLabelProps, Omitted>,
	Accepts<ContextMenuGroupLabelProps, "inset" | "ref">,
	RejectsAll<ContextMenuSeparatorProps, Omitted>,
	RejectsAll<ContextMenuShortcutProps, Omitted>,
	RejectsAll<ContextMenuSubProps, Omitted>,
	Accepts<ContextMenuSubProps, "defaultOpen" | "onOpenChange" | "open">,
	RejectsAll<ContextMenuSubTriggerProps, Omitted>,
	Accepts<ContextMenuSubTriggerProps, "inset" | "ref">,
	RejectsAll<ContextMenuSubPopupProps, Omitted>,
	Accepts<
		ContextMenuSubPopupProps,
		"align" | "alignOffset" | "portalProps" | "ref" | "side" | "sideOffset"
	>,
	"default" extends ContextMenuItemVariant ? true : false,
	"destructive" extends ContextMenuItemVariant ? true : false,
	"default" extends ContextMenuCheckboxItemVariant ? true : false,
	"switch" extends ContextMenuCheckboxItemVariant ? true : false,
];

const contractChecks: ApiContract = [
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

describe("ContextMenu type contracts", () => {
	it("exports runtime members and matches identity aliases", async () => {
		expect(import.meta.resolve("@mizen/ui")).toContain(
			"packages/ui/dist/index.js"
		);
		expect(import.meta.resolve("@mizen/ui/context-menu")).toContain(
			"packages/ui/dist/components/context-menu/context-menu.js"
		);

		const mod = await import(
			"../../../packages/ui/src/components/context-menu/context-menu"
		);
		expect(Object.keys(mod).sort()).toEqual([
			"ContextMenu",
			"ContextMenuCheckboxItem",
			"ContextMenuGroup",
			"ContextMenuGroupLabel",
			"ContextMenuItem",
			"ContextMenuLinkItem",
			"ContextMenuPopup",
			"ContextMenuPortal",
			"ContextMenuPrimitive",
			"ContextMenuRadioGroup",
			"ContextMenuRadioItem",
			"ContextMenuSeparator",
			"ContextMenuShortcut",
			"ContextMenuSub",
			"ContextMenuSubPopup",
			"ContextMenuSubTrigger",
			"ContextMenuTrigger",
		]);

		expect(mod.ContextMenu).toBe(mod.ContextMenuPrimitive.Root);
		expect(ContextMenu).toBe(ContextMenuPrimitive.Root);
		expect(mod.ContextMenuPortal).toBe(mod.ContextMenuPrimitive.Portal);
		expect(ContextMenuPortal).toBe(ContextMenuPrimitive.Portal);

		for (const part of [
			"Root",
			"Trigger",
			"Portal",
			"Positioner",
			"Popup",
			"Group",
			"GroupLabel",
			"Item",
			"LinkItem",
			"CheckboxItem",
			"RadioGroup",
			"RadioItem",
			"Separator",
			"SubmenuRoot",
			"SubmenuTrigger",
		]) {
			expect(mod.ContextMenuPrimitive).toHaveProperty(part);
		}
		expect(contractChecks.every((c) => c === true)).toBe(true);
	});

	it("renders trigger element with canonical slot and non-button semantics", () => {
		const markup = renderToStaticMarkup(
			h(ContextMenu, null, h(ContextMenuTrigger, null, "Surface"))
		);

		expect(markup).toContain('data-slot="context-menu-trigger"');
		expect(markup).toContain("Surface");
		expect(markup).not.toContain('type="button"');
	});

	it("protects data-slot when forwarding custom render on trigger", () => {
		const markup = renderToStaticMarkup(
			h(
				ContextMenu,
				null,
				h(ContextMenuTrigger, {
					render: (triggerProps: HTMLAttributes<HTMLDivElement>) =>
						h("section", { ...triggerProps, "aria-label": "Workspace area" }),
				})
			)
		);

		expect(markup).toContain('data-slot="context-menu-trigger"');
		expect(markup).toContain('aria-label="Workspace area"');
		expect(markup).toContain("<section");
	});
});
