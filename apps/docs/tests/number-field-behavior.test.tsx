// @vitest-environment happy-dom
import { act, createElement as h, useState } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import {
	NumberField,
	NumberFieldDecrement,
	NumberFieldGroup,
	NumberFieldIncrement,
	NumberFieldInput,
} from "../../../packages/ui/src/components/number-field/number-field";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(s: T): T => s,
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

describe("NumberField stepping and keyboard interaction behavior", () => {
	it("steps uncontrolled value with increment and decrement buttons", () => {
		const onValueChange = vi.fn();
		const { container, unmount } = mount(
			h(
				NumberField,
				{ defaultValue: 5, onValueChange },
				h(
					NumberFieldGroup,
					null,
					h(NumberFieldDecrement, null),
					h(NumberFieldInput, null),
					h(NumberFieldIncrement, null)
				)
			)
		);

		const input = container.querySelector<HTMLInputElement>(
			'[data-slot="number-field-input"]'
		);
		const inc = container.querySelector<HTMLButtonElement>(
			'[data-slot="number-field-increment"]'
		);
		const dec = container.querySelector<HTMLButtonElement>(
			'[data-slot="number-field-decrement"]'
		);

		expect(input?.value).toBe("5");

		act(() => {
			inc?.click();
		});

		expect(input?.value).toBe("6");
		expect(onValueChange).toHaveBeenCalledTimes(1);
		expect(onValueChange).toHaveBeenCalledWith(6, expect.anything());

		act(() => {
			dec?.click();
		});

		expect(input?.value).toBe("5");
		expect(onValueChange).toHaveBeenCalledTimes(2);
		expect(onValueChange).toHaveBeenLastCalledWith(5, expect.anything());

		unmount();
	});

	it("supports controlled state and custom stepping amounts", () => {
		function Controlled() {
			const [val, setVal] = useState<number | null>(10);
			return h(
				NumberField,
				{ onValueChange: (next) => setVal(next), step: 5, value: val },
				h(
					NumberFieldGroup,
					null,
					h(NumberFieldDecrement, null),
					h(NumberFieldInput, null),
					h(NumberFieldIncrement, null)
				)
			);
		}

		const { container, unmount } = mount(h(Controlled));
		const input = container.querySelector<HTMLInputElement>(
			'[data-slot="number-field-input"]'
		);
		const inc = container.querySelector<HTMLButtonElement>(
			'[data-slot="number-field-increment"]'
		);

		expect(input?.value).toBe("10");

		act(() => {
			inc?.click();
		});

		expect(input?.value).toBe("15");
		unmount();
	});

	it("clamps values at min and max and supports arrow key navigation", () => {
		const { container, unmount } = mount(
			h(
				NumberField,
				{ defaultValue: 10, max: 10, min: 0, step: 2 },
				h(
					NumberFieldGroup,
					null,
					h(NumberFieldDecrement, null),
					h(NumberFieldInput, null),
					h(NumberFieldIncrement, null)
				)
			)
		);

		const input = container.querySelector<HTMLInputElement>(
			'[data-slot="number-field-input"]'
		);
		const inc = container.querySelector<HTMLButtonElement>(
			'[data-slot="number-field-increment"]'
		);

		act(() => {
			inc?.click();
		});
		expect(input?.value).toBe("10");

		act(() => {
			input?.dispatchEvent(
				new KeyboardEvent("keydown", { bubbles: true, key: "ArrowDown" })
			);
		});
		expect(input?.value).toBe("8");

		unmount();
	});

	it("formats displayed value with locale format options in happy-dom", () => {
		const { container, unmount } = mount(
			h(
				NumberField,
				{
					defaultValue: 42,
					format: { minimumFractionDigits: 2 },
				},
				h(NumberFieldGroup, null, h(NumberFieldInput, null))
			)
		);

		const input = container.querySelector<HTMLInputElement>(
			'[data-slot="number-field-input"]'
		);
		expect(input?.value).toBe("42.00");
		unmount();
	});

	it("supports custom accessible labels and custom stepper children", () => {
		const { container, unmount } = mount(
			h(
				NumberField,
				{ defaultValue: 1 },
				h(
					NumberFieldGroup,
					null,
					h(NumberFieldDecrement, { "aria-label": "Step down" }, "Minus"),
					h(NumberFieldInput, null),
					h(NumberFieldIncrement, { "aria-label": "Step up" }, "Plus")
				)
			)
		);

		const dec = container.querySelector('[data-slot="number-field-decrement"]');
		const inc = container.querySelector('[data-slot="number-field-increment"]');

		expect(dec?.getAttribute("aria-label")).toBe("Step down");
		expect(inc?.getAttribute("aria-label")).toBe("Step up");
		expect(dec?.textContent).toBe("Minus");
		expect(inc?.textContent).toBe("Plus");
		expect(dec?.querySelector("svg")).toBeNull();
		expect(inc?.querySelector("svg")).toBeNull();

		unmount();
	});

	it("prevents interaction when disabled or read-only", () => {
		const onValueChange = vi.fn();
		const { container: disContainer, unmount: unmountDis } = mount(
			h(
				NumberField,
				{ defaultValue: 5, disabled: true, onValueChange },
				h(
					NumberFieldGroup,
					null,
					h(NumberFieldDecrement, null),
					h(NumberFieldInput, null),
					h(NumberFieldIncrement, null)
				)
			)
		);

		const disInput = disContainer.querySelector<HTMLInputElement>(
			'[data-slot="number-field-input"]'
		);
		const disInc = disContainer.querySelector<HTMLButtonElement>(
			'[data-slot="number-field-increment"]'
		);

		expect(disInput?.disabled).toBe(true);
		act(() => {
			disInc?.click();
		});
		expect(disInput?.value).toBe("5");
		expect(onValueChange).not.toHaveBeenCalled();
		unmountDis();

		const { container: roContainer, unmount: unmountRo } = mount(
			h(
				NumberField,
				{ defaultValue: 5, onValueChange, readOnly: true },
				h(
					NumberFieldGroup,
					null,
					h(NumberFieldDecrement, null),
					h(NumberFieldInput, null),
					h(NumberFieldIncrement, null)
				)
			)
		);

		const roInput = roContainer.querySelector<HTMLInputElement>(
			'[data-slot="number-field-input"]'
		);
		const roInc = roContainer.querySelector<HTMLButtonElement>(
			'[data-slot="number-field-increment"]'
		);

		expect(roInput?.readOnly).toBe(true);
		act(() => {
			roInc?.click();
		});
		expect(roInput?.value).toBe("5");
		expect(onValueChange).not.toHaveBeenCalled();
		unmountRo();
	});
});
