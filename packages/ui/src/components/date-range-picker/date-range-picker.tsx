"use client";

import type { ReactElement } from "react";
import { useCallback, useId, useMemo, useRef, useState } from "react";
import { assignRef } from "../../ref-utils";
import type { CalendarRangeValue } from "../calendar/calendar.types";
import { CalendarTrigger } from "../date-picker/date-picker-trigger";
import { BoundFieldProvider } from "../field/field-context";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "../input-group/input-group";
import { Popover, PopoverPopup } from "../popover/popover";
import type { DateRangePickerProps } from "./date-range-picker.types";
import {
	formatIsoRange,
	getRangeInputValidationMessage,
} from "./date-range-picker-date";
import { useDateRangePickerDraft } from "./date-range-picker-state";
import { DateRangeCalendarView } from "./date-range-picker-views";

export type {
	DateRangePickerProps,
	DateRangePreset,
} from "./date-range-picker.types";

// The native width in characters that fits two ISO dates and the placeholder.
const RANGE_FIELD_SIZE = 30;

export function DateRangePicker(
	dateRangePickerProps: DateRangePickerProps
): ReactElement {
	const [isControlled] = useState(() =>
		Object.hasOwn(dateRangePickerProps, "value")
	);
	const [uncontrolledValue, setUncontrolledValue] = useState<
		CalendarRangeValue | undefined
	>(dateRangePickerProps.defaultValue);
	const initialValue = useRef(dateRangePickerProps.defaultValue);
	const committedValue = isControlled
		? dateRangePickerProps.value
		: uncontrolledValue;

	const generatedId = useId();
	const inputId = dateRangePickerProps.id ?? generatedId;

	const committedText = useMemo(
		() => formatIsoRange(committedValue),
		[committedValue]
	);

	const groupRef = useRef<HTMLDivElement | null>(null);
	const [isOpen, setIsOpen] = useState(false);

	const constraints = useMemo(
		() => ({
			isDateUnavailable: dateRangePickerProps.isDateUnavailable,
			maxNights: dateRangePickerProps.maxNights,
			maxValue: dateRangePickerProps.maxValue,
			minNights: dateRangePickerProps.minNights,
			minValue: dateRangePickerProps.minValue,
			required: dateRangePickerProps.required,
		}),
		[
			dateRangePickerProps.isDateUnavailable,
			dateRangePickerProps.maxNights,
			dateRangePickerProps.maxValue,
			dateRangePickerProps.minNights,
			dateRangePickerProps.minValue,
			dateRangePickerProps.required,
		]
	);

	const {
		displayText,
		handleCalendarSelect,
		handleInputBlur,
		handleInputChange,
		handleInputFocus,
		handleInputKeyDown,
		handlePresetSelect,
		handleDraftReset,
		isLocalInvalid,
	} = useDateRangePickerDraft({
		committedText,
		committedValue,
		constraints,
		disabled: dateRangePickerProps.disabled ?? false,
		isControlled,
		onValueChange: dateRangePickerProps.onValueChange,
		readOnly: dateRangePickerProps.readOnly ?? false,
		setIsOpen,
		setUncontrolledValue,
	});

	const isEffectivelyInvalid = Boolean(
		dateRangePickerProps.invalid || isLocalInvalid
	);
	const resolvedDisabled = Boolean(dateRangePickerProps.disabled);
	const resolvedReadOnly = Boolean(dateRangePickerProps.readOnly);
	const size = dateRangePickerProps.size ?? "default";
	const setInputRef = useCallback(
		(node: HTMLInputElement | null) => {
			if (!node) {
				return assignRef(dateRangePickerProps.ref, node);
			}

			node.setCustomValidity(
				resolvedDisabled || resolvedReadOnly
					? ""
					: getRangeInputValidationMessage(displayText, constraints)
			);
			const { form } = node;
			const handleFormReset = (event: Event) => {
				queueMicrotask(() => {
					if (event.defaultPrevented) {
						return;
					}
					setUncontrolledValue(initialValue.current);
					setIsOpen(false);
					handleDraftReset();
				});
			};
			if (form && !isControlled) {
				form.addEventListener("reset", handleFormReset);
			}
			const cleanupRef = assignRef(dateRangePickerProps.ref, node);
			return () => {
				if (form && !isControlled) {
					form.removeEventListener("reset", handleFormReset);
				}
				cleanupRef?.();
			};
		},
		[
			constraints,
			dateRangePickerProps.ref,
			displayText,
			handleDraftReset,
			isControlled,
			resolvedDisabled,
			resolvedReadOnly,
		]
	);

	return (
		<Popover onOpenChange={setIsOpen} open={isOpen}>
			<BoundFieldProvider value={null}>
				<InputGroup ref={groupRef}>
					<InputGroupInput
						aria-describedby={dateRangePickerProps["aria-describedby"]}
						aria-label={dateRangePickerProps["aria-label"]}
						aria-labelledby={dateRangePickerProps["aria-labelledby"]}
						autoFocus={dateRangePickerProps.autoFocus}
						disabled={resolvedDisabled}
						id={inputId}
						invalid={isEffectivelyInvalid}
						name={dateRangePickerProps.name}
						onBlur={handleInputBlur}
						onChange={handleInputChange}
						onFocus={handleInputFocus}
						onKeyDown={handleInputKeyDown}
						placeholder="YYYY-MM-DD – YYYY-MM-DD"
						readOnly={resolvedReadOnly}
						ref={setInputRef}
						// In a row the field is as wide as its range format.
						render={<input size={RANGE_FIELD_SIZE} />}
						required={dateRangePickerProps.required}
						size={size}
						value={displayText}
					/>
					<InputGroupAddon align="inline-end">
						<CalendarTrigger
							disabled={resolvedDisabled}
							label={dateRangePickerProps.triggerLabel}
						/>
					</InputGroupAddon>
				</InputGroup>
			</BoundFieldProvider>

			<PopoverPopup
				align="start"
				anchor={groupRef}
				aria-label={
					dateRangePickerProps["aria-label"] ??
					"Date range picker calendar dialog"
				}
				variant="bare"
			>
				<DateRangeCalendarView
					committedValue={committedValue}
					constraints={constraints}
					disabled={resolvedDisabled}
					onCalendarSelect={handleCalendarSelect}
					onPresetSelect={handlePresetSelect}
					props={dateRangePickerProps}
					readOnly={resolvedReadOnly}
				/>
			</PopoverPopup>
		</Popover>
	);
}
