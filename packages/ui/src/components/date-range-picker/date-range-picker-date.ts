import type { CalendarRangeValue } from "../calendar/calendar.types";
import type { DateConstraints } from "../date-picker/date-picker-date";
import {
	areDatesEqual,
	formatIsoDate,
	isDateConstraintSatisfied,
	parseIsoDate,
	startOfDay,
} from "../date-picker/date-picker-date";

export interface RangeConstraints extends DateConstraints {
	readonly maxNights?: number | undefined;
	readonly minNights?: number | undefined;
}

type RangeValidationStatus = "invalid" | "valid";

export interface RangeValidationResult {
	readonly range: CalendarRangeValue | undefined;
	readonly status: RangeValidationStatus;
}

export function formatIsoRange(range: CalendarRangeValue | undefined): string {
	if (!range?.from) {
		return "";
	}
	const fromText = formatIsoDate(range.from);
	if (!range.to) {
		return fromText;
	}
	return `${fromText} – ${formatIsoDate(range.to)}`;
}

export function countNights(from: Date, to: Date): number {
	const utcFrom = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
	const utcTo = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
	const diffDays = Math.round((utcTo - utcFrom) / (1000 * 60 * 60 * 24));
	return Math.max(0, diffDays);
}

const RANGE_SEPARATOR_REGEX = /\s+[–—-]\s+|[–—]|\/|\s+(?:to)\s+/i;

export function parseIsoRange(text: string): CalendarRangeValue | undefined {
	const trimmed = text.trim();
	if (trimmed === "") {
		return undefined;
	}

	const separatorMatch = RANGE_SEPARATOR_REGEX.exec(trimmed);
	if (!separatorMatch) {
		const single = parseIsoDate(trimmed);
		return single ? { from: single } : undefined;
	}

	const [separator] = separatorMatch;
	const { index } = separatorMatch;
	const firstPart = trimmed.slice(0, index).trim();
	const secondPart = trimmed.slice(index + separator.length).trim();

	if (firstPart === "" || secondPart === "") {
		return undefined;
	}

	const from = parseIsoDate(firstPart);
	const to = parseIsoDate(secondPart);

	if (!(from && to)) {
		return undefined;
	}

	if (startOfDay(to).getTime() < startOfDay(from).getTime()) {
		return undefined;
	}

	return { from, to };
}

export function areRangesEqual(
	a: CalendarRangeValue | undefined,
	b: CalendarRangeValue | undefined
): boolean {
	if (a === undefined && b === undefined) {
		return true;
	}
	if (a === undefined || b === undefined) {
		return false;
	}
	return areDatesEqual(a.from, b.from) && areDatesEqual(a.to, b.to);
}

function areRangeDaysAvailable(
	from: Date,
	to: Date,
	isUnavailable: (date: Date) => boolean
): boolean {
	const current = startOfDay(from);
	const end = startOfDay(to);
	while (current.getTime() <= end.getTime()) {
		if (isUnavailable(current)) {
			return false;
		}
		current.setDate(current.getDate() + 1);
	}
	return true;
}

function areNightsWithinLimits(
	nights: number,
	minNights?: number,
	maxNights?: number
): boolean {
	if (minNights !== undefined && nights < minNights) {
		return false;
	}
	return !(maxNights !== undefined && nights > maxNights);
}

export function isRangeConstraintSatisfied(
	range: CalendarRangeValue,
	constraints: RangeConstraints
): boolean {
	if (!isDateConstraintSatisfied(range.from, constraints)) {
		return false;
	}
	if (!range.to) {
		return true;
	}
	if (startOfDay(range.to).getTime() < startOfDay(range.from).getTime()) {
		return false;
	}
	if (!isDateConstraintSatisfied(range.to, constraints)) {
		return false;
	}
	const nights = countNights(range.from, range.to);
	if (
		!areNightsWithinLimits(nights, constraints.minNights, constraints.maxNights)
	) {
		return false;
	}
	if (constraints.isDateUnavailable) {
		return areRangeDaysAvailable(
			range.from,
			range.to,
			constraints.isDateUnavailable
		);
	}
	return true;
}

export function validateRangeInput(
	text: string,
	constraints: RangeConstraints
): RangeValidationResult {
	const trimmed = text.trim();
	if (trimmed === "") {
		return {
			range: undefined,
			status: constraints.required ? "invalid" : "valid",
		};
	}

	const parsed = parseIsoRange(trimmed);
	if (!parsed) {
		return {
			range: undefined,
			status: "invalid",
		};
	}

	if (!(parsed.to && isRangeConstraintSatisfied(parsed, constraints))) {
		return {
			range: undefined,
			status: "invalid",
		};
	}

	return {
		range: parsed,
		status: "valid",
	};
}

export function getRangeInputValidationMessage(
	text: string,
	constraints: RangeConstraints
): string {
	return text !== "" &&
		validateRangeInput(text, constraints).status === "invalid"
		? "Enter a valid date range within the allowed limits."
		: "";
}
