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
import { assertTone } from "../chart-frame/chart-assert";
import type { ChartSeriesTone } from "../chart-frame/chart-colors";
import { ChartDataTable } from "../chart-frame/chart-data-table";
import { ChartFrame } from "../chart-frame/chart-frame";
import { ChartTooltip } from "../chart-tooltip/chart-tooltip";
import {
	COLOR_DOMAIN,
	colorRange,
	getBucket,
	HeatmapLegend,
} from "../heatmap/heatmap-scale";
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

export interface CalendarHeatmapDay {
	/** A calendar date as YYYY-MM-DD, free of time zones. */
	date: string;
	value: number | null;
}

export type CalendarHeatmapProps = Omit<
	Closed<ComponentPropsWithRef<"div">>,
	"aria-label" | "children" | "data-slot" | "role"
> & {
	"aria-label": string;
	days: readonly CalendarHeatmapDay[];
	formatValue?: (value: number) => string;
	locale?: string;
	tone?: ChartSeriesTone;
	valueLabel?: string;
	/** 0 starts weeks on Sunday, 1 on Monday. */
	weekStartsOn?: 0 | 1;
};

interface CalendarCell {
	colorKey: "missing" | number;
	date: Date;
	id: string;
	value: number | null;
	week: string;
	weekday: string;
}

const NAME = "CalendarHeatmap";
const DAY = 86_400_000;
// The grid fills its container with near-square days, laid out at a 16px
// pitch; below a 12px pitch it scrolls instead of shrinking further. The
// gutter holds weekday labels and the axis holds month labels.
const PITCH = 16;
const MIN_PITCH = 12;
const GUTTER = 40;
const AXIS = 24;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const styles = create({
	plot: (minInlineSize: number) => ({ minInlineSize }),
	root: { minWidth: 0 },
	scroller: { overflowX: "auto" },
});

function parseDate(date: string): number {
	const [year, month, day] = date.split("-").map(Number);
	const time = Date.UTC(year, month - 1, day);
	if (!DATE_PATTERN.test(date) || new Date(time).getUTCDate() !== day) {
		throw new RangeError(`${NAME} dates must be valid YYYY-MM-DD strings.`);
	}
	return time;
}

function prepareDays(days: readonly CalendarHeatmapDay[]) {
	if (!Array.isArray(days)) {
		throw new TypeError(`${NAME} days must be an array.`);
	}
	const values = new Map<number, number | null>();
	for (const { date, value } of days) {
		const time = parseDate(date);
		if (values.has(time)) {
			throw new RangeError(`${NAME} dates must be unique.`);
		}
		if (value !== null && !(Number.isFinite(value) && value >= 0)) {
			throw new RangeError(`${NAME} values must be finite and not negative.`);
		}
		values.set(time, value);
	}
	return values;
}

function weekdayLabels(locale: string, weekStartsOn: 0 | 1) {
	const format = new Intl.DateTimeFormat(locale, {
		timeZone: "UTC",
		weekday: "short",
	});
	// 2023-01-01 was a Sunday.
	return Array.from({ length: 7 }, (_, index) =>
		format.format(Date.UTC(2023, 0, 1 + ((index + weekStartsOn) % 7)))
	);
}

function buildCells(
	values: Map<number, number | null>,
	weekdays: readonly string[],
	weekStartsOn: 0 | 1
) {
	const times = [...values.keys()];
	const first = Math.min(...times);
	const last = Math.max(...times);
	const lead = (new Date(first).getUTCDay() - weekStartsOn + 7) % 7;
	const maximum = Math.max(
		0,
		...[...values.values()].map((value) => value ?? 0)
	);
	const cells: CalendarCell[] = [];
	for (let time = first; time <= last; time += DAY) {
		const index = Math.round((time - first) / DAY) + lead;
		const value = values.get(time) ?? null;
		cells.push({
			colorKey: value === null ? "missing" : getBucket(value, maximum),
			date: new Date(time),
			id: String(time),
			value,
			week: String(Math.floor(index / 7)),
			weekday: weekdays[index % 7],
		});
	}
	return {
		cells,
		maximum,
		weeks: Math.floor((lead + cells.length - 1) / 7) + 1,
	};
}

// A week column shows its month's name when the month's first day falls in it.
function monthLabels(cells: readonly CalendarCell[], locale: string) {
	const format = new Intl.DateTimeFormat(locale, {
		month: "short",
		timeZone: "UTC",
	});
	const labels = new Map<string, string>();
	for (const { date, week } of cells) {
		if (date.getUTCDate() === 1 || cells[0].date === date) {
			labels.set(week, format.format(date));
		}
	}
	return labels;
}

function renderTooltip(
	context: ChartTooltipBodyRenderContext<CalendarCell, string, string>,
	dateFormat: Intl.DateTimeFormat,
	valueLabel: string,
	tone: ChartSeriesTone,
	format: (value: number) => string
) {
	const point = context.primaryPoint ?? context.points[0];
	if (!point) {
		return null;
	}
	const { date, value } = point.datum;
	return (
		<ChartTooltip
			items={[
				{
					id: "calendar-heatmap-value",
					label: valueLabel,
					tone,
					value: value === null ? "No data" : format(value),
				},
			]}
			label={dateFormat.format(date)}
		/>
	);
}

