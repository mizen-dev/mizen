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

describe("DatePicker regression tests", () => {
	it("does not discard dirty focused draft when rerendered with newly allocated Date for the same local calendar day", () => {
		const initialDate = new Date(2026, 9, 3, 0, 0, 0);
		const { container, rerender, unmount } = mount(
			h(DatePicker, { value: initialDate })
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
			setInputValue(input, "2026-10-25");
		});

		// Parent re-renders with a newly allocated Date instance for the SAME day
		const newlyAllocatedSameDay = new Date(2026, 9, 3, 14, 30, 0);
		rerender(h(DatePicker, { value: newlyAllocatedSameDay }));

		// Dirty draft must be preserved while focused
		expect(input.value).toBe("2026-10-25");

		unmount();
	});

	it("does not emit onValueChange on blur when committed value has non-midnight time and input text matches same calendar day", () => {
		const onValueChange = vi.fn();
		const nonMidnightDate = new Date(2026, 9, 3, 15, 45, 0);
		const { container, unmount } = mount(
			h(DatePicker, { onValueChange, value: nonMidnightDate })
		);
		const input = container.querySelector("input");
		expect(input).not.toBeNull();
		if (!input) {
			return;
		}

		expect(input.value).toBe("2026-10-03");

		act(() => {
			input.focus();
		});
		act(() => {
			input.blur();
		});

		// Same calendar day, so blur must NOT emit a change
		expect(onValueChange).not.toHaveBeenCalled();

		unmount();
	});

	it("replaces an invalid blurred draft when parent later changes the controlled calendar day", () => {
		const { container, rerender, unmount } = mount(
			h(DatePicker, { value: new Date(2026, 9, 3) })
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
			setInputValue(input, "2026-02-29"); // invalid leap day
		});
		act(() => {
			input.blur();
		});

		// Stays invalid while base key matches
		expect(input.value).toBe("2026-02-29");
		expect(input.getAttribute("aria-invalid")).toBe("true");

		// Parent updates controlled calendar day to a new day
		rerender(h(DatePicker, { value: new Date(2026, 9, 10) }));

		// New controlled day supersedes stale invalid draft
		expect(input.value).toBe("2026-10-10");
		expect(input.getAttribute("aria-invalid")).toBeNull();

		unmount();
	});

	it("has fixed placeholder YYYY-MM-DD on input without inputMode numeric", () => {
		const { container, unmount } = mount(h(DatePicker, {}));
		const input = container.querySelector("input");
		expect(input?.placeholder).toBe("YYYY-MM-DD");
		expect(input?.getAttribute("inputmode")).toBeNull();
		unmount();
	});
});
