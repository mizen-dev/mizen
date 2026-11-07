"use client";

import { TimeSeries } from "@mizen/ui";
import { useCallback } from "react";

export function DailyVisitors() {
	const points = [
		{ time: Date.UTC(2026, 9, 1), value: 240 },
		{ time: Date.UTC(2026, 9, 2), value: 275 },
		{ time: Date.UTC(2026, 9, 3), value: null },
		{ time: Date.UTC(2026, 9, 4), value: 310 },
	];
	const formatValue = useCallback(
		(value: number) => value.toLocaleString("en-US"),
		[]
	);
	return (
		<TimeSeries
			aria-description="Visitor counts by day, with one missing observation."
			aria-label="Daily visitors"
			formatAxisValue={formatValue}
			formatValue={formatValue}
			points={points}
			seriesLabel="Visitors"
			timeZone="UTC"
		/>
	);
}
