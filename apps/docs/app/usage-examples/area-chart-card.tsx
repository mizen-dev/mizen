"use client";

import {
	AreaChart,
	type AreaChartSeries,
	ChartLegend,
	MetricDelta,
	MetricTrend,
	Stack,
} from "@mizen-labs/ui";
import { IconUsers } from "@tabler/icons-react";
import { useState } from "react";
import { PeriodSelect } from "./chart-controls";

const month = (index: number) => Date.UTC(2026, index, 1);
const sourceSeries = (id: string, label: string, values: number[]) => ({
	id,
	label,
	points: values.map((value, index) => ({ time: month(index), value })),
});
const PERIODS = ["This year", "Last year"] as const;
type Period = (typeof PERIODS)[number];
const visitorsByPeriod: Record<
	Period,
	{ delta: number; series: AreaChartSeries[] }
> = {
	"Last year": {
		delta: -0.034,
		series: [
			sourceSeries(
				"organic",
				"Organic",
				[1800, 2400, 3300, 4200, 4900, 5200, 4700, 3900, 3200, 2900, 2600, 2400]
			),
			sourceSeries(
				"referral",
				"Referral",
				[900, 1000, 1200, 1500, 1900, 2400, 2900, 3300, 3500, 3600, 3700, 3900]
			),
			sourceSeries(
				"paid",
				"Paid",
				[200, 220, 260, 300, 340, 380, 360, 320, 300, 280, 260, 240]
			),
		],
	},
	"This year": {
		delta: 0.082,
		series: [
			sourceSeries(
				"organic",
				"Organic",
				[2600, 2800, 3100, 3000, 3600, 3900, 4300, 4200, 4700, 5100, 5000, 5600]
			),
			sourceSeries(
				"referral",
				"Referral",
				[1300, 1350, 1500, 1550, 1700, 1800, 2000, 2050, 2250, 2400, 2500, 2700]
			),
			sourceSeries(
				"paid",
				"Paid",
				[800, 850, 950, 1000, 1150, 1200, 1300, 1400, 1550, 1650, 1750, 1900]
			),
		],
	},
};
const total = (entry: AreaChartSeries) =>
	entry.points.reduce((sum, { value }) => sum + (value ?? 0), 0);
const TONES = ["series1", "series2", "series3"] as const;

export function VisitorsAreaCard() {
	const [period, setPeriod] = useState<Period>("This year");
	const { delta, series: visitorSources } = visitorsByPeriod[period];
	return (
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
			label="Visitors"
			value={visitorSources
				.reduce((sum, entry) => sum + total(entry), 0)
				.toLocaleString("en-US")}
		>
			<Stack gap="3">
				<AreaChart
					aria-label="Monthly visitors by source"
					legend={false}
					series={visitorSources}
					timeZone="UTC"
				/>
				<ChartLegend
					aria-label="Visitors by source"
					items={visitorSources.map((entry, index) => ({
						id: entry.id,
						label: entry.label,
						tone: TONES[index],
						value: total(entry).toLocaleString("en-US"),
					}))}
					variant="tiles"
				/>
			</Stack>
		</MetricTrend>
	);
}
