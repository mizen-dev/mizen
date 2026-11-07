import { create, props, type StyleXStyles } from "@stylexjs/stylex";
import type { PointerEventHandler } from "react";
import { conditions } from "../../styles/conditions.stylex";
import { duration, easing } from "../../styles/motion.stylex";
import { arcPath } from "./arc-path";
import { type ChartSeriesTone, chartColors } from "./chart-colors";

/** Optional hover wiring from `useChartHover`. */
export interface RingGraphicHover {
	fade: (id: string) => readonly (StyleXStyles | false)[];
	markProps: (id: string) => {
		onPointerLeave: PointerEventHandler;
		onPointerMove: PointerEventHandler;
	};
}

export interface RingGraphicRing {
	/** The filled share of the track, from 0 to 1. */
	fraction: number;
	id: string;
	tone: ChartSeriesTone;
}

// The track is the ring's own hue, quiet enough that the fill reads first.
const TRACK_OPACITY = 0.18;

const styles = create({
	// The fill is a dash on the whole track, so a new value glides along it.
	fill: {
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.disclosure,
		},
		transitionProperty: "stroke-dasharray, opacity",
		transitionTimingFunction: easing.expoOut,
	},
	svg: { display: "block", flexShrink: 0, overflow: "visible" },
});

/**
 * Concentric rounded arcs, outermost first, each over a track of the same
 * hue. `sweep` is how much of the circle a full track covers, in turns.
 */
export function RingGraphic({
	diameter,
	gap,
	hover,
	rings,
	stroke,
	sweep = 1,
}: {
	diameter: number;
	gap: number;
	hover?: RingGraphicHover;
	rings: readonly RingGraphicRing[];
	stroke: number;
	sweep?: number;
}) {
	const center = diameter / 2;
	return (
		<svg
			aria-hidden="true"
			height={diameter}
			viewBox={`0 0 ${diameter} ${diameter}`}
			width={diameter}
			{...props(styles.svg)}
		>
			{rings.map(({ fraction, id, tone }, index) => {
				const radius = center - stroke / 2 - index * (stroke + gap);
				const color = chartColors[tone];
				const fill = Math.min(Math.max(fraction, 0), 1) * sweep;
				return (
					<g
						fill="none"
						key={id}
						strokeLinecap="round"
						strokeWidth={stroke}
						{...hover?.markProps(id)}
						{...(hover ? props(...hover.fade(id)) : null)}
					>
						<path
							d={arcPath(center, center, radius, 0, sweep)}
							stroke={color}
							strokeOpacity={TRACK_OPACITY}
						/>
						{/* An empty ring hides its fill: a round cap would leave a dot. */}
						<path
							d={arcPath(center, center, radius, 0, sweep)}
							opacity={fill > 0 ? 1 : 0}
							pathLength={sweep}
							stroke={color}
							strokeDasharray={`${fill} ${sweep + 1}`}
							{...props(styles.fill)}
						/>
					</g>
				);
			})}
		</svg>
	);
}
