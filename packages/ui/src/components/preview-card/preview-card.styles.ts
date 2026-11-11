import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { duration, easing } from "../../styles/motion.stylex";
import { shadows } from "../../styles/shadows.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import {
	fontSize,
	letterSpacing,
	lineHeight,
} from "../../styles/typography.stylex";

export const previewCardStyles = create({
	popup: {
		backgroundColor: colors.floatingSurface,
		borderColor: {
			[conditions.moreContrast]: colors.controlBorderStrong,
			default: colors.border,
		},
		borderEndEndRadius: shape.floatingRadius,
		borderEndStartRadius: shape.floatingRadius,
		borderStartEndRadius: shape.floatingRadius,
		borderStartStartRadius: shape.floatingRadius,
		borderStyle: "solid",
		borderWidth: "1px",
		boxShadow: shadows.floating,
		boxSizing: "border-box",
		color: colors.content,
		display: "flex",
		flexDirection: "column",
		fontSize: fontSize["14"],
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
		maxHeight: "var(--available-height)",
		maxWidth: "min(var(--available-width), calc(100vw - 2rem))",
		opacity: {
			"[data-ending-style]": 0,
			"[data-starting-style]": 0,
			default: 1,
		},
		outline: "none",
		overflowWrap: "anywhere",
		overflowY: "auto",
		overscrollBehavior: "contain",
		padding: space["6"],
		transform: {
			"[data-ending-style]": "scale(0.98)",
			"[data-starting-style]": "scale(0.98)",
			default: "none",
		},
		transformOrigin: "var(--transform-origin)",
		transitionDuration: {
			"[data-ending-style]": duration.overlayExit,
			default: duration.overlayEnter,
			[conditions.reducedMotion]: duration.instant,
			"[data-instant]": duration.instant,
		},
		transitionProperty: "opacity, transform",
		transitionTimingFunction: easing.expoOut,
		width: "20rem",
	},
	positioner: {
		zIndex: 50,
	},
});
