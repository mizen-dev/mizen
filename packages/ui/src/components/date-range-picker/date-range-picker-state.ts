import type { ChangeEvent, FocusEvent, KeyboardEvent } from "react";
import { useCallback, useState } from "react";
import type { CalendarRangeValue } from "../calendar/calendar.types";
import type { RangeConstraints } from "./date-range-picker-date";
import {
	areRangesEqual,
	formatIsoRange,
	getRangeInputValidationMessage,
	isRangeConstraintSatisfied,
	validateRangeInput,
} from "./date-range-picker-date";

export interface UseDateRangePickerDraftOptions {
	committedText: string;
	committedValue: CalendarRangeValue | undefined;
	constraints: RangeConstraints;
	disabled: boolean;
	isControlled: boolean;
	onValueChange?: ((value: CalendarRangeValue | undefined) => void) | undefined;
	readOnly: boolean;
	setIsOpen: (open: boolean) => void;
	setUncontrolledValue: (updater: CalendarRangeValue | undefined) => void;
}

function getNextCalendarCommit(selectedRange: CalendarRangeValue | undefined): {
	readonly isComplete: boolean;
	readonly nextVal: CalendarRangeValue | undefined;
} {
	if (!selectedRange) {
		return { isComplete: false, nextVal: undefined };
	}
	const isComplete = selectedRange.to !== undefined;
	return {
		isComplete,
		nextVal: isComplete ? selectedRange : { from: selectedRange.from },
	};
}

export function useDateRangePickerDraft({
	committedText,
	committedValue,
	constraints,
	disabled,
	isControlled,
	onValueChange,
	readOnly,
	setIsOpen,
	setUncontrolledValue,
}: UseDateRangePickerDraftOptions) {
	const [isFocused, setIsFocused] = useState(false);
	const [focusedDraft, setFocusedDraft] = useState<string | null>(null);
	const [invalidState, setInvalidState] = useState<{
		baseKey: string;
		text: string;
	} | null>(null);

	const isInvalidActive =
		invalidState !== null && invalidState.baseKey === committedText;
	const handleDraftReset = useCallback(() => {
		setIsFocused(false);
		setFocusedDraft(null);
		setInvalidState(null);
	}, []);

	let displayText = committedText;
	if (isFocused) {
		displayText =
			focusedDraft ?? (isInvalidActive ? invalidState.text : committedText);
	} else if (isInvalidActive) {
		displayText = invalidState.text;
	}

	const commitCandidate = useCallback(
		(nextRange: CalendarRangeValue | undefined) => {
			setInvalidState(null);
			setFocusedDraft(null);
			if (areRangesEqual(committedValue, nextRange)) {
				return;
			}
			if (!isControlled) {
				setUncontrolledValue(nextRange);
			}
			onValueChange?.(nextRange);
		},
		[committedValue, isControlled, onValueChange, setUncontrolledValue]
	);

	const handleInputChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			if (readOnly || disabled) {
				return;
			}
			event.currentTarget.setCustomValidity(
				getRangeInputValidationMessage(event.currentTarget.value, constraints)
			);
			setInvalidState(null);
			setFocusedDraft(event.target.value);
		},
		[constraints, disabled, readOnly]
	);

	const handleInputFocus = useCallback(() => {
		if (disabled) {
			return;
		}
		setIsFocused(true);
	}, [disabled]);

	const handleInputBlur = useCallback(
		(event: FocusEvent<HTMLInputElement>) => {
			setIsFocused(false);
			if (readOnly || disabled) {
				return;
			}
			const currentDraft = focusedDraft ?? event.target.value;
			setFocusedDraft(null);
			const result = validateRangeInput(currentDraft, constraints);
			event.currentTarget.setCustomValidity(
				getRangeInputValidationMessage(currentDraft, constraints)
			);

			if (result.status === "valid") {
				setInvalidState(null);
				if (!areRangesEqual(committedValue, result.range)) {
					commitCandidate(result.range);
				}
			} else {
				setInvalidState({
					baseKey: committedText,
					text: currentDraft,
				});
			}
		},
		[
			commitCandidate,
			committedText,
			committedValue,
			constraints,
			disabled,
			focusedDraft,
			readOnly,
		]
	);

	const handleInputKeyDown = useCallback(
		(event: KeyboardEvent<HTMLInputElement>) => {
			if (disabled || readOnly) {
				return;
			}
			if (event.key === "Enter") {
				const currentDraft = focusedDraft ?? event.currentTarget.value;
				const result = validateRangeInput(currentDraft, constraints);
				event.currentTarget.setCustomValidity(
					getRangeInputValidationMessage(currentDraft, constraints)
				);
				if (result.status === "valid") {
					commitCandidate(result.range);
				} else {
					setInvalidState({
						baseKey: committedText,
						text: currentDraft,
					});
					event.preventDefault();
				}
			} else if (event.key === "Escape") {
				event.currentTarget.setCustomValidity(
					getRangeInputValidationMessage(committedText, constraints)
				);
				setFocusedDraft(null);
				setInvalidState(null);
				setIsOpen(false);
			}
		},
		[
			commitCandidate,
			committedText,
			constraints,
			disabled,
			focusedDraft,
			readOnly,
			setIsOpen,
		]
	);

	const handleCalendarSelect = useCallback(
		(selectedRange: CalendarRangeValue | undefined) => {
			if (readOnly || disabled) {
				return;
			}
			if (
				selectedRange &&
				!isRangeConstraintSatisfied(selectedRange, constraints)
			) {
				return;
			}
			const { isComplete, nextVal } = getNextCalendarCommit(selectedRange);
			commitCandidate(nextVal);
			if (isComplete) {
				setIsOpen(false);
			}
		},
		[commitCandidate, constraints, disabled, readOnly, setIsOpen]
	);

	const handlePresetSelect = useCallback(
		(presetRange: CalendarRangeValue) => {
			if (readOnly || disabled) {
				return;
			}
			if (!isRangeConstraintSatisfied(presetRange, constraints)) {
				return;
			}
			commitCandidate(presetRange);
			setIsOpen(false);
		},
		[commitCandidate, constraints, disabled, readOnly, setIsOpen]
	);

	const isLocalInvalid = isInvalidActive;

	return {
		displayText:
			isFocused || isInvalidActive
				? displayText
				: formatIsoRange(committedValue),
		handleCalendarSelect,
		handleDraftReset,
		handleInputBlur,
		handleInputChange,
		handleInputFocus,
		handleInputKeyDown,
		handlePresetSelect,
		isLocalInvalid,
	};
}
