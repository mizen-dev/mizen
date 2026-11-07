import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import {
	borderWidth,
	focus,
	focusMotion,
	focusOutline,
} from "../../styles/interaction.stylex";
import { duration, easing } from "../../styles/motion.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import {
	fontSize,
	fontWeight,
	lineHeight,
} from "../../styles/typography.stylex";

export const anchoredToastStyles = create({
	content: {
		alignItems: "start",
		boxSizing: "border-box",
		color: colors.content,
		display: "flex",
		gap: space["2"],
		maxWidth: "min(22.5rem, var(--available-width))",
		minWidth: "min(15rem, var(--available-width))",
		padding: space["4"],
	},
	positioner: {
		pointerEvents: "none",
		position: "absolute",
		zIndex: 1000,
	},
	root: {
		animationDuration: {
			":focus-visible": focusMotion.duration,
		},
		animationName: {
			":focus-visible": focusMotion.ring,
		},
		boxSizing: "border-box",
		opacity: {
			"[data-ending-style]": 0,
			"[data-starting-style]": 0,
			default: 1,
		},
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "var(--toast-focus-ring, transparent)",
		},
		outlineOffset: focus.offset,
		outlineStyle: {
			":focus-visible": "solid",
			default: focusOutline.restingOutlineStyle,
		},
		outlineWidth: borderWidth.focus,
		pointerEvents: "auto",
		transform: {
			"[data-ending-style]": "scale(0.98)",
			"[data-starting-style]": "scale(0.98)",
			default: "none",
		},
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			"[data-ending-style]": duration.overlayExit,
			default: duration.overlayEnter,
		},
		transitionProperty: "transform, opacity",
		transitionTimingFunction: easing.expoOut,
		userSelect: "none",
	},
	tooltipContent: {
		alignItems: "center",
		boxSizing: "border-box",
		color: colors.content,
		display: "inline-flex",
		maxWidth: "min(20rem, var(--available-width))",
		paddingBlock: space["1"],
		paddingInline: space["2"],
	},
	tooltipRoot: {
		animationDuration: {
			":focus-visible": focusMotion.duration,
		},
		animationName: {
			":focus-visible": focusMotion.ring,
		},
		borderRadius: shape.controlRadius,
		boxSizing: "border-box",
		opacity: {
			"[data-ending-style]": 0,
			"[data-starting-style]": 0,
			default: 1,
		},
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "var(--toast-focus-ring, transparent)",
		},
		outlineOffset: focus.offset,
		outlineStyle: {
			":focus-visible": "solid",
			default: focusOutline.restingOutlineStyle,
		},
		outlineWidth: borderWidth.focus,
		pointerEvents: "auto",
		transform: {
			"[data-ending-style]": "scale(0.98)",
			"[data-starting-style]": "scale(0.98)",
			default: "none",
		},
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			"[data-ending-style]": duration.overlayExit,
			default: duration.overlayEnter,
		},
		transitionProperty: "transform, opacity",
		transitionTimingFunction: easing.expoOut,
		userSelect: "none",
	},
	tooltipTitle: {
		boxSizing: "border-box",
		color: colors.content,
		fontSize: fontSize["12"],
		fontWeight: fontWeight.medium,
		lineHeight: lineHeight["16"],
		margin: space["0"],
		overflowWrap: "anywhere",
	},
	viewport: {
		"--toast-focus-ring": {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineColor: {
			[conditions.forcedColors]: "Highlight",
			default: "transparent",
		},
		outlineOffset: focus.offset,
		outlineStyle: {
			":focus-visible": "solid",
			default: focusOutline.restingOutlineStyle,
		},
		outlineWidth: borderWidth.focus,
	},
});
