"use client";

import { props } from "@stylexjs/stylex";
import { barX, barY, defineChart, group } from "@tanstack/charts";
import { decorative } from "@tanstack/charts/mark/decorative";
import type { ChartTooltipBodyRenderContext } from "@tanstack/charts/react/tooltip";
import { scaleBand } from "@tanstack/charts/scales/band";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { tooltip as tooltipFeature } from "@tanstack/charts/tooltip";
import type { ComponentPropsWithRef } from "react";
import { useMemo } from "react";
import type { Closed } from "../../closed";
import { colors } from "../../styles/colors.stylex";
import { typeRoles } from "../../styles/typography.styles";
import { type ChartSeriesTone, chartColors } from "../chart-frame/chart-colors";
import { bandCrosshair } from "../chart-frame/chart-crosshair";
import { ChartFrame } from "../chart-frame/chart-frame";
import { ChartLegend } from "../chart-legend/chart-legend";
import { ChartTooltip } from "../chart-tooltip/chart-tooltip";
import { categoryComparisonStyles } from "./category-comparison.styles";

export interface CategoryComparisonDatum {
	/** A reference value, such as last year, drawn as a muted bar beside value. */
	comparison?: number;
	id: string;
	label: string;
	value: number;
}

export type CategoryComparisonOrientation = "horizontal" | "vertical";

export type CategoryComparisonProps = Omit<
	Closed<ComponentPropsWithRef<"div">>,
	"aria-label" | "children" | "data-slot" | "role"
> & {
	"aria-description"?: string;
	"aria-label": string;
	categories: readonly CategoryComparisonDatum[];
	/** Names the comparison values; required when any category has one. */
	comparisonLabel?: string;
	formatAxisValue?: (value: number) => string;
	formatValue?: (value: number) => string;
	/** Shows the legend below the chart. Turn it off when a card header shows it. */
	legend?: boolean;
	locale?: string;
	/** vertical suits ordered categories such as months. */
	orientation?: CategoryComparisonOrientation;
	seriesLabel: string;
	tone?: ChartSeriesTone;
	/** Draws a track behind each bar showing the full scale. */
	track?: boolean;
};

interface CategoryComparisonChartProps {
	"aria-description"?: string;
	"aria-label": string;
	categories: readonly CategoryComparisonDatum[];
	comparisonLabel?: string;
	domain: readonly [number, number];
	formatAxisValue?: (value: number) => string;
	formatValue?: (value: number) => string;
	legend: boolean;
	locale: string;
	orientation: CategoryComparisonOrientation;
	seriesLabel: string;
	tone: ChartSeriesTone;
	track: boolean;
}

interface CategoryComparisonRow {
	category: string;
	id: string;
	label: string;
	series: "comparison" | "value";
	value: number;
}

function assertCategory(category: CategoryComparisonDatum, ids: Set<string>) {
	if (
		typeof category.id !== "string" ||
		!category.id.trim() ||
		typeof category.label !== "string" ||
		!category.label.trim()
	) {
		throw new TypeError(
			"CategoryComparison categories require non-empty ids and labels."
		);
	}
	if (ids.has(category.id)) {
		throw new RangeError("CategoryComparison category ids must be unique.");
	}
	for (const value of [category.value, category.comparison ?? 0]) {
		if (typeof value !== "number" || !Number.isFinite(value)) {
			throw new RangeError("CategoryComparison values must be finite numbers.");
		}
	}
	ids.add(category.id);
}

function prepareCategories(categories: readonly CategoryComparisonDatum[]) {
	if (!Array.isArray(categories)) {
		throw new TypeError("CategoryComparison categories must be an array.");
	}
	const ids = new Set<string>();
	let min = 0;
	let max = 0;
	for (const category of categories) {
		assertCategory(category, ids);
		const comparison = category.comparison ?? category.value;
		min = Math.min(min, category.value, comparison);
		max = Math.max(max, category.value, comparison);
	}
	if (!Number.isFinite(max - min)) {
		throw new RangeError(
			"CategoryComparison values exceed a finite chart range."
		);
	}
	return {
		categories: [...categories],
		domain: [min, max === min ? 1 : max] as const,
	};
}

