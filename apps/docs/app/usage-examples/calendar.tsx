"use client";
import { Calendar } from "@mizen/ui";
import { useState } from "react";
export function AppointmentCalendar() {
	const [date, setDate] = useState<Date | undefined>(new Date(2026, 9, 15));
	return (
		<Calendar
			aria-label="Appointment date"
			mode="single"
			onValueChange={setDate}
			value={date}
		/>
	);
}

export function CalendarDropdownNavigation() {
	const [month, setMonth] = useState(new Date(2026, 9, 1));
	return (
		<Calendar
			aria-label="Choose a date"
			captionLayout="dropdown"
			endMonth={new Date(2030, 11, 1)}
			mode="single"
			month={month}
			onMonthChange={setMonth}
			startMonth={new Date(2020, 0, 1)}
		/>
	);
}
