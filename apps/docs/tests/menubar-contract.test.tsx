// @vitest-environment happy-dom

import type { ComponentType } from "react";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Menu } from "../../../packages/ui/src/components/menu/menu";
import {
	Menubar,
	type MenubarProps,
	MenubarTrigger,
	type MenubarTriggerProps,
} from "../../../packages/ui/src/components/menubar/menubar";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(constants: T): T => constants,
	defineMarker: () => ({}),
	defineVars: <T extends object>(variables: T): T => variables,
	keyframes: () => "keyframes",
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

type Rejects<P, K extends PropertyKey> = [Extract<keyof P, K>] extends [never]
	? true
	: false;
type HasRef<P> = "ref" extends keyof P ? true : false;
type CallbackProps<T> = T extends (...args: infer Args) => unknown
	? Args[0]
	: never;
type MenubarRenderProps = CallbackProps<NonNullable<MenubarProps["render"]>>;
type MenubarTriggerRenderProps = CallbackProps<
	NonNullable<MenubarTriggerProps["render"]>
>;
type MenubarContract = [
	Rejects<MenubarProps, "className" | "data-slot" | "role" | "style">,
	"orientation" extends keyof MenubarProps ? true : false,
	Rejects<MenubarProps, "aria-orientation">,
	"disabled" extends keyof MenubarProps ? true : false,
	HasRef<MenubarProps>,
	Rejects<MenubarTriggerProps, "className" | "data-slot" | "role" | "style">,
	"disabled" extends keyof MenubarTriggerProps ? true : false,
	"render" extends keyof MenubarTriggerProps ? true : false,
	HasRef<MenubarTriggerProps>,
];
const contract: MenubarContract = [
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
const UnsafeMenubar = Menubar as ComponentType<Record<string, unknown>>;
const UnsafeMenubarTrigger = MenubarTrigger as ComponentType<
	Record<string, unknown>
>;

describe("Menubar contract and semantics", () => {
	it("keeps styles and roles closed while supporting Base UI orientation", () => {
		expect(contract.every(Boolean)).toBe(true);
	});

	it("renders a named native menubar with a menuitem trigger", () => {
		const markup = renderToStaticMarkup(
			h(
				Menubar,
				{
					"aria-label": "Document commands",
					orientation: "vertical",
				} satisfies MenubarProps,
				h(Menu, null, h(MenubarTrigger, null, "File"))
			)
		);

		expect(markup).toContain('data-slot="menubar"');
		expect(markup).toContain('role="menubar"');
		expect(markup).toContain('aria-label="Document commands"');
		expect(markup).toContain('aria-orientation="vertical"');
		expect(markup).toContain('data-slot="menubar-trigger"');
		expect(markup).toContain('role="menuitem"');
		expect(markup).toContain("><span>File</span></button>");
	});

	it("protects slots and roles from unsafe props and render callbacks", () => {
		const markup = renderToStaticMarkup(
			h(
				UnsafeMenubar,
				{
					"aria-label": "Document commands",
					"aria-orientation": "horizontal",
					className: "unsafe",
					"data-slot": "wrong-root",
					orientation: "vertical",
					render: (renderProps: MenubarRenderProps) =>
						h("section", {
							...renderProps,
							"aria-orientation": "horizontal",
							role: "tree",
						}),
					role: "tree",
					style: { color: "red" },
				},
				h(
					Menu,
					null,
					h(UnsafeMenubarTrigger, {
						"data-slot": "wrong-trigger",
						render: (renderProps: MenubarTriggerRenderProps) =>
							h(
								"button",
								{ ...renderProps, role: "link", type: "button" },
								"File"
							),
						role: "link",
						style: { color: "red" },
					})
				)
			)
		);

		expect(markup).toContain('data-slot="menubar"');
		expect(markup).toContain('role="menubar"');
		expect(markup).toContain('aria-orientation="vertical"');
		expect(markup).toContain('data-slot="menubar-trigger"');
		expect(markup).toContain('role="menuitem"');
		expect(markup).not.toContain("wrong-");
		expect(markup).not.toContain("unsafe");
		expect(markup).not.toContain('role="tree"');
		expect(markup).not.toContain('role="link"');
		expect(markup).not.toContain("style=");
	});
});