function assertLabels(ariaLabel: string, seriesLabel: string) {
	if (
		typeof ariaLabel !== "string" ||
		typeof seriesLabel !== "string" ||
		!ariaLabel.trim() ||
		!seriesLabel.trim()
	) {
		throw new TypeError(
			"CategoryComparison requires non-empty aria-label and seriesLabel values."
		);
	}
}

function assertFormatters(
	formatValue: ((value: number) => string) | undefined,
	formatAxisValue: ((value: number) => string) | undefined
) {
	for (const [name, formatter] of Object.entries({
		formatAxisValue,
		formatValue,
	})) {
		if (formatter !== undefined && typeof formatter !== "function") {
			throw new TypeError(`CategoryComparison ${name} must be a function.`);
		}
	}
}

function formatNumber(
	value: number,
	formatter: ((value: number) => string) | undefined,
	numberFormat: Intl.NumberFormat,
	formatterName = "formatValue"
) {
	const formatted = formatter ? formatter(value) : numberFormat.format(value);
	if (typeof formatted !== "string") {
		throw new TypeError(
			`CategoryComparison ${formatterName} must return a string.`
		);
	}
	return formatted;
}

function toRows(
	categories: readonly CategoryComparisonDatum[]
): CategoryComparisonRow[] {
	return categories.flatMap(({ comparison, id, label, value }) => [
		...(comparison === undefined
			? []
			: [
					{
						category: id,
						id: `${id}:comparison`,
						label,
						series: "comparison" as const,
						value: comparison,
					},
				]),
		{ category: id, id, label, series: "value" as const, value },
	]);
}

function renderTooltip(
	context: ChartTooltipBodyRenderContext<
		CategoryComparisonRow,
		number | string,
		number | string
	>,
	labels: { comparison?: string; value: string },
	tone: ChartSeriesTone,
	format: (value: number) => string
) {
	const point = context.primaryPoint ?? context.points[0];
	if (!point) {
		return null;
	}
	const rows = context.points
		.map(({ datum }) => datum)
		.filter(({ category }) => category === point.datum.category)
		.sort((left) => (left.series === "value" ? -1 : 1));
	return (
		<ChartTooltip
			items={rows.map((row) => ({
				id: row.id,
				label: row.series === "value" ? labels.value : labels.comparison,
				tone: row.series === "value" ? tone : "muted",
				value: format(row.value),
			}))}
			label={point.datum.label}
		/>
	);
}

// The focused category keeps full color while the rest recede.
const RECEDE = [
	{
		style: { opacity: 0.35 },
		transition: { duration: 150, type: "tween" as const },
		when: { focus: "unmatched" as const },
	},
];

interface MarkOptions {
	domain: readonly [number, number];
	grouped: boolean;
	tone: ChartSeriesTone;
}

function barFill(tone: ChartSeriesTone) {
	return (row: CategoryComparisonRow) =>
		row.series === "value" ? chartColors[tone] : chartColors.muted;
}

// Bar widths follow BoardUI's proportions: slim, fully rounded pairs when two
// bars share a slot, wider bars with softer corners when one stands alone.
function barSize(
	orientation: CategoryComparisonOrientation,
	grouped: boolean
): { radius: number; thickness: number } {
	if (grouped) {
		return { radius: 5, thickness: 10 };
	}
	return orientation === "vertical"
		? { radius: 8, thickness: 28 }
		: { radius: 6, thickness: 20 };
}

// A full-scale track behind each category, as in a progress bar.
function getTrack(
	categories: readonly CategoryComparisonDatum[],
	orientation: CategoryComparisonOrientation,
	{ domain, grouped }: MarkOptions
) {
	const { radius, thickness } = barSize(orientation, grouped);
	const common = {
		fill: colors.controlSurface,
		id: "category-comparison-track",
		key: ({ id }: CategoryComparisonDatum) => id,
		maxThickness: grouped ? thickness * 2 + 6 : thickness,
		radius: { end: radius },
	};
	return decorative(
		orientation === "vertical"
			? barY(categories, { ...common, x: "id", y1: domain[0], y2: domain[1] })
			: barX(categories, { ...common, x1: domain[0], x2: domain[1], y: "id" })
	);
}

