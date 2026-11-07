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

import { Calendar } from "../../../packages/ui/src/components/calendar/calendar";
import { findDayButton, isDaySelected, mount } from "./calendar-test-helpers";

describe("Calendar single-mode uncontrolled date selection behavior", () => {
	it("renders a fixed June 2026 month, clicks an enabled day, verifies onValueChange receives selected Date, and updates selected state", () => {
		const onValueChange = vi.fn();
		const fixedMonth = new Date(2026, 5, 1);

		const { container, unmount } = mount(
			h(Calendar, {
				defaultMonth: fixedMonth,
				mode: "single",
				onValueChange,
			})
		);

		const day15Button = findDayButton(container, 15, "June", 2026);
		expect(day15Button).toBeDefined();
		expect(day15Button.disabled).toBe(false);

		expect(isDaySelected(day15Button)).toBe(false);

		act(() => {
			day15Button.click();
		});

		expect(onValueChange).toHaveBeenCalledTimes(1);
		const receivedDate: unknown = onValueChange.mock.calls[0]?.[0];
		expect(receivedDate).toBeInstanceOf(Date);
		if (!(receivedDate instanceof Date)) {
			throw new Error("Expected receivedDate to be an instance of Date");
		}
		expect(receivedDate.getFullYear()).toBe(2026);
		expect(receivedDate.getMonth()).toBe(5);
		expect(receivedDate.getDate()).toBe(15);

		expect(isDaySelected(day15Button)).toBe(true);

		unmount();
	});

	it("initializes selected date from defaultValue and updates selection state upon clicking another day", () => {
		const onValueChange = vi.fn();
		const initialDate = new Date(2026, 5, 10);

		const { container, unmount } = mount(
			h(Calendar, {
				defaultValue: initialDate,
				mode: "single",
				onValueChange,
			})
		);

		const day10Button = findDayButton(container, 10, "June", 2026);
		expect(isDaySelected(day10Button)).toBe(true);

		const day20Button = findDayButton(container, 20, "June", 2026);
		act(() => {
			day20Button.click();
		});

		expect(onValueChange).toHaveBeenCalledTimes(1);
		const nextDate: unknown = onValueChange.mock.calls[0]?.[0];
		expect(nextDate).toBeInstanceOf(Date);
		if (!(nextDate instanceof Date)) {
			throw new Error("Expected nextDate to be an instance of Date");
		}
		expect(nextDate.getDate()).toBe(20);

		expect(isDaySelected(day20Button)).toBe(true);

		unmount();
	});

	it("proves controlled single selection calls onValueChange without mutating rendered selection until parent rerenders", () => {
		const onValueChange = vi.fn();
		const controlledDate = new Date(2026, 5, 10);
		const day20 = new Date(2026, 5, 20);

		const { container, rerender, unmount } = mount(
			h(Calendar, {
				defaultMonth: new Date(2026, 5, 1),
				mode: "single",
				onValueChange,
				value: controlledDate,
			})
		);

		const day10Button = findDayButton(container, 10, "June", 2026);
		const day20Button = findDayButton(container, 20, "June", 2026);
		expect(isDaySelected(day10Button)).toBe(true);
		expect(isDaySelected(day20Button)).toBe(false);

		act(() => {
			day20Button.click();
		});

		expect(onValueChange).toHaveBeenCalledTimes(1);
		expect(onValueChange.mock.calls[0]?.[0]?.getDate()).toBe(20);

		expect(isDaySelected(day10Button)).toBe(true);
		expect(isDaySelected(day20Button)).toBe(false);

		rerender(
			h(Calendar, {
				defaultMonth: new Date(2026, 5, 1),
				mode: "single",
				onValueChange,
				value: day20,
			})
		);

		expect(isDaySelected(day20Button)).toBe(true);
		expect(isDaySelected(day10Button)).toBe(false);

		unmount();
	});

	it("finds day button using month-aware ISO fallback when text and aria-label do not match", () => {
		const container = document.createElement("div");
		const btn = document.createElement("button");
		btn.setAttribute("data-day", "2026-07-04");
		container.appendChild(btn);

		const found = findDayButton(container, 4, "July", 2026);
		expect(found).toBe(btn);
	});
});
