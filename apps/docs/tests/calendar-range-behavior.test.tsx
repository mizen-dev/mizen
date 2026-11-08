// @vitest-environment happy-dom
import { act, createElement as h } from "react";
import { describe, expect, it, vi } from "vite-plus/test";
import {
	Calendar,
	type CalendarRangeValue,
} from "../../../packages/ui/src/components/calendar/calendar";
import {
	findDayButton,
	isDate,
	isDaySelected,
	isRangeValue,
	mount,
} from "./calendar-test-helpers";

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

describe("Calendar range-mode uncontrolled selection behavior and constraints", () => {
	it("starts and completes an uncontrolled range selection with native Date values", () => {
		const onValueChange = vi.fn();
		const fixedMonth = new Date(2026, 5, 1);

		const { container, unmount } = mount(
			h(Calendar, {
				defaultMonth: fixedMonth,
				mode: "range",
				onValueChange,
			})
		);

		const day10Button = findDayButton(container, 10, "June", 2026);
		const day15Button = findDayButton(container, 15, "June", 2026);
		const day12Button = findDayButton(container, 12, "June", 2026);

		expect(isDaySelected(day10Button)).toBe(false);
		expect(isDaySelected(day15Button)).toBe(false);

		act(() => {
			day10Button.click();
		});

		expect(onValueChange).toHaveBeenCalledTimes(1);
		const firstCall: unknown = onValueChange.mock.calls[0]?.[0];
		if (
			!(
				isRangeValue(firstCall) &&
				isDate(firstCall.from) &&
				isDate(firstCall.to)
			)
		) {
			throw new Error(
				"Expected first range emission to be a zero-night range with matching from and to Dates"
			);
		}
		expect(firstCall.from.getFullYear()).toBe(2026);
		expect(firstCall.from.getMonth()).toBe(5);
		expect(firstCall.from.getDate()).toBe(10);
		expect(firstCall.to.getFullYear()).toBe(2026);
		expect(firstCall.to.getMonth()).toBe(5);
		expect(firstCall.to.getDate()).toBe(10);
		expect(isDaySelected(day10Button)).toBe(true);

		act(() => {
			day15Button.click();
		});

		expect(onValueChange).toHaveBeenCalledTimes(2);
		const secondCall: unknown = onValueChange.mock.calls[1]?.[0];
		if (
			!(
				isRangeValue(secondCall) &&
				isDate(secondCall.from) &&
				isDate(secondCall.to)
			)
		) {
			throw new Error(
				"Expected second range emission to contain completed from and to Dates"
			);
		}
		expect(secondCall.from.getDate()).toBe(10);
		expect(secondCall.to.getDate()).toBe(15);
		expect(isDaySelected(day10Button)).toBe(true);
		expect(isDaySelected(day12Button)).toBe(true);
		expect(isDaySelected(day15Button)).toBe(true);

		unmount();
	});

	it("enforces minNights constraint resetting a too-short range completion", () => {
		const onValueChange = vi.fn();
		const fixedMonth = new Date(2026, 5, 1);

		const { container, unmount } = mount(
			h(Calendar, {
				defaultMonth: fixedMonth,
				minNights: 3,
				mode: "range",
				onValueChange,
			})
		);

		const day10Button = findDayButton(container, 10, "June", 2026);
		const day11Button = findDayButton(container, 11, "June", 2026);

		act(() => {
			day10Button.click();
		});

		act(() => {
			day11Button.click();
		});

		const lastCall: unknown = onValueChange.mock.calls.at(-1)?.[0];
		if (!(isRangeValue(lastCall) && isDate(lastCall.from))) {
			throw new Error("Expected range callback payload with reset from Date");
		}
		expect(lastCall.from.getFullYear()).toBe(2026);
		expect(lastCall.from.getMonth()).toBe(5);
		expect(lastCall.from.getDate()).toBe(11);
		expect(lastCall.to).toBeUndefined();
		expect(isDaySelected(day11Button)).toBe(true);
		expect(isDaySelected(day10Button)).toBe(false);

		unmount();
	});

	it("enforces maxNights constraint resetting overlong range completions", () => {
		const onValueChange = vi.fn();
		const fixedMonth = new Date(2026, 5, 1);

		const { container, unmount } = mount(
			h(Calendar, {
				defaultMonth: fixedMonth,
				maxNights: 3,
				mode: "range",
				onValueChange,
			})
		);

		const day10Button = findDayButton(container, 10, "June", 2026);
		const day20Button = findDayButton(container, 20, "June", 2026);

		act(() => {
			day10Button.click();
		});

		act(() => {
			day20Button.click();
		});

		const lastCall: unknown = onValueChange.mock.calls.at(-1)?.[0];
		if (!(isRangeValue(lastCall) && isDate(lastCall.from))) {
			throw new Error("Expected range callback payload with reset from Date");
		}
		expect(lastCall.from.getFullYear()).toBe(2026);
		expect(lastCall.from.getMonth()).toBe(5);
		expect(lastCall.from.getDate()).toBe(20);
		expect(lastCall.to).toBeUndefined();
		expect(isDaySelected(day20Button)).toBe(true);
		expect(isDaySelected(day10Button)).toBe(false);

		unmount();
	});

	it("resets range selection when spanning an unavailable interior date", () => {
		const onValueChange = vi.fn();
		const fixedMonth = new Date(2026, 5, 1);

		const { container, unmount } = mount(
			h(Calendar, {
				defaultMonth: fixedMonth,
				isDateUnavailable: (date: Date) =>
					date.getFullYear() === 2026 &&
					date.getMonth() === 5 &&
					date.getDate() === 12,
				mode: "range",
				onValueChange,
			})
		);

		const day10Button = findDayButton(container, 10, "June", 2026);
		const day12Button = findDayButton(container, 12, "June", 2026);
		const day15Button = findDayButton(container, 15, "June", 2026);

		act(() => {
			day10Button.click();
		});

		act(() => {
			day15Button.click();
		});

		const lastCall: unknown = onValueChange.mock.calls.at(-1)?.[0];
		if (!(isRangeValue(lastCall) && isDate(lastCall.from))) {
			throw new Error("Expected range callback payload with reset from Date");
		}
		expect(lastCall.from.getFullYear()).toBe(2026);
		expect(lastCall.from.getMonth()).toBe(5);
		expect(lastCall.from.getDate()).toBe(15);
		expect(lastCall.to).toBeUndefined();
		expect(isDaySelected(day15Button)).toBe(true);
		expect(isDaySelected(day10Button)).toBe(false);
		expect(isDaySelected(day12Button)).toBe(false);

		unmount();
	});

	it("proves controlled range selection calls onValueChange without mutating rendered selection until parent rerenders", () => {
		const onValueChange = vi.fn();
		const controlledRange: CalendarRangeValue = {
			from: new Date(2026, 5, 10),
			to: new Date(2026, 5, 15),
		};
		const updatedRange: CalendarRangeValue = {
			from: new Date(2026, 5, 10),
			to: new Date(2026, 5, 20),
		};

		const { container, rerender, unmount } = mount(
			h(Calendar, {
				defaultMonth: new Date(2026, 5, 1),
				mode: "range",
				onValueChange,
				value: controlledRange,
			})
		);

		const day10Button = findDayButton(container, 10, "June", 2026);
		const day12Button = findDayButton(container, 12, "June", 2026);
		const day20Button = findDayButton(container, 20, "June", 2026);

		expect(isDaySelected(day10Button)).toBe(true);
		expect(isDaySelected(day12Button)).toBe(true);
		expect(isDaySelected(day20Button)).toBe(false);

		act(() => {
			day20Button.click();
		});

		expect(onValueChange).toHaveBeenCalledTimes(1);
		expect(isDaySelected(day10Button)).toBe(true);
		expect(isDaySelected(day12Button)).toBe(true);
		expect(isDaySelected(day20Button)).toBe(false);

		rerender(
			h(Calendar, {
				defaultMonth: new Date(2026, 5, 1),
				mode: "range",
				onValueChange,
				value: updatedRange,
			})
		);

		expect(isDaySelected(day10Button)).toBe(true);
		expect(isDaySelected(day12Button)).toBe(true);
		expect(isDaySelected(day20Button)).toBe(true);

		unmount();
	});
});