function getBars(
	rows: readonly CategoryComparisonRow[],
	orientation: CategoryComparisonOrientation,
	{ grouped, tone }: MarkOptions
) {
	const { radius, thickness } = barSize(orientation, grouped);
	const common = {
		fill: barFill(tone),
		id: "category-comparison-bars",
		key: (row: CategoryComparisonRow) => row.id,
		layout: grouped ? group({ padding: 0.2 }) : undefined,
		maxThickness: thickness,
		radius: { end: radius },
		states: RECEDE,
		z: "series" as const,
	};
	return orientation === "vertical"
		? barY(rows, { ...common, x: "category", y: "value", y1: 0 })
		: barX(rows, { ...common, x: "value", x1: 0, y: "category" });
}

function getLegendItems(
	seriesLabel: string,
	tone: ChartSeriesTone,
	comparisonLabel: string | undefined
) {
	const items = [
		{ id: "category-comparison-series", label: seriesLabel, tone },
	];
	return comparisonLabel === undefined
		? items
		: [
				...items,
				{
					id: "category-comparison-comparison",
					label: comparisonLabel,
					tone: "muted" as const,
				},
			];
}

function getHeight(
	orientation: CategoryComparisonOrientation,
	count: number,
	grouped: boolean
) {
	if (orientation === "vertical") {
		return 200;
	}
	return Math.max(240, count * (grouped ? 64 : 48) + 72);
}

function CategoryComparisonChart({
	"aria-description": ariaDescription,
	"aria-label": ariaLabel,
	categories,
	comparisonLabel,
	domain,
	formatAxisValue,
	formatValue,
	legend,
	locale,
	orientation,
	seriesLabel,
	tone,
	track,
}: CategoryComparisonChartProps) {
	const numberFormat = useMemo(() => new Intl.NumberFormat(locale), [locale]);
	// Axis ticks default to compact numbers ("13.5K"); tooltips stay exact.
	const axisNumberFormat = useMemo(
		() =>
			new Intl.NumberFormat(locale, {
				maximumFractionDigits: 1,
				notation: "compact",
			}),
		[locale]
	);
	const format = useMemo(
		() => (value: number) => formatNumber(value, formatValue, numberFormat),
		[formatValue, numberFormat]
	);
	const rows = useMemo(() => toRows(categories), [categories]);
	const grouped = rows.length > categories.length;
	const definition = useMemo(() => {
		const labels = new Map(categories.map(({ id, label }) => [id, label]));
		// Tracks and the axis share one niced domain, so tracks reach the top tick.
		const tickCount = orientation === "vertical" ? 4 : 5;
		const scale = scaleLinear().domain(domain).nice(tickCount);
		const [start, end] = scale.domain();
		const options = { domain: [start, end] as const, grouped, tone };
		const valueScale = {
			axis: {
				ticks: {
					count: tickCount,
					format: (value: number) =>
						formatNumber(
							value,
							formatAxisValue ?? formatValue,
							axisNumberFormat,
							formatAxisValue ? "formatAxisValue" : "formatValue"
						),
				},
			},
			grid: true,
			scale,
		};
		const categoryScale = {
			axis: { ticks: { format: (id: string) => labels.get(id) ?? id } },
			scale: scaleBand<string>()
				.domain(categories.map(({ id }) => id))
				.paddingInner(0.2)
				.paddingOuter(0.08),
		};
		const vertical = orientation === "vertical";
		return defineChart(
			{
				marks: [
					bandCrosshair(vertical ? "x" : "y"),
					...(track ? [getTrack(categories, orientation, options)] : []),
					getBars(rows, orientation, options),
				],
				scales: vertical
					? { x: categoryScale, y: valueScale }
					: { x: valueScale, y: categoryScale },
			},
			{
				focus: vertical ? "group-x" : "group-y",
				// The brand band marks the focused category, so no point ring.
				focusRing: false,
				tooltip: tooltipFeature,
			}
		);
	}, [
		categories,
		domain,
		formatAxisValue,
		axisNumberFormat,
		formatValue,
		grouped,
		orientation,
		rows,
		tone,
		track,
	]);
	const renderTooltipBody = useMemo(
		() =>
			(
				context: ChartTooltipBodyRenderContext<
					CategoryComparisonRow,
					number | string,
					number | string
				>
			) =>
				renderTooltip(
					context,
					{ comparison: comparisonLabel, value: seriesLabel },
					tone,
					format
				),
		[comparisonLabel, format, seriesLabel, tone]
	);

	return (
		<div data-slot="category-comparison-chart">
			<ChartFrame
				aria-description={ariaDescription}
				aria-label={ariaLabel}
				definition={definition}
				height={getHeight(orientation, categories.length, grouped)}
				renderTooltipBody={renderTooltipBody}
				tabIndex={0}
			/>
			{legend ? (
				<div
					data-slot="category-comparison-legend"
					{...props(categoryComparisonStyles.legend)}
				>
					<ChartLegend
						aria-label={`${seriesLabel} series`}
						items={getLegendItems(
							seriesLabel,
							tone,
							grouped ? comparisonLabel : undefined
						)}
					/>
				</div>
			) : null}
		</div>
	);
}

