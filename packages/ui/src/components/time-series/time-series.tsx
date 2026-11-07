"use client";

import { props } from "@stylexjs/stylex";
import { areaY, defineChart, dot, lineY } from "@tanstack/charts";
import { decorative } from "@tanstack/charts/mark/decorative";
import type { ChartTooltipBodyRenderContext } from "@tanstack/charts/react/tooltip";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { tooltip as tooltipFeature } from "@tanstack/charts/tooltip";
import { scaleUtc } from "d3-scale";
import type { ComponentPropsWithRef } from "react";
import { useId, useMemo } from "react";
import type { Closed } from "../../closed";
import { typeRoles } from "../../styles/typography.styles";
import { type ChartSeriesTone, chartColors } from "../chart-frame/chart-colors";
import { pillTickLabels, timeCrosshair } from "../chart-frame/chart-crosshair";
import { ChartFrame } from "../chart-frame/chart-frame";
import {
	ChartLoading,
	type ChartStatus,
	chartRevealStyles,
	useLoadingReveal,
} from "../chart-frame/chart-loading";
import { ChartLegend } from "../chart-legend/chart-legend";
import { ChartTooltip } from "../chart-tooltip/chart-tooltip";
import {
	AXIS_TICK_MIN_GAP,
	formatNumber,
	getTickCount,
	makeAxisFormatter,
	makeDateFormatter,
	preparePoints,
	SMOOTH,
	type TimeSeriesDatum,
	type TimeSeriesPoint,
} from "./time-format";
import { timeSeriesStyles } from "./time-series.styles";

export type { TimeSeriesPoint } from "./time-format";

export type TimeSeriesPresentation = "chart" | "sparkline";

/** A second series, such as last year, drawn dashed in the muted tone. */
export interface TimeSeriesComparison {
	label: string;
	points: readonly TimeSeriesPoint[];
}

export type TimeSeriesProps = Omit<
	Closed<ComponentPropsWithRef<"div">>,
	"aria-label" | "children" | "data-slot" | "role"
> & {
	"aria-description"?: string;
	"aria-label": string;
	comparison?: TimeSeriesComparison;
	formatAxisValue?: (value: number) => string;
	formatValue?: (value: number) => string;
	/** Shows the series legend below the chart. Turn it off when a card header shows it. */
	legend?: boolean;
	locale?: string;
	points: readonly TimeSeriesPoint[];
	presentation?: TimeSeriesPresentation;
	seriesLabel: string;
	/** "loading" holds the chart's space with a placeholder; data that replaces it wipes in. */
	status?: ChartStatus;
	timeZone: string;
	tone?: ChartSeriesTone;
};

interface PreparedComparison {
	label: string;
	points: readonly TimeSeriesDatum[];
}

interface TimeSeriesPlotProps {
	"aria-description"?: string;
	"aria-label": string;
	comparison?: PreparedComparison;
	formatAxisValue?: (value: number) => string;
	formatValue?: (value: number) => string;
	legend: boolean;
	locale: string;
	points: readonly TimeSeriesDatum[];
	presentation: TimeSeriesPresentation;
	reveal: boolean;
	seriesLabel: string;
	timeZone: string;
	tone: ChartSeriesTone;
}

function assertLabels(seriesLabel: string, ariaLabel: string) {
	if (
		typeof seriesLabel !== "string" ||
		typeof ariaLabel !== "string" ||
		!seriesLabel.trim() ||
		!ariaLabel.trim()
	) {
		throw new TypeError(
			"TimeSeries requires non-empty seriesLabel and aria-label values."
		);
	}
}

function assertOptions(
	presentation: TimeSeriesPresentation,
	formatValue: ((value: number) => string) | undefined,
	formatAxisValue: ((value: number) => string) | undefined,
	tone: ChartSeriesTone,
	timeZone: string
) {
	if (presentation !== "chart" && presentation !== "sparkline") {
		throw new RangeError(
			"TimeSeries presentation must be 'chart' or 'sparkline'."
		);
	}
	if (
		(formatValue !== undefined && typeof formatValue !== "function") ||
		(formatAxisValue !== undefined && typeof formatAxisValue !== "function")
	) {
		throw new TypeError("TimeSeries formatters must be functions.");
	}
	if (!Object.hasOwn(chartColors, tone)) {
		throw new RangeError(
			"TimeSeries tone is not a supported chart series tone."
		);
	}
	if (typeof timeZone !== "string" || !timeZone.trim()) {
		throw new TypeError("TimeSeries requires a non-empty timeZone.");
	}
}

interface TimeSeriesRow {
	id: string;
	time: number;
	value: number | null;
	x: Date;
}

// Points between two gaps have no line segment, so they keep a visible dot.
function getIsolatedRows(rows: readonly TimeSeriesRow[]): TimeSeriesRow[] {
	return rows.filter(
		(row, index) =>
			row.value !== null &&
			(rows[index - 1]?.value ?? null) === null &&
			(rows[index + 1]?.value ?? null) === null
	);
}

