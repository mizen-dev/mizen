"use client";

import { create, props } from "@stylexjs/stylex";
import {
	type PointerEvent,
	type ReactNode,
	useCallback,
	useRef,
	useState,
} from "react";
import { conditions } from "../../styles/conditions.stylex";
import { duration } from "../../styles/motion.stylex";
import { space } from "../../styles/spacing.stylex";
import {
	ChartTooltip,
	type ChartTooltipItem,
} from "../chart-tooltip/chart-tooltip";

// Hover for charts drawn without the chart engine: the hovered item stays at
// full strength while the rest recede, and a tooltip follows the pointer.

export interface ChartHoverTip {
	items: readonly ChartTooltipItem[];
	label?: ReactNode;
}

interface HoverState {
	flip: boolean;
	id: string;
	tip?: ChartHoverTip;
	x: number;
	y: number;
}

const styles = create({
	// The focused item keeps full color while the rest recede, as on engine charts.
	dim: { opacity: 0.3 },
	host: { position: "relative" },
	mark: {
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "opacity",
	},
	tip: (x: number, y: number, flip: boolean) => ({
		insetBlockStart: y,
		insetInlineStart: x,
		pointerEvents: "none",
		position: "absolute",
		transform: flip
			? `translate(calc(-100% - ${space["3"]}), -50%)`
			: `translate(${space["3"]}, -50%)`,
		// Small hosts such as rings must not squeeze the tooltip.
		width: "max-content",
		zIndex: 1,
	}),
});

export function useChartHover() {
	const hostRef = useRef<HTMLDivElement>(null);
	const [hover, setHover] = useState<HoverState | null>(null);
	const [linked, setLinked] = useState<string | null>(null);
	/** Pointer handlers for a mark: hovering shows its tooltip. */
	const markProps = useCallback(
		(id: string, tip?: ChartHoverTip) => ({
			onPointerLeave: () => setHover(null),
			onPointerMove: (event: PointerEvent) => {
				const box = hostRef.current?.getBoundingClientRect();
				if (!box) {
					return;
				}
				const x = event.clientX - box.left;
				setHover({
					flip: x > box.width / 2,
					id,
					tip,
					x,
					y: event.clientY - box.top,
				});
			},
		}),
		[]
	);
	/** Pointer handlers for a legend tile or row: hovering highlights its mark. */
	const linkProps = useCallback(
		(id: string) => ({
			onPointerEnter: () => setLinked(id),
			onPointerLeave: () => setLinked(null),
		}),
		[]
	);
	const active = hover?.id ?? linked;
	/** StyleX styles for a mark or tile: it recedes while another item is active. */
	const fade = useCallback(
		(id: string) =>
			[styles.mark, active !== null && active !== id && styles.dim] as const,
		[active]
	);
	return {
		active,
		fade,
		hostRef,
		hostStyle: styles.host,
		hover,
		linkProps,
		markProps,
	};
}

export function ChartHoverTooltip({
	hover,
}: {
	hover: { flip: boolean; tip?: ChartHoverTip; x: number; y: number } | null;
}) {
	if (!hover?.tip) {
		return null;
	}
	return (
		<div
			aria-hidden="true"
			{...props(styles.tip(hover.x, hover.y, hover.flip))}
		>
			<ChartTooltip items={hover.tip.items} label={hover.tip.label} />
		</div>
	);
}
