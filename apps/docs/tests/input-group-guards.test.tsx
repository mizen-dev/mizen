// @vitest-environment happy-dom
import { act, createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vite-plus/test";
import { Button } from "../../../packages/ui/src/components/button/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "../../../packages/ui/src/components/input-group/input-group";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	createTheme: <T extends object>(_v: T, overrides: object): object =>
		overrides,
	defineConsts: <T extends object>(c: T): T => c,
	defineMarker: () => ({}),
	defineVars: <T extends object>(v: T): T => v,
	keyframes: <T extends object>(k: T): T => k,
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);

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

describe("InputGroup interactive target guards in addons", () => {
	it("bypasses focus redirection for button controls", () => {
		const { container, unmount } = mount(
			h(
				InputGroup,
				null,
				h(InputGroupInput, null),
				h(
					InputGroupAddon,
					{ align: "inline-end" },
					h(Button, { size: "sm" }, "Action")
				)
			)
		);

		const input = container.querySelector<HTMLInputElement>(
			'[data-slot="input-group-input"]'
		);
		const button = container.querySelector("button");
		expect(input).not.toBeNull();
		expect(button).not.toBeNull();
		if (!(input && button)) {
			throw new Error("Elements not found");
		}

		const focusSpy = vi.spyOn(input, "focus");
		const mouseDownEvent = new MouseEvent("mousedown", {
			bubbles: true,
			cancelable: true,
		});
		const preventDefaultSpy = vi.spyOn(mouseDownEvent, "preventDefault");

		button.dispatchEvent(mouseDownEvent);

		expect(preventDefaultSpy).not.toHaveBeenCalled();
		expect(focusSpy).not.toHaveBeenCalled();
		unmount();
	});

	it("bypasses focus redirection for links, contenteditable, and tabindex elements", () => {
		const { container, unmount } = mount(
			h(
				InputGroup,
				null,
				h(InputGroupInput, null),
				h(
					InputGroupAddon,
					{ align: "inline-end" },
					h("a", { href: "#details" }, "Link"),
					h("span", { contentEditable: true }, "Editable"),
					h("div", { tabIndex: 0 }, "Focusable"),
					h("span", { role: "combobox" }, "Combo")
				)
			)
		);

		const input = container.querySelector<HTMLInputElement>(
			'[data-slot="input-group-input"]'
		);
		const link = container.querySelector("a");
		const editable = container.querySelector("[contenteditable]");
		const tabItem = container.querySelector("[tabindex='0']");
		const combo = container.querySelector("[role='combobox']");
		if (!(input && link && editable && tabItem && combo)) {
			throw new Error("Elements missing");
		}

		const focusSpy = vi.spyOn(input, "focus");

		for (const el of [link, editable, tabItem, combo]) {
			const evt = new MouseEvent("mousedown", {
				bubbles: true,
				cancelable: true,
			});
			const preventSpy = vi.spyOn(evt, "preventDefault");
			el.dispatchEvent(evt);
			expect(preventSpy).not.toHaveBeenCalled();
		}
		expect(focusSpy).not.toHaveBeenCalled();
		unmount();
	});

	it("ignores non-descendant or portal events where currentTarget does not contain target", () => {
		const { container, unmount } = mount(
			h(
				InputGroup,
				null,
				h(InputGroupInput, null),
				h(InputGroupAddon, null, h(InputGroupText, null, "Prefix"))
			)
		);

		const input = container.querySelector<HTMLInputElement>(
			'[data-slot="input-group-input"]'
		);
		const addon = container.querySelector('[data-slot="input-group-addon"]');
		if (!(input && addon)) {
			throw new Error("Elements missing");
		}

		const focusSpy = vi.spyOn(input, "focus");
		const externalEl = document.createElement("div");
		document.body.appendChild(externalEl);

		const evt = new MouseEvent("mousedown", {
			bubbles: false,
			cancelable: true,
		});
		Object.defineProperty(evt, "target", {
			configurable: true,
			value: externalEl,
		});

		addon.dispatchEvent(evt);
		expect(focusSpy).not.toHaveBeenCalled();

		externalEl.remove();
		unmount();
	});

	it("targets only direct protected input and ignores nested inputs in addons", () => {
		const { container, unmount } = mount(
			h(
				InputGroup,
				null,
				h(InputGroupInput, { defaultValue: "direct" }),
				h(
					InputGroupAddon,
					null,
					h(
						"div",
						null,
						h("input", {
							"data-slot": "nested-input",
							defaultValue: "nested",
						})
					),
					h(InputGroupText, null, "Label")
				)
			)
		);

		const directInput = container.querySelector<HTMLInputElement>(
			'[data-slot="input-group-input"]'
		);
		const nestedInput = container.querySelector<HTMLInputElement>(
			'[data-slot="nested-input"]'
		);
		const labelText = container.querySelector('[data-slot="input-group-text"]');
		if (!(directInput && nestedInput && labelText)) {
			throw new Error("Elements missing");
		}

		const directFocusSpy = vi.spyOn(directInput, "focus");
		const nestedFocusSpy = vi.spyOn(nestedInput, "focus");

		const evt = new MouseEvent("mousedown", {
			bubbles: true,
			cancelable: true,
		});
		labelText.dispatchEvent(evt);

		expect(directFocusSpy).toHaveBeenCalledTimes(1);
		expect(nestedFocusSpy).not.toHaveBeenCalled();
		unmount();
	});
});