function toRows(points: readonly TimeSeriesDatum[]): TimeSeriesRow[] {
	return points.map(({ time, x, value }) => ({
		id: String(time),
		time,
		value,
		x,
	}));
}

// The comparison is decorative: it shapes the scale but adds no focus targets.
function getComparisonMarks(comparison: PreparedComparison | undefined) {
	if (!comparison) {
		return [];
	}
	return [
		decorative(
			lineY(toRows(comparison.points), {
				curve: SMOOTH,
				id: "time-series-comparison",
				key: (datum) => datum.id,
				stroke: chartColors.muted,
				strokeDasharray: "4 4",
				x: "x",
				y: "value",
			})
		),
	];
}

function getLegendItems(
	seriesLabel: string,
	tone: ChartSeriesTone,
	comparison: PreparedComparison | undefined
) {
	const items = [{ id: "time-series", label: seriesLabel, tone }];
	return comparison
		? [
				...items,
				{
					id: "time-series-comparison",
					label: comparison.label,
					tone: "muted" as const,
				},
			]
		: items;
}

function renderTooltip(
	context: ChartTooltipBodyRenderContext<TimeSeriesDatum, Date, number>,
	seriesLabel: string,
	tone: ChartSeriesTone,
	dateFormatter: Intl.DateTimeFormat,
	formatValue: (value: number) => string
) {
	const point = context.points.find(({ datum }) => datum.value !== null);
	if (!point) {
		return null;
	}
	return (
		<ChartTooltip
			items={[
				{
					id: "time-series-value",
					label: seriesLabel,
					tone,
					value: formatValue(point.yValue),
				},
			]}
			label={dateFormatter.format(point.xValue)}
		/>
	);
}

function plotHeight(presentation: TimeSeriesPresentation) {
	return presentation === "sparkline" ? 64 : 200;
}

function TimeSeriesLegend({
	comparison,
	legend,
	presentation,
	seriesLabel,
	tone,
}: Pick<
	TimeSeriesPlotProps,
	"comparison" | "legend" | "presentation" | "seriesLabel" | "tone"
>) {
	return legend && presentation === "chart" ? (
		<div data-slot="time-series-legend" {...props(timeSeriesStyles.legend)}>
			<ChartLegend
				aria-label={`${seriesLabel} series`}
				items={getLegendItems(seriesLabel, tone, comparison)}
			/>
		</div>
	) : null;
}

// Loading holds the plot's space and keeps the legend, so data arrives in place.
function TimeSeriesContent({
	plot,
	status,
}: {
	plot: TimeSeriesPlotProps;
	status: ChartStatus;
}) {
	if (status === "loading") {
		return (
			<>
				<ChartLoading
					grid={plot.presentation === "chart"}
					height={plotHeight(plot.presentation)}
				/>
				<TimeSeriesLegend {...plot} />
			</>
		);
	}
	return plot.points.some(({ value }) => value !== null) ? (
		<TimeSeriesPlot {...plot} />
	) : (
		<p role="status" {...props(typeRoles.body, timeSeriesStyles.empty)}>
			No observations available.
		</p>
	);
}

