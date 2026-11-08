// @vitest-environment happy-dom
import { act, createElement as h } from "react";
import { describe, expect, it, vi } from "vite-plus/test";
import { DateRangePicker } from "../../../packages/ui/src/components/date-range-picker/date-range-picker";
import type { DateRangePreset } from "../../../packages/ui/src/components/date-range-picker/date-range-picker.types";
import { mount } from "./calendar-test-helpers";

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

describe("DateRangePicker presets behavior", () => {
	const samplePresets: readonly DateRangePreset[] = [
		{
			label: "Next 7 Days",
			value: {
				from: new Date(2026, 9, 3),
				to: new Date(2026, 9, 10),
			},
		},
		{
			label: "Next 30 Days",
			value: {
				from: new Date(2026, 9, 3),
				to: new Date(2026, 10, 2),
			},
		},
		{
			label: "Unavailable Range",
			value: {
				from: new Date(2026, 9, 14),
				to: new Date(2026, 9, 16),
			},
		},
	];

	it("renders preset buttons in the popup when presets are provided", () => {
		const { container, unmount } = mount(
			h(DateRangePicker, { presets: samplePresets })
		);

		const trigger = container.querySelector(
			"button[aria-label='Open calendar']"
		);
		expect(trigger).not.toBeNull();
		if (!trigger) {
			return;
		}

		act(() => {
			(trigger as HTMLButtonElement).click();
		});

		const buttons = Array.from(document.body.querySelectorAll("button")).filter(
			(btn) =>
				btn.textContent === "Next 7 Days" ||
				btn.textContent === "Next 30 Days" ||
				btn.textContent === "Unavailable Range"
		);
		expect(buttons.length).toBe(3);

		unmount();
	});

	it("commits preset selection once and closes popover", () => {
		const onValueChange = vi.fn();
		const { container, unmount } = mount(
			h(DateRangePicker, {
				onValueChange,
				presets: samplePresets,
			})
		);

		const trigger = container.querySelector(
			"button[aria-label='Open calendar']"
		);
		expect(trigger).not.toBeNull();
		if (!trigger) {
			return;
		}

		act(() => {
			(trigger as HTMLButtonElement).click();
		});

		const presetBtn = Array.from(document.body.querySelectorAll("button")).find(
			(btn) => btn.textContent === "Next 7 Days"
		);
		expect(presetBtn).toBeDefined();

		act(() => {
			presetBtn?.click();
		});

		expect(onValueChange).toHaveBeenCalledTimes(1);
		const committed = onValueChange.mock.calls[0]?.[0];
		expect(committed?.from.getDate()).toBe(3);
		expect(committed?.to.getDate()).toBe(10);

		const input = container.querySelector("input");
		expect(input?.value).toBe("2026-10-03 – 2026-10-10");

		unmount();
	});

	it("disables preset button when preset violates constraints", () => {
		const isDateUnavailable = (d: Date) => d.getDate() === 15;
		const { container, unmount } = mount(
			h(DateRangePicker, {
				isDateUnavailable,
				presets: samplePresets,
			})
		);

		const trigger = container.querySelector(
			"button[aria-label='Open calendar']"
		);
		expect(trigger).not.toBeNull();
		if (!trigger) {
			return;
		}

		act(() => {
			(trigger as HTMLButtonElement).click();
		});

		const unavailableBtn = Array.from(
			document.body.querySelectorAll("button")
		).find((btn) => btn.textContent === "Unavailable Range");
		expect(unavailableBtn).toBeDefined();
		expect(unavailableBtn?.disabled).toBe(true);

		unmount();
	});

	it("disables reversed preset button where to is before from", () => {
		const reversedPresets: readonly DateRangePreset[] = [
			{
				label: "Reversed Preset",
				value: {
					from: new Date(2026, 9, 10),
					to: new Date(2026, 9, 3),
				},
			},
		];
		const { container, unmount } = mount(
			h(DateRangePicker, {
				presets: reversedPresets,
			})
		);

		const trigger = container.querySelector(
			"button[aria-label='Open calendar']"
		);
		expect(trigger).not.toBeNull();
		if (!trigger) {
			return;
		}

		act(() => {
			(trigger as HTMLButtonElement).click();
		});

		const reversedBtn = Array.from(
			document.body.querySelectorAll("button")
		).find((btn) => btn.textContent === "Reversed Preset");
		expect(reversedBtn).toBeDefined();
		expect(reversedBtn?.disabled).toBe(true);

		unmount();
	});
});
