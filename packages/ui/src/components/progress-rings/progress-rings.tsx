"use client";

import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import type { Closed } from "../../closed";
import { typeRoles } from "../../styles/typography.styles";
import {
	assertAriaLabel,
	assertIdentity,
	assertNonNegative,
	assertTone,
} from "../chart-frame/chart-assert";
import { type ChartSeriesTone, chartColors } from "../chart-frame/chart-colors";
import { ChartHoverTooltip, useChartHover } from "../chart-frame/chart-hover";
import { RingGraphic } from "../chart-frame/ring-graphic";
import { visuallyHiddenStyles } from "../visually-hidden/visually-hidden.styles";
import { progressRingsStyles as styles } from "./progress-rings.styles";

export interface ProgressRing {
	/** Shown instead of the formatted value, such as "1h 45m". */
	display?: string;
	goal: number;
	id: string;
	label: string;
	/** Defaults to the ring's position in the palette order. */
	tone?: ChartSeriesTone;
	value: number;
}

export type ProgressRingsSize = "md" | "sm";

export type ProgressRingsProps = Omit<
	Closed<ComponentPropsWithRef<"figure">>,
	"aria-label" | "children" | "data-slot" | "role"
> & {
	"aria-label": string;
	formatValue?: (value: number) => string;
	locale?: string;
	/** Up to three rings, outermost first. */
	rings: readonly ProgressRing[];
	/** sm is a 32px glyph for dense grids such as a calendar; it shows no tiles. */
	size?: ProgressRingsSize;
};

const NAME = "ProgressRings";
const TONES = ["series1", "series2", "series3"] as const;
const GEOMETRY = {
	md: { diameter: 176, gap: 4, stroke: 16 },
	sm: { diameter: 32, gap: 1, stroke: 3 },
} as const;

function assertRings(rings: readonly ProgressRing[]) {
	if (!Array.isArray(rings) || rings.length === 0 || rings.length > 3) {
		throw new RangeError("ProgressRings needs one to three rings.");
	}
	const ids = new Set<string>();
	for (const ring of rings) {
		assertIdentity(NAME, ring, ids);
		assertNonNegative(NAME, ring.value);
		if (!(Number.isFinite(ring.goal) && ring.goal > 0)) {
			throw new RangeError("ProgressRings goals must be positive.");
		}
		assertTone(NAME, ring.tone);
	}
}

/** Up to three concentric rings, each showing progress toward its own goal. */
export function ProgressRings({
	"aria-label": ariaLabel,
	formatValue,
	locale = "en-US",
	ref: forwardedRef,
	rings: inputRings,
	size = "md",
	...rest
}: ProgressRingsProps) {
	assertAriaLabel(NAME, ariaLabel);
	assertRings(inputRings);
	for (const name of ["children", "className", "data-slot", "role", "style"]) {
		Reflect.deleteProperty(rest, name);
	}
	const format = formatValue ?? new Intl.NumberFormat(locale).format;
	const percent = new Intl.NumberFormat(locale, { style: "percent" });
	const rings = inputRings.map((ring, index) => ({
		...ring,
		tone: ring.tone ?? TONES[index],
	}));
	const compact = size === "sm";
	const hover = useChartHover();
	const { fade, hostRef, hostStyle, linkProps, markProps } = hover;
	// Hovering a ring shows its value and progress; hovering a tile lights its ring.
	const tips = new Map(
		rings.map(({ display, goal, id, label, tone, value }) => [
			id,
			{
				items: [
					{
						id,
						label,
						tone,
						value: `${display ?? format(value)} · ${percent.format(value / goal)}`,
					},
				],
			},
		])
	);
	const ringHover = {
		fade,
		markProps: (id: string) => markProps(id, tips.get(id)),
	};

	return (
		<figure
			{...rest}
			aria-label={ariaLabel}
			data-slot="progress-rings"
			ref={forwardedRef}
			{...props(styles.root, compact && styles.compact, typeRoles.ui)}
		>
			<ul
				{...props(
					styles.list,
					compact ? visuallyHiddenStyles.root : styles.tiles
				)}
			>
				{rings.map(({ display, goal, id, label, tone, value }) => (
					<li
						data-slot="progress-rings-item"
						key={id}
						{...linkProps(id)}
						{...props(styles.tile, ...fade(id))}
					>
						<span {...props(styles.label)}>
							<span
								aria-hidden="true"
								{...props(styles.swatch(chartColors[tone]))}
							/>
							{label}
						</span>
						<span>
							<span {...props(styles.value)}>{display ?? format(value)}</span>
							<span {...props(styles.share, typeRoles.caption)}>
								{percent.format(value / goal)}
							</span>
						</span>
					</li>
				))}
			</ul>
			<div ref={hostRef} {...props(hostStyle)}>
				<RingGraphic
					{...GEOMETRY[size]}
					hover={ringHover}
					rings={rings.map(({ goal, id, tone, value }) => ({
						fraction: value / goal,
						id,
						tone,
					}))}
				/>
				<ChartHoverTooltip hover={hover.hover} />
			</div>
		</figure>
	);
}
