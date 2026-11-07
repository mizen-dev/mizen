"use client";

import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef, ReactNode } from "react";
import type { Closed } from "../../closed";
import { typeRoles } from "../../styles/typography.styles";
import { type ChartSeriesTone, chartColors } from "../chart-frame/chart-colors";
import { useChartHover } from "../chart-frame/chart-hover";
import { barListStyles } from "./bar-list.styles";

export interface BarListItem {
	/** A decorative glyph before the label, such as a device icon. */
	icon?: ReactNode;
	id: string;
	label: string;
	value: number;
}

export type BarListProps = Omit<
	Closed<ComponentPropsWithRef<"div">>,
	"aria-label" | "children" | "data-slot" | "role"
> & {
	"aria-label": string;
	formatValue?: (value: number) => string;
	items: readonly BarListItem[];
	locale?: string;
	/** One hue for every bar. By default each item takes its palette color. */
	tone?: ChartSeriesTone;
	/** A column caption above the values, such as "Visitors". */
	valueLabel?: string;
};

// Tinted enough to read as a bar, light enough to keep the label legible on it.
const TINT = "20%";
const PALETTE = [
	"series1",
	"series2",
	"series3",
	"series4",
	"series5",
	"series6",
] as const satisfies readonly ChartSeriesTone[];

// Items take palette colors in input order, so sorting never repaints one; past
// six, they fold into the neutral reference tone instead of cycling.
function toneAt(
	index: number,
	tone: ChartSeriesTone | undefined
): ChartSeriesTone {
	return tone ?? PALETTE[index] ?? "muted";
}

function tintOf(tone: ChartSeriesTone) {
	return `color-mix(in oklch, ${chartColors[tone]} ${TINT}, transparent)`;
}

function assertItems(items: readonly BarListItem[]) {
	if (!Array.isArray(items)) {
		throw new TypeError("BarList items must be an array.");
	}
	const ids = new Set<string>();
	for (const { id, label, value } of items) {
		if (typeof id !== "string" || !id.trim() || typeof label !== "string") {
			throw new TypeError("BarList items require non-empty ids and labels.");
		}
		if (ids.has(id)) {
			throw new RangeError("BarList item ids must be unique.");
		}
		if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
			throw new RangeError("BarList values must be finite and not negative.");
		}
		ids.add(id);
	}
}

function assertOptions(ariaLabel: string, tone: ChartSeriesTone | undefined) {
	if (typeof ariaLabel !== "string" || !ariaLabel.trim()) {
		throw new TypeError("BarList requires a non-empty aria-label.");
	}
	if (tone !== undefined && !Object.hasOwn(chartColors, tone)) {
		throw new RangeError("BarList tone is not a supported chart series tone.");
	}
}

/** Ranked rows whose background bar shows each value against the largest. */
export function BarList({
	"aria-label": ariaLabel,
	formatValue,
	items,
	locale = "en-US",
	ref: forwardedRef,
	tone,
	valueLabel,
	...rest
}: BarListProps) {
	assertOptions(ariaLabel, tone);
	assertItems(items);
	for (const name of ["children", "className", "data-slot", "role", "style"]) {
		Reflect.deleteProperty(rest, name);
	}
	const format = formatValue ?? new Intl.NumberFormat(locale).format;
	const { fade, linkProps } = useChartHover();
	const ranked = items
		.map((item, index) => ({ ...item, tone: toneAt(index, tone) }))
		.sort((left, right) => right.value - left.value);
	const max = ranked[0]?.value || 1;

	return (
		<div
			{...rest}
			data-slot="bar-list"
			ref={forwardedRef}
			{...props(barListStyles.root, typeRoles.ui)}
		>
			{valueLabel ? (
				<div
					aria-hidden="true"
					data-slot="bar-list-header"
					{...props(barListStyles.header, typeRoles.caption)}
				>
					<span />
					<span>{valueLabel}</span>
				</div>
			) : null}
			<ul aria-label={ariaLabel} {...props(barListStyles.list)}>
				{ranked.map(({ icon, id, label, tone: itemTone, value }) => (
					<li
						data-slot="bar-list-item"
						key={id}
						{...linkProps(id)}
						{...props(barListStyles.item)}
					>
						<span
							aria-hidden="true"
							data-slot="bar-list-bar"
							{...props(
								...fade(id),
								barListStyles.bar(`${(value / max) * 100}%`, tintOf(itemTone))
							)}
						/>
						<span data-slot="bar-list-label" {...props(barListStyles.label)}>
							{icon ? (
								<span aria-hidden="true" {...props(barListStyles.icon)}>
									{icon}
								</span>
							) : null}
							{label}
						</span>
						<span data-slot="bar-list-value" {...props(barListStyles.value)}>
							{format(value)}
						</span>
					</li>
				))}
			</ul>
		</div>
	);
}
