"use client";

import { props } from "@stylexjs/stylex";
import { defineChart } from "@tanstack/charts";
import { focusGroupAngle, pie, polar, radialArc } from "@tanstack/charts/polar";
import type { ChartTooltipBodyRenderContext } from "@tanstack/charts/react/tooltip";
import { tooltip as tooltipFeature } from "@tanstack/charts/tooltip";
import type { ComponentPropsWithRef } from "react";
import { useMemo } from "react";
import type { Closed } from "../../closed";
import { typeRoles } from "../../styles/typography.styles";
import { type ChartSeriesTone, chartColors } from "../chart-frame/chart-colors";
import { ChartFrame } from "../chart-frame/chart-frame";
import {
	ChartLegend,
	type ChartLegendItem,
} from "../chart-legend/chart-legend";
import { ChartTooltip } from "../chart-tooltip/chart-tooltip";
import { partToWholeStyles } from "./part-to-whole.styles";

export interface PartToWholePart {
	id: string;
	label: string;
	value: number;
}

export type PartToWholeProps = Omit<
	Closed<ComponentPropsWithRef<"div">>,
	"aria-label" | "children" | "data-slot" | "role"
> & {
	"aria-description"?: string;
	"aria-label": string;
	formatValue?: (value: number) => string;
	locale?: string;
	/** Up to six parts; fold the rest into "Other". */
	parts: readonly PartToWholePart[];
	/** Caption under the total in the donut's center. */
	totalLabel?: string;
};

interface PreparedPart extends PartToWholePart {
	rawValue: number;
	share: number;
	tone: ChartSeriesTone;
}

interface PartToWholeChartProps {
	"aria-description"?: string;
	"aria-label": string;
	formatValue: (value: number) => string;
	legendItems: readonly ChartLegendItem[];
	parts: readonly PreparedPart[];
	shareFormat: Intl.NumberFormat;
	totalLabel: string;
}

function validatePart(part: PartToWholePart, ids: Set<string>) {
	if (
		typeof part.id !== "string" ||
		!part.id.trim() ||
		typeof part.label !== "string" ||
		!part.label.trim()
	) {
		throw new TypeError("PartToWhole parts require non-empty ids and labels.");
	}
	if (ids.has(part.id)) {
		throw new RangeError("PartToWhole part ids must be unique.");
	}
	if (
		typeof part.value !== "number" ||
		!Number.isFinite(part.value) ||
		part.value < 0
	) {
		throw new RangeError("PartToWhole values must be finite and non-negative.");
	}
	ids.add(part.id);
}

function prepareParts(parts: readonly PartToWholePart[]): PreparedPart[] {
	if (!Array.isArray(parts)) {
		throw new TypeError("PartToWhole parts must be an array.");
	}
	if (parts.length > 6) {
		throw new RangeError(
			'PartToWhole supports up to six parts; fold the rest into "Other".'
		);
	}
	const ids = new Set<string>();
	let maximum = 0;
	for (const part of parts) {
		validatePart(part, ids);
		maximum = Math.max(maximum, part.value);
	}
	const scaledTotal =
		maximum === 0
			? 0
			: parts.reduce((sum, part) => sum + part.value / maximum, 0);
	return parts.map((part, index) => ({
		...part,
		rawValue: part.value,
		share: scaledTotal === 0 ? 0 : part.value / maximum / scaledTotal,
		tone: `series${index + 1}` as ChartSeriesTone,
	}));
}

function assertProps(
	ariaLabel: string,
	locale: string,
	formatValue: PartToWholeProps["formatValue"]
) {
	if (typeof ariaLabel !== "string" || !ariaLabel.trim()) {
		throw new TypeError("PartToWhole requires a non-empty aria-label.");
	}
	if (typeof locale !== "string" || !locale.trim()) {
		throw new TypeError("PartToWhole locale must be a non-empty string.");
	}
	if (formatValue !== undefined && typeof formatValue !== "function") {
		throw new TypeError("PartToWhole formatValue must be a function.");
	}
}

function formatNumber(value: number, formatValue: (value: number) => string) {
	const formatted = formatValue(value);
	if (typeof formatted !== "string") {
		throw new TypeError("PartToWhole formatValue must return a string.");
	}
	return formatted;
}

function renderTooltip(
	context: ChartTooltipBodyRenderContext<PreparedPart, number, number>,
	formatValue: (value: number) => string,
	shareFormat: Intl.NumberFormat
) {
	const point = context.primaryPoint ?? context.points[0];
	if (!point) {
		return null;
	}
	return (
		<ChartTooltip
			items={[
				{
					id: `part-${point.datum.id}`,
					label: point.datum.label,
					tone: point.datum.tone,
					value: `${formatNumber(point.datum.rawValue, formatValue)} · ${shareFormat.format(point.datum.share)}`,
				},
			]}
		/>
	);
}

