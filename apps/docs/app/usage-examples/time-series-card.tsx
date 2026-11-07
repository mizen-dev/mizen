"use client";

import { MetricDelta, MetricTrend, TimeSeries } from "@mizen/ui";
import { IconCoin } from "@tabler/icons-react";
import { useState } from "react";
import { PeriodTabs } from "./chart-controls";

const PERIODS = ["Weekly", "Monthly", "Yearly"] as const;
type Period = (typeof PERIODS)[number];
const DAY = 24 * 60 * 60 * 1000;
const revenueByPeriod = {
	Monthly: {
		delta: 0.094,
		label: "Monthly revenue",
		points: [
			1400, 1900, 2600, 2300, 3300, 3000, 2700, 3800, 4600, 4200, 3700, 5400,
		].map((value, month) => ({ time: Date.UTC(2026, month, 1), value })),
		value: "18,240",
	},
	// Twelve weeks, starting the first Monday of September.
	Weekly: {
		delta: -0.098,
		label: "Weekly revenue",
		points: [
			5200, 3100, 4800, 2600, 4400, 5900, 3300, 4700, 6100, 3800, 5500, 4960,
		].map((value, week) => ({
			time: Date.UTC(2026, 8, 7) + week * 7 * DAY,
			value,
		})),
		value: "4,960",
	},
	Yearly: {
		delta: 0.272,
		label: "Yearly revenue",
		points: [61_000, 88_000, 112_000, 139_000, 168_000, 214_600].map(
			(value, index) => ({ time: Date.UTC(2021 + index, 0, 1), value })
		),
		value: "214,600",
	},
} satisfies Record<Period, unknown>;
const compactDollars = new Intl.NumberFormat("en-US", {
	currency: "USD",
	maximumFractionDigits: 1,
	minimumFractionDigits: 0,
	notation: "compact",
	style: "currency",
});
const formatDollars = (value: number) => compactDollars.format(value);

export function RevenueLineCard() {
	const [period, setPeriod] = useState<Period>("Monthly");
	const { delta, label, points, value } = revenueByPeriod[period];
	return (
		<MetricTrend
			actions={
				<PeriodTabs
					label="Period"
					onValueChange={setPeriod}
					options={PERIODS}
					value={period}
				/>
			}
			delta={<MetricDelta value={delta} />}
			icon={<IconCoin />}
			label="Revenue"
			value={value}
			valuePrefix="$"
		>
			<TimeSeries
				aria-label={label}
				formatValue={formatDollars}
				legend={false}
				points={points}
				seriesLabel="Revenue"
				timeZone="UTC"
			/>
		</MetricTrend>
	);
}
