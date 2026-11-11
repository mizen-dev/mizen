import type { ComponentPropsWithRef } from "react";
import type {
	CalendarCommonProps,
	CalendarLocale,
} from "../calendar/calendar.types";

export interface DatePickerProps {
	readonly "aria-describedby"?: string | undefined;
	readonly "aria-label"?: string | undefined;
	readonly "aria-labelledby"?: string | undefined;
	autoFocus?: boolean | undefined;
	captionLayout?: CalendarCommonProps["captionLayout"];
	defaultValue?: Date | undefined;
	dir?: "ltr" | "rtl" | undefined;
	disabled?: boolean | undefined;
	endMonth?: Date | undefined;
	id?: string | undefined;
	invalid?: boolean | undefined;
	isDateUnavailable?: ((date: Date) => boolean) | undefined;
	locale?: CalendarLocale | undefined;
	maxValue?: Date | undefined;
	minValue?: Date | undefined;
	name?: string | undefined;
	onValueChange?: ((value: Date | undefined) => void) | undefined;
	readOnly?: boolean | undefined;
	ref?: ComponentPropsWithRef<"input">["ref"] | undefined;
	required?: boolean | undefined;
	size?: "default" | "lg" | "sm" | undefined;
	startMonth?: Date | undefined;
	/** The accessible name of the calendar button. */
	triggerLabel?: string | undefined;
	value?: Date | undefined;
	weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined;
}