function PartToWholeChart({
	"aria-description": ariaDescription,
	"aria-label": ariaLabel,
	formatValue,
	legendItems,
	shareFormat,
	parts,
	totalLabel,
}: PartToWholeChartProps) {
	const definition = useMemo(() => {
		const positiveParts = parts.filter(({ value }) => value > 0);
		const arcs = pie(positiveParts, { value: "share" });
		return defineChart(
			{
				marks: [
					polar({
						inset: 12,
						marks: [
							radialArc(arcs, {
								cornerRadius: 4,
								fill: ({ tone }) => chartColors[tone],
								id: "part-to-whole-arcs",
								innerRadius: ({ radius }) => radius * 0.74,
								key: ({ id }) => id,
								// A thin surface gap separates neighboring segments.
								padAngle: () => (positiveParts.length > 1 ? 0.03 : 0),
							}),
						],
						scales: { angle: null, radius: null },
					}),
				],
				scales: { x: null, y: null },
			},
			{ focus: focusGroupAngle, tooltip: tooltipFeature }
		);
	}, [parts]);
	const renderTooltipBody = useMemo(
		() =>
			(context: ChartTooltipBodyRenderContext<PreparedPart, number, number>) =>
				renderTooltip(context, formatValue, shareFormat),
		[formatValue, shareFormat]
	);
	const total = parts.reduce((sum, { rawValue }) => sum + rawValue, 0);
	return (
		<div data-slot="part-to-whole-chart" {...props(partToWholeStyles.chart)}>
			<div {...props(partToWholeStyles.plot)}>
				<ChartFrame
					aria-description={ariaDescription}
					aria-label={ariaLabel}
					definition={definition}
					height={240}
					renderTooltipBody={renderTooltipBody}
					tabIndex={0}
				/>
				<div
					aria-hidden="true"
					data-slot="part-to-whole-total"
					{...props(partToWholeStyles.total)}
				>
					<span {...props(typeRoles.numeric)}>
						{formatNumber(total, formatValue)}
					</span>
					<span {...props(typeRoles.caption, partToWholeStyles.totalLabel)}>
						{totalLabel}
					</span>
				</div>
			</div>
			<div
				data-slot="part-to-whole-legend"
				{...props(partToWholeStyles.legend)}
			>
				<ChartLegend
					aria-label={`${ariaLabel} parts`}
					items={legendItems}
					variant="rows"
				/>
			</div>
		</div>
	);
}

export function PartToWhole({
	"aria-description": ariaDescription,
	"aria-label": ariaLabel,
	formatValue: formatValueProp,
	locale = "en-US",
	parts: inputParts,
	ref: forwardedRef,
	totalLabel = "Total",
	...rest
}: PartToWholeProps) {
	assertProps(ariaLabel, locale, formatValueProp);
	const numberFormat = useMemo(
		() => new Intl.NumberFormat(locale, { maximumSignificantDigits: 21 }),
		[locale]
	);
	const formatValue = useMemo(
		() => formatValueProp ?? numberFormat.format,
		[formatValueProp, numberFormat]
	);
	const parts = useMemo(() => prepareParts(inputParts), [inputParts]);
	const hasPositivePart = parts.some(({ value }) => value > 0);
	const shareFormat = useMemo(
		() =>
			new Intl.NumberFormat(locale, {
				maximumSignificantDigits: 3,
				style: "percent",
			}),
		[locale]
	);
	const legendItems = useMemo(
		() =>
			parts.map(({ id, label, share, tone, value }) => ({
				id: `part-${id}`,
				label: <span {...props(partToWholeStyles.label)}>{label}</span>,
				tone,
				value: (
					<>
						{formatNumber(value, formatValue)}{" "}
						<span {...props(partToWholeStyles.share)}>
							{shareFormat.format(share)}
						</span>
					</>
				),
			})),
		[formatValue, parts, shareFormat]
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
			data-slot="part-to-whole"
			ref={forwardedRef}
			{...props(partToWholeStyles.root)}
		>
			{parts.length === 0 || !hasPositivePart ? (
				<>
					<p
						aria-label={ariaLabel}
						role="status"
						{...props(typeRoles.body, partToWholeStyles.empty)}
					>
						{parts.length === 0
							? "No parts available."
							: "All parts have a value of zero."}
					</p>
					{parts.length > 0 ? (
						<ChartLegend
							aria-label={`${ariaLabel} parts`}
							items={legendItems}
							variant="rows"
						/>
					) : null}
				</>
			) : (
				<PartToWholeChart
					aria-description={ariaDescription}
					aria-label={ariaLabel}
					formatValue={formatValue}
					legendItems={legendItems}
					parts={parts}
					shareFormat={shareFormat}
					totalLabel={totalLabel}
				/>
			)}
		</div>
	);
}
