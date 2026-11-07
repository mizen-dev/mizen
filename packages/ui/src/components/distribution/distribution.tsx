"use client";

import { props } from "@stylexjs/stylex";
import { crosshair, defineChart, rect } from "@tanstack/charts";
import type { ChartTooltipBodyRenderContext } from "@tanstack/charts/react/tooltip";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { tooltip as tooltipFeature } from "@tanstack/charts/tooltip";
import { binX } from "@tanstack/charts/transform/bin";
import type { ComponentPropsWithRef } from "react";
import { useMemo } from "react";
import type { Closed } from "../../closed";
import { typeRoles } from "../../styles/typography.styles";
import { type ChartSeriesTone, chartColors } from "../chart-frame/chart-colors";
import { ChartFrame } from "../chart-frame/chart-frame";
import { ChartLegend } from "../chart-legend/chart-legend";
import { ChartTooltip } from "../chart-tooltip/chart-tooltip";
import { distributionStyles } from "./distribution.styles";

export type DistributionProps = Omit<
	Closed<ComponentPropsWithRef<"div">>,
	"aria-label" | "children" | "data-slot" | "role"
> & {
	"aria-description"?: string;
	"aria-label": string;
	binCount?: number;
	domain: readonly [number, number];
	formatAxisValue?: (value: number) => string;
	formatValue?: (value: number) => string;
	locale?: string;
	seriesLabel: string;
	tone?: ChartSeriesTone;
	values: readonly number[];
};

interface DistributionBin {
	count: number;
	x1: number;
	x2: number;
}

interface DistributionChartProps {
	"aria-description"?: string;
	"aria-label": string;
	bins: readonly DistributionBin[];
	domain: readonly [number, number];
	formatAxisValue?: (value: number) => string;
	formatValue?: (value: number) => string;
	locale: string;
	seriesLabel: string;
	tone: ChartSeriesTone;
}

function assertDomain(domain: readonly [number, number]) {
	if (
		!Array.isArray(domain) ||
		domain.length !== 2 ||
		!domain.every(Number.isFinite) ||
		domain[0] >= domain[1] ||
		!Number.isFinite(domain[1] - domain[0])
	) {
		throw new RangeError(
			"Distribution domain must be a finite increasing range."
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
			throw new TypeError(`Distribution ${name} must be a function.`);
		}
	}
}

function assertValues(
	values: readonly number[],
	domain: readonly [number, number]
) {
	if (!Array.isArray(values)) {
		throw new TypeError("Distribution values must be an array.");
	}
	const [minimum, maximum] = domain;
	for (const value of values) {
		if (typeof value !== "number" || !Number.isFinite(value)) {
			throw new RangeError("Distribution values must be finite numbers.");
		}
		if (value < minimum || value > maximum) {
			throw new RangeError("Distribution values must fall within the domain.");
		}
	}
}

function makeBoundaries(domain: readonly [number, number], binCount: number) {
	if (!Number.isSafeInteger(binCount) || binCount <= 0) {
		throw new RangeError(
			"Distribution binCount must be a positive safe integer."
		);
	}
	const [minimum, maximum] = domain;
	const width = maximum - minimum;
	if (minimum + width / binCount === minimum) {
		throw new RangeError(
			"Distribution domain is too narrow for the requested binCount."
		);
	}
	const boundaries = Array.from({ length: binCount + 1 }, (_, index) => {
		if (index === 0) {
			return minimum;
		}
		if (index === binCount) {
			return maximum;
		}
		return minimum + width * (index / binCount);
	});
	if (
		boundaries.some(
			(edge, index) =>
				index > 0 && (!Number.isFinite(edge) || edge <= boundaries[index - 1])
		)
	) {
		throw new RangeError(
			"Distribution domain is too narrow for the requested binCount."
		);
	}
	return boundaries;
}

function prepareValues(
	values: readonly number[],
	domain: readonly [number, number],
	binCount: number
) {
	assertDomain(domain);
	assertValues(values, domain);
	const boundaries = makeBoundaries(domain, binCount);
	const bins = binX(values, {
		domain,
		outputs: { count: { reduce: "count" } },
		thresholds: boundaries,
		value: (value) => value,
	});
	return bins.map(({ count, x1, x2 }) => ({ count, x1, x2 }));
}

function formatNumber(
	value: number,
	formatter: ((value: number) => string) | undefined,
	numberFormat: Intl.NumberFormat,
	formatterName = "formatValue"
) {
	const formatted = formatter ? formatter(value) : numberFormat.format(value);
	if (typeof formatted !== "string") {
		throw new TypeError(`Distribution ${formatterName} must return a string.`);
	}
	return formatted;
}

function renderTooltip(
	context: ChartTooltipBodyRenderContext<DistributionBin, number, number>,
	seriesLabel: string,
	tone: ChartSeriesTone,
	formatStart: (value: number) => string,
	format: (value: number) => string,
	countFormat: Intl.NumberFormat
) {
	const point = context.primaryPoint ?? context.points[0];
	if (!point) {
		return null;
	}
	const bin = point.datum;
	// A plain range such as "10–20 min": the start uses the axis format, so a
	// unit in the value format appears once.
	const interval = `${formatStart(bin.x1)}–${format(bin.x2)}`;
	return (
		<ChartTooltip
			items={[
				{
					id: `distribution-bin-${bin.x1}`,
					label: seriesLabel,
					tone,
					value: countFormat.format(bin.count),
				},
			]}
			label={interval}
		/>
	);
}

