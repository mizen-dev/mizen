import { create, keyframes } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { duration, easing } from "../../styles/motion.stylex";
import { space } from "../../styles/spacing.stylex";
import {
	fontSize,
	fontWeight,
	letterSpacing,
	lineHeight,
} from "../../styles/typography.stylex";

const indeterminateProgress = keyframes({
	"0%": {
		transform: "translateX(-100%)",
	},
	"100%": {
		transform: "translateX(250%)",
	},
});

export const progressStyles = create({
	indicator: {
		animationDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: "1.5s",
		},
		animationIterationCount: "infinite",
		animationName: {
			"[data-indeterminate]": {
				[conditions.reducedMotion]: "none",
				default: indeterminateProgress,
			},
			default: "none",
		},
		animationTimingFunction: easing.easeInOut,
		backgroundColor: colors.accent,
		borderRadius: "9999px",
		boxSizing: "border-box",
		display: "block",
		height: "inherit",
		// The fill glides between values instead of stepping.
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.disclosure,
		},
		transitionProperty: "width",
		transitionTimingFunction: easing.expoOut,
		width: {
			"[data-indeterminate]": "50%",
			default: "0%",
		},
	},
	label: {
		color: colors.content,
		fontSize: fontSize["14"],
		fontWeight: fontWeight.medium,
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
	},
	root: {
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "column",
		gap: space["1"],
		width: "100%",
	},
	track: {
		backgroundColor: colors.border,
		borderRadius: "9999px",
		boxSizing: "border-box",
		display: "block",
		height: "0.375rem",
		overflow: "hidden",
		width: "100%",
	},
	value: {
		color: colors.content,
		fontSize: fontSize["14"],
		fontVariantNumeric: "tabular-nums",
		fontWeight: fontWeight.regular,
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
	},
});
