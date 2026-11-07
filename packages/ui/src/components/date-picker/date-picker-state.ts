import type { ChangeEvent, FocusEvent, KeyboardEvent } from "react";
import { useCallback, useState } from "react";
import type { DateConstraints } from "./date-picker-date";
import {
	areDatesEqual,
	getDateInputValidationMessage,
	isDateConstraintSatisfied,
	validateDateInput,
} from "./date-picker-date";

export interface UseDatePickerDraftOptions {
	committedText: string;
	committedValue: Date | undefined;
	constraints: DateConstraints;
	disabled: boolean;
	isControlled: boolean;
	onValueChange?: ((value: Date | undefined) => void) | undefined;
	readOnly: boolean;
	setIsOpen: (open: boolean) => void;
	setUncontrolledValue: (updater: Date | undefined) => void;
}

export function useDatePickerDraft({
	committedText,
	committedValue,
	constraints,
	disabled,
	isControlled,
	onValueChange,
	readOnly,
	setIsOpen,
	setUncontrolledValue,
}: UseDatePickerDraftOptions) {
	const [isFocused, setIsFocused] = useState(false);
	const [focusedDraft, setFocusedDraft] = useState<string | null>(null);
	const [invalidState, setInvalidState] = useState<{
		baseKey: string;
		text: string;
	} | null>(null);

	const isInvalidActive =
		invalidState !== null && invalidState.baseKey === committedText;

	let displayText = committedText;
	if (isFocused) {
		displayText =
			focusedDraft ?? (isInvalidActive ? invalidState.text : committedText);
	} else if (isInvalidActive) {
		displayText = invalidState.text;
	}

	const commitCandidate = useCallback(
		(nextDate: Date | undefined) => {
			if (!isControlled) {
				setUncontrolledValue(nextDate);
			}
			setInvalidState(null);
			setFocusedDraft(null);
			onValueChange?.(nextDate);
		},
		[isControlled, onValueChange, setUncontrolledValue]
	);
	const handleDraftReset = useCallback(() => {
		setIsFocused(false);
		setFocusedDraft(null);
		setInvalidState(null);
	}, []);

	const handleInputChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			if (readOnly || disabled) {
				return;
			}
			event.currentTarget.setCustomValidity(
				getDateInputValidationMessage(event.currentTarget.value, constraints)
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
			const result = validateDateInput(currentDraft, constraints);
			event.currentTarget.setCustomValidity(
				getDateInputValidationMessage(currentDraft, constraints)
			);

			if (result.status === "valid") {
				setInvalidState(null);
				if (!areDatesEqual(committedValue, result.date)) {
					commitCandidate(result.date);
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
				const result = validateDateInput(currentDraft, constraints);
				event.currentTarget.setCustomValidity(
					getDateInputValidationMessage(currentDraft, constraints)
				);
				if (result.status === "valid") {
					commitCandidate(result.date);
				} else {
					setInvalidState({
						baseKey: committedText,
						text: currentDraft,
					});
					event.preventDefault();
				}
			} else if (event.key === "Escape") {
				event.currentTarget.setCustomValidity(
					getDateInputValidationMessage(committedText, constraints)
				);
				setFocusedDraft(null);
				setInvalidState(null);
			}
		},
		[
			commitCandidate,
			committedText,
			constraints,
			disabled,
			focusedDraft,
			readOnly,
		]
	);

	const handleCalendarSelect = useCallback(
		(selectedDate: Date | undefined) => {
			if (readOnly || disabled) {
				return;
			}
			if (
				selectedDate &&
				!isDateConstraintSatisfied(selectedDate, constraints)
			) {
				return;
			}
			commitCandidate(selectedDate);
			setIsOpen(false);
		},
		[commitCandidate, constraints, disabled, readOnly, setIsOpen]
	);

	const isLocalInvalid = isInvalidActive;

	return {
		displayText,
		handleCalendarSelect,
		handleDraftReset,
		handleInputBlur,
		handleInputChange,
		handleInputFocus,
		handleInputKeyDown,
		isLocalInvalid,
	};
}
