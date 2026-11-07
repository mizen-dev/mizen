import type { DayPickerLocale } from "@daypicker/react";
import type { ComponentPropsWithRef } from "react";

export type CalendarLocale = DayPickerLocale;

export type CalendarVariant = "default" | "embedded";

export interface CalendarRangeValue {
	readonly from: Date;
	readonly to?: Date | undefined;
}

export interface CalendarCommonProps {
	readonly "aria-describedby"?: string | undefined;
	readonly "aria-label"?: string | undefined;
	readonly "aria-labelledby"?: string | undefined;
	autoFocus?: boolean | undefined;
	captionLayout?: "label" | "dropdown" | undefined;
	defaultMonth?: Date | undefined;
	dir?: "ltr" | "rtl" | undefined;
	disabled?: boolean | undefined;
	endMonth?: Date | undefined;
	invalid?: boolean | undefined;
	isDateUnavailable?: ((date: Date) => boolean) | undefined;
	locale?: CalendarLocale | undefined;
	maxValue?: Date | undefined;
	minValue?: Date | undefined;
	month?: Date | undefined;
	onMonthChange?: ((month: Date) => void) | undefined;
	readOnly?: boolean | undefined;
	ref?: ComponentPropsWithRef<"div">["ref"] | undefined;
	required?: boolean | undefined;
	startMonth?: Date | undefined;
	variant?: CalendarVariant | undefined;
	weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined;
}

export interface CalendarSingleProps extends CalendarCommonProps {
	defaultValue?: Date | undefined;
	mode: "single";
	onValueChange?: ((value: Date | undefined) => void) | undefined;
	value?: Date | undefined;
}

export interface CalendarRangeProps extends CalendarCommonProps {
	defaultValue?: CalendarRangeValue | undefined;
	maxNights?: number | undefined;
	minNights?: number | undefined;
	mode: "range";
	onValueChange?: ((value: CalendarRangeValue | undefined) => void) | undefined;
	resetOnSelect?: boolean | undefined;
	value?: CalendarRangeValue | undefined;
}

export type CalendarProps = CalendarSingleProps | CalendarRangeProps;
