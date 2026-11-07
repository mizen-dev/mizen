// @vitest-environment happy-dom

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Menu as BaseMenu } from "../../../packages/ui/node_modules/@base-ui/react/menu/index.mjs";
import type {
	MenuItemProps,
	MenuPopupProps,
	MenuShortcutProps,
	MenuSubPopupProps,
} from "../../../packages/ui/src/components/menu/menu";

const MenuParts = await import("../../../packages/ui/src/components/menu/menu");

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T) => styles,
	defineConsts: <T extends object>(values: T) => values,
	defineMarker: () => ({}),
	defineVars: <T extends object>(values: T) => values,
	keyframes: () => "keyframes",
	props: () => ({ className: "mizen-default" }),
	when: { ancestor: () => ":where(*)" },
}));

const popupProps: MenuPopupProps = {
	anchor: { getBoundingClientRect: () => new DOMRect() },
	portalProps: { keepMounted: true },
	render: createElement("section"),
};
const centeredSubmenu: MenuSubPopupProps = { align: "center" };
const shortcutProps: MenuShortcutProps = { "aria-hidden": true };
const itemProps: MenuItemProps = {
	inset: true,
	render: createElement("button", { type: "button" }),
	variant: "destructive",
};

describe("Menu API", () => {
	it("exposes native roots, portal, handle, and namespace", () => {
		expect(MenuParts.Menu).toBe(BaseMenu.Root);
		expect(MenuParts.MenuPortal).toBe(BaseMenu.Portal);
		expect(MenuParts.MenuCreateHandle).toBe(BaseMenu.createHandle);
		expect(MenuParts.MenuPrimitive).toBe(BaseMenu);
		expect(MenuParts.MenuSub).toBe(BaseMenu.SubmenuRoot);
		// One name per part: Menu has no DropdownMenu aliases.
		expect(MenuParts).not.toHaveProperty("DropdownMenu");
		expect(popupProps.portalProps?.keepMounted).toBe(true);
		expect(centeredSubmenu.align).toBe("center");
		expect(itemProps.inset).toBe(true);
	});
	it("renders a native kbd and keeps Mizen styling", () => {
		const html = renderToStaticMarkup(
			createElement(MenuParts.MenuShortcut, shortcutProps, "⌘O")
		);
		expect(html).toContain("<kbd");
		expect(html).toContain("mizen-default");
		const group = renderToStaticMarkup(createElement(MenuParts.MenuGroup));
		expect(group).toContain("mizen-default");
	});
});
