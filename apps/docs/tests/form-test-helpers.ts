import type { ReactNode } from "react";
import { act, createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { Field } from "../../../packages/ui/src/components/field/field";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);

export function mount(
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

export function setInputValue(input: HTMLInputElement, value: string) {
	const nativeSetter = Object.getOwnPropertyDescriptor(
		HTMLInputElement.prototype,
		"value"
	)?.set;
	if (nativeSetter) {
		nativeSetter.call(input, value);
	} else {
		input.value = value;
	}
	input.dispatchEvent(new Event("input", { bubbles: true }));
	input.dispatchEvent(new Event("change", { bubbles: true }));
}

export function renderBoundField(
	field: unknown,
	...children: readonly (ReactNode | undefined)[]
) {
	return Reflect.apply(h, undefined, [Field, { field }, ...children]);
}
