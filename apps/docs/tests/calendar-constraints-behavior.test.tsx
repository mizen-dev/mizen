// @vitest-environment happy-dom
import { act, createElement as h } from "react";
import { describe, expect, it, vi } from "vite-plus/test";
import { Calendar } from "../../../packages/ui/src/components/calendar/calendar";
import {
	findDayButton,
	findNavButton,
	isDaySelected,
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

describe("Calendar constraint behavior and state semantics", () => {
	it("disables out-of-bound dates outside minValue and maxValue range", () => {
		const onValueChange = vi.fn();
		const fixedMonth = new Date(2026, 5, 1);
		const minValue = new Date(2026, 5, 5);
		const maxValue = new Date(2026, 5, 25);

		const { container, unmount } = mount(
			h(Calendar, {
				defaultMonth: fixedMonth,
				maxValue,
				minValue,
				mode: "single",
				onValueChange,
			})
		);

		const day4Button = findDayButton(container, 4, "June", 2026);
		const day10Button = findDayButton(container, 10, "June", 2026);
		const day26Button = findDayButton(container, 26, "June", 2026);

		expect(day4Button.disabled).toBe(true);
		expect(day26Button.disabled).toBe(true);
		expect(day10Button.disabled).toBe(false);

		act(() => {
			day4Button.click();
		});
		expect(onValueChange).not.toHaveBeenCalled();

		act(() => {
			day10Button.click();
		});
		expect(onValueChange).toHaveBeenCalledTimes(1);

		unmount();
	});

	it("disables dates matched by isDateUnavailable predicate", () => {
		const onValueChange = vi.fn();
		const fixedMonth = new Date(2026, 5, 1);

		const { container, unmount } = mount(
			h(Calendar, {
				defaultMonth: fixedMonth,
				isDateUnavailable: (date) => date.getDate() === 12,
				mode: "single",
				onValueChange,
			})
		);

		const day12Button = findDayButton(container, 12, "June", 2026);
		const day13Button = findDayButton(container, 13, "June", 2026);

		expect(day12Button.disabled).toBe(true);
		expect(day13Button.disabled).toBe(false);

		act(() => {
			day12Button.click();
		});
		expect(onValueChange).not.toHaveBeenCalled();

		act(() => {
			day13Button.click();
		});
		expect(onValueChange).toHaveBeenCalledTimes(1);

		unmount();
	});

	it("disables all day and navigation controls and prevents selection in disabled mode", () => {
		const onValueChange = vi.fn();
		const fixedMonth = new Date(2026, 5, 1);

		const { container, unmount } = mount(
			h(Calendar, {
				defaultMonth: fixedMonth,
				disabled: true,
				mode: "single",
				onValueChange,
			})
		);

		const day15Button = findDayButton(container, 15, "June", 2026);
		const prevButton = findNavButton(container, "previous");
		const nextButton = findNavButton(container, "next");

		expect(day15Button.disabled).toBe(true);
		expect(
			prevButton.disabled || prevButton.getAttribute("aria-disabled") === "true"
		).toBe(true);
		expect(
			nextButton.disabled || nextButton.getAttribute("aria-disabled") === "true"
		).toBe(true);

		act(() => {
			day15Button.click();
		});
		expect(onValueChange).not.toHaveBeenCalled();

		unmount();
	});

	it("preserves focusability of controls while preventing selection in readOnly mode", () => {
		const onValueChange = vi.fn();
		const fixedMonth = new Date(2026, 5, 1);

		const { container, unmount } = mount(
			h(Calendar, {
				defaultMonth: fixedMonth,
				mode: "single",
				onValueChange,
				readOnly: true,
			})
		);

		const grid =
			container.querySelector<HTMLElement>('[role="grid"]') ??
			container.querySelector<HTMLElement>("table");
		expect(grid).not.toBeNull();
		expect(grid?.getAttribute("aria-readonly")).toBe("true");

		const day15Button = findDayButton(container, 15, "June", 2026);
		const prevButton = findNavButton(container, "previous");
		const nextButton = findNavButton(container, "next");

		expect(day15Button.disabled).toBe(false);
		expect(prevButton.disabled).toBe(false);
		expect(nextButton.disabled).toBe(false);

		day15Button.focus();
		expect(document.activeElement).toBe(day15Button);

		prevButton.focus();
		expect(document.activeElement).toBe(prevButton);

		act(() => {
			day15Button.click();
		});

		expect(onValueChange).not.toHaveBeenCalled();
		expect(isDaySelected(day15Button)).toBe(false);

		unmount();
	});

	it("renders invalid accessibility semantics on table[role='grid'] and retains data-invalid on wrapper", () => {
		const fixedMonth = new Date(2026, 5, 1);

		const { container, unmount } = mount(
			h(Calendar, {
				defaultMonth: fixedMonth,
				invalid: true,
				mode: "single",
			})
		);

		const wrapper = container.querySelector<HTMLElement>(
			'[data-slot="calendar"]'
		);
		expect(wrapper).not.toBeNull();
		expect(wrapper?.getAttribute("aria-invalid")).toBeNull();
		expect(wrapper?.hasAttribute("data-invalid")).toBe(true);

		const grid = container.querySelector<HTMLElement>('table[role="grid"]');
		expect(grid).not.toBeNull();
		expect(grid?.getAttribute("aria-invalid")).toBe("true");

		unmount();
	});
});
