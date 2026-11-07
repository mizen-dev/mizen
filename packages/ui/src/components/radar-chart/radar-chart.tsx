"use client";

import { create, props } from "@stylexjs/stylex";
import { defineChart } from "@tanstack/charts";
import {
	angleGrid,
	focusGroupAngle,
	polar,
	radialArea,
	radialGrid,
	radialLine,
} from "@tanstack/charts/polar";
import type { ChartTooltipBodyRenderContext } from "@tanstack/charts/react/tooltip";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { scalePoint } from "@tanstack/charts/scales/point";
import { tooltip as tooltipFeature } from "@tanstack/charts/tooltip";
import { curveLinearClosed } from "d3-shape";
import type { ComponentPropsWithRef } from "react";
import { useMemo } from "react";
import type { Closed } from "../../closed";
import { colors } from "../../styles/colors.stylex";
import { space } from "../../styles/spacing.stylex";
import { assertIdentity, assertNonNegative } from "../chart-frame/chart-assert";
import { chartColors } from "../chart-frame/chart-colors";
import { ChartFrame } from "../chart-frame/chart-frame";
import { ChartLegend } from "../chart-legend/chart-legend";
import { ChartTooltip } from "../chart-tooltip/chart-tooltip";

export interface RadarChartAxis {
	id: string;
	label: string;
}

export interface RadarChartSeries {
	id: string;
	label: string;
	/** One value per axis, in axis order. */
	values: readonly number[];
}

export type RadarChartProps = Omit<
	Closed<ComponentPropsWithRef<"div">>,
	"aria-label" | "children" | "data-slot" | "role"
> & {
	"aria-description"?: string;
	"aria-label": string;
	/** Three to eight axes, clockwise from the top. */
	axes: readonly RadarChartAxis[];
	formatValue?: (value: number) => string;
	/** Shows the series legend below the chart. Turn it off when a card header shows it. */
	legend?: boolean;
	locale?: string;
	/** The value at the outer ring. Defaults to the largest value. */
	max?: number;
	/** Up to three series; any two can overlap, so only three hues stay distinct. */
	series: readonly RadarChartSeries[];
};

interface RadarRow {
	axis: string;
	id: string;
	series: string;
	value: number;
}

const NAME = "RadarChart";
const TONES = ["series1", "series2", "series3"] as const;
const RINGS = [0.25, 0.5, 0.75, 1];

const styles = create({
	legend: { marginBlockStart: space["2"] },
	root: { minWidth: 0 },
});

function seriesRows(
	entry: RadarChartSeries,
	axes: readonly RadarChartAxis[]
): RadarRow[] {
	const values: readonly number[] = entry.values;
	if (!Array.isArray(values) || values.length !== axes.length) {
		throw new RangeError(`${NAME} series need one value per axis.`);
	}
	return values.map((value, index) => {
		assertNonNegative(NAME, value);
		const axis = axes[index].id;
		return { axis, id: `${entry.id}:${axis}`, series: entry.id, value };
	});
}

function prepare(
	axes: readonly RadarChartAxis[],
	series: readonly RadarChartSeries[]
) {
	if (!Array.isArray(axes) || axes.length < 3 || axes.length > 8) {
		throw new RangeError(`${NAME} needs three to eight axes.`);
	}
	if (!Array.isArray(series) || series.length === 0 || series.length > 3) {
		throw new RangeError(`${NAME} needs one to three series.`);
	}
	const axisIds = new Set<string>();
	for (const axis of axes) {
		assertIdentity(NAME, axis, axisIds);
	}
	const seriesIds = new Set<string>();
	return series.flatMap((entry) => {
		assertIdentity(NAME, entry, seriesIds);
		return seriesRows(entry, axes);
	});
}

