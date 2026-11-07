"use client";

import {
	CategoryComparison,
	ChartLegend,
	MetricDelta,
	MetricTrend,
} from "@mizen/ui";
import { IconCoin, IconShoppingCart } from "@tabler/icons-react";
import { useState } from "react";
import { PeriodTabs } from "./chart-controls";

const MONTHS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];
const thisYear = [
	1720, 1790, 1960, 1880, 2100, 2210, 2380, 2290, 2420, 2510, 2390, 2460,
];
const lastYear = [
	1530, 1490, 1660, 1640, 1720, 1770, 1840, 1910, 1950, 2010, 1830, 1810,
];
const PERIODS = ["Weekly", "Monthly", "Yearly"] as const;
type Period = (typeof PERIODS)[number];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const YEARS = ["2021", "2022", "2023", "2024", "2025", "2026"];
const earningsByPeriod = {
	Monthly: {
		delta: 0.148,
		label: "Earnings by month",
		labels: MONTHS,
		value: "7,462",
		values: [
			1400, 6100, 8800, 5900, 2900, 1800, 3100, 4200, 5700, 3700, 9700, 7000,
		],
	},
	Weekly: {
		delta: 0.062,
		label: "Earnings by day this week",
		labels: WEEKDAYS,
		value: "5,460",
		values: [620, 940, 1100, 870, 1240, 410, 280],
	},
	Yearly: {
		delta: 0.113,
		label: "Earnings by year",
		labels: YEARS,
		value: "63,400",
		values: [21_000, 34_000, 41_000, 48_000, 57_000, 63_400],
	},
} satisfies Record<Period, unknown>;
const compactDollars = new Intl.NumberFormat("en-US", {
	currency: "USD",
	maximumFractionDigits: 0,
	minimumFractionDigits: 0,
	notation: "compact",
	style: "currency",
});
const formatDollars = (value: number) => compactDollars.format(value);

export function OrdersComparisonCard() {
	return (
		<MetricTrend
			actions={
				<ChartLegend
					aria-label="Order series"
					items={[
						{ id: "this-year", label: "This year", tone: "series5" },
						{ id: "last-year", label: "Last year", tone: "muted" },
					]}
				/>
			}
			delta={<MetricDelta value={0.2} />}
			description="20,968 last year"
			icon={<IconShoppingCart />}
			label="Orders"
			value="25,162"
		>
			<CategoryComparison
				aria-label="Monthly orders, this year against last year"
				categories={MONTHS.map((label, index) => ({
					comparison: lastYear[index],
					id: label.toLowerCase(),
					label,
					value: thisYear[index],
				}))}
				comparisonLabel="Last year"
				legend={false}
				orientation="vertical"
				seriesLabel="This year"
				tone="series5"
			/>
		</MetricTrend>
	);
}

export function EarningsTrackCard() {
	const [period, setPeriod] = useState<Period>("Monthly");
	const { delta, label, labels, value, values } = earningsByPeriod[period];
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
			label="Earned so far"
			value={value}
			valuePrefix="$"
		>
			<CategoryComparison
				aria-label={label}
				categories={labels.map((name, index) => ({
					id: name.toLowerCase(),
					label: name,
					value: values[index] ?? 0,
				}))}
				formatValue={formatDollars}
				legend={false}
				orientation="vertical"
				seriesLabel="Earnings"
				tone="series4"
				track
			/>
		</MetricTrend>
	);
}
