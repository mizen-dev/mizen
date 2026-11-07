import { props } from "@stylexjs/stylex";
import type { ReactElement } from "react";
import { useCallback } from "react";
import { Calendar } from "../calendar/calendar";
import type { CalendarRangeValue } from "../calendar/calendar.types";
import { dateRangePickerStyles } from "./date-range-picker.styles";
import type {
	DateRangePickerProps,
	DateRangePreset,
} from "./date-range-picker.types";
import type { RangeConstraints } from "./date-range-picker-date";
import { isRangeConstraintSatisfied } from "./date-range-picker-date";

interface DateRangePresetButtonProps {
	readonly disabled: boolean;
	readonly label: string;
	readonly onSelect: (value: CalendarRangeValue) => void;
	readonly value: CalendarRangeValue;
}

function DateRangePresetButton({
	disabled,
	label,
	onSelect,
	value,
}: DateRangePresetButtonProps): ReactElement {
	const handleClick = useCallback(() => {
		onSelect(value);
	}, [onSelect, value]);

	return (
		<button
			disabled={disabled}
			onClick={handleClick}
			type="button"
			{...props(
				dateRangePickerStyles.presetButton,
				disabled && dateRangePickerStyles.presetButtonDisabled
			)}
		>
			{label}
		</button>
	);
}

interface DateRangePresetsListProps {
	readonly constraints: RangeConstraints;
	readonly disabled: boolean;
	readonly onSelect: (value: CalendarRangeValue) => void;
	readonly presets?: readonly DateRangePreset[] | undefined;
	readonly readOnly: boolean;
}

function DateRangePresetsList({
	constraints,
	disabled,
	onSelect,
	presets,
	readOnly,
}: DateRangePresetsListProps): ReactElement | null {
	if (!presets || presets.length === 0) {
		return null;
	}

	return (
		<div {...props(dateRangePickerStyles.presetsRow)}>
			{presets.map((preset) => {
				const isPresetValid = isRangeConstraintSatisfied(
					preset.value,
					constraints
				);
				const isBtnDisabled = disabled || readOnly || !isPresetValid;

				return (
					<DateRangePresetButton
						disabled={isBtnDisabled}
						key={preset.label}
						label={preset.label}
						onSelect={onSelect}
						value={preset.value}
					/>
				);
			})}
		</div>
	);
}

export interface DateRangeCalendarViewProps {
	readonly committedValue?: CalendarRangeValue | undefined;
	readonly constraints: RangeConstraints;
	readonly disabled: boolean;
	readonly onCalendarSelect: (value: CalendarRangeValue | undefined) => void;
	readonly onPresetSelect: (value: CalendarRangeValue) => void;
	readonly props: DateRangePickerProps;
	readonly readOnly: boolean;
}

export function DateRangeCalendarView({
	committedValue,
	constraints,
	disabled,
	onCalendarSelect,
	onPresetSelect,
	props: calendarViewProps,
	readOnly,
}: DateRangeCalendarViewProps): ReactElement {
	return (
		<div {...props(dateRangePickerStyles.popupContainer)}>
			<DateRangePresetsList
				constraints={constraints}
				disabled={disabled}
				onSelect={onPresetSelect}
				presets={calendarViewProps.presets}
				readOnly={readOnly}
			/>
			<Calendar
				aria-label={
					calendarViewProps["aria-label"] ?? "Date range picker calendar"
				}
				autoFocus
				captionLayout={calendarViewProps.captionLayout}
				defaultMonth={committedValue?.from}
				dir={calendarViewProps.dir}
				disabled={disabled}
				endMonth={calendarViewProps.endMonth}
				isDateUnavailable={calendarViewProps.isDateUnavailable}
				locale={calendarViewProps.locale}
				maxNights={calendarViewProps.maxNights}
				maxValue={calendarViewProps.maxValue}
				minNights={calendarViewProps.minNights ?? 0}
				minValue={calendarViewProps.minValue}
				mode="range"
				onValueChange={onCalendarSelect}
				readOnly={readOnly}
				required={calendarViewProps.required}
				resetOnSelect
				startMonth={calendarViewProps.startMonth}
				value={committedValue}
				variant="embedded"
				weekStartsOn={calendarViewProps.weekStartsOn}
			/>
		</div>
	);
}