function DistributionChart({
	"aria-description": ariaDescription,
	"aria-label": ariaLabel,
	bins,
	domain,
	formatAxisValue,
	formatValue,
	locale,
	seriesLabel,
	tone,
}: DistributionChartProps) {
	const numberFormat = useMemo(
		() => new Intl.NumberFormat(locale, { maximumSignificantDigits: 21 }),
		[locale]
	);
	const format = useMemo(
		() => (value: number) => formatNumber(value, formatValue, numberFormat),
		[formatValue, numberFormat]
	);
	const formatStart = useMemo(
		() =>
			formatAxisValue
				? (value: number) =>
						formatNumber(
							value,
							formatAxisValue,
							numberFormat,
							"formatAxisValue"
						)
				: format,
		[format, formatAxisValue, numberFormat]
	);
	const countFormat = useMemo(
		() => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }),
		[locale]
	);
	const definition = useMemo(() => {
		const maximumCount = bins.reduce(
			(maximum, { count }) => Math.max(maximum, count),
			0
		);
		const countStep = Math.max(1, Math.ceil(maximumCount / 4));
		const countTicks = Array.from(
			{ length: Math.floor(maximumCount / countStep) + 1 },
			(_, index) => index * countStep
		);
		if (countTicks.at(-1) !== maximumCount) {
			countTicks.push(maximumCount);
		}
		return defineChart(
			{
				marks: [
					rect(bins, {
						fill: chartColors[tone],
						fillOpacity: 0.82,
						id: "distribution-bars",
						inset: 1.25,
						key: (_bin, index) => String(index),
						radius: 2,
						x1: "x1",
						x2: "x2",
						y1: () => 0,
						y2: "count",
					}),
					// One ring on the focused bin, drawn over the bars like Chart Frame's ring.
					crosshair({
						marker: {
							fill: "var(--ts-chart-focus-fill, Canvas)",
							radius: 5,
							stroke: chartColors[tone],
							strokeWidth: 2.5,
						},
						x: false,
						y: false,
					}),
				],
				scales: {
					x: {
						axis: {
							ticks: {
								count: 5,
								format: (value: number) =>
									formatNumber(
										value,
										formatAxisValue ?? formatValue,
										numberFormat,
										formatAxisValue ? "formatAxisValue" : "formatValue"
									),
							},
						},
						scale: scaleLinear().domain(domain),
					},
					y: {
						axis: {
							ticks: {
								format: (value: number) => countFormat.format(value),
								values: countTicks,
							},
						},
						grid: true,
						scale: scaleLinear().domain([0, maximumCount]),
					},
				},
			},
			{
				focus: "group-x",
				// The default layer rings every bin of an interval mark at once, so
				// the crosshair marker above rings only the focused one.
				focusRing: false,
				tooltip: tooltipFeature,
			}
		);
	}, [
		bins,
		countFormat,
		domain,
		formatAxisValue,
		formatValue,
		numberFormat,
		tone,
	]);
	const renderTooltipBody = useMemo(
		() =>
			(
				context: ChartTooltipBodyRenderContext<DistributionBin, number, number>
			) =>
				renderTooltip(
					context,
					seriesLabel,
					tone,
					formatStart,
					format,
					countFormat
				),
		[countFormat, format, formatStart, seriesLabel, tone]
	);

	return (
		<div data-slot="distribution-chart">
			<ChartFrame
				aria-description={ariaDescription}
				aria-label={ariaLabel}
				definition={definition}
				height={264}
				renderTooltipBody={renderTooltipBody}
				tabIndex={0}
			/>
			<div
				data-slot="distribution-legend"
				{...props(distributionStyles.legend)}
			>
				<ChartLegend
					aria-label={`${seriesLabel} series`}
					items={[{ id: "distribution-series", label: seriesLabel, tone }]}
				/>
			</div>
		</div>
	);
}

function assertOptions(
	ariaLabel: string,
	seriesLabel: string,
	formatValue: ((value: number) => string) | undefined,
	formatAxisValue: ((value: number) => string) | undefined,
	locale: string,
	tone: ChartSeriesTone
) {
	if (
		typeof ariaLabel !== "string" ||
		typeof seriesLabel !== "string" ||
		!ariaLabel.trim() ||
		!seriesLabel.trim()
	) {
		throw new TypeError(
			"Distribution requires non-empty aria-label and seriesLabel values."
		);
	}
	assertFormatters(formatValue, formatAxisValue);
	if (typeof locale !== "string" || !locale.trim()) {
		throw new TypeError("Distribution locale must be a non-empty string.");
	}
	if (!Object.hasOwn(chartColors, tone)) {
		throw new RangeError("Distribution tone is not supported.");
	}
	new Intl.NumberFormat(locale).format(0);
}

export function Distribution({
	"aria-description": ariaDescription,
	"aria-label": ariaLabel,
	binCount = 8,
	domain,
	formatValue,
	formatAxisValue,
	locale = "en-US",
	ref: forwardedRef,
	seriesLabel,
	tone = "series1",
	values: inputValues,
	...rest
}: DistributionProps) {
	assertOptions(
		ariaLabel,
		seriesLabel,
		formatValue,
		formatAxisValue,
		locale,
		tone
	);
	const bins = useMemo(
		() => prepareValues(inputValues, domain, binCount),
		[binCount, domain, inputValues]
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
			data-slot="distribution"
			ref={forwardedRef}
			{...props(distributionStyles.root)}
		>
			{inputValues.length === 0 ? (
				<p
					aria-label={ariaLabel}
					role="status"
					{...props(typeRoles.body, distributionStyles.empty)}
				>
					No observations available.
				</p>
			) : (
				<DistributionChart
					aria-description={ariaDescription}
					aria-label={ariaLabel}
					bins={bins}
					domain={domain}
					formatAxisValue={formatAxisValue}
					formatValue={formatValue}
					locale={locale}
					seriesLabel={seriesLabel}
					tone={tone}
				/>
			)}
		</div>
	);
}
