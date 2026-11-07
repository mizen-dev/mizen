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
	palette,
	Section,
	Stack,
	Text,
} from "@mizen/ui";
import { colors } from "@mizen/ui/colors.stylex";
import { conditions } from "@mizen/ui/conditions.stylex";
import { fonts } from "@mizen/ui/fonts.stylex";
import {
	Metric,
	MetricDescription,
	MetricLabel,
	MetricValue,
} from "@mizen/ui/metric";
import { shape } from "@mizen/ui/shape.stylex";
import { space } from "@mizen/ui/spacing.stylex";
import { fontSize } from "@mizen/ui/typography.stylex";
import { create, props } from "@stylexjs/stylex";
import { areaY, barY, defineChart, group, lineY } from "@tanstack/charts";
import type { ChartTooltipBodyRenderContext } from "@tanstack/charts/react/tooltip";
import { scaleBand } from "@tanstack/charts/scales/band";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { scaleOrdinal } from "@tanstack/charts/scales/ordinal";
import { scalePoint } from "@tanstack/charts/scales/point";
import { tooltip } from "@tanstack/charts/tooltip";
import { chartExampleStyles } from "./chart-composition.styles";

const specimenStyles = create({
	chartGrid: {
		display: "grid",
		gap: space["4"],
		gridTemplateColumns: {
			[conditions.md]: "repeat(3, minmax(0, 1fr))",
			default: "minmax(0, 1fr)",
		},
	},
	paletteGrid: {
		display: "grid",
		gap: space["3"],
		gridTemplateColumns: {
			[conditions.sm]: "repeat(2, minmax(0, 1fr))",
			default: "minmax(0, 1fr)",
		},
	},
	paletteLabel: { color: colors.content, fontSize: fontSize["14"] },
	paletteValue: {
		color: colors.mutedContent,
		display: "block",
		fontFamily: fonts.mono,
		fontSize: fontSize["14"],
		overflowWrap: "anywhere",
	},
	stepGrid: {
		display: "grid",
		gap: space["1"],
		gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
	},
	swatch: {
		blockSize: space["4"],
		borderRadius: shape.controlRadius,
		display: "block",
		inlineSize: "100%",
		overflow: "hidden",
	},
});

const paletteRows = [
	{ hue: "rose", steps: [300, 500, 700] },
	{ hue: "orange", steps: [300, 500, 700] },
	{ hue: "amber", steps: [300, 500, 700] },
	{ hue: "green", steps: [300, 500, 700] },
	{ hue: "teal", steps: [300, 500, 700] },
	{ hue: "blue", steps: [300, 500, 700] },
	{ hue: "violet", steps: [300, 500, 700] },
	{ hue: "pink", steps: [300, 500, 700] },
] as const;

const chartSeriesItems = [
	{ id: "series-1", label: "Series 1", tone: "series1" },
	{ id: "series-2", label: "Series 2", tone: "series2" },
	{ id: "series-3", label: "Series 3", tone: "series3" },
	{ id: "series-4", label: "Series 4", tone: "series4" },
	{ id: "series-5", label: "Series 5", tone: "series5" },
	{ id: "series-6", label: "Series 6", tone: "series6" },
] as const;

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

