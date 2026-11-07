"use client";
import {
	DatePicker,
	Field,
	FieldDescription,
	FieldLabel,
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
