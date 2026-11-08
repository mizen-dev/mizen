"use client";

import { props } from "@stylexjs/stylex";
import { areaY, defineChart, lineY, stackRowsY } from "@tanstack/charts";
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
} from "../time-series/time-format";
import { areaChartStyles } from "./area-chart.styles";

/** stacked reads as volume, overlap compares series, percent shows share. */
export type AreaChartLayout = "overlap" | "percent" | "stacked";

export interface AreaChartSeries {
	id: string;
	label: string;
	points: readonly TimeSeriesPoint[];
	/** Defaults to the series' position in the fixed palette order. */
	tone?: ChartSeriesTone;
}

export type AreaChartProps = Omit<
	Closed<ComponentPropsWithRef<"div">>,
	"aria-label" | "children" | "data-slot" | "role"
> & {
	"aria-description"?: string;
	"aria-label": string;
	formatAxisValue?: (value: number) => string;
	formatValue?: (value: number) => string;
	layout?: AreaChartLayout;
	/** Shows the series legend below the chart. Turn it off when a card header shows it. */
	legend?: boolean;
	locale?: string;
	series: readonly AreaChartSeries[];
	/** "loading" holds the chart's space with a placeholder; data that replaces it wipes in. */
	status?: ChartStatus;
	timeZone: string;
};

interface PreparedSeries {
	id: string;
	label: string;
	points: readonly TimeSeriesDatum[];
	tone: ChartSeriesTone;
}

interface AreaChartRow {
	id: string;
	series: string;
	share: number;
	time: number;
	value: number | null;
	x: Date;
	y1: number | null;
	y2: number | null;
}

const NAME = "AreaChart";
const PLOT_HEIGHT = 200;
const LAYOUTS = new Set<AreaChartLayout>(["overlap", "percent", "stacked"]);
// Six fixed palette slots; a seventh series is never a generated hue.
const TONES = [
	"series1",
	"series2",
	"series3",
	"series4",
	"series5",
	"series6",
] as const satisfies readonly ChartSeriesTone[];

function assertSeriesShape(entry: AreaChartSeries, ids: Set<string>) {
	if (
		typeof entry.id !== "string" ||
		!entry.id.trim() ||
		typeof entry.label !== "string" ||
		!entry.label.trim()
	) {
		throw new TypeError(`${NAME} series require non-empty ids and labels.`);
	}
	if (ids.has(entry.id)) {
		throw new RangeError(`${NAME} series ids must be unique.`);
	}
	if (entry.tone !== undefined && !Object.hasOwn(chartColors, entry.tone)) {
		throw new RangeError(`${NAME} tone is not a supported chart series tone.`);
	}
	ids.add(entry.id);
}

// Stacking adds values per time, so every series needs a value at every time.
function assertStackable(series: readonly PreparedSeries[]) {
	const times = series[0]?.points.map(({ time }) => time).join() ?? "";
	for (const { points } of series) {
		if (points.map(({ time }) => time).join() !== times) {
			throw new RangeError(
				`${NAME} stacked and percent layouts need the same times in every series.`
			);
		}
		if (points.some(({ value }) => value === null)) {
			throw new RangeError(
				`${NAME} stacked and percent layouts need a value at every time.`
			);
		}
	}
}

function prepareSeries(
	series: readonly AreaChartSeries[],
	layout: AreaChartLayout
): PreparedSeries[] {
	if (!Array.isArray(series)) {
		throw new TypeError(`${NAME} series must be an array.`);
	}
	if (series.length > TONES.length) {
		throw new RangeError(
			`${NAME} supports up to ${TONES.length} series; group the rest as "Other".`
		);
	}
	const ids = new Set<string>();
	const prepared = series.map((entry, index) => {
		assertSeriesShape(entry, ids);
		return {
			id: entry.id,
			label: entry.label,
			points: preparePoints(entry.points, NAME),
			tone: entry.tone ?? TONES[index],
		};
	});
	// With no values at all the chart shows its empty status instead.
	const hasValue = prepared.some(({ points }) =>
		points.some(({ value }) => value !== null)
	);
	if (layout !== "overlap" && hasValue) {
		assertStackable(prepared);
	}
	return prepared;
}

function assertOptions(
	ariaLabel: string,
	layout: AreaChartLayout,
	timeZone: string,
	formatters: readonly unknown[]
) {
	if (typeof ariaLabel !== "string" || !ariaLabel.trim()) {
		throw new TypeError(`${NAME} requires a non-empty aria-label.`);
	}
	if (!LAYOUTS.has(layout)) {
		throw new RangeError(
			`${NAME} layout must be 'stacked', 'overlap', or 'percent'.`
		);
	}
	if (typeof timeZone !== "string" || !timeZone.trim()) {
		throw new TypeError(`${NAME} requires a non-empty timeZone.`);
	}
	if (
		formatters.some(
			(format) => format !== undefined && typeof format !== "function"
		)
	) {
		throw new TypeError(`${NAME} formatters must be functions.`);
	}
}

