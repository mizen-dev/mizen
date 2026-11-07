"use client";

import { ChartFrame, ChartTooltip, chartColors } from "@mizen-labs/ui";
import { barY, defineChart } from "@tanstack/charts";
import type { ChartTooltipBodyRenderContext } from "@tanstack/charts/react/tooltip";
import { scaleBand } from "@tanstack/charts/scales/band";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { tooltip } from "@tanstack/charts/tooltip";

interface SignupDatum {
	count: number;
	month: string;
}
const data: readonly SignupDatum[] = [
	{ count: 18, month: "Jan" },
	{ count: 24, month: "Feb" },
	{ count: 21, month: "Mar" },
	{ count: 32, month: "Apr" },
];
const chart = defineChart({
	marks: [barY(data, { fill: chartColors.series1, x: "month", y: "count" })],
	scales: {
		x: { scale: () => scaleBand<string>().padding(0.25) },
		y: { grid: true, scale: scaleLinear },
	},
	tooltip,
});
function renderSignupTooltip({
	points,
}: ChartTooltipBodyRenderContext<SignupDatum, string, number>) {
	const [point] = points;
	if (!point) {
		return null;
	}
	return (
		<ChartTooltip
			items={[
				{
					id: "signups",
					label: "Signups",
					tone: "series1",
					value: point.datum.count.toLocaleString("en-US"),
				},
			]}
			label={point.datum.month}
		/>
	);
}

export function MonthlySignups() {
	return (
		<ChartFrame
			aria-description="Monthly signups from January to April."
			aria-label="Monthly signups"
			definition={chart}
			height={220}
			initialWidth={480}
			renderTooltipBody={renderSignupTooltip}
			tabIndex={0}
		/>
	);
}
