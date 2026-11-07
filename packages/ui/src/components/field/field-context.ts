import { createContext, useContext } from "react";

interface BoundFieldMeta {
	readonly errors: readonly unknown[];
	readonly isDirty: boolean;
	readonly isTouched: boolean;
	readonly isValid: boolean;
}

interface BoundStringFieldState {
	readonly meta: BoundFieldMeta;
	readonly value: string;
}

interface BoundNumberFieldState {
	readonly meta: BoundFieldMeta;
	readonly value: number | null;
}

export interface BoundStringField {
	readonly handleBlur: () => void;
	readonly handleChange: (updater: string | ((prev: string) => string)) => void;
	readonly name: string;
	readonly state: BoundStringFieldState;
}

export interface BoundNumberField {
	readonly handleBlur: () => void;
	readonly handleChange: (
		updater: number | null | ((prev: number | null) => number | null)
	) => void;
	readonly name: string;
	readonly state: BoundNumberFieldState;
}

export type BoundField = BoundStringField | BoundNumberField;

const BoundFieldContext = createContext<BoundField | null>(null);

export function useBoundFieldContext(): BoundField | null {
	return useContext(BoundFieldContext);
}

export const BoundFieldProvider = BoundFieldContext.Provider;

export function isBoundStringField(
	field: BoundField | null | undefined
): field is BoundStringField {
	return typeof field?.state.value === "string";
}

export function isBoundNumberField(
	field: BoundField | null | undefined
): field is BoundNumberField {
	return (
		field !== null &&
		field !== undefined &&
		(field.state.value === null || typeof field.state.value === "number")
	);
}

export function extractFirstErrorMessage(
	errors: readonly unknown[]
): string | undefined {
	for (const error of errors) {
		if (typeof error === "string") {
			return error;
		}
		if (Array.isArray(error)) {
			const nested = extractFirstErrorMessage(error);
			if (nested !== undefined) {
				return nested;
			}
		}
		if (typeof error === "object" && error !== null && "message" in error) {
			const { message } = error;
			if (typeof message === "string") {
				return message;
			}
		}
	}
	return undefined;
}
