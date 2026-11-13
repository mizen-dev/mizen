"use client";
import {
	DatePicker,
	Field,
	FieldDescription,
	FieldLabel,
	Inline,
	SegmentedControl,
	SegmentedControlItem,
} from "@mizen-labs/ui";
import { useState } from "react";

const longDate = new Intl.DateTimeFormat("en-US", {
	day: "numeric",
	month: "long",
	weekday: "long",
	year: "numeric",
});

export function ControlledDatePicker() {
	const [date, setDate] = useState<Date | undefined>(new Date(2026, 9, 15));
	return (
		<Field>
			<FieldLabel>Release date</FieldLabel>
			<DatePicker onValueChange={setDate} value={date} />
			<FieldDescription aria-live="polite">
				{date ? `Ships on ${longDate.format(date)}.` : "Choose a release date."}
			</FieldDescription>
		</Field>
	);
}

// In a row the date field is as wide as its date, so the next filter sits
// beside it. In a Field or a Stack it fills the width.
export function DatePickerFilterRowExample7() {
	return (
		<Inline gap="2">
			<DatePicker
				aria-label="Bank day"
				defaultValue={new Date(2026, 10, 12)}
				size="sm"
			/>
			<SegmentedControl aria-label="Period" defaultValue={["day"]} size="sm">
				<SegmentedControlItem value="day">Day</SegmentedControlItem>
				<SegmentedControlItem value="week">7 days</SegmentedControlItem>
			</SegmentedControl>
		</Inline>
	);
}

export function DatePickerDropdownNavigation() {
	return (
		<Field>
			<FieldLabel>Appointment date</FieldLabel>
			<DatePicker
				captionLayout="dropdown"
				defaultValue={new Date(2026, 9, 15)}
				endMonth={new Date(2030, 11)}
				startMonth={new Date(2020, 0)}
			/>
			<FieldDescription>Use the month and year menus to jump.</FieldDescription>
		</Field>
	);
}
