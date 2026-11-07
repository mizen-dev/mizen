"use client";

import { MetricTrend, ProgressRings } from "@mizen/ui";
import { IconActivity } from "@tabler/icons-react";

export function ActivityRingsCard() {
	return (
		<MetricTrend icon={<IconActivity />} label="Activity">
			<ProgressRings
				aria-label="Activity today"
				rings={[
					{
						display: "1,592 kcal",
						goal: 2000,
						id: "move",
						label: "Move",
						value: 1592,
					},
					{
						display: "1h 45m",
						goal: 120,
						id: "exercise",
						label: "Exercise",
						value: 105,
					},
					{
						display: "5.2 km",
						goal: 8,
						id: "running",
						label: "Running",
						value: 5.2,
					},
				]}
			/>
		</MetricTrend>
	);
}
