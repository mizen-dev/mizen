// @vitest-environment happy-dom

import { act, createRef, createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import {
	Toggle,
	ToggleGroup,
} from "../../../packages/ui/src/components/toggle/toggle";
import {
	Toolbar,
	ToolbarButton,
	ToolbarGroup,
	ToolbarInput,
	ToolbarSeparator,
} from "../../../packages/ui/src/components/toolbar/toolbar";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(constants: T): T => constants,
	defineMarker: () => ({}),
	defineVars: <T extends object>(variables: T): T => variables,
	keyframes: <T extends object>(frames: T): T => frames,
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

function mount(
	element: Parameters<ReturnType<typeof createRoot>["render"]>[0]
) {
	const container = document.body.appendChild(document.createElement("div"));
	const root = createRoot(container);
	act(() => root.render(element));
	return {
		buttons: () => container.querySelectorAll<HTMLButtonElement>("button"),
		container,
		unmount: () => {
			act(() => root.unmount());
			container.remove();
		},
	};
}

describe("Toolbar behavior", () => {
	it("preserves native input refs, initial text, and character sizing", () => {
		const ref = createRef<HTMLInputElement>();
		const view = mount(
			h(
				Toolbar,
				{ "aria-label": "Search tools" },
				h(ToolbarInput, {
					"aria-label": "Find",
					defaultValue: "Workspace",
					ref,
					size: 18,
				})
			)
		);
		expect(ref.current).toBe(view.container.querySelector("input"));
		expect(ref.current?.value).toBe("Workspace");
		expect(ref.current?.getAttribute("size")).toBe("18");
		view.unmount();
	});
	it("preserves Button loading state and blocks repeated actions", () => {
		const onClick = vi.fn();
		const view = mount(
			h(
				Toolbar,
				{ "aria-label": "Actions" },
				h(ToolbarButton, { loading: true, onClick }, "Save")
			)
		);
		const [button] = view.buttons();
		expect(button?.getAttribute("aria-busy")).toBe("true");
		expect(button?.hasAttribute("data-loading")).toBe(true);
		expect(
			button?.querySelector('[data-slot="button-loading-indicator"]')
		).not.toBeNull();
		act(() => button?.click());
		expect(onClick).not.toHaveBeenCalled();
		view.unmount();
	});

	it("forwards a button action once", () => {
		const onClick = vi.fn();
		const view = mount(
			h(
				Toolbar,
				{ "aria-label": "Actions" },
				h(ToolbarButton, { "aria-label": "Save", onClick }, "Save")
			)
		);
		act(() => view.buttons()[0]?.click());
		expect(onClick).toHaveBeenCalledTimes(1);
		view.unmount();
	});

	it("applies horizontal and vertical orientation semantics", () => {
		const horizontal = mount(
			h(
				Toolbar,
				{ "aria-label": "Horizontal tools" },
				h(ToolbarButton, { "aria-label": "First" }, "1"),
				h(ToolbarButton, { "aria-label": "Disabled", disabled: true }, "2"),
				h(ToolbarButton, { "aria-label": "Last" }, "3")
			)
		);
		const horizontalButtons = horizontal.buttons();
		expect(horizontalButtons[0]?.getAttribute("data-orientation")).toBe(
			"horizontal"
		);
		horizontal.unmount();

		const vertical = mount(
			h(
				Toolbar,
				{ "aria-label": "Vertical tools", orientation: "vertical" },
				h(ToolbarButton, { "aria-label": "First" }, "1"),
				h(ToolbarButton, { "aria-label": "Second" }, "2")
			)
		);
		const verticalButtons = vertical.buttons();
		expect(verticalButtons[0]?.getAttribute("data-orientation")).toBe(
			"vertical"
		);
		vertical.unmount();
	});

	it("supports ToggleGroup state inside Toolbar and restores its separator orientation", () => {
		const view = mount(
			h(
				Toolbar,
				{ "aria-label": "Formatting tools" },
				h(
					ToggleGroup,
					{ "aria-label": "Alignment", defaultValue: ["left"] },
					h(
						ToolbarButton,
						{
							"aria-label": "Align left",
							render: h(Toggle, { value: "left" }),
						},
						"Left"
					),
					h(
						ToolbarButton,
						{
							"aria-label": "Align right",
							render: h(Toggle, { value: "right" }),
						},
						"Right"
					)
				),
				h(ToolbarSeparator),
				h(
					ToolbarGroup,
					null,
					h(ToolbarButton, { "aria-label": "Save" }, "Save")
				)
			)
		);
		const buttons = view.buttons();
		expect(buttons[0]?.getAttribute("aria-pressed")).toBe("true");
		act(() => buttons[1]?.click());
		expect(buttons[0]?.getAttribute("aria-pressed")).toBe("false");
		expect(buttons[1]?.getAttribute("aria-pressed")).toBe("true");
		expect(
			view.container
				.querySelector('[data-slot="toolbar-separator"]')
				?.getAttribute("aria-orientation")
		).toBe("vertical");
		view.unmount();
	});
});
