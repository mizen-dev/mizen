"use client";

import { create, props } from "@stylexjs/stylex";
import { cell, defineChart } from "@tanstack/charts";
import type { ChartTooltipBodyRenderContext } from "@tanstack/charts/react/tooltip";
import { scaleBand } from "@tanstack/charts/scales/band";
import { tooltip as tooltipFeature } from "@tanstack/charts/tooltip";
import type { ComponentPropsWithRef } from "react";
import { useMemo } from "react";
import type { Closed } from "../../closed";
import { typeRoles } from "../../styles/typography.styles";
import { type ChartSeriesTone, chartColors } from "../chart-frame/chart-colors";
import { ChartDataTable } from "../chart-frame/chart-data-table";
import { ChartFrame } from "../chart-frame/chart-frame";
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
import {
	COLOR_DOMAIN,
	colorRange,
	getBucket,
	HeatmapLegend,
} from "./heatmap-scale";

export interface HeatmapRow {
	label: string;
	values: readonly (number | null)[];
}

export type HeatmapProps = Omit<
	Closed<ComponentPropsWithRef<"div">>,
	"aria-label" | "children" | "data-slot" | "role"
> & {
	"aria-label": string;
	columns: readonly string[];
	formatValue?: (value: number) => string;
	max?: number;
	rows: readonly HeatmapRow[];
	tone?: ChartSeriesTone;
	valueLabel?: string;
};

interface HeatmapCell {
	colorKey: "missing" | number;
	column: string;
	row: string;
	value: number | null;
}

const styles = create({
	// Cells stay compact: each column gets at most 2.25rem, plus room for row labels.
	plot: (columnCount: number) => ({
		maxInlineSize: `calc(${columnCount} * 2.25rem + 6rem)`,
	}),
	root: { minWidth: 0 },
});

function requireLabel(label: string, name: string, seen: Set<string>) {
	if (typeof label !== "string" || !label.trim()) {
		throw new TypeError(`Heatmap ${name} labels must be non-empty strings.`);
	}
	if (seen.has(label)) {
		throw new RangeError(`Heatmap ${name} labels must be unique.`);
	}
	seen.add(label);
}

function assertUniqueLabels(labels: readonly string[], name: string) {
	const seen = new Set<string>();
	for (const label of labels) {
		requireLabel(label, name, seen);
	}
}

function isArray(value: unknown): boolean {
	return Array.isArray(value);
}

function assertRows(rows: readonly HeatmapRow[], columnCount: number) {
	const seen = new Set<string>();
	for (const row of rows) {
		requireLabel(row?.label, "row", seen);
		if (!isArray(row.values) || row.values.length !== columnCount) {
			throw new RangeError("Heatmap rows must match the column count.");
		}
	}
}

function assertValues(rows: readonly HeatmapRow[]) {
	let maximum = 0;
	for (const row of rows) {
		for (const value of row.values) {
			if (value === null) {
				continue;
			}
			if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
				throw new RangeError(
					"Heatmap values must be finite non-negative numbers or null."
				);
			}
			maximum = Math.max(maximum, value);
		}
	}
	return maximum;
}

function assertMaximum(max: number | undefined) {
	if (
		max !== undefined &&
		(typeof max !== "number" || !Number.isFinite(max) || max < 0)
	) {
		throw new RangeError("Heatmap max must be a finite non-negative number.");
	}
}

function prepareCells(
	columns: readonly string[],
	rows: readonly HeatmapRow[],
	max: number | undefined
) {
	if (!(isArray(columns) && isArray(rows))) {
		throw new TypeError("Heatmap columns and rows must be arrays.");
	}
	assertMaximum(max);
	assertUniqueLabels(columns, "column");
	assertRows(rows, columns.length);
	const observedMax = assertValues(rows);
	const maximum = max ?? observedMax;
	if (max === 0 && observedMax > 0) {
		throw new RangeError(
			"Heatmap max must be greater than zero when values are positive."
		);
	}
	return {
		cells: rows.flatMap(({ label, values }) =>
			values.map((value, index) => {
				const colorKey: HeatmapCell["colorKey"] =
					value === null ? "missing" : getBucket(value, maximum);
				return { colorKey, column: columns[index], row: label, value };
			})
		),
		maximum,
	};
}

function formatValue(
	value: number,
	formatter: ((value: number) => string) | undefined
) {
	const formatted = formatter ? formatter(value) : String(value);
	if (typeof formatted !== "string") {
		throw new TypeError("Heatmap formatValue must return a string.");
	}
	return formatted;
}

function assertProps(
	ariaLabel: string,
	valueLabel: string,
	formatter: ((value: number) => string) | undefined,
	tone: ChartSeriesTone
) {
	if (
		typeof ariaLabel !== "string" ||
		!ariaLabel.trim() ||
		typeof valueLabel !== "string" ||
		!valueLabel.trim()
	) {
		throw new TypeError(
			"Heatmap requires non-empty aria-label and valueLabel strings."
		);
	}
	if (formatter !== undefined && typeof formatter !== "function") {
		throw new TypeError("Heatmap formatValue must be a function.");
	}
	if (!Object.hasOwn(chartColors, tone)) {
		throw new RangeError("Heatmap tone is not supported.");
	}
}

