"use client";

import { ChartLegend, MetricDelta, MetricTrend, TimeSeries } from "@mizen/ui";
import { IconCoin } from "@tabler/icons-react";

const toPoints = (thousands: number[]) =>
	thousands.map((value, month) => ({
		time: Date.UTC(2026, month, 1),
		value: value * 1000,
	}));
const months = toPoints([42, 44, 48, 47, 52, 55, 60, 57, 63, 66, 64, 70]);
const lastYear = toPoints([36, 37, 40, 41, 43, 46, 48, 49, 51, 52, 53, 55]);
const currency = new Intl.NumberFormat("en-US", {
	currency: "USD",
	minimumFractionDigits: 0,
	notation: "compact",
	style: "currency",
});
const formatValue = (value: number) => currency.format(value);

export function MonthlyRevenueTrend() {
	return (
		<MetricTrend
			actions={
				<ChartLegend
					aria-label="Revenue series"
					items={[
						{ id: "this-year", label: "This year", tone: "series1" },
						{ id: "last-year", label: "Last year", tone: "muted" },
					]}
				/>
			}
			delta={<MetricDelta value={0.16} />}
			description="$131,304 last year"
			icon={<IconCoin />}
			label="Revenue"
			value="152,314"
			valuePrefix="$"
		>
			<TimeSeries
				aria-label="Monthly revenue this year and last year"
				comparison={{ label: "Last year", points: lastYear }}
				formatAxisValue={formatValue}
				formatValue={formatValue}
				legend={false}
				points={months}
				seriesLabel="This year"
				timeZone="UTC"
			/>
		</MetricTrend>
	);
}
