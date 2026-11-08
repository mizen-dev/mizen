"use client";

import type { DateRange } from "@daypicker/react";
import { DayPicker } from "@daypicker/react";
import { props } from "@stylexjs/stylex";
import type { ReactElement } from "react";
import { useCallback, useMemo, useState } from "react";
import { calendarStyles } from "./calendar.styles";
import type {
	CalendarProps,
	CalendarRangeProps,
	CalendarRangeValue,
	CalendarSingleProps,
	CalendarVariant,
} from "./calendar.types";
import { calendarComponents } from "./calendar-components";
import { CalendarGridContext } from "./calendar-context";
import {
	buildDisabledMatchers,
	getCalendarClassNames,
	normalizeCalendarRange,
} from "./calendar-utils";

export type {
	CalendarLocale,
	CalendarProps,
	CalendarRangeProps,
	CalendarRangeValue,
	CalendarSingleProps,
	CalendarVariant,
} from "./calendar.types";

function SingleCalendarView(singleProps: CalendarSingleProps): ReactElement {
	const [isControlled] = useState(() => Object.hasOwn(singleProps, "value"));
	const [uncontrolled, setUncontrolled] = useState<Date | undefined>(
		singleProps.defaultValue
	);
	const current = isControlled ? singleProps.value : uncontrolled;

	const {
		autoFocus,
		defaultMonth = singleProps.defaultValue ?? singleProps.value,
		dir,
		disabled = false,
		isDateUnavailable,
		locale,
		maxValue,
		minValue,
		month,
		onMonthChange,
		onValueChange,
		readOnly = false,
		required,
		weekStartsOn,
	} = singleProps;

	const disabledMatchers = useMemo(
		() =>
			buildDisabledMatchers(disabled, minValue, maxValue, isDateUnavailable),
		[disabled, minValue, maxValue, isDateUnavailable]
	);

	const handleSelect = useCallback(
		(selected: Date | undefined) => {
			if (readOnly || disabled) {
				return;
			}
			if (!isControlled) {
				setUncontrolled(selected);
			}
			onValueChange?.(selected);
		},
		[disabled, isControlled, onValueChange, readOnly]
	);

	const classNames = useMemo(
		() => getCalendarClassNames("single", readOnly),
		[readOnly]
	);

	return (
		<DayPicker
			autoFocus={autoFocus}
			captionLayout={singleProps.captionLayout}
			classNames={classNames}
			components={calendarComponents}
			defaultMonth={defaultMonth}
			dir={dir}
			disabled={disabledMatchers}
			disableNavigation={disabled}
			endMonth={singleProps.endMonth}
			fixedWeeks
			locale={locale}
			mode="single"
			month={month}
			onMonthChange={onMonthChange}
			onSelect={handleSelect}
			required={required}
			selected={current}
			showOutsideDays
			startMonth={singleProps.startMonth}
			weekStartsOn={weekStartsOn}
		/>
	);
}

function RangeCalendarView(rangeProps: CalendarRangeProps): ReactElement {
	const [isControlled] = useState(() => Object.hasOwn(rangeProps, "value"));
	const [uncontrolled, setUncontrolled] = useState<
		CalendarRangeValue | undefined
	>(rangeProps.defaultValue);
	const current = isControlled ? rangeProps.value : uncontrolled;

	const {
		autoFocus,
		defaultMonth = rangeProps.defaultValue?.from ?? rangeProps.value?.from,
		dir,
		disabled = false,
		isDateUnavailable,
		locale,
		maxNights,
		maxValue,
		minNights,
		minValue,
		resetOnSelect,
		month,
		onMonthChange,
		onValueChange,
		readOnly = false,
		required,
		weekStartsOn,
	} = rangeProps;

	const disabledMatchers = useMemo(
		() =>
			buildDisabledMatchers(disabled, minValue, maxValue, isDateUnavailable),
		[disabled, minValue, maxValue, isDateUnavailable]
	);

	const handleSelect = useCallback(
		(range: DateRange | undefined) => {
			if (readOnly || disabled) {
				return;
			}
			const nextRange = normalizeCalendarRange(range);
			if (!isControlled) {
				setUncontrolled(nextRange);
			}
			onValueChange?.(nextRange);
		},
		[disabled, isControlled, onValueChange, readOnly]
	);

	const classNames = useMemo(
		() => getCalendarClassNames("range", readOnly),
		[readOnly]
	);

	return (
		<DayPicker
			autoFocus={autoFocus}
			captionLayout={rangeProps.captionLayout}
			classNames={classNames}
			components={calendarComponents}
			defaultMonth={defaultMonth}
			dir={dir}
			disabled={disabledMatchers}
			disableNavigation={disabled}
			endMonth={rangeProps.endMonth}
			excludeDisabled
			fixedWeeks
			locale={locale}
			max={maxNights}
			min={minNights}
			mode="range"
			month={month}
			onMonthChange={onMonthChange}
			onSelect={handleSelect}
			required={required}
			resetOnSelect={resetOnSelect}
			selected={current ? { from: current.from, to: current.to } : undefined}
			showOutsideDays
			startMonth={rangeProps.startMonth}
			weekStartsOn={weekStartsOn}
		/>
	);
}

function getCalendarStyles(
	disabled?: boolean,
	readOnly?: boolean,
	invalid?: boolean,
	variant?: CalendarVariant
) {
	return props(
		calendarStyles.root,
		variant === "embedded" && calendarStyles.rootEmbedded,
		disabled && calendarStyles.disabled,
		readOnly && calendarStyles.readOnly,
		invalid && calendarStyles.invalid
	);
}

function getWrapperProps(calendarProps: CalendarProps) {
	const { disabled, invalid, readOnly, ref, variant } = calendarProps;
	const styleProps = getCalendarStyles(disabled, readOnly, invalid, variant);

	return {
		...styleProps,
		"data-disabled": disabled ? "" : undefined,
		"data-invalid": invalid ? "" : undefined,
		"data-readonly": readOnly ? "" : undefined,
		"data-slot": "calendar",
		ref,
	};
}

export function Calendar(calendarProps: CalendarProps): ReactElement {
	const wrapperProps = getWrapperProps(calendarProps);
	const content =
		calendarProps.mode === "single" ? (
			<SingleCalendarView {...calendarProps} />
		) : (
			<RangeCalendarView {...calendarProps} />
		);

	const {
		"aria-describedby": ariaDescribedBy,
		"aria-label": ariaLabel,
		"aria-labelledby": ariaLabelledBy,
		invalid,
		readOnly,
	} = calendarProps;
	const gridContextValue = useMemo(
		() => ({ ariaDescribedBy, ariaLabel, ariaLabelledBy, invalid, readOnly }),
		[ariaDescribedBy, ariaLabel, ariaLabelledBy, invalid, readOnly]
	);

	return (
		<CalendarGridContext.Provider value={gridContextValue}>
			<div {...wrapperProps}>{content}</div>
		</CalendarGridContext.Provider>
	);
}
