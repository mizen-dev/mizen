"use client";

import { AreaChart, type AreaChartSeries } from "@mizen-labs/ui";

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

export function VisitorsBySource() {
	return (
		<AreaChart
			aria-label="Monthly visitors by source"
			series={visitors}
			timeZone="UTC"
		/>
	);
}
