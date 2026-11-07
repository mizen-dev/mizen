// @vitest-environment happy-dom

import { createRef, createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { buttonStyles } from "../../../packages/ui/src/components/button/button.styles";
import {
	Toolbar,
	ToolbarButton,
	type ToolbarButtonProps,
	ToolbarGroup,
	type ToolbarGroupProps,
	ToolbarLink,
	type ToolbarLinkProps,
	type ToolbarProps,
	ToolbarSeparator,
	type ToolbarSeparatorProps,
} from "../../../packages/ui/src/components/toolbar/toolbar";

const propsSpy = vi.fn((_style?: object) => ({}));
vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(constants: T): T => constants,
	defineMarker: () => Symbol("stylex-marker"),
	defineVars: <T extends object>(variables: T): T => variables,
	keyframes: <T extends object>(frames: T): T => frames,
	props: (style?: object) => propsSpy(style),
	when: { ancestor: () => ({}) },
}));

type Rejects<T, K extends PropertyKey> = [Extract<keyof T, K>] extends [never]
	? true
	: false;
type Accepts<T, K extends PropertyKey> = K extends keyof T ? true : false;
type ClosedContract = [
	Rejects<
		ToolbarProps,
		"className" | "data-slot" | "style" | "render" | "role"
	>,
	Rejects<ToolbarButtonProps, "className" | "data-slot" | "style">,
	Rejects<
		ToolbarGroupProps,
		"className" | "data-slot" | "style" | "render" | "role"
	>,
	Rejects<
		ToolbarLinkProps,
		"className" | "data-slot" | "style" | "render" | "role"
	>,
	Rejects<
		ToolbarSeparatorProps,
		"className" | "data-slot" | "style" | "render" | "role"
	>,
	Accepts<ToolbarProps, "orientation" | "loopFocus" | "ref">,
	Accepts<
		ToolbarButtonProps,
		"render" | "loading" | "size" | "variant" | "ref"
	>,
	Accepts<ToolbarLinkProps, "href" | "ref">,
	Rejects<ToolbarSeparatorProps, "role">,
];
const closedContract: ClosedContract = [
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

describe("Toolbar contract", () => {
	it("renders the five toolbar parts and reuses Button by default", () => {
		const rootRef = createRef<HTMLDivElement>();
		const buttonRef = createRef<HTMLButtonElement>();
		const groupRef = createRef<HTMLDivElement>();
		const linkRef = createRef<HTMLAnchorElement>();
		const separatorRef = createRef<HTMLDivElement>();
		const markup = renderToStaticMarkup(
			h(
				Toolbar,
				{
					"aria-label": "Document tools",
					orientation: "vertical",
					ref: rootRef,
				},
				h(
					ToolbarGroup,
					{ ref: groupRef },
					h(ToolbarButton, { "aria-label": "Bold", ref: buttonRef }, "B"),
					h(ToolbarLink, { href: "/help", ref: linkRef }, "Help")
				),
				h(ToolbarSeparator, { ref: separatorRef })
			)
		);
		expect(markup).toContain('data-slot="toolbar"');
		expect(markup).toContain('data-orientation="vertical"');
		expect(markup).toContain('data-slot="toolbar-group"');
		expect(markup).toContain('data-slot="toolbar-button"');
		expect(markup).toContain('aria-label="Bold"');
		expect(markup).toContain('data-slot="toolbar-link"');
		expect(markup).toContain('href="/help"');
		expect(markup).toContain('data-slot="toolbar-separator"');
		expect(closedContract.every(Boolean)).toBe(true);
		expect(
			propsSpy.mock.calls.some(([style]) => style === buttonStyles.base)
		).toBe(true);
	});

	it("keeps slots and style props closed at runtime", () => {
		const bad = {
			className: "bad-class",
			"data-slot": "bad-slot",
			render: h("button", { type: "button" }, "Bad render"),
			role: "menu",
			style: { color: "red" },
		};
		const badButton = {
			className: bad.className,
			"data-slot": bad["data-slot"],
			style: bad.style,
		};
		const markup = renderToStaticMarkup(
			h(
				Toolbar,
				{ ...bad } as unknown as ToolbarProps,
				h(
					ToolbarButton,
					{ ...badButton } as unknown as ToolbarButtonProps,
					"Save"
				),
				h(ToolbarGroup, { ...bad } as unknown as ToolbarGroupProps, "Group"),
				h(
					ToolbarLink,
					{ ...bad, href: "/help" } as unknown as ToolbarLinkProps,
					"Help"
				),
				h(ToolbarSeparator, bad as unknown as ToolbarSeparatorProps)
			)
		);
		expect(markup).not.toContain("bad-class");
		expect(markup).not.toContain("bad-slot");
		expect(markup).not.toContain("color:red");
		expect(markup).not.toContain('role="menu"');
		expect(markup).not.toContain("Bad render");
		expect(markup).toContain('data-slot="toolbar"');
		expect(markup).toContain('data-slot="toolbar-separator"');
	});

	it("keeps ToolbarButton composable with Base UI render parts", () => {
		const toggle = h("button", {
			"data-slot": "toggle",
			type: "button",
			value: "bold",
		});
		const toolbarButton = h(
			ToolbarButton,
			{
				"aria-label": "Bold",
				render: toggle,
			},
			"B"
		);
		const markup = renderToStaticMarkup(h(Toolbar, null, toolbarButton));
		expect(markup).toContain('aria-label="Bold"');
		expect(markup).toContain('data-slot="toolbar"');
		expect(markup).toContain("<button");
		expect(markup).toContain(">B</button>");
	});
});
