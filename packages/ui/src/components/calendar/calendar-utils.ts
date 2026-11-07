import type { ClassNames, DateRange, Matcher } from "@daypicker/react";
import { props } from "@stylexjs/stylex";
import { calendarStyles } from "./calendar.styles";
import type { CalendarRangeValue } from "./calendar.types";

export function normalizeCalendarRange(
	range: DateRange | undefined
): CalendarRangeValue | undefined {
	return range?.from ? { from: range.from, to: range.to } : undefined;
}

export function buildDisabledMatchers(
	disabled?: boolean,
	minValue?: Date,
	maxValue?: Date,
	isDateUnavailable?: (date: Date) => boolean
): Matcher[] {
	if (disabled) {
		return [true];
	}
	const matchers: Matcher[] = [];
	if (minValue) {
		matchers.push({ before: minValue });
	}
	if (maxValue) {
		matchers.push({ after: maxValue });
	}
	if (isDateUnavailable) {
		matchers.push(isDateUnavailable);
	}
	return matchers;
}

export function getCalendarClassNames(
	mode: "single" | "range",
	readOnly: boolean
): Partial<ClassNames> {
	return {
		caption_label: props(calendarStyles.captionLabel).className,
		day: props(calendarStyles.day).className,
		day_button: props(
			calendarStyles.dayButton,
			readOnly && calendarStyles.dayButtonReadOnly
		).className,
		disabled: props(calendarStyles.dayDisabled).className,
		dropdowns: props(calendarStyles.dropdowns).className,
		focused: "",
		month: props(calendarStyles.month).className,
		month_caption: props(calendarStyles.monthCaption).className,
		month_grid: props(calendarStyles.monthGrid).className,
		months: props(calendarStyles.months).className,
		nav: props(calendarStyles.nav).className,
		outside: props(calendarStyles.outside).className,
		range_end: props(calendarStyles.rangeEnd).className,
		range_middle: props(calendarStyles.rangeMiddle).className,
		range_start: props(calendarStyles.rangeStart).className,
		root: props(calendarStyles.dayPickerRoot).className,
		selected: props(
			mode === "range" ? calendarStyles.selectedRange : calendarStyles.selected
		).className,
		today: props(calendarStyles.today).className,
		week: props(calendarStyles.week).className,
		weekday: props(calendarStyles.weekday).className,
		weekdays: props(calendarStyles.weekdays).className,
		weeks: props(calendarStyles.weeks).className,
	};
}
