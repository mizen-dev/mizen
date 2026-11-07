import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import {
	borderWidth,
	focus,
	focusMotion,
} from "../../styles/interaction.stylex";

export const chartFrameStyles = create({
	customTooltip: {
		"--ts-chart-tooltip-background": "transparent",
		"--ts-chart-tooltip-border": "none",
		"--ts-chart-tooltip-padding": "0",
		"--ts-chart-tooltip-shadow": "none",
	},
	frame: {
		"--ts-chart-1": colors.chartSeries1,
		"--ts-chart-2": colors.chartSeries2,
		"--ts-chart-3": colors.chartSeries3,
		"--ts-chart-4": colors.chartSeries4,
		"--ts-chart-5": colors.chartSeries5,
		"--ts-chart-6": colors.chartSeries6,
		// No halo: the frame inherits any parent surface, and the label redraws the
		// tick beneath it in the same place.
		"--ts-chart-crosshair-label-halo": "transparent",
		"--ts-chart-tooltip-background": colors.floatingSurface,
		"--ts-chart-tooltip-border": `1px solid ${colors.border}`,
		"--ts-chart-tooltip-color": colors.content,
		backgroundColor: "transparent",
		color: colors.content,
		fontFamily: "inherit",
		fontVariantNumeric: "tabular-nums",
		minWidth: 0,
		width: "100%",
	},
	plot: {
		animationDuration: { ":focus-visible": focusMotion.duration },
		animationName: { ":focus-visible": focusMotion.ring },
		outlineColor: {
			default: colors.focusRing,
			[conditions.forcedColors]: "Highlight",
		},
		outlineOffset: focus.offset,
		outlineStyle: { ":focus-visible": "solid", default: "none" },
		outlineWidth: borderWidth.focus,
	},
});
