"use client";

import { CalendarHeatmap } from "@mizen/ui";

const DAY = 86_400_000;
const start = Date.UTC(2026, 6, 1);
// Half a year fits a narrow card at a comfortable cell size.
const days = Array.from({ length: 184 }, (_, index) => ({
	date: new Date(start + index * DAY).toISOString().slice(0, 10),
	value: Math.round(
		Math.abs(Math.sin(index * 0.45) * 40 + Math.cos(index * 0.1) * 20)
	),
}));

export function CalendarHeatmapHalfYearExample() {
	return (
		<CalendarHeatmap
			aria-label="Deploys from July to December"
			days={days}
			tone="series5"
			valueLabel="Deploys"
			weekStartsOn={0}
		/>
	);
}
