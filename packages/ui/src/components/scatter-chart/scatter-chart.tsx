"use client";

import { props } from "@stylexjs/stylex";
import { defineChart, dot } from "@tanstack/charts";
import type { ChartTooltipBodyRenderContext } from "@tanstack/charts/react/tooltip";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { tooltip as tooltipFeature } from "@tanstack/charts/tooltip";
import type { ComponentPropsWithRef } from "react";
import { useMemo } from "react";
import type { Closed } from "../../closed";
import { typeRoles } from "../../styles/typography.styles";
import { type ChartSeriesTone, chartColors } from "../chart-frame/chart-colors";
import { ChartDataTable } from "../chart-frame/chart-data-table";
import { ChartFrame } from "../chart-frame/chart-frame";
import { ChartLegend } from "../chart-legend/chart-legend";
import { ChartTooltip } from "../chart-tooltip/chart-tooltip";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableContainer,
	TableHead,
	TableHeader,
	TableRow,
} from "../table/table";
import { scatterChartStyles } from "./scatter-chart.styles";

export interface ScatterChartPoint {
	/** The id of one of the chart's groups. */
	group?: string;
	id: string;
	label: string;
	/** A third measure drawn as bubble area. */
	size?: number;
	x: number;
	y: number;
}

export interface ScatterChartGroup {
	id: string;
	label: string;
}

export type ScatterChartProps = Omit<
	Closed<ComponentPropsWithRef<"div">>,
	"aria-label" | "children" | "data-slot" | "role"
> & {
	"aria-description"?: string;
	"aria-label": string;
	formatX?: (value: number) => string;
	formatY?: (value: number) => string;
	/** Up to three groups, colored in palette order; every point names one. */
	groups?: readonly ScatterChartGroup[];
	points: readonly ScatterChartPoint[];
	tone?: ChartSeriesTone;
	xAxisLabel: string;
	yAxisLabel: string;
};

interface PreparedPoint extends ScatterChartPoint {
	r: number;
	tone: ChartSeriesTone;
}

interface ScatterChartPlotProps {
	"aria-description"?: string;
	"aria-label": string;
	formatX: (value: number) => string;
	formatY: (value: number) => string;
	groups: readonly ScatterChartGroup[];
	points: readonly PreparedPoint[];
	xAxisLabel: string;
	xDomain: readonly [number, number];
	yAxisLabel: string;
	yDomain: readonly [number, number];
}

interface PreparedScatterChart {
	points: readonly PreparedPoint[];
	xDomain: readonly [number, number];
	yDomain: readonly [number, number];
}

function axisDomain(
	minimum: number,
	maximum: number
): readonly [number, number] {
	const padding =
		minimum === maximum
			? Math.max(1, Math.abs(minimum) * 0.05)
			: (maximum - minimum) * 0.05;
	const lower = minimum - padding;
	const upper = maximum + padding;
	return [
		Number.isFinite(lower) ? lower : minimum,
		Number.isFinite(upper) ? upper : maximum,
	];
}

function assertPointIdentity(point: unknown, ids: Set<string>) {
	if (
		typeof point !== "object" ||
		point === null ||
		!("id" in point) ||
		!("label" in point) ||
		typeof point.id !== "string" ||
		!point.id.trim() ||
		typeof point.label !== "string" ||
		!point.label.trim()
	) {
		throw new TypeError(
			"ScatterChart points require non-empty ids and labels."
		);
	}
	if (ids.has(point.id)) {
		throw new RangeError("ScatterChart point ids must be unique.");
	}
	ids.add(point.id);
}

function assertPointCoordinates(point: ScatterChartPoint) {
	if (
		typeof point.x !== "number" ||
		!Number.isFinite(point.x) ||
		typeof point.y !== "number" ||
		!Number.isFinite(point.y)
	) {
		throw new RangeError("ScatterChart coordinates must be finite numbers.");
	}
}

// Any two groups can sit side by side, and only the first three palette hues
// stay distinct for every pair under color-vision deficiency.
const GROUP_TONES = ["series1", "series2", "series3"] as const;
const BUBBLE_RADIUS = { max: 14, min: 4 };

function assertGroups(
	groups: readonly ScatterChartGroup[],
	points: readonly ScatterChartPoint[]
) {
	if (!Array.isArray(groups) || groups.length > GROUP_TONES.length) {
		throw new RangeError("ScatterChart supports up to three groups.");
	}
	const ids = new Set(groups.map(({ id }) => id));
	if (ids.size !== groups.length) {
		throw new RangeError("ScatterChart group ids must be unique.");
	}
	const grouped = groups.length > 0;
	for (const { group } of points) {
		if (grouped ? !ids.has(group ?? "") : group !== undefined) {
			throw new RangeError(
				"ScatterChart points must name one of the chart's groups."
			);
		}
	}
}