function toRows(series: readonly PreparedSeries[]) {
	return series.flatMap(({ id, points }) =>
		points.map(({ time, value, x }) => ({
			id: `${id}:${time}`,
			series: id,
			time,
			value,
			x,
		}))
	);
}

// Overlapping areas fill from zero; stacked ones fill between neighbors, and
// percent stacks normalize each time to a 0–1 share.
function layoutRows(
	series: readonly PreparedSeries[],
	layout: AreaChartLayout
): AreaChartRow[] {
	const rows = toRows(series);
	const totals = new Map<number, number>();
	for (const { time, value } of rows) {
		totals.set(time, (totals.get(time) ?? 0) + (value ?? 0));
	}
	const withShare = rows.map((row) => ({
		...row,
		share: (row.value ?? 0) / (totals.get(row.time) || 1),
	}));
	if (layout === "overlap") {
		return withShare.map((row) => ({ ...row, y1: 0, y2: row.value }));
	}
	return stackRowsY(withShare, {
		offset: layout === "percent" ? "normalize" : undefined,
		order: series.map(({ id }) => id),
		x: "time",
		y: "value",
		z: "series",
	}).map((row) => ({
		id: row.id,
		series: row.series,
		share: row.share,
		time: row.time,
		value: row.value,
		// Stacking keys positions by the numeric time; the axis needs a Date.
		x: new Date(row.time),
		y1: row.y1,
		y2: row.y2,
	}));
}

function gradientId(id: string) {
	return `area-chart-${id.replace(/[^\w-]/gu, "_")}`;
}

function getMarks(series: readonly PreparedSeries[], rows: AreaChartRow[]) {
	const bySeries = (id: string) => rows.filter((row) => row.series === id);
	// Areas paint first so every line stays on top.
	const areas = series.map(({ id }) =>
		decorative(
			areaY(bySeries(id), {
				curve: SMOOTH,
				fill: `url(#${gradientId(id)})`,
				fillOpacity: 1,
				id: `area-chart-area-${id}`,
				key: (row) => row.id,
				x: "x",
				y1: "y1",
				y2: "y2",
			})
		)
	);
	const lines = series.map(({ id, tone }) =>
		lineY(bySeries(id), {
			curve: SMOOTH,
			id: `area-chart-line-${id}`,
			key: (row) => row.id,
			stroke: chartColors[tone],
			x: "x",
			y: "y2",
			// Focus groups points by z, so one tooltip lists every series.
			z: "series",
		})
	);
	return [...areas, ...lines];
}

function renderTooltip(
	context: ChartTooltipBodyRenderContext<AreaChartRow, Date, number>,
	series: readonly PreparedSeries[],
	layout: AreaChartLayout,
	dateFormatter: Intl.DateTimeFormat,
	format: (value: number) => string,
	formatShare: (value: number) => string
) {
	const first = context.primaryPoint ?? context.points[0];
	if (!first) {
		return null;
	}
	const rows = new Map(
		context.points.map(({ datum }) => [datum.series, datum])
	);
	const items = series.flatMap(({ id, label, tone }) => {
		const row = rows.get(id);
		if (!row || row.value === null) {
			return [];
		}
		const value = format(row.value);
		return [
			{
				id,
				label,
				tone,
				value:
					layout === "percent" ? `${value} · ${formatShare(row.share)}` : value,
			},
		];
	});
	return (
		<ChartTooltip
			items={items.reverse()}
			label={dateFormatter.format(first.datum.x)}
		/>
	);
}

interface AreaChartPlotProps {
	"aria-description"?: string;
	"aria-label": string;
	formatAxisValue?: (value: number) => string;
	formatValue?: (value: number) => string;
	layout: AreaChartLayout;
	legend: boolean;
	locale: string;
	series: readonly PreparedSeries[];
	timeZone: string;
}

function AreaChartLegend({
	"aria-label": ariaLabel,
	series,
}: {
	"aria-label": string;
	series: readonly PreparedSeries[];
}) {
	return (
		<div data-slot="area-chart-legend" {...props(areaChartStyles.legend)}>
			<ChartLegend
				aria-label={`${ariaLabel} series`}
				items={series.map(({ id, label, tone }) => ({ id, label, tone }))}
			/>
		</div>
	);
}

