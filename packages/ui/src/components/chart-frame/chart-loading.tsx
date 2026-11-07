"use client";

import { create, keyframes, props } from "@stylexjs/stylex";
import { useState } from "react";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { duration, easing } from "../../styles/motion.stylex";
import { visuallyHiddenStyles } from "../visually-hidden/visually-hidden.styles";

/** Whether a chart's data is still on its way. */
export type ChartStatus = "loading" | "ready";

const pulse = keyframes({
	"0%, 100%": { opacity: 0.45 },
	"50%": { opacity: 1 },
});

const wipe = keyframes({
	from: { clipPath: "inset(0 100% 0 0)" },
	to: { clipPath: "inset(0 0 0 0)" },
});

const wipeRtl = keyframes({
	from: { clipPath: "inset(0 0 0 100%)" },
	to: { clipPath: "inset(0 0 0 0)" },
});

const fade = keyframes({
	from: { opacity: 0 },
	to: { opacity: 1 },
});

const styles = create({
	area: { fill: colors.chartReference, fillOpacity: 0.14 },
	frame: (height: number) => ({ blockSize: height, position: "relative" }),
	grid: { stroke: colors.chartReference, strokeOpacity: 0.35 },
	line: { fill: "none", stroke: colors.chartReference, strokeOpacity: 0.45 },
	silhouette: {
		animationDuration: "1.6s",
		animationIterationCount: "infinite",
		animationName: { [conditions.reducedMotion]: "none", default: pulse },
		animationTimingFunction: easing.easeInOut,
	},
	svg: { blockSize: "100%", display: "block", inlineSize: "100%" },
});

/** The plot of a chart whose data replaced its loading state wipes in. */
export const chartRevealStyles = create({
	reveal: {
		animationDuration: {
			[conditions.reducedMotion]: duration.fast,
			default: "700ms",
		},
		animationFillMode: "both",
		animationName: {
			":dir(rtl)": wipeRtl,
			[conditions.reducedMotion]: fade,
			default: wipe,
		},
		animationTimingFunction: easing.expoOut,
	},
});

/**
 * True once data arrives after a loading state, so the plot can reveal. A
 * chart that starts ready shows at once. State updates during render, so no
 * effect is needed.
 */
export function useLoadingReveal(status: ChartStatus): boolean {
	const [sawLoading, setSawLoading] = useState(status === "loading");
	if (status === "loading" && !sawLoading) {
		setSawLoading(true);
	}
	return sawLoading && status === "ready";
}

// A gentle rise across the plot reads as a chart without implying values.
const LINE = "M0 30 C15 26 25 20 40 22 S65 12 80 14 S95 8 100 9";
const AREA = `${LINE} L100 40 L0 40 Z`;
const GRID_ROWS = [4, 16, 28, 40];

/** A placeholder at the chart's own height while its data loads. */
export function ChartLoading({
	grid = true,
	height,
}: {
	grid?: boolean;
	height: number;
}) {
	return (
		<div
			data-slot="chart-loading"
			role="status"
			{...props(styles.frame(height))}
		>
			<svg
				aria-hidden="true"
				focusable="false"
				preserveAspectRatio="none"
				viewBox="0 0 100 40"
				{...props(styles.svg)}
			>
				{grid
					? GRID_ROWS.map((y) => (
							<line
								key={y}
								strokeDasharray="3 3"
								vectorEffect="non-scaling-stroke"
								x1="0"
								x2="100"
								y1={y}
								y2={y}
								{...props(styles.grid)}
							/>
						))
					: null}
				<g {...props(styles.silhouette)}>
					<path d={AREA} {...props(styles.area)} />
					<path
						d={LINE}
						strokeWidth={2}
						vectorEffect="non-scaling-stroke"
						{...props(styles.line)}
					/>
				</g>
			</svg>
			<span {...props(visuallyHiddenStyles.root)}>Loading chart</span>
		</div>
	);
}
