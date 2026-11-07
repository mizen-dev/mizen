"use client";

import { Heatmap, MetricDelta, MetricTrend } from "@mizen/ui";
import { create, props } from "@stylexjs/stylex";
import { IconUsers } from "@tabler/icons-react";
import { useState } from "react";
import { PeriodSelect } from "./chart-controls";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TWO_HOURS = Array.from({ length: 12 }, (_, index) =>
	String(index * 2).padStart(2, "0")
);
const PERIODS = ["Last 7 days", "Last 30 days"] as const;
type Period = (typeof PERIODS)[number];
// The last week peaks mid-afternoon on workdays; over 30 days a launch moved
// the peak to the evening and the weekend.
function usersByHour(
	weekday: number,
	weekend: number,
	base: number,
	peakSlot: number
) {
	return WEEKDAYS.map((day, dayIndex) => ({
		label: day,
		values: TWO_HOURS.map((_, hourIndex) => {
			const peak = Math.max(0, 6 - Math.abs(hourIndex - peakSlot));
			return Math.round(
				peak * (dayIndex < 5 ? weekday : weekend) + base + dayIndex
			);
		}),
	}));
}
const activityByPeriod = {
	"Last 7 days": {
		delta: 0.052,
		rows: usersByHour(14, 6, 8, 7),
		value: "1,892",
	},
	"Last 30 days": {
		delta: 0.038,
		rows: usersByHour(24, 70, 20, 10),
		value: "7,416",
	},
} satisfies Record<Period, unknown>;

// Heatmap cells cap at 2.25rem, so the card hugs the grid instead of
// stretching past it; on narrow screens it shrinks with the stage.
const styles = create({
	card: { inlineSize: "100%", marginInline: "auto", maxInlineSize: "35rem" },
});

export function ActiveUsersCard() {
	const [period, setPeriod] = useState<Period>("Last 7 days");
	const { delta, rows, value } = activityByPeriod[period];
	return (
		<div {...props(styles.card)}>
			<MetricTrend
				actions={
					<PeriodSelect
						label="Period"
						onValueChange={setPeriod}
						options={PERIODS}
						value={period}
					/>
				}
				delta={<MetricDelta value={delta} />}
				icon={<IconUsers />}
				label="Active users"
				value={value}
			>
				<Heatmap
					aria-label="Active users by weekday and hour"
					columns={TWO_HOURS}
					rows={rows}
					tone="series5"
					valueLabel="Active users"
				/>
			</MetricTrend>
		</div>
	);
}
