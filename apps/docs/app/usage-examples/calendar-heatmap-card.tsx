"use client";

import { CalendarHeatmap, MetricDelta, MetricTrend } from "@mizen/ui";
import { IconGitCommit } from "@tabler/icons-react";

const DAY = 86_400_000;
const firstDay = Date.UTC(2026, 6, 1);
const contributionDays = Array.from({ length: 184 }, (_, index) => {
	const date = new Date(firstDay + index * DAY);
	const weekday = date.getUTCDay();
	const wave = Math.round(
		Math.abs(Math.sin(index * 0.7) * 6 + Math.cos(index * 0.13) * 3)
	);
	return {
		date: date.toISOString().slice(0, 10),
		value: weekday === 0 || weekday === 6 ? Math.max(0, wave - 4) : wave,
	};
});
const contributionTotal = contributionDays.reduce(
	(sum, { value }) => sum + value,
	0
);

export function ContributionsCard() {
	return (
		<MetricTrend
			delta={<MetricDelta value={0.148} />}
			icon={<IconGitCommit />}
			label="Contributions, July to December"
			value={contributionTotal.toLocaleString("en-US")}
		>
			<CalendarHeatmap
				aria-label="Contributions from July to December"
				days={contributionDays}
				valueLabel="Contributions"
			/>
		</MetricTrend>
	);
}