function renderTooltip(
	context: ChartTooltipBodyRenderContext<RadarRow, string, number>,
	axes: readonly RadarChartAxis[],
	series: readonly RadarChartSeries[],
	format: (value: number) => string
) {
	const point = context.primaryPoint ?? context.points[0];
	if (!point) {
		return null;
	}
	const values = new Map(
		context.points.map(({ datum }) => [datum.series, datum.value])
	);
	return (
		<ChartTooltip
			items={series.flatMap(({ id, label }, index) =>
				values.has(id)
					? [
							{
								id,
								label,
								tone: TONES[index],
								value: format(values.get(id) ?? 0),
							},
						]
					: []
			)}
			label={axes.find(({ id }) => id === point.datum.axis)?.label}
		/>
	);
}

function assertOptions(ariaLabel: string, max: number | undefined) {
	if (typeof ariaLabel !== "string" || !ariaLabel.trim()) {
		throw new TypeError(`${NAME} requires a non-empty aria-label.`);
	}
	if (max !== undefined && !(Number.isFinite(max) && max > 0)) {
		throw new RangeError(`${NAME} max must be positive.`);
	}
}

/** Up to three profiles across three to eight measures on one scale. */
export function RadarChart({
	"aria-description": ariaDescription,
	"aria-label": ariaLabel,
	axes,
	formatValue,
	legend = true,
	locale = "en-US",
	max,
	ref: forwardedRef,
	series,
	...rest
}: RadarChartProps) {
	assertOptions(ariaLabel, max);
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
	const rows = useMemo(() => prepare(axes, series), [axes, series]);
	const format = useMemo(
		() => formatValue ?? new Intl.NumberFormat(locale).format,
		[formatValue, locale]
	);
	const outer = max ?? Math.max(1, ...rows.map(({ value }) => value));
	const definition = useMemo(() => {
		const labels = new Map(axes.map(({ id, label }) => [id, label]));
		const tones = new Map(series.map(({ id }, index) => [id, TONES[index]]));
		const toneOf = (row: RadarRow) =>
			chartColors[tones.get(row.series) ?? "series1"];
		const marks = series.flatMap(({ id }) => {
			const own = rows.filter((row) => row.series === id);
			return [
				radialArea(own, {
					angle: "axis",
					curve: curveLinearClosed,
					fill: toneOf,
					fillOpacity: 0.16,
					id: `radar-area-${id}`,
					key: "id",
					radius: "value",
				}),
				radialLine(own, {
					angle: "axis",
					curve: curveLinearClosed,
					id: `radar-line-${id}`,
					key: "id",
					points: true,
					radius: "value",
					stroke: toneOf,
					strokeWidth: 2,
					z: "series",
				}),
			];
		});
		return defineChart(
			{
				marks: [
					polar({
						guides: [
							radialGrid({
								shape: "polygon",
								stroke: colors.border,
								strokeOpacity: 1,
								values: RINGS.map((ring) => ring * outer),
							}),
							angleGrid({
								format: (axis) => labels.get(String(axis)) ?? String(axis),
								labels: true,
								stroke: colors.border,
								strokeOpacity: 1,
							}),
						],
						marks,
						radiusRatio: 0.72,
						scales: {
							angle: {
								scale: scalePoint<string>().domain(axes.map(({ id }) => id)),
								wrap: true,
							},
							radius: { scale: scaleLinear().domain([0, outer]) },
						},
					}),
				],
				scales: { x: null, y: null },
			},
			{ focus: focusGroupAngle, tooltip: tooltipFeature }
		);
	}, [axes, outer, rows, series]);
	const renderTooltipBody = useMemo(
		() => (context: ChartTooltipBodyRenderContext<RadarRow, string, number>) =>
			renderTooltip(context, axes, series, format),
		[axes, format, series]
	);

	return (
		<div
			{...rest}
			data-slot="radar-chart"
			ref={forwardedRef}
			{...props(styles.root)}
		>
			<ChartFrame
				aria-description={ariaDescription}
				aria-label={ariaLabel}
				definition={definition}
				height={300}
				renderTooltipBody={renderTooltipBody}
				tabIndex={0}
			/>
			{legend && series.length > 1 ? (
				<div {...props(styles.legend)}>
					<ChartLegend
						aria-label={`${ariaLabel} series`}
						items={series.map(({ id, label }, index) => ({
							id,
							label,
							tone: TONES[index],
						}))}
					/>
				</div>
			) : null}
		</div>
	);
}