/** A grid of days, one column per week, shaded by each day's value. */
export function CalendarHeatmap({
	"aria-label": ariaLabel,
	days,
	formatValue,
	locale = "en-US",
	ref: forwardedRef,
	tone = "series1",
	valueLabel = "Value",
	weekStartsOn = 1,
	...rest
}: CalendarHeatmapProps) {
	if (typeof ariaLabel !== "string" || !ariaLabel.trim()) {
		throw new TypeError(`${NAME} requires a non-empty aria-label.`);
	}
	assertTone(NAME, tone);
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
	const values = useMemo(() => prepareDays(days), [days]);
	const format = formatValue ?? new Intl.NumberFormat(locale).format;

	return (
		<div
			{...rest}
			data-slot="calendar-heatmap"
			ref={forwardedRef}
			{...props(styles.root)}
		>
			{values.size === 0 ? (
				// biome-ignore lint/a11y/useSemanticElements: Names an empty chart, not a form group; the status keeps its own text.
				<div aria-label={ariaLabel} role="group">
					<p role="status" {...props(typeRoles.body)}>
						No data available.
					</p>
				</div>
			) : (
				<CalendarHeatmapPlot
					aria-label={ariaLabel}
					format={format}
					locale={locale}
					tone={tone}
					valueLabel={valueLabel}
					values={values}
					weekStartsOn={weekStartsOn}
				/>
			)}
		</div>
	);
}

function CalendarHeatmapPlot({
	"aria-label": ariaLabel,
	format,
	locale,
	tone,
	valueLabel,
	values,
	weekStartsOn,
}: {
	"aria-label": string;
	format: (value: number) => string;
	locale: string;
	tone: ChartSeriesTone;
	valueLabel: string;
	values: Map<number, number | null>;
	weekStartsOn: 0 | 1;
}) {
	const weekdays = useMemo(
		() => weekdayLabels(locale, weekStartsOn),
		[locale, weekStartsOn]
	);
	const { cells, maximum, weeks } = useMemo(
		() => buildCells(values, weekdays, weekStartsOn),
		[values, weekdays, weekStartsOn]
	);
	const definition = useMemo(() => {
		const months = monthLabels(cells, locale);
		return defineChart(
			{
				color: { domain: COLOR_DOMAIN, range: colorRange(tone) },
				marks: [
					cell(cells, {
						color: "colorKey",
						id: "calendar-heatmap-days",
						inset: 1.5,
						key: ({ id }) => id,
						radius: 3,
						x: "week",
						y: "weekday",
					}),
				],
				scales: {
					x: {
						// Labels are already sparse (one per month), so none are thinned.
						axis: {
							tickLabels: { thin: false },
							ticks: { format: (week: string) => months.get(week) ?? "" },
						},
						scale: scaleBand<string>()
							.domain(
								Array.from({ length: weeks }, (_, index) => String(index))
							)
							.padding(0),
					},
					y: {
						// Alternate weekday labels keep the gutter readable.
						axis: {
							tickLabels: { thin: false },
							ticks: {
								format: (day: string) =>
									weekdays.indexOf(day) % 2 === 0 ? day : "",
							},
						},
						scale: scaleBand<string>().domain(weekdays).padding(0),
					},
				},
			},
			{ tooltip: tooltipFeature }
		);
	}, [cells, locale, tone, weekdays, weeks]);
	const dateFormat = useMemo(
		() =>
			new Intl.DateTimeFormat(locale, {
				day: "numeric",
				month: "short",
				timeZone: "UTC",
				weekday: "short",
				year: "numeric",
			}),
		[locale]
	);
	const renderTooltipBody = useMemo(
		() =>
			(context: ChartTooltipBodyRenderContext<CalendarCell, string, string>) =>
				renderTooltip(context, dateFormat, valueLabel, tone, format),
		[dateFormat, format, tone, valueLabel]
	);
	const inlineSize = weeks * PITCH + GUTTER;

	return (
		<>
			<div {...props(styles.scroller)}>
				<div {...props(styles.plot(weeks * MIN_PITCH + GUTTER))}>
					<ChartFrame
						aria-label={ariaLabel}
						aspectRatio={inlineSize / (7 * PITCH + AXIS)}
						definition={definition}
						initialWidth={inlineSize}
						renderTooltipBody={renderTooltipBody}
						tabIndex={0}
					/>
				</div>
			</div>
			<HeatmapLegend
				high={format(maximum)}
				tone={tone}
				valueLabel={valueLabel}
			/>
			<ChartDataTable>
				<TableContainer aria-label={`${ariaLabel} data`}>
					<Table>
						<TableCaption>{ariaLabel} values</TableCaption>
						<TableHeader sticky={false}>
							<TableRow>
								<TableHead scope="col">Date</TableHead>
								<TableHead scope="col">{valueLabel}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{cells
								.filter(({ value }) => value !== null)
								.map(({ date, id, value }) => (
									<TableRow key={id}>
										<TableHead scope="row">{dateFormat.format(date)}</TableHead>
										<TableCell numeric>{format(value ?? 0)}</TableCell>
									</TableRow>
								))}
						</TableBody>
					</Table>
				</TableContainer>
			</ChartDataTable>
		</>
	);
}
