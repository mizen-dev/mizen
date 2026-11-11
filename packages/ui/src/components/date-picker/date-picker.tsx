"use client";

import type { ReactElement } from "react";
import { useCallback, useId, useMemo, useRef, useState } from "react";
import { assignRef } from "../../ref-utils";
import { Calendar } from "../calendar/calendar";
import { BoundFieldProvider } from "../field/field-context";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "../input-group/input-group";
import { Popover, PopoverPopup } from "../popover/popover";
import type { DatePickerProps } from "./date-picker.types";
import {
	formatIsoDate,
	getDateInputValidationMessage,
} from "./date-picker-date";
import { useDatePickerDraft } from "./date-picker-state";
import { CalendarTrigger } from "./date-picker-trigger";

export type { DatePickerProps } from "./date-picker.types";

export function DatePicker(datePickerProps: DatePickerProps): ReactElement {
	const [isControlled] = useState(() =>
		Object.hasOwn(datePickerProps, "value")
	);
	const [uncontrolledValue, setUncontrolledValue] = useState<Date | undefined>(
		datePickerProps.defaultValue
	);
	const initialValue = useRef(datePickerProps.defaultValue);
	const committedValue = isControlled
		? datePickerProps.value
		: uncontrolledValue;

	const {
		"aria-describedby": ariaDescribedBy,
		"aria-label": ariaLabel,
		"aria-labelledby": ariaLabelledBy,
		autoFocus,
		captionLayout,
		dir,
		disabled = false,
		endMonth,
		id: providedId,
		invalid: externalInvalid,
		isDateUnavailable,
		locale,
		maxValue,
		minValue,
		name,
		onValueChange,
		readOnly = false,
		ref: forwardedInputRef,
		required,
		size = "default",
		startMonth,
		weekStartsOn,
	} = datePickerProps;

	const generatedId = useId();
	const inputId = providedId ?? generatedId;

	const committedText = useMemo(
		() => formatIsoDate(committedValue),
		[committedValue]
	);

	const groupRef = useRef<HTMLDivElement | null>(null);
	const [isOpen, setIsOpen] = useState(false);

	const constraints = useMemo(
		() => ({ isDateUnavailable, maxValue, minValue, required }),
		[isDateUnavailable, maxValue, minValue, required]
	);

	const {
		displayText,
		handleCalendarSelect,
		handleDraftReset,
		handleInputBlur,
		handleInputChange,
		handleInputFocus,
		handleInputKeyDown,
		isLocalInvalid,
	} = useDatePickerDraft({
		committedText,
		committedValue,
		constraints,
		disabled,
		isControlled,
		onValueChange,
		readOnly,
		setIsOpen,
		setUncontrolledValue,
	});

	const isEffectivelyInvalid = Boolean(externalInvalid || isLocalInvalid);
	const setInputRef = useCallback(
		(node: HTMLInputElement | null) => {
			if (!node) {
				return assignRef(forwardedInputRef, node);
			}

			node.setCustomValidity(
				disabled || readOnly
					? ""
					: getDateInputValidationMessage(displayText, constraints)
			);
			const { form } = node;
			const handleFormReset = (event: Event) => {
				queueMicrotask(() => {
					if (event.defaultPrevented || isControlled) {
						return;
					}
					setUncontrolledValue(initialValue.current);
					setIsOpen(false);
					handleDraftReset();
				});
			};
			if (!isControlled) {
				form?.addEventListener("reset", handleFormReset);
			}
			const cleanupRef = assignRef(forwardedInputRef, node);
			return () => {
				form?.removeEventListener("reset", handleFormReset);
				cleanupRef?.();
			};
		},
		[
			constraints,
			disabled,
			displayText,
			forwardedInputRef,
			handleDraftReset,
			isControlled,
			readOnly,
		]
	);

	return (
		<Popover onOpenChange={setIsOpen} open={isOpen}>
			<BoundFieldProvider value={null}>
				<InputGroup ref={groupRef}>
					<InputGroupInput
						aria-describedby={ariaDescribedBy}
						aria-label={ariaLabel}
						aria-labelledby={ariaLabelledBy}
						autoFocus={autoFocus}
						disabled={disabled}
						id={inputId}
						invalid={isEffectivelyInvalid}
						name={name}
						onBlur={handleInputBlur}
						onChange={handleInputChange}
						onFocus={handleInputFocus}
						onKeyDown={handleInputKeyDown}
						placeholder="YYYY-MM-DD"
						readOnly={readOnly}
						ref={setInputRef}
						required={required}
						size={size}
						value={displayText}
					/>
					<InputGroupAddon align="inline-end">
						<CalendarTrigger
							disabled={disabled}
							label={datePickerProps.triggerLabel}
						/>
					</InputGroupAddon>
				</InputGroup>
			</BoundFieldProvider>

			<PopoverPopup
				align="start"
				anchor={groupRef}
				aria-label={ariaLabel ?? "Date picker calendar dialog"}
				variant="bare"
			>
				<Calendar
					aria-label={ariaLabel ?? "Date picker calendar"}
					autoFocus
					captionLayout={captionLayout}
					defaultMonth={committedValue}
					dir={dir}
					disabled={disabled}
					endMonth={endMonth}
					isDateUnavailable={isDateUnavailable}
					locale={locale}
					maxValue={maxValue}
					minValue={minValue}
					mode="single"
					onValueChange={handleCalendarSelect}
					readOnly={readOnly}
					required={required}
					startMonth={startMonth}
					value={committedValue}
					weekStartsOn={weekStartsOn}
				/>
			</PopoverPopup>
		</Popover>
	);
}
