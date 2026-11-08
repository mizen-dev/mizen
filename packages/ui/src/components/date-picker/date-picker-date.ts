export interface DateConstraints {
	readonly isDateUnavailable?: ((date: Date) => boolean) | undefined;
	readonly maxValue?: Date | undefined;
	readonly minValue?: Date | undefined;
	readonly required?: boolean | undefined;
}

type DateValidationStatus = "invalid" | "valid";

export interface DateValidationResult {
	readonly date: Date | undefined;
	readonly status: DateValidationStatus;
}

export function formatIsoDate(date: Date | undefined): string {
	if (!date) {
		return "";
	}
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/u;

export function parseIsoDate(text: string): Date | undefined {
	const trimmed = text.trim();
	if (!ISO_DATE_PATTERN.test(trimmed)) {
		return undefined;
	}

	const parts = trimmed.split("-");
	const year = Number(parts[0]);
	const month = Number(parts[1]);
	const day = Number(parts[2]);

	if (month < 1 || month > 12 || day < 1 || day > 31) {
		return undefined;
	}

	const date = new Date(year, month - 1, day);
	if (
		date.getFullYear() !== year ||
		date.getMonth() !== month - 1 ||
		date.getDate() !== day
	) {
		return undefined;
	}

	date.setHours(0, 0, 0, 0);
	return date;
}

export function areDatesEqual(
	a: Date | undefined,
	b: Date | undefined
): boolean {
	if (a === undefined && b === undefined) {
		return true;
	}
	if (a === undefined || b === undefined) {
		return false;
	}
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}

export function startOfDay(date: Date): Date {
	const result = new Date(date);
	result.setHours(0, 0, 0, 0);
	return result;
}

export function isDateConstraintSatisfied(
	date: Date,
	constraints: DateConstraints
): boolean {
	const target = startOfDay(date);

	if (constraints.minValue) {
		const min = startOfDay(constraints.minValue);
		if (target.getTime() < min.getTime()) {
			return false;
		}
	}

	if (constraints.maxValue) {
		const max = startOfDay(constraints.maxValue);
		if (target.getTime() > max.getTime()) {
			return false;
		}
	}

	return !constraints.isDateUnavailable?.(date);
}

export function validateDateInput(
	text: string,
	constraints: DateConstraints
): DateValidationResult {
	const trimmed = text.trim();
	if (trimmed === "") {
		return {
			date: undefined,
			status: constraints.required ? "invalid" : "valid",
		};
	}

	const parsed = parseIsoDate(trimmed);
	if (!parsed) {
		return {
			date: undefined,
			status: "invalid",
		};
	}

	if (!isDateConstraintSatisfied(parsed, constraints)) {
		return {
			date: undefined,
			status: "invalid",
		};
	}

	return {
		date: parsed,
		status: "valid",
	};
}

export function getDateInputValidationMessage(
	text: string,
	constraints: DateConstraints
): string {
	return text !== "" &&
		validateDateInput(text, constraints).status === "invalid"
		? "Enter a valid date within the allowed range."
		: "";
}