function stripReservedProps(attributes: Record<string, unknown>) {
	for (const name of [
		"aria-label",
		"children",
		"className",
		"data-slot",
		"role",
		"style",
	]) {
		Reflect.deleteProperty(attributes, name);
	}
}

function renderTooltip(
	context: ChartTooltipBodyRenderContext<HeatmapCell, string, string>,
	valueLabel: string,
	tone: ChartSeriesTone,
	formatter: ((value: number) => string) | undefined
) {
	const point = context.primaryPoint ?? context.points[0];
	if (!point) {
		return null;
	}
	const { column, row, value } = point.datum;
	return (
		<ChartTooltip
			items={[
				{
					id: "heatmap-value",
					label: valueLabel,
					tone,
					value: value === null ? "No data" : formatValue(value, formatter),
				},
			]}
			label={`${row} · ${column}`}
		/>
	);
}

function HeatmapTable({
	"aria-label": ariaLabel,
	columns,
	formatValue: formatter,
	rows,
}: Pick<HeatmapProps, "aria-label" | "columns" | "formatValue" | "rows">) {
	return (
		<ChartDataTable>
			<TableContainer aria-label={`${ariaLabel} data`}>
				<Table>
					<TableCaption>{ariaLabel} values</TableCaption>
					<TableHeader sticky={false}>
						<TableRow>
							<TableHead scope="col">Row</TableHead>
							{columns.map((column) => (
								<TableHead key={column}>{column}</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{rows.map(({ label, values }) => (
							<TableRow key={label}>
								<TableHead scope="row">{label}</TableHead>
								{values.map((value, index) => (
									<TableCell key={columns[index]} numeric>
										{value === null ? (
											"No data"
										) : (
											<data value={value}>{formatValue(value, formatter)}</data>
										)}
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</ChartDataTable>
	);
}

function HeatmapChart({
	"aria-label": ariaLabel,
	columns,
	cells,
	formatValue: formatter,
	maximum,
	rows,
	tone,
	valueLabel,
}: {
	"aria-label": string;
	columns: readonly string[];
	cells: readonly HeatmapCell[];
	formatValue?: (value: number) => string;
	maximum: number;
	rows: readonly HeatmapRow[];
	tone: ChartSeriesTone;
	valueLabel: string;
}) {
	const definition = useMemo(
		() =>
			defineChart(
				{
					color: { domain: COLOR_DOMAIN, range: colorRange(tone) },
					marks: [
						cell(cells, {
							color: "colorKey",
							id: "heatmap-cells",
							inset: 1.5,
							key: ({ row, column }) => JSON.stringify([row, column]),
							radius: 4,
							x: "column",
							y: "row",
						}),
					],
					scales: {
						x: {
							scale: scaleBand<string>()
								.domain(columns)
								.paddingInner(0.1)
								.paddingOuter(0),
						},
						y: {
							scale: scaleBand<string>()
								.domain(rows.map(({ label }) => label))
								.paddingInner(0.1)
								.paddingOuter(0),
						},
					},
				},
				{ tooltip: tooltipFeature }
			),
		[cells, columns, rows, tone]
	);
	const renderTooltipBody = useMemo(
		() =>
			(context: ChartTooltipBodyRenderContext<HeatmapCell, string, string>) =>
				renderTooltip(context, valueLabel, tone, formatter),
		[formatter, tone, valueLabel]
	);

	return (
		<div {...props(styles.plot(columns.length))}>
			<ChartFrame
				aria-label={ariaLabel}
				definition={definition}
				height={rows.length * 30 + 40}
				renderTooltipBody={renderTooltipBody}
				tabIndex={0}
			/>
			<HeatmapLegend
				high={formatValue(maximum, formatter)}
				tone={tone}
				valueLabel={valueLabel}
			/>
		</div>
	);
}

export function Heatmap({
	"aria-label": ariaLabel,
	columns,
	formatValue: formatter,
	max,
	ref: forwardedRef,
	rows,
	tone = "series1",
	valueLabel = "Value",
	...rest
}: HeatmapProps) {
	assertProps(ariaLabel, valueLabel, formatter, tone);
	const { cells, maximum } = useMemo(
		() => prepareCells(columns, rows, max),
		[columns, max, rows]
	);
	stripReservedProps(rest);

	return (
		<div
			{...rest}
			data-slot="heatmap"
			ref={forwardedRef}
			{...props(styles.root)}
		>
			{rows.length === 0 || columns.length === 0 ? (
				// biome-ignore lint/a11y/useSemanticElements: Names an empty chart, not a form group; the status keeps its own text.
				<div aria-label={ariaLabel} role="group">
					<p role="status" {...props(typeRoles.body)}>
						No data available.
					</p>
				</div>
			) : (
				<>
					<HeatmapChart
						aria-label={ariaLabel}
						cells={cells}
						columns={columns}
						formatValue={formatter}
						maximum={maximum}
						rows={rows}
						tone={tone}
						valueLabel={valueLabel}
					/>
					<HeatmapTable
						aria-label={ariaLabel}
						columns={columns}
						formatValue={formatter}
						rows={rows}
					/>
				</>
			)}
		</div>
	);
}
