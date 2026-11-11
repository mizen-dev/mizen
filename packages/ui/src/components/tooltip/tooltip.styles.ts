import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { borderWidth } from "../../styles/interaction.stylex";
import { duration, easing } from "../../styles/motion.stylex";
import { shadows } from "../../styles/shadows.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import {
	fontSize,
	fontWeight,
	letterSpacing,
	lineHeight,
} from "../../styles/typography.stylex";

export const tooltipStyles = create({
	popup: {
		backgroundColor: colors.floatingSurface,
		borderColor: {
			[conditions.moreContrast]: colors.controlBorderStrong,
			default: colors.border,
		},
		borderRadius: shape.controlRadius,
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxShadow: shadows.floating,
		boxSizing: "border-box",
		color: colors.content,
		display: "flex",
		fontSize: fontSize["12"],
		fontWeight: fontWeight.regular,
		height: "var(--popup-height, auto)",
		letterSpacing: letterSpacing.caption,
		lineHeight: lineHeight["16"],
		// Wide enough that one-sentence tooltips stay on one line.
		maxWidth: "min(20rem, var(--available-width), calc(100vw - 2rem))",
		opacity: {
			"[data-ending-style]": 0,
			"[data-starting-style]": 0,
			default: 1,
		},
		overflowWrap: "anywhere",
		position: "relative",
		// A box keeps its full width once text wraps, so balance leaves empty
		// space; pretty only avoids a one-word last line.
		textWrap: "pretty",
		transform: {
			"[data-ending-style]": "scale(0.98)",
			"[data-starting-style]": "scale(0.98)",
			default: "none",
		},
		transformOrigin: "var(--transform-origin)",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			"[data-instant]": duration.instant,
			default: duration.fast,
		},
		transitionProperty: "width, height, opacity, transform",
		transitionTimingFunction: easing.expoOut,
		width: "var(--popup-width, max-content)",
	},
	positioner: {
		height: "var(--positioner-height)",
		maxWidth: "min(var(--available-width), calc(100vw - 2rem))",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			"[data-instant]": duration.instant,
			default: duration.fast,
		},
		transitionProperty: "top, left, right, bottom, transform",
		transitionTimingFunction: easing.expoOut,
		width: "var(--positioner-width)",
		zIndex: 50,
	},
	viewport: {
		boxSizing: "border-box",
		height: "100%",
		overflow: "clip",
		paddingBlock: space["1"],
		paddingInline: space["3"],
		position: "relative",
		width: "100%",
	},
	viewportContent: {
		opacity: {
			":is(*) > :is([data-current], [data-previous])": 1,
			":is(*) > :is([data-current], [data-previous]):is([data-starting-style], [data-ending-style])": 0,
		},
		transitionDuration: {
			[conditions.reducedMotion]: {
				":is(*) > :is([data-current], [data-previous])": duration.instant,
			},
			":is(*) > :is([data-current], [data-previous])": duration.fast,
			"[data-instant]": {
				":is(*) > :is([data-current], [data-previous])": duration.instant,
			},
		},
		transitionProperty: {
			":is(*) > :is([data-current], [data-previous])": "opacity",
		},
		width: {
			":is(*) > :is([data-current], [data-previous])":
				"calc(var(--popup-width) - 1.25rem - 2px)",
		},
	},
});
