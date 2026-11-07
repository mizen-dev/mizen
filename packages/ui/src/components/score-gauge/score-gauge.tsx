"use client";

import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import type { Closed } from "../../closed";
import { typeRoles } from "../../styles/typography.styles";
import { arcPath } from "../chart-frame/arc-path";
import {
	assertAriaLabel,
	assertIdentity,
	assertNonNegative,
	assertTone,
} from "../chart-frame/chart-assert";
import { type ChartSeriesTone, chartColors } from "../chart-frame/chart-colors";
import { ChartHoverTooltip, useChartHover } from "../chart-frame/chart-hover";
import type { RingGraphicHover } from "../chart-frame/ring-graphic";
import { scoreGaugeStyles as styles } from "./score-gauge.styles";

export interface ScoreGaugePart {
	/** Supporting context after the label, such as "7h 50m". */
	detail?: string;
	id: string;
	label: string;
	/** The most this part can contribute; its arc spans this share of the ring. */
	max: number;
	tone?: ChartSeriesTone;
	value: number;
}

export type ScoreGaugeProps = Omit<
	Closed<ComponentPropsWithRef<"figure">>,
	"aria-label" | "children" | "data-slot" | "role"
> & {
	"aria-label": string;
	locale?: string;
	/** Up to six parts; the score is the sum of their values. */
	parts: readonly ScoreGaugePart[];
};

const NAME = "ScoreGauge";
const TONES = [
	"series1",
	"series2",
	"series3",
	"series4",
	"series5",
	"series6",
] as const;
const DIAMETER = 128;
const STROKE = 14;
// Surface gap between segments, in pixels, measured past the round caps.
const GAP = 4;
const TRACK_OPACITY = 0.18;

function assertParts(parts: readonly ScoreGaugePart[]) {
	if (
		!Array.isArray(parts) ||
		parts.length === 0 ||
		parts.length > TONES.length
	) {
		throw new RangeError("ScoreGauge needs one to six parts.");
	}
	const ids = new Set<string>();
	for (const part of parts) {
		assertIdentity(NAME, part, ids);
		assertNonNegative(NAME, part.value);
		if (
			!(Number.isFinite(part.max) && part.max > 0 && part.value <= part.max)
		) {
			throw new RangeError(
				"ScoreGauge parts need a positive max of at least value."
			);
		}
		assertTone(NAME, part.tone);
	}
}

// Each part's arc in turns: its share of the total, less half a gap at each end.
function partRanges(maxes: readonly number[], gapTurns: number) {
	const total = maxes.reduce((sum, max) => sum + max, 0);
	let start = 0;
	return maxes.map((max) => {
		const from = start + gapTurns / 2;
		start += max / total;
		return { from, to: Math.max(from, start - gapTurns / 2) };
	});
}

function Segments({
	hover,
	parts,
}: {
	hover: RingGraphicHover;
	parts: readonly (ScoreGaugePart & { tone: ChartSeriesTone })[];
}) {
	const center = DIAMETER / 2;
	const radius = center - STROKE / 2;
	// Round caps reach half a stroke past each end, so the gap includes them.
	const gapTurns =
		parts.length > 1 ? (GAP + STROKE) / (2 * Math.PI * radius) : 0;
	const ranges = partRanges(
		parts.map(({ max }) => max),
		gapTurns
	);
	return (
		<svg
			aria-hidden="true"
			height={DIAMETER}
			viewBox={`0 0 ${DIAMETER} ${DIAMETER}`}
			width={DIAMETER}
			{...props(styles.svg)}
		>
			{parts.map(({ id, max, tone, value }, index) => {
				const { from, to } = ranges[index];
				const color = chartColors[tone];
				return (
					<g
						fill="none"
						key={id}
						strokeLinecap="round"
						strokeWidth={STROKE}
						{...hover.markProps(id)}
						{...props(...hover.fade(id))}
					>
						<path
							d={arcPath(center, center, radius, from, to)}
							stroke={color}
							strokeOpacity={TRACK_OPACITY}
						/>
						{value > 0 ? (
							<path
								d={arcPath(
									center,
									center,
									radius,
									from,
									from + (to - from) * (value / max)
								)}
								stroke={color}
							/>
						) : null}
					</g>
				);
			})}
		</svg>
	);
}

/**
 * A score built from parts: a segmented ring around the total, with each
 * part's points below it.
 */
export function ScoreGauge({
	"aria-label": ariaLabel,
	locale = "en-US",
	parts: inputParts,
	ref: forwardedRef,
	...rest
}: ScoreGaugeProps) {
	assertAriaLabel(NAME, ariaLabel);
	assertParts(inputParts);
	for (const name of ["children", "className", "data-slot", "role", "style"]) {
		Reflect.deleteProperty(rest, name);
	}
	const { format } = new Intl.NumberFormat(locale);
	const parts = inputParts.map((part, index) => ({
		...part,
		tone: part.tone ?? TONES[index],
	}));
	const hover = useChartHover();
	const { fade, hostRef, hostStyle, linkProps, markProps } = hover;
	// Hovering a segment shows its points; hovering a row lights its segment.
	const tips = new Map(
		parts.map(({ id, label, max: partMax, tone, value }) => [
			id,
			{
				items: [
					{ id, label, tone, value: `${format(value)}/${format(partMax)}` },
				],
			},
		])
	);
	const segmentHover = {
		fade,
		markProps: (id: string) => markProps(id, tips.get(id)),
	};
	const score = parts.reduce((sum, { value }) => sum + value, 0);
	const max = parts.reduce((sum, part) => sum + part.max, 0);

	return (
		<figure
			{...rest}
			aria-label={ariaLabel}
			data-slot="score-gauge"
			ref={forwardedRef}
			{...props(styles.root, typeRoles.ui)}
		>
			<div ref={hostRef} {...props(styles.figure, hostStyle)}>
				<Segments hover={segmentHover} parts={parts} />
				<span data-slot="score-gauge-score" {...props(styles.score)}>
					<span {...props(typeRoles.title)}>{format(score)}</span>
					<span {...props(styles.detail, typeRoles.caption)}>
						of {format(max)}
					</span>
				</span>
				<ChartHoverTooltip hover={hover.hover} />
			</div>
			<ul {...props(styles.list)}>
				{parts.map(({ detail, id, label, max: partMax, tone, value }) => (
					<li
						data-slot="score-gauge-part"
						key={id}
						{...linkProps(id)}
						{...props(styles.row, ...fade(id))}
					>
						<span {...props(styles.label)}>
							<span
								aria-hidden="true"
								{...props(styles.swatch(chartColors[tone]))}
							/>
							<span>
								{label}
								{detail ? (
									<span {...props(styles.detail)}>: {detail}</span>
								) : null}
							</span>
						</span>
						<span {...props(styles.value)}>
							{format(value)}/{format(partMax)}
						</span>
					</li>
				))}
			</ul>
		</figure>
	);
}
