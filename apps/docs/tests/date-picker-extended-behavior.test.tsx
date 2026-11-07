// @vitest-environment happy-dom
import { act, createElement as h } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(s: T): T => s,
	createTheme: <T extends object>(_variables: T, overrides: object): object =>
		overrides,
	defineConsts: <T extends object>(c: T): T => c,
	defineMarker: () => ({}),
	defineVars: <T extends object>(v: T): T => v,
	keyframes: <T extends object>(k: T): T => k,
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);

import { DatePicker } from "../../../packages/ui/src/components/date-picker/date-picker";
import { mount } from "./calendar-test-helpers";
import { setInputValue } from "./date-picker-test-helpers";

describe("DatePicker extended behavior", () => {
	it("commits valid value on Enter key press in text input", () => {
		const onValueChange = vi.fn();
		const { container, unmount } = mount(h(DatePicker, { onValueChange }));
		const input = container.querySelector("input");
		expect(input).not.toBeNull();
		if (!input) {
			return;
		}

		act(() => {
			input.focus();
		});
		act(() => {
			setInputValue(input, "2026-10-20");
		});
		act(() => {
			input.dispatchEvent(
				new KeyboardEvent("keydown", { bubbles: true, key: "Enter" })
			);
		});

		expect(onValueChange).toHaveBeenCalledTimes(1);
		const committed = onValueChange.mock.calls[0]?.[0];
		expect(committed?.getDate()).toBe(20);
		expect(input.getAttribute("aria-invalid")).toBeNull();

		unmount();
	});

	it("keeps text, calls no onValueChange, and exposes aria-invalid=true immediately on Enter while remaining focused", () => {
		const onValueChange = vi.fn();
		const initial = new Date(2026, 9, 3);
		const { container, unmount } = mount(
			h(DatePicker, { defaultValue: initial, onValueChange })
		);
		const input = container.querySelector("input");
		expect(input).not.toBeNull();
		if (!input) {
			return;
		}

		act(() => {
			input.focus();
		});
		act(() => {
			setInputValue(input, "2026-02-29");
		});
		act(() => {
			input.dispatchEvent(
				new KeyboardEvent("keydown", { bubbles: true, key: "Enter" })
			);
		});

		expect(onValueChange).not.toHaveBeenCalled();
		expect(input.value).toBe("2026-02-29");
		expect(input.getAttribute("aria-invalid")).toBe("true");

		act(() => {
			setInputValue(input, "2026-02-2");
		});
		expect(input.getAttribute("aria-invalid")).toBeNull();

		act(() => {
			setInputValue(input, "2026-02-30");
			input.dispatchEvent(
				new KeyboardEvent("keydown", { bubbles: true, key: "Enter" })
			);
		});
		expect(input.getAttribute("aria-invalid")).toBe("true");

		act(() => {
			input.blur();
		});
		expect(input.value).toBe("2026-02-30");
		expect(input.getAttribute("aria-invalid")).toBe("true");

		act(() => {
			input.focus();
		});
		expect(input.value).toBe("2026-02-30");
		expect(input.getAttribute("aria-invalid")).toBe("true");

		unmount();
	});

	it("enforces minValue and maxValue constraints during text entry", () => {
		const onValueChange = vi.fn();
		const min = new Date(2026, 9, 10);
		const max = new Date(2026, 9, 20);
		const { container, unmount } = mount(
			h(DatePicker, { maxValue: max, minValue: min, onValueChange })
		);
		const input = container.querySelector("input");
		expect(input).not.toBeNull();
		if (!input) {
			return;
		}

		act(() => {
			input.focus();
		});
		act(() => {
			setInputValue(input, "2026-10-05"); // before min
		});
		act(() => {
			input.blur();
		});

		expect(onValueChange).not.toHaveBeenCalled();
		expect(input.getAttribute("aria-invalid")).toBe("true");

		act(() => {
			input.focus();
		});
		act(() => {
			setInputValue(input, "2026-10-25"); // after max
		});
		act(() => {
			input.blur();
		});

		expect(onValueChange).not.toHaveBeenCalled();
		expect(input.getAttribute("aria-invalid")).toBe("true");

		act(() => {
			input.focus();
		});
		act(() => {
			setInputValue(input, "2026-10-15"); // valid
		});
		act(() => {
			input.blur();
		});

		expect(onValueChange).toHaveBeenCalledTimes(1);
		expect(input.getAttribute("aria-invalid")).toBeNull();

		unmount();
	});

	it("enforces isDateUnavailable constraint", () => {
		const onValueChange = vi.fn();
		const isDateUnavailable = (d: Date) => d.getDate() === 15;
		const { container, unmount } = mount(
			h(DatePicker, { isDateUnavailable, onValueChange })
		);
		const input = container.querySelector("input");
		expect(input).not.toBeNull();
		if (!input) {
			return;
		}

		act(() => {
			input.focus();
		});
		act(() => {
			setInputValue(input, "2026-10-15"); // unavailable
		});
		act(() => {
			input.blur();
		});

		expect(onValueChange).not.toHaveBeenCalled();
		expect(input.getAttribute("aria-invalid")).toBe("true");

		unmount();
	});

	it("preserves dirty focused draft across controlled updates, but syncs when blurred", () => {
		let controlledValue: Date | undefined = new Date(2026, 9, 1);
		const { container, rerender, unmount } = mount(
			h(DatePicker, { value: controlledValue })
		);
		const input = container.querySelector("input");
		expect(input?.value).toBe("2026-10-01");
		if (!input) {
			return;
		}

		act(() => {
			input.focus();
		});
		act(() => {
			setInputValue(input, "2026-10-18");
		});

		// Parent updates controlled value while input is focused
		controlledValue = new Date(2026, 9, 5);
		rerender(h(DatePicker, { value: controlledValue }));

		// Dirty draft preserved while focused
		expect(input.value).toBe("2026-10-18");

		// Blur input - next controlled update syncs
		act(() => {
			input.blur();
		});

		controlledValue = new Date(2026, 9, 25);
		rerender(h(DatePicker, { value: controlledValue }));
		expect(input.value).toBe("2026-10-25");

		unmount();
	});
});
