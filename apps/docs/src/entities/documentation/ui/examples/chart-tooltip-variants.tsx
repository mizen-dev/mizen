"use client";
import {
	Card,
	CardPanel,
	ChartFrame,
	ChartLegend,
	type ChartSeriesTone,
	ChartTooltip,
	chartColors,
	Heading,
	Section,
	Stack,
	Text,
} from "@mizen-labs/ui";
import {
	Metric,
	MetricDescription,
	MetricLabel,
	MetricValue,
} from "@mizen-labs/ui/metric";
import { props } from "@stylexjs/stylex";
import { defineChart, lineY } from "@tanstack/charts";
import type { ChartTooltipBodyRenderContext } from "@tanstack/charts/react/tooltip";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { scaleOrdinal } from "@tanstack/charts/scales/ordinal";
import { scalePoint } from "@tanstack/charts/scales/point";
import { tooltip } from "@tanstack/charts/tooltip";
import { chartExampleStyles } from "../compositions/chart-composition.styles";

interface TeamDatum {
	month: string;
	series: "Active teams" | "New teams";
	value: number;
}
const teamData: readonly TeamDatum[] = [
	{ month: "Jan", series: "Active teams", value: 42 },
	{ month: "Feb", series: "Active teams", value: 48 },
	{ month: "Mar", series: "Active teams", value: 53 },
	{ month: "Apr", series: "Active teams", value: 58 },
	{ month: "Jan", series: "New teams", value: 8 },
	{ month: "Feb", series: "New teams", value: 11 },
	{ month: "Mar", series: "New teams", value: 9 },
	{ month: "Apr", series: "New teams", value: 14 },
];
const tones: Record<TeamDatum["series"], ChartSeriesTone> = {
	"Active teams": "series1",
	"New teams": "series2",
};
const teamChart = defineChart({
	color: {
		scale: () =>
			scaleOrdinal<string, string>()
				.domain(["Active teams", "New teams"])
				.range([chartColors.series1, chartColors.series2]),
	},
	marks: [
		lineY(teamData, {
			id: "teams",
			points: true,
			x: "month",
			y: "value",
			z: "series",
		}),
	],
	scales: {
		x: {
			scale: () => scalePoint<string>().padding(0.25),
		},
		y: {
			grid: true,
			scale: scaleLinear,
		},
	},
	tooltip,
});
function renderTeamTooltip({
	points,
}: ChartTooltipBodyRenderContext<TeamDatum, string, number>) {
	if (points.length === 0) {
		return null;
	}
	return (
		<ChartTooltip
			items={points.map((point) => ({
				id: point.datum.series,
				label: point.datum.series,
				tone: tones[point.datum.series],
				value: point.yValue.toLocaleString("en-US"),
			}))}
			label={points[0].xValue}
		/>
	);
}
const legendItems = [
	{ id: "active", label: "Active teams", tone: "series1" },
	{ id: "new", label: "New teams", tone: "series2" },
] as const;
const _paletteSeriesTones: Record<string, ChartSeriesTone> = {
	Active: "series3",
	Growth: "series5",
	"Last year": "series2",
	New: "series4",
	"This year": "series1",
};
export function ChartTooltipTeamActivityExample1() {
	return (
		<Section aria-labelledby="chart-frame-heading" data-testid="chart-example">
			<div {...props(chartExampleStyles.workarea)}>
				<Card>
					<CardPanel>
						<Stack gap="3">
							<div {...props(chartExampleStyles.header)}>
								<div>
									<Heading id="chart-frame-heading" level={2} size="heading">
										Team activity
									</Heading>
									<Text size="ui" tone="muted">
										January–April 2026
									</Text>
								</div>
								<Metric>
									<MetricLabel>Active teams in April</MetricLabel>
									<MetricValue>
										{
											teamData
												.filter(({ series }) => series === "Active teams")
												.at(-1)?.value
										}
									</MetricValue>
									<MetricDescription>16 more than January</MetricDescription>
								</Metric>
							</div>
							<ChartLegend aria-label="Team series" items={legendItems} />
							<ChartFrame
								aria-description="Active and newly created teams from January through April."
								aria-label="Monthly team counts"
								definition={teamChart}
								height={264}
								initialWidth={720}
								renderTooltipBody={renderTeamTooltip}
								tabIndex={0}
							/>
						</Stack>
					</CardPanel>
				</Card>
			</div>
		</Section>
	);
}
