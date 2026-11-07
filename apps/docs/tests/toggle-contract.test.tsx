// @vitest-environment happy-dom
import { act, createRef, createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
	Toggle,
	ToggleGroup,
	ToggleGroupItem,
	ToggleGroupSeparator,
} from "../../../packages/ui/src/components/toggle/toggle";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(values: T): T => values,
	defineMarker: () => ({}),
	defineVars: <T extends object>(values: T): T => values,
	keyframes: <T extends object>(values: T): T => values,
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));
Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);

describe("Toggle composition contract", () => {
	it("retains native buttons and protects closed styling and internal slots", () => {
		const unsupported = {
			className: "injected",
			"data-slot": "injected",
			defaultPressed: true,
			nativeButton: false,
			render: h("a"),
			style: { color: "red" },
		};
		const markup = renderToStaticMarkup(h(Toggle, unsupported, "Bold"));
		expect(markup).toContain("<button");
		expect(markup).toContain('type="button"');
		expect(markup).toContain('aria-pressed="true"');
		expect(markup).toContain('data-slot="toggle"');
		expect(markup).not.toContain("injected");
		expect(markup).not.toContain("color:red");
	});

	it("forwards item and separator refs and lets item cancellation veto a group change", () => {
		const container = document.body.appendChild(document.createElement("div"));
		const root = createRoot(container);
		const itemRef = createRef<HTMLButtonElement>();
		const separatorRef = createRef<HTMLDivElement>();
		const onValueChange = vi.fn();
		act(() =>
			root.render(
				h(
					ToggleGroup,
					{ "aria-label": "Formatting", defaultValue: ["bold"], onValueChange },
					h(ToggleGroupItem, { ref: itemRef, value: "bold" }, "Bold"),
					h(ToggleGroupSeparator, { ref: separatorRef }),
					h(
						ToggleGroupItem,
						{
							onPressedChange: (_pressed, details) => details.cancel(),
							value: "italic",
						},
						"Italic"
					)
				)
			)
		);
		expect(itemRef.current).toBe(container.querySelector("button"));
		expect(separatorRef.current?.getAttribute("aria-orientation")).toBe(
			"vertical"
		);
		act(() => container.querySelectorAll("button")[1]?.click());
		expect(onValueChange).not.toHaveBeenCalled();
		expect(itemRef.current?.getAttribute("aria-pressed")).toBe("true");
		act(() => itemRef.current?.click());
		expect(onValueChange).toHaveBeenCalledWith([], expect.any(Object));
		act(() => root.unmount());
		container.remove();
	});
});