function AreaChartPlot({
	"aria-description": ariaDescription,
	"aria-label": ariaLabel,
	formatAxisValue,
	formatValue,
	layout,
	legend,
	locale,
	reveal,
	series,
	timeZone,
}: AreaChartPlotProps & { reveal: boolean }) {
	const times = series[0].points;
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
	const shareFormatter = useMemo(
		() =>
			new Intl.NumberFormat(locale, {
				maximumFractionDigits: 0,
				style: "percent",
			}),
		[locale]
	);
	const dateFormatter = useMemo(
		() => makeDateFormatter(locale, timeZone, times),
		[locale, times, timeZone]
	);
	const axisFormatter = useMemo(
		() => makeAxisFormatter(locale, timeZone, times),
		[locale, times, timeZone]
	);
	const format = useMemo(
		() => (value: number) =>
			formatNumber(value, formatValue, numberFormatter, "formatValue", NAME),
		[formatValue, numberFormatter]
	);
	const idPrefix = useId().replace(/[^\w-]/gu, "");
	const definition = useMemo(() => {
		const formatAxis = (value: number) =>
			layout === "percent"
				? shareFormatter.format(value)
				: formatNumber(
						value,
						formatAxisValue ?? formatValue,
						axisNumberFormatter,
						formatAxisValue ? "formatAxisValue" : "formatValue",
						NAME
					);
		return defineChart(
			{
				clip: true,
				gradients: series.map(({ id, tone }) => ({
					id: gradientId(id),
					stops: [
						{ color: chartColors[tone], offset: 0, opacity: 0.02 },
						{ color: chartColors[tone], offset: 1, opacity: 0.32 },
					],
				})),
				marks: [
					timeCrosshair((date) => axisFormatter.format(date)),
					...getMarks(series, layoutRows(series, layout)),
				],
				scales: {
					x: {
						axis: {
							tickLabels: {
								...pillTickLabels,
								thin: { minGap: AXIS_TICK_MIN_GAP },
							},
							ticks: {
								count: getTickCount(times),
								format: (date: Date) => axisFormatter.format(date),
							},
						},
						nice: false,
						scale: scaleUtc,
					},
					y: {
						axis: { ticks: { count: 4, format: formatAxis } },
						grid: true,
						nice: layout !== "percent",
						scale:
							layout === "percent" ? scaleLinear().domain([0, 1]) : scaleLinear,
					},
				},
			},
			{ focus: "group-x", tooltip: tooltipFeature }
		);
	}, [
		axisFormatter,
		axisNumberFormatter,
		formatAxisValue,
		formatValue,
		layout,
		series,
		shareFormatter,
		times,
	]);
	const renderTooltipBody = useMemo(
		() =>
			(context: ChartTooltipBodyRenderContext<AreaChartRow, Date, number>) =>
				renderTooltip(context, series, layout, dateFormatter, format, (value) =>
					shareFormatter.format(value)
				),
		[dateFormatter, format, layout, series, shareFormatter]
	);

	return (
		<div data-slot="area-chart-plot">
			<div {...props(reveal && chartRevealStyles.reveal)}>
				<ChartFrame
					aria-description={ariaDescription}
					aria-label={ariaLabel}
					definition={definition}
					height={PLOT_HEIGHT}
					idPrefix={idPrefix}
					renderTooltipBody={renderTooltipBody}
					tabIndex={0}
				/>
			</div>
			{legend ? (
				<AreaChartLegend aria-label={ariaLabel} series={series} />
			) : null}
		</div>
	);
}

function AreaChartContent({
	plot,
	status,
}: {
	plot: AreaChartPlotProps & { reveal: boolean };
	status: ChartStatus;
}) {
	if (status === "loading") {
		return (
			<>
				<ChartLoading height={PLOT_HEIGHT} />
				{plot.legend ? (
					<AreaChartLegend
						aria-label={plot["aria-label"]}
						series={plot.series}
					/>
				) : null}
			</>
		);
	}
	const hasValue = plot.series.some(({ points }) =>
		points.some(({ value }) => value !== null)
	);
	return hasValue ? (
		<AreaChartPlot {...plot} />
	) : (
		<p role="status" {...props(typeRoles.body, areaChartStyles.empty)}>
			No observations available.
		</p>
	);
}

export function AreaChart({
	"aria-description": ariaDescription,
	"aria-label": ariaLabel,
	formatAxisValue,
	formatValue,
	layout = "stacked",
	legend = true,
	locale = "en-US",
	ref: forwardedRef,
	series: inputSeries,
	status = "ready",
	timeZone,
	...rest
}: AreaChartProps) {
	const reveal = useLoadingReveal(status);
	assertOptions(ariaLabel, layout, timeZone, [formatValue, formatAxisValue]);
	makeDateFormatter(locale, timeZone);
	const series = useMemo(
		() => prepareSeries(inputSeries, layout),
		[inputSeries, layout]
	);
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
			data-slot="area-chart"
			ref={forwardedRef}
			{...props(areaChartStyles.root)}
		>
			<AreaChartContent
				plot={{
					"aria-description": ariaDescription,
					"aria-label": ariaLabel,
					formatAxisValue,
					formatValue,
					layout,
					legend,
					locale,
					reveal,
					series,
					timeZone,
				}}
				status={status}
			/>
		</div>
	);
}