function TimeSeriesPlot({
	"aria-description": ariaDescription,
	"aria-label": ariaLabel,
	comparison,
	legend,
	formatAxisValue,
	formatValue,
	locale,
	points,
	presentation,
	reveal,
	seriesLabel,
	timeZone,
	tone,
}: TimeSeriesPlotProps) {
	const numberFormatter = useMemo(
		() => new Intl.NumberFormat(locale),
		[locale]
	);
	// Axis ticks default to compact numbers ("13.5K"); tooltips stay exact.
	const axisNumberFormatter = useMemo(
		() =>
			new Intl.NumberFormat(locale, {
				maximumFractionDigits: 1,
				notation: "compact",
			}),
		[locale]
	);
	const dateFormatter = useMemo(
		() => makeDateFormatter(locale, timeZone, points),
		[locale, points, timeZone]
	);
	const axisFormatter = useMemo(
		() => makeAxisFormatter(locale, timeZone, points),
		[locale, points, timeZone]
	);
	const valueFormatter = useMemo(
		() => (value: number) => formatNumber(value, formatValue, numberFormatter),
		[formatValue, numberFormatter]
	);
	// Gradient IDs must stay unique when several charts share a page.
	const idPrefix = useId().replace(/[^\w-]/g, "");
	const definition = useMemo(() => {
		const rows = toRows(points);
		return defineChart(
			{
				// The area fills to zero; clipping ends it at the plot's bottom edge.
				clip: true,
				gradients: [
					{
						id: "time-series-area",
						stops: [
							{ color: chartColors[tone], offset: 0, opacity: 0.02 },
							{ color: chartColors[tone], offset: 1, opacity: 0.32 },
						],
					},
				],
				guides: presentation === "sparkline" ? false : undefined,
				marks: [
					// Decorative marks paint without owning focus or tooltip points.
					decorative(
						areaY(rows, {
							curve: SMOOTH,
							fill: "url(#time-series-area)",
							fillOpacity: 1,
							id: "time-series-area",
							key: (datum) => datum.id,
							x: "x",
							y: "value",
						})
					),
					...getComparisonMarks(comparison),
					...(presentation === "chart"
						? [timeCrosshair((date) => axisFormatter.format(date))]
						: []),
					// Hover and focus mark the active point; resting points stay quiet.
					lineY(rows, {
						curve: SMOOTH,
						id: "time-series-line",
						key: (datum) => datum.id,
						stroke: chartColors[tone],
						x: "x",
						y: "value",
					}),
					decorative(
						dot(getIsolatedRows(rows), {
							fill: chartColors[tone],
							id: "time-series-isolated",
							key: (datum) => datum.id,
							r: 2.5,
							x: "x",
							y: "value",
						})
					),
				],
				scales: {
					x: {
						axis: {
							tickLabels: {
								...pillTickLabels,
								thin: { minGap: AXIS_TICK_MIN_GAP },
							},
							ticks: {
								count: getTickCount(points),
								format: (date: Date) => axisFormatter.format(date),
							},
						},
						// The time domain ends at the data; nicing would pad empty time.
						nice: false,
						scale: scaleUtc,
					},
					y: {
						axis: {
							ticks: {
								count: 4,
								format: (value: number) =>
									formatNumber(
										value,
										formatAxisValue ?? formatValue,
										axisNumberFormatter,
										formatAxisValue ? "formatAxisValue" : "formatValue"
									),
							},
						},
						grid: true,
						nice: true,
						scale: scaleLinear,
					},
				},
			},
			{ tooltip: tooltipFeature }
		);
	}, [
		axisFormatter,
		axisNumberFormatter,
		comparison,
		formatAxisValue,
		formatValue,
		points,
		presentation,
		tone,
	]);
	const renderTooltipBody = useMemo(
		() =>
			(context: ChartTooltipBodyRenderContext<TimeSeriesDatum, Date, number>) =>
				renderTooltip(
					context,
					seriesLabel,
					tone,
					dateFormatter,
					valueFormatter
				),
		[dateFormatter, seriesLabel, tone, valueFormatter]
	);

	return (
		<div data-slot="time-series-chart">
			<div {...props(reveal && chartRevealStyles.reveal)}>
				<ChartFrame
					aria-description={ariaDescription}
					aria-label={ariaLabel}
					definition={definition}
					height={plotHeight(presentation)}
					idPrefix={idPrefix}
					initialWidth={presentation === "sparkline" ? 256 : undefined}
					renderTooltipBody={renderTooltipBody}
					tabIndex={0}
				/>
			</div>
			<TimeSeriesLegend
				comparison={comparison}
				legend={legend}
				presentation={presentation}
				seriesLabel={seriesLabel}
				tone={tone}
			/>
		</div>
	);
}

export function TimeSeries({
	"aria-description": ariaDescription,
	"aria-label": ariaLabel,
	comparison,
	legend = true,
	formatAxisValue,
	formatValue,
	locale = "en-US",
	points,
	presentation = "chart",
	ref: forwardedRef,
	seriesLabel,
	status = "ready",
	timeZone,
	tone = "series1",
	...rest
}: TimeSeriesProps) {
	const reveal = useLoadingReveal(status);
	assertLabels(seriesLabel, ariaLabel);
	assertOptions(presentation, formatValue, formatAxisValue, tone, timeZone);
	makeDateFormatter(locale, timeZone);
	const sortedPoints = preparePoints(points);
	const preparedComparison = comparison && {
		label: comparison.label,
		points: preparePoints(comparison.points),
	};
	for (const name of [
		"aria-label",
		"children",
		"className",
		"data-slot",
		"role",
		"style",
	]) {
		Reflect.deleteProperty(rest, name);
	}

	return (
		<div
			{...rest}
			aria-busy={status === "loading" || undefined}
			data-slot="time-series"
			ref={forwardedRef}
			{...props(
				timeSeriesStyles.root,
				presentation === "sparkline" && timeSeriesStyles.sparkline
			)}
		>
			<TimeSeriesContent
				plot={{
					"aria-description": ariaDescription,
					"aria-label": ariaLabel,
					comparison: preparedComparison,
					formatAxisValue,
					formatValue,
					legend,
					locale,
					points: sortedPoints,
					presentation,
					reveal,
					seriesLabel,
					timeZone,
					tone,
				}}
				status={status}
			/>
		</div>
	);
}
