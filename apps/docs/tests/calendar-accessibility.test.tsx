// @vitest-environment happy-dom
import { act, createElement as h } from "react";
import { describe, expect, it, vi } from "vite-plus/test";
import { Calendar } from "../../../packages/ui/src/components/calendar/calendar";
import { findDayButton, findNavButton, mount } from "./calendar-test-helpers";

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

describe("Calendar accessibility, navigation slots, and keyboard behavior", () => {
	it("renders semantic grid structure and accessible previous and next month buttons", () => {
		const fixedMonth = new Date(2026, 5, 1);
		const { container, unmount } = mount(
			h(Calendar, {
				defaultMonth: fixedMonth,
				mode: "single",
			})
		);

		const grid = container.querySelector('table, [role="grid"]');
		expect(grid).not.toBeNull();

		const prevButton = findNavButton(container, "previous");
		const nextButton = findNavButton(container, "next");
		expect(prevButton).toBeDefined();
		expect(nextButton).toBeDefined();

		const prevSlot = container.querySelector('[data-slot="calendar-previous"]');
		const nextSlot = container.querySelector('[data-slot="calendar-next"]');
		const chevronSlots = container.querySelectorAll(
			'[data-slot="calendar-chevron"]'
		);

		expect(prevSlot).not.toBeNull();
		expect(nextSlot).not.toBeNull();
		expect(chevronSlots.length).toBeGreaterThanOrEqual(2);

		unmount();
	});

	it("supports autoFocus on defaultValue and navigates to the next day with ArrowRight in LTR", () => {
		const fixedMonth = new Date(2026, 5, 1);
		const initialDate = new Date(2026, 5, 15);

		const { container, unmount } = mount(
			h(Calendar, {
				autoFocus: true,
				defaultMonth: fixedMonth,
				defaultValue: initialDate,
				mode: "single",
			})
		);

		const day15Button = findDayButton(container, 15, "June", 2026);
		expect(document.activeElement).toBe(day15Button);

		act(() => {
			day15Button.dispatchEvent(
				new KeyboardEvent("keydown", {
					bubbles: true,
					cancelable: true,
					key: "ArrowRight",
				})
			);
		});

		const day16Button = findDayButton(container, 16, "June", 2026);
		expect(document.activeElement).toBe(day16Button);

		unmount();
	});

	it("renders Monday as the first day of the week when weekStartsOn={1}", () => {
		const fixedMonth = new Date(2026, 5, 1);
		const { container, unmount } = mount(
			h(Calendar, {
				defaultMonth: fixedMonth,
				mode: "single",
				weekStartsOn: 1,
			})
		);

		const firstWeekdayHeader = container.querySelector("th");
		expect(firstWeekdayHeader).not.toBeNull();
		const headerText = firstWeekdayHeader?.textContent?.trim();
		const headerAria = firstWeekdayHeader?.getAttribute("aria-label");
		const isMonday =
			headerText === "Mo" ||
			headerText === "Mon" ||
			headerText === "M" ||
			headerAria?.includes("Monday");
		expect(Boolean(isMonday)).toBe(true);

		unmount();
	});

	it("reflects dir='rtl' on the rendered calendar while keeping navigation available", () => {
		const fixedMonth = new Date(2026, 5, 1);
		const { container, unmount } = mount(
			h(Calendar, {
				defaultMonth: fixedMonth,
				dir: "rtl",
				mode: "single",
			})
		);

		const rtlRoot = container.querySelector('[dir="rtl"]');
		expect(rtlRoot).not.toBeNull();

		const prevButton = findNavButton(container, "previous");
		const nextButton = findNavButton(container, "next");
		expect(prevButton).toBeDefined();
		expect(nextButton).toBeDefined();

		unmount();
	});

	it("navigates to next month on clicking next and emits native Date via onMonthChange", () => {
		const onMonthChange = vi.fn();
		const fixedMonth = new Date(2026, 5, 1);

		const { container, unmount } = mount(
			h(Calendar, {
				defaultMonth: fixedMonth,
				mode: "single",
				onMonthChange,
			})
		);

		expect(container.textContent).toContain("June 2026");

		const nextButton = findNavButton(container, "next");
		act(() => {
			nextButton.click();
		});

		expect(container.textContent).toContain("July 2026");
		expect(onMonthChange).toHaveBeenCalledTimes(1);

		const emittedMonth: unknown = onMonthChange.mock.calls[0]?.[0];
		expect(emittedMonth).toBeInstanceOf(Date);
		if (!(emittedMonth instanceof Date)) {
			throw new Error("Expected emitted month to be a native Date instance");
		}
		expect(emittedMonth.getFullYear()).toBe(2026);
		expect(emittedMonth.getMonth()).toBe(6);

		unmount();
	});

	it("combines contextual aria-label with generated month grid label on table[role='grid']", () => {
		const fixedMonth = new Date(2026, 5, 1);
		const { container, unmount } = mount(
			h("div", null, [
				h(Calendar, {
					"aria-label": "Departure date",
					defaultMonth: fixedMonth,
					key: "cal1",
					mode: "single",
				}),
				h(Calendar, {
					"aria-label": "Return date",
					defaultMonth: fixedMonth,
					key: "cal2",
					mode: "single",
				}),
			])
		);

		const grids =
			container.querySelectorAll<HTMLTableElement>('table[role="grid"]');
		expect(grids.length).toBe(2);
		expect(grids[0]?.getAttribute("aria-label")).toBe(
			"Departure date, June 2026"
		);
		expect(grids[1]?.getAttribute("aria-label")).toBe("Return date, June 2026");

		unmount();
	});

	it("preserves generated month grid label when no contextual aria-label is provided", () => {
		const fixedMonth = new Date(2026, 5, 1);
		const { container, unmount } = mount(
			h(Calendar, {
				defaultMonth: fixedMonth,
				mode: "single",
			})
		);

		const grid =
			container.querySelector<HTMLTableElement>('table[role="grid"]');
		expect(grid).not.toBeNull();
		expect(grid?.getAttribute("aria-label")).toBe("June 2026");

		unmount();
	});

	it("applies aria-labelledby and aria-describedby to table[role='grid']", () => {
		const fixedMonth = new Date(2026, 5, 1);
		const { container, unmount } = mount(
			h(Calendar, {
				"aria-describedby": "calendar-desc",
				"aria-labelledby": "calendar-title",
				defaultMonth: fixedMonth,
				mode: "single",
			})
		);

		const grid =
			container.querySelector<HTMLTableElement>('table[role="grid"]');
		expect(grid).not.toBeNull();
		expect(grid?.getAttribute("aria-labelledby")).toBe("calendar-title");
		expect(grid?.getAttribute("aria-describedby")).toBe("calendar-desc");

		unmount();
	});
});
