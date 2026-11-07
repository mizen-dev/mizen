"use client";

import { CalendarHeatmap } from "@mizen/ui";

const DAY = 86_400_000;
const start = Date.UTC(2026, 0, 1);
// A deterministic year of activity: busier on weekdays, quiet some weekends.
const days = Array.from({ length: 365 }, (_, index) => {
	const date = new Date(start + index * DAY);
	const weekday = date.getUTCDay();
	const wave = Math.round(
		Math.abs(Math.sin(index * 0.7) * 6 + Math.cos(index * 0.13) * 3)
	);
	return {
		date: date.toISOString().slice(0, 10),
		value: weekday === 0 || weekday === 6 ? Math.max(0, wave - 4) : wave,
	};
});

export function ContributionsThisYear() {
	return (
		<CalendarHeatmap
			aria-label="Contributions in 2026"
			days={days}
			valueLabel="Contributions"
		/>
	);
}