// Bubble area, not radius, is proportional to size.
function getRadius(size: number | undefined, maxSize: number) {
	if (size === undefined || maxSize <= 0) {
		return 5;
	}
	const { max, min } = BUBBLE_RADIUS;
	return Math.max(min, Math.sqrt(size / maxSize) * max);
}

function decoratePoints(
	points: readonly ScatterChartPoint[],
	groups: readonly ScatterChartGroup[],
	tone: ChartSeriesTone
): PreparedPoint[] {
	for (const { size } of points) {
		if (size !== undefined && !(Number.isFinite(size) && size >= 0)) {
			throw new RangeError(
				"ScatterChart sizes must be finite and not negative."
			);
		}
	}
	const maxSize = Math.max(0, ...points.map(({ size }) => size ?? 0));
	const tones = new Map(
		groups.map(({ id }, index) => [id, GROUP_TONES[index]])
	);
	return points.map((point) => ({
		...point,
		r: getRadius(point.size, maxSize),
		tone: tones.get(point.group ?? "") ?? tone,
	}));
}

function preparePoints(
	points: readonly ScatterChartPoint[],
	groups: readonly ScatterChartGroup[],
	tone: ChartSeriesTone
): PreparedScatterChart {
	if (!Array.isArray(points)) {
		throw new TypeError("ScatterChart points must be an array.");
	}
	const ids = new Set<string>();
	let minX = Number.POSITIVE_INFINITY;
	let maxX = Number.NEGATIVE_INFINITY;
	let minY = Number.POSITIVE_INFINITY;
	let maxY = Number.NEGATIVE_INFINITY;
	for (const point of points) {
		assertPointIdentity(point, ids);
		assertPointCoordinates(point);
		minX = Math.min(minX, point.x);
		maxX = Math.max(maxX, point.x);
		minY = Math.min(minY, point.y);
		maxY = Math.max(maxY, point.y);
	}
	if (
		points.length > 0 &&
		!(Number.isFinite(maxX - minX) && Number.isFinite(maxY - minY))
	) {
		throw new RangeError(
			"ScatterChart coordinates exceed a finite chart range."
		);
	}
	assertGroups(groups, points);
	return {
		points: decoratePoints(points, groups, tone),
		xDomain: points.length ? axisDomain(minX, maxX) : ([0, 1] as const),
		yDomain: points.length ? axisDomain(minY, maxY) : ([0, 1] as const),
	};
}

function formatNumber(
	value: number,
	formatter: ((value: number) => string) | undefined,
	numberFormat: Intl.NumberFormat
) {
	const formatted = formatter ? formatter(value) : numberFormat.format(value);
	if (typeof formatted !== "string") {
		throw new TypeError("ScatterChart axis formatters must return strings.");
	}
	return formatted;
}

function assertProps(
	ariaLabel: string,
	xAxisLabel: string,
	yAxisLabel: string,
	formatX: ScatterChartProps["formatX"],
	formatY: ScatterChartProps["formatY"],
	tone: ChartSeriesTone
) {
	for (const [name, value] of Object.entries({
		"aria-label": ariaLabel,
		xAxisLabel,
		yAxisLabel,
	})) {
		if (typeof value !== "string" || !value.trim()) {
			throw new TypeError(`ScatterChart requires a non-empty ${name}.`);
		}
	}
	for (const [name, formatter] of Object.entries({ formatX, formatY })) {
		if (formatter !== undefined && typeof formatter !== "function") {
			throw new TypeError(`ScatterChart ${name} must be a function.`);
		}
	}
	if (!Object.hasOwn(chartColors, tone)) {
		throw new RangeError("ScatterChart tone is not supported.");
	}
}

function renderTooltip(
	context: ChartTooltipBodyRenderContext<PreparedPoint, number, number>,
	xAxisLabel: string,
	yAxisLabel: string,
	formatX: (value: number) => string,
	formatY: (value: number) => string
) {
	const point = context.primaryPoint ?? context.points[0];
	if (!point) {
		return null;
	}
	const { tone } = point.datum;
	return (
		<ChartTooltip
			items={[
				{
					id: "scatter-x",
					label: xAxisLabel,
					tone,
					value: formatX(point.xValue),
				},
				{
					id: "scatter-y",
					label: yAxisLabel,
					tone,
					value: formatY(point.yValue),
				},
			]}
			label={point.datum.label}
		/>
	);
}

