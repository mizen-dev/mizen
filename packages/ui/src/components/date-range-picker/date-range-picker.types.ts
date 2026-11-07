import type { ComponentPropsWithRef } from "react";
import type {
	CalendarCommonProps,
	CalendarLocale,
	CalendarRangeValue,
} from "../calendar/calendar.types";

export interface DateRangePreset {
	readonly label: string;
	readonly value: CalendarRangeValue & { readonly to: Date };
}

export interface DateRangePickerProps {
	readonly "aria-describedby"?: string | undefined;
	readonly "aria-label"?: string | undefined;
	readonly "aria-labelledby"?: string | undefined;
	autoFocus?: boolean | undefined;
	captionLayout?: CalendarCommonProps["captionLayout"];
	defaultValue?: CalendarRangeValue | undefined;
	dir?: "ltr" | "rtl" | undefined;
	disabled?: boolean | undefined;
	endMonth?: Date | undefined;
	id?: string | undefined;
	invalid?: boolean | undefined;
	isDateUnavailable?: ((date: Date) => boolean) | undefined;
	locale?: CalendarLocale | undefined;
	maxNights?: number | undefined;
	maxValue?: Date | undefined;
	minNights?: number | undefined;
	minValue?: Date | undefined;
	name?: string | undefined;
	onValueChange?: ((value: CalendarRangeValue | undefined) => void) | undefined;
	presets?: readonly DateRangePreset[] | undefined;
	readOnly?: boolean | undefined;
	ref?: ComponentPropsWithRef<"input">["ref"] | undefined;
	required?: boolean | undefined;
	size?: "default" | "lg" | "sm" | undefined;
	startMonth?: Date | undefined;
	value?: CalendarRangeValue | undefined;
	weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined;
}
