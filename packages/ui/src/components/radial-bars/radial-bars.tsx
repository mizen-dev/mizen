"use client";

import { create, props } from "@stylexjs/stylex";
import { type ComponentPropsWithRef, useMemo } from "react";
import type { Closed } from "../../closed";
import { colors } from "../../styles/colors.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import { typeRoles } from "../../styles/typography.styles";
import { fontWeight } from "../../styles/typography.stylex";
import {
	assertAriaLabel,
	assertIdentity,
	assertNonNegative,
} from "../chart-frame/chart-assert";
import { type ChartSeriesTone, chartColors } from "../chart-frame/chart-colors";
import { ChartHoverTooltip, useChartHover } from "../chart-frame/chart-hover";
import { RingGraphic } from "../chart-frame/ring-graphic";

export interface RadialBarsItem {
	id: string;
	label: string;
	value: number;
}

export type RadialBarsProps = Omit<
	Closed<ComponentPropsWithRef<"figure">>,
	"aria-label" | "children" | "data-slot" | "role"
> & {
	"aria-label": string;
	formatValue?: (value: number) => string;
	/** Up to six items, drawn largest outermost. */
	items: readonly RadialBarsItem[];
	locale?: string;
};

const NAME = "RadialBars";
const TONES = [
	"series1",
	"series2",
	"series3",
	"series4",
	"series5",
	"series6",
] as const satisfies readonly ChartSeriesTone[];
const DIAMETER = 200;
const GAP = 4;
// The largest bar spans three quarters of a turn, which keeps outer rings from
// exaggerating their values as much as a full circle would.
const SWEEP = 0.75;

const styles = create({
	label: {
		alignItems: "center",
		color: colors.mutedContent,
		display: "flex",
		gap: space["2"],
		minWidth: 0,
	},
	list: {
		alignSelf: "stretch",
		display: "grid",
		gap: space["2"],
		gridTemplateColumns: "repeat(auto-fit, minmax(7rem, 1fr))",
		listStyle: "none",
		margin: 0,
		padding: 0,
	},
	root: {
		alignItems: "center",
		display: "flex",
		flexDirection: "column",
		gap: space["4"],
		margin: 0,
		minWidth: 0,
	},
	swatch: (backgroundColor: string) => ({
		backgroundColor,
		blockSize: "0.625rem",
		borderRadius: 3,
		flexShrink: 0,
		inlineSize: "0.625rem",
	}),
	tile: {
		backgroundColor: colors.surface,
		borderRadius: shape.controlRadius,
		display: "flex",
		flexDirection: "column",
		gap: space["1"],
		minWidth: 0,
		paddingBlock: space["2"],
		paddingInline: space["3"],
	},
	value: {
		color: colors.content,
		fontVariantNumeric: "tabular-nums",
		fontWeight: fontWeight.medium,
	},
});

function assertItems(items: readonly RadialBarsItem[]) {
	if (
		!Array.isArray(items) ||
		items.length === 0 ||
		items.length > TONES.length
	) {
		throw new RangeError(`${NAME} needs one to six items.`);
	}
	const ids = new Set<string>();
	for (const item of items) {
		assertIdentity(NAME, item, ids);
		assertNonNegative(NAME, item.value);
	}
}

/**
 * Concentric bars around a center, one per item, largest outermost. Read the
 * exact values in the tiles; arc length is a quick ranking, not a measure.
 */
export function RadialBars({
	"aria-label": ariaLabel,
	formatValue,
	items,
	locale = "en-US",
	ref: forwardedRef,
	...rest
}: RadialBarsProps) {
	assertAriaLabel(NAME, ariaLabel);
	assertItems(items);
	for (const name of ["children", "className", "data-slot", "role", "style"]) {
		Reflect.deleteProperty(rest, name);
	}
	const format = formatValue ?? new Intl.NumberFormat(locale).format;
	// Tones follow input order, so sorting never repaints an item.
	const ranked = items
		.map((item, index) => ({ ...item, tone: TONES[index] }))
		.sort((left, right) => right.value - left.value);
	const max = ranked[0]?.value || 1;
	const stroke = Math.min(16, (DIAMETER * 0.36) / ranked.length - GAP);
	const hover = useChartHover();
	const { fade, hostRef, hostStyle, linkProps, markProps } = hover;
	// Hovering a bar shows its value; hovering a tile lights its bar.
	const ringHover = useMemo(() => {
		const tips = new Map(
			ranked.map(({ id, label, tone, value }) => [
				id,
				{ items: [{ id, label, tone, value: format(value) }] },
			])
		);
		return { fade, markProps: (id: string) => markProps(id, tips.get(id)) };
	}, [fade, format, markProps, ranked]);

	return (
		<figure
			{...rest}
			aria-label={ariaLabel}
			data-slot="radial-bars"
			ref={forwardedRef}
			{...props(styles.root, typeRoles.ui)}
		>
			<div ref={hostRef} {...props(hostStyle)}>
				<RingGraphic
					diameter={DIAMETER}
					gap={GAP}
					hover={ringHover}
					rings={ranked.map(({ id, tone, value }) => ({
						fraction: value / max,
						id,
						tone,
					}))}
					stroke={stroke}
					sweep={SWEEP}
				/>
				<ChartHoverTooltip hover={hover.hover} />
			</div>
			<ul {...props(styles.list)}>
				{items.map(({ id, label, value }, index) => (
					<li
						data-slot="radial-bars-item"
						key={id}
						{...linkProps(id)}
						{...props(styles.tile, ...fade(id))}
					>
						<span {...props(styles.label)}>
							<span
								aria-hidden="true"
								{...props(styles.swatch(chartColors[TONES[index]]))}
							/>
							{label}
						</span>
						<span {...props(styles.value)}>{format(value)}</span>
					</li>
				))}
			</ul>
		</figure>
	);
}