function assertLocaleAndTone(locale: string, tone: ChartSeriesTone) {
	if (typeof locale !== "string" || !locale.trim()) {
		throw new TypeError(
			"CategoryComparison locale must be a non-empty string."
		);
	}
	if (!Object.hasOwn(chartColors, tone)) {
		throw new RangeError("CategoryComparison tone is not supported.");
	}
	// Throws a RangeError for an unknown locale.
	new Intl.NumberFormat(locale).format(0);
}

function assertComparisonOptions(
	categories: readonly CategoryComparisonDatum[],
	comparisonLabel: string | undefined,
	orientation: CategoryComparisonOrientation
) {
	if (orientation !== "horizontal" && orientation !== "vertical") {
		throw new RangeError(
			"CategoryComparison orientation must be 'horizontal' or 'vertical'."
		);
	}
	const hasComparison =
		Array.isArray(categories) &&
		categories.some(({ comparison }) => comparison !== undefined);
	if (
		hasComparison &&
		(typeof comparisonLabel !== "string" || !comparisonLabel.trim())
	) {
		throw new TypeError(
			"CategoryComparison requires a comparisonLabel when categories have comparison values."
		);
	}
}

export function CategoryComparison({
	"aria-description": ariaDescription,
	"aria-label": ariaLabel,
	categories: inputCategories,
	comparisonLabel,
	formatAxisValue,
	formatValue,
	legend = true,
	locale = "en-US",
	orientation = "horizontal",
	ref: forwardedRef,
	seriesLabel,
	tone = "series1",
	track = false,
	...rest
}: CategoryComparisonProps) {
	assertLabels(ariaLabel, seriesLabel);
	assertFormatters(formatValue, formatAxisValue);
	assertComparisonOptions(inputCategories, comparisonLabel, orientation);
	assertLocaleAndTone(locale, tone);
	const { categories, domain } = useMemo(
		() => prepareCategories(inputCategories),
		[inputCategories]
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
			data-slot="category-comparison"
			ref={forwardedRef}
			{...props(categoryComparisonStyles.root)}
		>
			{categories.length === 0 ? (
				<p
					aria-label={ariaLabel}
					role="status"
					{...props(typeRoles.body, categoryComparisonStyles.empty)}
				>
					No categories available.
				</p>
			) : (
				<CategoryComparisonChart
					aria-description={ariaDescription}
					aria-label={ariaLabel}
					categories={categories}
					comparisonLabel={comparisonLabel}
					domain={domain}
					formatAxisValue={formatAxisValue}
					formatValue={formatValue}
					legend={legend}
					locale={locale}
					orientation={orientation}
					seriesLabel={seriesLabel}
					tone={tone}
					track={track}
				/>
			)}
		</div>
	);
}
