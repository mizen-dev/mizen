// @vitest-environment happy-dom
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import type {
	Calendar,
	CalendarLocale,
	CalendarProps,
	CalendarRangeProps,
	CalendarRangeValue,
	CalendarSingleProps,
	CalendarVariant,
} from "../../../packages/ui/src/components/calendar/calendar";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	createTheme: <T extends object>(_variables: T, overrides: object): object =>
		overrides,
	defineConsts: <T extends object>(c: T): T => c,
	defineMarker: () => ({}),
	defineVars: <T extends object>(v: T): T => v,
	keyframes: <T extends object>(k: T): T => k,
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

type AcceptsAll<T, K extends PropertyKey> = [K] extends [keyof T]
	? true
	: false;
type RejectsAll<T, K extends PropertyKey> = [Extract<keyof T, K>] extends [
	never,
]
	? true
	: false;
type IsExact<T, U> = [T] extends [U] ? ([U] extends [T] ? true : false) : false;
type IsRequired<T, K extends PropertyKey> = K extends keyof T
	? Record<string, never> extends Pick<T, K>
		? false
		: true
	: false;

type ForbiddenProps =
	| "className"
	| "style"
	| "classNames"
	| "components"
	| "labels"
	| "selected"
	| "onSelect";

type SingleCallbackParam = CalendarSingleProps extends {
	onValueChange?: (value: infer V, ...args: never[]) => void;
}
	? V
	: never;

type RangeCallbackParam = CalendarRangeProps extends {
	onValueChange?: (value: infer V, ...args: never[]) => void;
}
	? V
	: never;

type SinglePropsKeys =
	| "aria-describedby"
	| "aria-label"
	| "aria-labelledby"
	| "autoFocus"
	| "defaultMonth"
	| "defaultValue"
	| "dir"
	| "disabled"
	| "invalid"
	| "isDateUnavailable"
	| "locale"
	| "maxValue"
	| "minValue"
	| "mode"
	| "month"
	| "onMonthChange"
	| "onValueChange"
	| "readOnly"
	| "ref"
	| "required"
	| "value"
	| "variant"
	| "weekStartsOn";

type RangePropsKeys =
	| SinglePropsKeys
	| "maxNights"
	| "minNights"
	| "resetOnSelect";

type ClosedCalendarContract = [
	RejectsAll<CalendarProps, ForbiddenProps>,
	RejectsAll<CalendarSingleProps, ForbiddenProps>,
	RejectsAll<CalendarRangeProps, ForbiddenProps>,
	IsRequired<CalendarProps, "mode">,
	IsRequired<CalendarSingleProps, "mode">,
	IsRequired<CalendarRangeProps, "mode">,
	IsExact<CalendarProps["mode"], "single" | "range">,
	IsExact<CalendarSingleProps["mode"], "single">,
	IsExact<CalendarRangeProps["mode"], "range">,
	AcceptsAll<CalendarSingleProps, SinglePropsKeys>,
	AcceptsAll<CalendarRangeProps, RangePropsKeys>,
	IsExact<CalendarVariant, "default" | "embedded">,
	IsExact<CalendarSingleProps["variant"], CalendarVariant | undefined>,
	IsExact<CalendarRangeProps["minNights"], number | undefined>,
	IsExact<CalendarRangeProps["maxNights"], number | undefined>,
	AcceptsAll<CalendarRangeValue, "from" | "to">,
	IsRequired<CalendarRangeValue, "from">,
	IsExact<CalendarRangeValue["from"], Date>,
	IsExact<CalendarRangeValue["to"], Date | undefined>,
	Record<string, never> extends CalendarRangeValue ? false : true,
	{ to: Date } extends CalendarRangeValue ? false : true,
	IsExact<CalendarSingleProps["value"], Date | undefined>,
	IsExact<CalendarSingleProps["defaultValue"], Date | undefined>,
	IsExact<SingleCallbackParam, Date | undefined>,
	IsExact<CalendarRangeProps["value"], CalendarRangeValue | undefined>,
	IsExact<CalendarRangeProps["defaultValue"], CalendarRangeValue | undefined>,
	IsExact<RangeCallbackParam, CalendarRangeValue | undefined>,
	IsRequired<ComponentProps<typeof Calendar>, "mode">,
];

const contractChecks: ClosedCalendarContract = [
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
];

describe("Calendar public contract and export manifest", () => {
	it("exports Calendar runtime component and enforces closed contract", async () => {
		const mod = await import(
			"../../../packages/ui/src/components/calendar/calendar"
		);

		expect(mod.Calendar).toBeDefined();
		expect(
			typeof mod.Calendar === "function" || typeof mod.Calendar === "object"
		).toBe(true);
		expect(contractChecks.every((c) => c === true)).toBe(true);
	});

	it("verifies single-mode value and callback contract accepts Date or undefined without null", () => {
		const singleCallback: NonNullable<CalendarSingleProps["onValueChange"]> = (
			value
		) => {
			expect(value).toBeDefined();
		};
		expect(singleCallback).toBeDefined();

		const singleValue: CalendarSingleProps["value"] = new Date(2026, 5, 15);
		const singleDefaultValue: CalendarSingleProps["defaultValue"] = undefined;
		expect(singleValue).toBeDefined();
		expect(singleDefaultValue).toBeUndefined();
	});

	it("verifies range-mode value and callback contract accepts CalendarRangeValue or undefined without null", () => {
		const rangeCallback: NonNullable<CalendarRangeProps["onValueChange"]> = (
			value
		) => {
			expect(value).toBeDefined();
		};
		expect(rangeCallback).toBeDefined();

		const rangeValue: CalendarRangeProps["value"] = {
			from: new Date(2026, 5, 1),
			to: new Date(2026, 5, 10),
		};
		const rangeDefaultValue: CalendarRangeProps["defaultValue"] = undefined;
		expect(rangeValue).toBeDefined();
		expect(rangeDefaultValue).toBeUndefined();
	});

	it("verifies locale prop matches CalendarLocale type", () => {
		type TestLocaleExact = IsExact<
			CalendarSingleProps["locale"],
			CalendarLocale | undefined
		>;
		const localeExact: TestLocaleExact = true;
		expect(localeExact).toBe(true);

		type TestRangeLocaleExact = IsExact<
			CalendarRangeProps["locale"],
			CalendarLocale | undefined
		>;
		const rangeLocaleExact: TestRangeLocaleExact = true;
		expect(rangeLocaleExact).toBe(true);
	});

	it("verifies range-mode accepts optional minNights and maxNights constraints", () => {
		type TestMinNightsExact = IsExact<
			CalendarRangeProps["minNights"],
			number | undefined
		>;
		const minNightsExact: TestMinNightsExact = true;
		expect(minNightsExact).toBe(true);

		type TestMaxNightsExact = IsExact<
			CalendarRangeProps["maxNights"],
			number | undefined
		>;
		const maxNightsExact: TestMaxNightsExact = true;
		expect(maxNightsExact).toBe(true);
	});
});
