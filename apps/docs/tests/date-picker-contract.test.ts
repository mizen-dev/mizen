import type { ComponentProps } from "react";
import { describe, expect, it } from "vitest";
import type { CalendarLocale } from "../../../packages/ui/src/components/calendar/calendar.types";
import type { DatePicker } from "../../../packages/ui/src/components/date-picker/date-picker";
import type { DatePickerProps } from "../../../packages/ui/src/components/date-picker/date-picker.types";

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
	| "mode"
	| "presets"
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
	"maxValue",
	"minValue",
	"name",
	"onValueChange",
	"readOnly",
	"ref",
	"required",
	"size",
	"value",
	"weekStartsOn",
];

type ClosedDatePickerContract = [
	RejectsAll<DatePickerProps, ForbiddenProps>,
	AcceptsAll<DatePickerProps, AllowedPropsKeys>,
	IsExact<DatePickerProps["value"], Date | undefined>,
	IsExact<DatePickerProps["defaultValue"], Date | undefined>,
	IsExact<DatePickerProps["size"], "default" | "lg" | "sm" | undefined>,
	IsExact<DatePickerProps["locale"], CalendarLocale | undefined>,
	IsExact<
		DatePickerProps["onValueChange"],
		((value: Date | undefined) => void) | undefined
	>,
	IsExact<ComponentProps<typeof DatePicker>, DatePickerProps>,
];

const contractChecks: ClosedDatePickerContract = [
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
];

describe("DatePicker public contract and export manifest", () => {
	it("enforces closed contract statically", () => {
		expect(contractChecks.every((check) => check === true)).toBe(true);
	});
});