function ScatterChartTable({
	"aria-label": ariaLabel,
	formatX,
	formatY,
	points,
	xAxisLabel,
	yAxisLabel,
}: Pick<
	ScatterChartPlotProps,
	"aria-label" | "formatX" | "formatY" | "points" | "xAxisLabel" | "yAxisLabel"
>) {
	return (
		<ChartDataTable>
			<TableContainer aria-label={`${ariaLabel} data`}>
				<Table>
					<TableCaption>{ariaLabel} values</TableCaption>
					<TableHeader sticky={false}>
						<TableRow>
							<TableHead scope="col">Point</TableHead>
							<TableHead scope="col">{xAxisLabel}</TableHead>
							<TableHead scope="col">{yAxisLabel}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{points.map(({ id, label, x, y }) => (
							<TableRow key={id}>
								<TableHead scope="row">{label}</TableHead>
								<TableCell numeric>
									<data value={x}>{formatX(x)}</data>
								</TableCell>
								<TableCell numeric>
									<data value={y}>{formatY(y)}</data>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</ChartDataTable>
	);
}

function ScatterChartPlot({
	"aria-description": ariaDescription,
	"aria-label": ariaLabel,
	formatX,
	formatY,
	groups,
	points,
	xAxisLabel,
	xDomain,
	yAxisLabel,
	yDomain,
}: ScatterChartPlotProps) {
	const definition = useMemo(
		() =>
			defineChart(
				{
					// Each point's tone maps to its palette color.
					color: {
						domain: Object.keys(chartColors),
						range: Object.values(chartColors),
					},
					marks: [
						dot(points, {
							color: "tone",
							fillOpacity: 0.75,
							id: "scatter-chart-points",
							key: ({ id }) => id,
							r: "r",
							strokeWidth: 1.5,
							x: "x",
							y: "y",
						}),
					],
					scales: {
						x: {
							axis: {
								label: xAxisLabel,
								ticks: { count: 5, format: formatX },
							},
							grid: true,
							scale: scaleLinear().domain(xDomain),
						},
						y: {
							axis: {
								label: yAxisLabel,
								ticks: { count: 5, format: formatY },
							},
							grid: true,
							scale: scaleLinear().domain(yDomain),
						},
					},
				},
				{ tooltip: tooltipFeature }
			),
		[formatX, formatY, points, xAxisLabel, xDomain, yAxisLabel, yDomain]
	);
	const renderTooltipBody = useMemo(
		() =>
			(context: ChartTooltipBodyRenderContext<PreparedPoint, number, number>) =>
				renderTooltip(context, xAxisLabel, yAxisLabel, formatX, formatY),
		[formatX, formatY, xAxisLabel, yAxisLabel]
	);

	return (
		<>
			<ChartFrame
				aria-description={ariaDescription}
				aria-label={ariaLabel}
				definition={definition}
				height={280}
				renderTooltipBody={renderTooltipBody}
				tabIndex={0}
			/>
			{groups.length > 0 ? (
				<div
					data-slot="scatter-chart-legend"
					{...props(scatterChartStyles.legend)}
				>
					<ChartLegend
						aria-label={`${ariaLabel} groups`}
						items={groups.map(({ id, label }, index) => ({
							id,
							label,
							tone: GROUP_TONES[index],
						}))}
					/>
				</div>
			) : null}
		</>
	);
}

export function ScatterChart({
	"aria-description": ariaDescription,
	"aria-label": ariaLabel,
	formatX,
	formatY,
	groups = [],
	points: inputPoints,
	ref: forwardedRef,
	tone = "series1",
	xAxisLabel,
	yAxisLabel,
	...rest
}: ScatterChartProps) {
	assertProps(ariaLabel, xAxisLabel, yAxisLabel, formatX, formatY, tone);
	const { points, xDomain, yDomain } = useMemo(
		() => preparePoints(inputPoints, groups, tone),
		[groups, inputPoints, tone]
	);
	const numberFormat = useMemo(() => new Intl.NumberFormat("en-US"), []);
	const formatXValue = useMemo(
		() => (value: number) => formatNumber(value, formatX, numberFormat),
		[formatX, numberFormat]
	);
	const formatYValue = useMemo(
		() => (value: number) => formatNumber(value, formatY, numberFormat),
		[formatY, numberFormat]
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
			data-slot="scatter-chart"
			ref={forwardedRef}
			{...props(scatterChartStyles.root)}
		>
			{points.length === 0 ? (
				// biome-ignore lint/a11y/useSemanticElements: Names an empty chart, not a form group; the status keeps its own text.
				<div aria-label={ariaLabel} role="group">
					<p role="status" {...props(typeRoles.body)}>
						No data available.
					</p>
				</div>
			) : (
				<ScatterChartPlot
					aria-description={ariaDescription}
					aria-label={ariaLabel}
					formatX={formatXValue}
					formatY={formatYValue}
					groups={groups}
					points={points}
					xAxisLabel={xAxisLabel}
					xDomain={xDomain}
					yAxisLabel={yAxisLabel}
					yDomain={yDomain}
				/>
			)}
			<ScatterChartTable
				aria-label={ariaLabel}
				formatX={formatXValue}
				formatY={formatYValue}
				points={points}
				xAxisLabel={xAxisLabel}
				yAxisLabel={yAxisLabel}
			/>
		</div>
	);
}
