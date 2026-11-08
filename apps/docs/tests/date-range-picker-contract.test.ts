import type { ComponentProps } from "react";
import { describe, expect, it } from "vite-plus/test";
import type {
	CalendarLocale,
	CalendarRangeValue,
} from "../../../packages/ui/src/components/calendar/calendar.types";
import type { DateRangePicker } from "../../../packages/ui/src/components/date-range-picker/date-range-picker";
import type {
	DateRangePickerProps,
	DateRangePreset,
} from "../../../packages/ui/src/components/date-range-picker/date-range-picker.types";

type RejectsAll<T, K extends string> = [K] extends [never]
	? true
	: K extends keyof T
		? false
		: true;

type AcceptsAll<T, K extends readonly (keyof T)[]> = {
	[I in keyof K]: K[I] extends keyof T ? true : false;
}[number] extends true
	? true
	: false;

type IsExact<T, U> = [T] extends [U] ? ([U] extends [T] ? true : false) : false;

type ForbiddenProps =
	| "className"
	| "style"
	| "render"
	| "children"
	| "mode"
	| "open"
	| "defaultOpen"
	| "onOpenChange";

type AllowedPropsKeys = [
	"aria-describedby",
	"aria-label",
	"aria-labelledby",
	"autoFocus",
	"defaultValue",
	"dir",
	"disabled",
	"id",
	"invalid",
	"isDateUnavailable",
	"locale",
	"maxNights",
	"maxValue",
	"minNights",
	"minValue",
	"name",
	"onValueChange",
	"presets",
	"readOnly",
	"ref",
	"required",
	"size",
	"value",
	"weekStartsOn",
];

type ClosedDateRangePickerContract = [
	RejectsAll<DateRangePickerProps, ForbiddenProps>,
	AcceptsAll<DateRangePickerProps, AllowedPropsKeys>,
	IsExact<DateRangePickerProps["value"], CalendarRangeValue | undefined>,
	IsExact<DateRangePickerProps["defaultValue"], CalendarRangeValue | undefined>,
	IsExact<DateRangePickerProps["minNights"], number | undefined>,
	IsExact<DateRangePickerProps["maxNights"], number | undefined>,
	IsExact<
		DateRangePickerProps["presets"],
		readonly DateRangePreset[] | undefined
	>,
	IsExact<DateRangePickerProps["size"], "default" | "lg" | "sm" | undefined>,
	IsExact<DateRangePickerProps["locale"], CalendarLocale | undefined>,
	IsExact<
		DateRangePickerProps["onValueChange"],
		((value: CalendarRangeValue | undefined) => void) | undefined
	>,
	IsExact<ComponentProps<typeof DateRangePicker>, DateRangePickerProps>,
];

const contractChecks: ClosedDateRangePickerContract = [
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

describe("DateRangePicker public contract and export manifest", () => {
	it("enforces closed contract statically", () => {
		expect(contractChecks.every((check) => check === true)).toBe(true);
	});
});
