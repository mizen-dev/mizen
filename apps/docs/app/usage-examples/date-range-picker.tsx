"use client";
import {
	type CalendarRangeValue,
	DateRangePicker,
	Field,
	FieldDescription,
	FieldLabel,
} from "@mizen/ui";
import { useState } from "react";

// Fixed parts, not formatRange: its spacing differs between server and browser.
const shortDate = new Intl.DateTimeFormat("en-US", {
	day: "numeric",
	month: "short",
	year: "numeric",
});

function describeRange(range: CalendarRangeValue | undefined) {
	if (!(range?.from && range.to)) {
		return "Choose a start and an end date.";
	}
	return `Reports cover ${shortDate.format(range.from)} – ${shortDate.format(range.to)}.`;
}

export function ReportingDateRange() {
	const [range, setRange] = useState<CalendarRangeValue | undefined>({
		from: new Date(2026, 9, 10),
		to: new Date(2026, 9, 14),
	});
	return (
		<Field>
			<FieldLabel>Reporting period</FieldLabel>
			<DateRangePicker onValueChange={setRange} value={range} />
			<FieldDescription aria-live="polite">
				{describeRange(range)}
			</FieldDescription>
		</Field>
	);
}

export function DateRangePickerDropdownNavigation() {
	return (
		<Field>
			<FieldLabel>Travel dates</FieldLabel>
			<DateRangePicker
				captionLayout="dropdown"
				defaultValue={{
					from: new Date(2026, 9, 10),
					to: new Date(2026, 9, 14),
				}}
				endMonth={new Date(2030, 11)}
				startMonth={new Date(2020, 0)}
			/>
		</Field>
	);
}
