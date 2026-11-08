// @vitest-environment happy-dom
import { act, createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vite-plus/test";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
	InputGroupTextarea,
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

describe("InputGroup focus redirection and interactive guards", () => {
	it("redirects static addon clicks inside a focusable host and prevents default", () => {
		const userMouseDown = vi.fn();
		const { container, unmount } = mount(
			h(
				InputGroup,
				null,
				h(InputGroupInput, { defaultValue: "test" }),
				h(
					InputGroupAddon,
					{ align: "inline-start", onMouseDown: userMouseDown },
					h(InputGroupText, null, "Prefix")
				)
			)
		);

		container.tabIndex = 0;
		const input = container.querySelector<HTMLInputElement>(
			'[data-slot="input-group-input"]'
		);
		const addonText = container.querySelector('[data-slot="input-group-text"]');
		expect(input).not.toBeNull();
		expect(addonText).not.toBeNull();
		if (!(input && addonText)) {
			throw new Error("Elements not found");
		}

		const focusSpy = vi.spyOn(input, "focus");

		const mouseDownEvent = new MouseEvent("mousedown", {
			bubbles: true,
			cancelable: true,
		});
		const preventDefaultSpy = vi.spyOn(mouseDownEvent, "preventDefault");

		addonText.dispatchEvent(mouseDownEvent);

		expect(userMouseDown).toHaveBeenCalledTimes(1);
		expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
		expect(focusSpy).toHaveBeenCalledTimes(1);

		unmount();
	});

	it("redirects mouse down to textarea when paired with InputGroupTextarea", () => {
		const { container, unmount } = mount(
			h(
				InputGroup,
				null,
				h(InputGroupTextarea, { defaultValue: "notes" }),
				h(
					InputGroupAddon,
					{ align: "block-start" },
					h(InputGroupText, null, "Header")
				)
			)
		);

		const textarea = container.querySelector<HTMLTextAreaElement>(
			'[data-slot="input-group-textarea"]'
		);
		const addon = container.querySelector('[data-slot="input-group-addon"]');
		expect(textarea).not.toBeNull();
		expect(addon).not.toBeNull();
		if (!(textarea && addon)) {
			throw new Error("Elements not found");
		}

		const focusSpy = vi.spyOn(textarea, "focus");
		const mouseDownEvent = new MouseEvent("mousedown", {
			bubbles: true,
			cancelable: true,
		});

		addon.dispatchEvent(mouseDownEvent);
		expect(focusSpy).toHaveBeenCalledTimes(1);

		unmount();
	});

	it("does not refocus if input is already focused", () => {
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
		const text = container.querySelector('[data-slot="input-group-text"]');
		expect(input).not.toBeNull();
		expect(text).not.toBeNull();
		if (!(input && text)) {
			throw new Error("Elements not found");
		}

		input.focus();
		const focusSpy = vi.spyOn(input, "focus");

		const mouseDownEvent = new MouseEvent("mousedown", {
			bubbles: true,
			cancelable: true,
		});
		text.dispatchEvent(mouseDownEvent);

		expect(focusSpy).not.toHaveBeenCalled();

		unmount();
	});

	it("does not focus disabled input", () => {
		const { container, unmount } = mount(
			h(
				InputGroup,
				null,
				h(InputGroupInput, { disabled: true }),
				h(InputGroupAddon, null, h(InputGroupText, null, "Prefix"))
			)
		);

		const input = container.querySelector<HTMLInputElement>(
			'[data-slot="input-group-input"]'
		);
		const text = container.querySelector('[data-slot="input-group-text"]');
		expect(input).not.toBeNull();
		expect(text).not.toBeNull();
		if (!(input && text)) {
			throw new Error("Elements not found");
		}

		const focusSpy = vi.spyOn(input, "focus");

		const mouseDownEvent = new MouseEvent("mousedown", {
			bubbles: true,
			cancelable: true,
		});
		text.dispatchEvent(mouseDownEvent);

		expect(focusSpy).not.toHaveBeenCalled();

		unmount();
	});

	it("bypasses redirection when consumer calls preventDefault", () => {
		const handleMouseDown = vi.fn((e: React.MouseEvent) => {
			e.preventDefault();
		});

		const { container, unmount } = mount(
			h(
				InputGroup,
				null,
				h(InputGroupInput, null),
				h(
					InputGroupAddon,
					{ onMouseDown: handleMouseDown },
					h(InputGroupText, null, "Prefix")
				)
			)
		);

		const input = container.querySelector<HTMLInputElement>(
			'[data-slot="input-group-input"]'
		);
		const text = container.querySelector('[data-slot="input-group-text"]');
		expect(input).not.toBeNull();
		expect(text).not.toBeNull();
		if (!(input && text)) {
			throw new Error("Elements not found");
		}
		const focusSpy = vi.spyOn(input, "focus");

		const mouseDownEvent = new MouseEvent("mousedown", {
			bubbles: true,
			cancelable: true,
		});
		text.dispatchEvent(mouseDownEvent);

		expect(handleMouseDown).toHaveBeenCalledTimes(1);
		expect(focusSpy).not.toHaveBeenCalled();

		unmount();
	});
});
