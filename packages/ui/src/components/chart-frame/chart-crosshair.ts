import {
	type ChartAxisTickLabelOpacityContext,
	type ChartMark,
	crosshair,
	type SceneLabel,
	type SceneNode,
} from "@tanstack/charts";
import { resolveCrosshairGuide } from "@tanstack/charts/crosshair";
import { colors } from "../../styles/colors.stylex";
import { mizenAxisLabels, mizenTickGap } from "./chart-frame";

// Mizen's focus guides wear the brand: a wine rule whose time label sits in a
// wine pill on the axis, and a lavender band behind the focused category.

const PILL_PADDING_X = 8;
const PILL_HEIGHT = 18;
// Tabular digits and short month names average a bit over half an em.
const CHARACTER_WIDTH = 0.58;

function isAxisLabel(node: SceneNode): node is SceneLabel {
	return (
		node.kind === "label" &&
		(node.className ?? "").includes("crosshair-label--x")
	);
}

/** Puts a rounded wine pill behind the focused time label. */
function withPill(node: SceneNode | undefined): SceneNode | undefined {
	if (node?.kind !== "group") {
		return node;
	}
	const children = node.children.flatMap((child): SceneNode[] => {
		if (!isAxisLabel(child)) {
			return [withPill(child) ?? child];
		}
		const fontSize = child.fontSize ?? mizenAxisLabels.fontSize;
		const width =
			child.text.length * fontSize * CHARACTER_WIDTH + PILL_PADDING_X * 2;
		const center = child.y - fontSize * 0.35;
		return [
			{
				height: PILL_HEIGHT,
				key: `${child.key}:pill`,
				kind: "rect",
				radius: PILL_HEIGHT / 2,
				style: { fill: colors.brandForeground },
				width,
				x: child.x - width / 2,
				y: center - PILL_HEIGHT / 2,
			},
			{ ...child, style: { ...child.style, fill: colors.surface } },
		];
	});
	return { ...node, children };
}

function pillCrosshair(mark: ChartMark<never, Date, number>) {
	return {
		...mark,
		initialize: (context: Parameters<typeof mark.initialize>[0]) => {
			const initialized = mark.initialize(context);
			return {
				...initialized,
				render: (renderContext: Parameters<typeof initialized.render>[0]) => {
					const scene = initialized.render(renderContext);
					return {
						...scene,
						focusGuides: scene.focusGuides?.map((guide) => ({
							...guide,
							resolve: (resolveContext: Parameters<typeof guide.resolve>[0]) =>
								withPill(resolveCrosshairGuide(resolveContext)),
						})),
					};
				},
			};
		},
	};
}

// A tick closer than this to the focused time would show through the pill.
const PILL_CLEARANCE = 40;

/** Tick label options that hide the ticks under the focus pill while it shows. */
export const pillTickLabels = {
	opacity: ({ focus, position }: ChartAxisTickLabelOpacityContext) =>
		focus && Math.abs(position - focus.primary.x) < PILL_CLEARANCE
			? 0
			: undefined,
};

/** A vertical rule at the focused time, labeled in a pill on the x axis. */
export function timeCrosshair(format: (date: Date) => string) {
	return pillCrosshair(
		crosshair<Date, number>({
			x: {
				// The pill covers the gray tick under it, so the label reads alone.
				label: {
					fill: colors.surface,
					fillOpacity: 1,
					fontSize: mizenAxisLabels.fontSize,
					fontWeight: mizenAxisLabels.fontWeight,
					format,
					offset: mizenTickGap,
					strokeWidth: 0,
				},
				stroke: colors.brandForeground,
				strokeOpacity: 0.4,
				strokeWidth: 1,
			},
			y: false,
		})
	);
}

/** A soft band behind the focused category, drawn under the bars. */
export function bandCrosshair(axis: "x" | "y") {
	const band = {
		band: {
			fill: colors.brandBackground,
			fillOpacity: 1,
			inset: -4,
			radius: 8,
		},
		label: false,
	};
	return crosshair(
		axis === "x" ? { x: band, y: false } : { x: false, y: band }
	);
}
