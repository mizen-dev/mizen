"use client";
import {
	Calendar,
	type CalendarRangeValue,
	Heading,
	Stack,
	Text,
} from "@mizen-labs/ui";
import { props } from "@stylexjs/stylex";
import { useState } from "react";
import { specimenStyles } from "../components/[slug]/specimens/calendar-specimen.styles";

const FIXED_MONTH = new Date(2026, 5, 1);
const INITIAL_SINGLE = new Date(2026, 5, 15);
const INITIAL_RANGE: CalendarRangeValue = {
	from: new Date(2026, 5, 10),
	to: new Date(2026, 5, 18),
};
function formatIsoDate(date: Date | undefined): string {
	if (!date) {
		return "None";
	}
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}
function formatRangeText(range: CalendarRangeValue | undefined): string {
	if (!range) {
		return "None";
	}
	const fromStr = formatIsoDate(range.from);
	if (!range.to) {
		return `${fromStr} (in progress)`;
	}
	return `${fromStr} to ${formatIsoDate(range.to)}`;
}
export function CalendarSingleDateExample1() {
	const [singleDate, setSingleDate] = useState<Date | undefined>(
		INITIAL_SINGLE
	);
	return (
		<div {...props(specimenStyles.panel)}>
			<Stack gap="1">
				<Heading level={3}>Single date</Heading>
				<Text data-testid="calendar-single-value">
					Selected: {formatIsoDate(singleDate)}
				</Text>
			</Stack>
			<div data-testid="calendar-single">
				<Calendar
					aria-label="Single date"
					defaultMonth={FIXED_MONTH}
					mode="single"
					onValueChange={setSingleDate}
					value={singleDate}
				/>
			</div>
		</div>
	);
}
export function CalendarDateRangeExample2() {
	const [rangeDate, setRangeDate] = useState<CalendarRangeValue | undefined>(
		INITIAL_RANGE
	);
	return (
		<div {...props(specimenStyles.panel)}>
			<Stack gap="1">
				<Heading level={3}>Date range</Heading>
				<Text data-testid="calendar-range-value">
					Selected: {formatRangeText(rangeDate)}
				</Text>
			</Stack>
			<div data-testid="calendar-range">
				<Calendar
					aria-label="Date range"
					defaultMonth={FIXED_MONTH}
					mode="range"
					onValueChange={setRangeDate}
					value={rangeDate}
				/>
			</div>
		</div>
	);
}
