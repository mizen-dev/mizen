"use client";

import {
	AreaChart,
	type AreaChartSeries,
	Button,
	ChartLegend,
	type ChartStatus,
	MetricDelta,
	MetricTrend,
	Stack,
} from "@mizen-labs/ui";
import { useCallback, useState } from "react";

const month = (index: number) => Date.UTC(2026, index, 1);
const toPoints = (values: number[]) =>
	values.map((value, index) => ({ time: month(index), value }));

const visitors: AreaChartSeries[] = [
	{
		id: "organic",
		label: "Organic",
		points: toPoints([
			3100, 3300, 3500, 3400, 3800, 4100, 4300, 4200, 4600, 4800, 4700, 5100,
		]),
	},
	{
		id: "referral",
		label: "Referral",
		points: toPoints([
			1500, 1600, 1550, 1700, 1800, 1850, 2000, 2100, 2150, 2300, 2400, 2550,
		]),
	},
	{
		id: "paid",
		label: "Paid",
		points: toPoints([
			900, 850, 1100, 1000, 1200, 1300, 1250, 1500, 1550, 1600, 1700, 1850,
		]),
	},
];

// overlap compares series against each other; each area fills from zero.
export function AreaChartOverlapExample() {
	return (
		<AreaChart
			aria-label="Monthly visitors by source, overlapping"
			layout="overlap"
			series={visitors}
			timeZone="UTC"
		/>
	);
}

// status="loading" holds the chart's space; the data that replaces it wipes in.
export function AreaChartLoadingExample() {
	const [status, setStatus] = useState<ChartStatus>("ready");
	const reload = useCallback(() => {
		setStatus("loading");
		// Stands in for a network request.
		window.setTimeout(() => setStatus("ready"), 1200);
	}, []);
	return (
		<Stack gap="3">
			<AreaChart
				aria-label="Monthly visitors by source"
				series={visitors}
				status={status}
				timeZone="UTC"
			/>
			<Button
				disabled={status === "loading"}
				onClick={reload}
				variant="outline"
			>
				Reload data
			</Button>
		</Stack>
	);
}

// percent normalizes every month to 100%, so the chart reads as share.
export function AreaChartPercentExample() {
	return (
		<AreaChart
			aria-label="Share of monthly visitors by source"
			layout="percent"
			series={visitors}
			timeZone="UTC"
		/>
	);
}

const total = (series: AreaChartSeries) =>
	series.points.reduce((sum, { value }) => sum + (value ?? 0), 0);

// In a MetricTrend card, the legend carries each series' total under the chart.
export function AreaChartVisitorsCardExample() {
	return (
		<MetricTrend
			delta={<MetricDelta value={0.082} />}
			label="Visitors"
			value={visitors
				.reduce((sum, series) => sum + total(series), 0)
				.toLocaleString("en-US")}
		>
			<Stack gap="3">
				<AreaChart
					aria-label="Monthly visitors by source"
					legend={false}
					series={visitors}
					timeZone="UTC"
				/>
				<ChartLegend
					aria-label="Visitors by source"
					items={visitors.map((series, index) => ({
						id: series.id,
						label: series.label,
						tone: (["series1", "series2", "series3"] as const)[index],
						value: total(series).toLocaleString("en-US"),
					}))}
				/>
			</Stack>
		</MetricTrend>
	);
}