export function ChartFrameExamples() {
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

interface PaletteChartDatum {
	month: string;
	series: string;
	value: number;
}

const paletteChartData: readonly PaletteChartDatum[] = [
	{ month: "Jan", series: "This year", value: 38 },
	{ month: "Feb", series: "This year", value: 46 },
	{ month: "Mar", series: "This year", value: 52 },
	{ month: "Apr", series: "This year", value: 61 },
	{ month: "Jan", series: "Last year", value: 31 },
	{ month: "Feb", series: "Last year", value: 39 },
	{ month: "Mar", series: "Last year", value: 44 },
	{ month: "Apr", series: "Last year", value: 49 },
];

const paletteLineData: readonly PaletteChartDatum[] = [
	{ month: "Jan", series: "Active", value: 24 },
	{ month: "Feb", series: "Active", value: 31 },
	{ month: "Mar", series: "Active", value: 29 },
	{ month: "Apr", series: "Active", value: 39 },
	{ month: "Jan", series: "New", value: 12 },
	{ month: "Feb", series: "New", value: 18 },
	{ month: "Mar", series: "New", value: 16 },
	{ month: "Apr", series: "New", value: 23 },
];

const paletteAreaData: readonly PaletteChartDatum[] = [
	{ month: "Jan", series: "Growth", value: 22 },
	{ month: "Feb", series: "Growth", value: 28 },
	{ month: "Mar", series: "Growth", value: 26 },
	{ month: "Apr", series: "Growth", value: 36 },
	{ month: "May", series: "Growth", value: 42 },
];

const paletteSeriesTones: Record<string, ChartSeriesTone> = {
	Active: "series3",
	Growth: "series5",
	"Last year": "series2",
	New: "series4",
	"This year": "series1",
};

function renderPaletteTooltip({
	points,
}: ChartTooltipBodyRenderContext<PaletteChartDatum, string, number>) {
	if (points.length === 0) {
		return null;
	}
	return (
		<ChartTooltip
			items={points.map((point) => ({
				id: point.datum.series,
				label: point.datum.series,
				tone: paletteSeriesTones[point.datum.series],
				value: point.yValue.toLocaleString("en-US"),
			}))}
			label={points[0].xValue}
		/>
	);
}

const yearChart = defineChart({
	color: {
		scale: () =>
			scaleOrdinal<string, string>()
				.domain(["This year", "Last year"])
				.range([chartColors.series1, chartColors.series2]),
	},
	marks: [
		barY(paletteChartData, {
			layout: group({ padding: 0.2 }),
			radius: { end: 4 },
			x: "month",
			y: "value",
			z: "series",
		}),
	],
	scales: {
		x: {
			scale: () => scaleBand<string>().padding(0.2),
		},
		y: { grid: true, scale: scaleLinear },
	},
	tooltip,
});

const activityChart = defineChart({
	color: {
		scale: () =>
			scaleOrdinal<string, string>()
				.domain(["Active", "New"])
				.range([chartColors.series3, chartColors.series4]),
	},
	marks: [
		lineY(paletteLineData, {
			points: true,
			x: "month",
			y: "value",
			z: "series",
		}),
	],
	scales: {
		x: {
			scale: () => scalePoint<string>().padding(0.2),
		},
		y: { grid: true, scale: scaleLinear },
	},
	tooltip,
});

const growthChart = defineChart({
	marks: [
		areaY(paletteAreaData, {
			fill: chartColors.series5,
			fillOpacity: 0.12,
			stroke: chartColors.series5,
			strokeWidth: 2,
			x: "month",
			y: "value",
		}),
	],
	scales: {
		x: {
			scale: () => scalePoint<string>().padding(0.2),
		},
		y: { grid: true, scale: scaleLinear },
	},
	tooltip,
});

const chartExamples = [
	{
		ariaDescription:
			"This year and last year totals from January through April.",
		ariaLabel: "Year over year totals",
		definition: yearChart,
		heading: "Grouped bars",
		items: [
			{ id: "this-year", label: "This year", tone: "series1" },
			{ id: "last-year", label: "Last year", tone: "series2" },
		] as const,
		summary: {
			description: "12 more than last year",
			label: "April total",
			value: 61,
		},
	},
	{
		ariaDescription: "Active and new teams from January through April.",
		ariaLabel: "Team activity",
		definition: activityChart,
		heading: "Two-series line",
		items: [
			{ id: "active", label: "Active", tone: "series3" },
			{ id: "new", label: "New", tone: "series4" },
		] as const,
		summary: {
			description: "23 new teams in April",
			label: "April active teams",
			value: 39,
		},
	},
	{
		ariaDescription: "Monthly growth from January through May.",
		ariaLabel: "Monthly growth",
		definition: growthChart,
		heading: "Area",
		items: [{ id: "growth", label: "Growth", tone: "series5" }] as const,
		summary: {
			description: "Up from 22 in January",
			label: "May growth",
			value: 42,
		},
	},
] as const;

export function ChartPaletteExamples() {
	return (
		<Section
			aria-labelledby="chart-palette-heading"
			data-testid="chart-palette-example"
		>
			<Stack gap="3">
				<Heading id="chart-palette-heading" level={2} size="title">
					Chart colors
				</Heading>
				<Text>
					A reusable hue palette feeds theme-aware chart series. Compare its
					three steps, then see the series roles in common chart forms.
				</Text>
				<Heading level={3} size="heading">
					Core color swatches
				</Heading>
				<Text size="ui" tone="muted">
					OKLCH values list lightness, chroma, then hue.
				</Text>
				<div
					data-testid="chart-palette-grid"
					{...props(specimenStyles.paletteGrid)}
				>
					{paletteRows.map(({ hue, steps }) => (
						<div key={hue}>
							<Text size="ui" tone="muted">
								{hue}
							</Text>
							<div {...props(specimenStyles.stepGrid)}>
								{steps.map((step) => {
									const key = `${hue}${step}` as keyof typeof palette;
									return (
										<div key={key}>
											<svg
												aria-hidden="true"
												data-testid="chart-palette-swatch"
												focusable="false"
												preserveAspectRatio="none"
												viewBox="0 0 100 24"
												{...props(specimenStyles.swatch)}
											>
												<rect fill={palette[key]} height="24" width="100" />
											</svg>
											<span {...props(specimenStyles.paletteLabel)}>
												{step}
												<span {...props(specimenStyles.paletteValue)}>
													{palette[key].replace(/^oklch\(|\)$/g, "")}
												</span>
											</span>
										</div>
									);
								})}
							</div>
						</div>
					))}
				</div>
				<Heading level={3} size="heading">
					Theme-aware chart series
				</Heading>
				<ChartLegend
					aria-label="Theme-aware chart series"
					items={chartSeriesItems}
				/>
				<Card>
					<CardPanel>
						<div {...props(specimenStyles.chartGrid)}>
							{chartExamples.map(
								({
									ariaDescription,
									ariaLabel,
									definition,
									heading,
									summary,
									items,
								}) => (
									<Stack gap="2" key={ariaLabel}>
										<Heading level={3} size="heading">
											{heading}
										</Heading>
										<Metric>
											<MetricLabel>{summary.label}</MetricLabel>
											<MetricValue>{summary.value}</MetricValue>
											<MetricDescription>
												{summary.description}
											</MetricDescription>
										</Metric>
										<ChartLegend
											aria-label={`${heading} series`}
											items={items}
										/>
										<ChartFrame
											aria-description={ariaDescription}
											aria-label={ariaLabel}
											definition={definition}
											height={190}
											initialWidth={300}
											renderTooltipBody={renderPaletteTooltip}
											tabIndex={0}
										/>
									</Stack>
								)
							)}
						</div>
					</CardPanel>
				</Card>
			</Stack>
		</Section>
	);
}
