import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import {
	borderWidth,
	focusMotion,
	opacity,
} from "../../styles/interaction.stylex";
import { duration, easing } from "../../styles/motion.stylex";
import { shadows } from "../../styles/shadows.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import {
	fontSize,
	fontWeight,
	lineHeight,
} from "../../styles/typography.stylex";
import { toggleColors } from "../toggle/toggle-colors.stylex";

export const segmentedStyles = create({
	defaultSize: { minBlockSize: "2rem", paddingInline: space["3"] },
	iconSize: { aspectRatio: "1", paddingInline: 0 },
	item: {
		alignItems: "center",
		animationDuration: {
			":focus-visible": focusMotion.duration,
		},
		animationName: {
			":focus-visible": focusMotion.ring,
		},
		appearance: "none",
		backgroundColor: {
			":active:not([data-disabled]):not([data-pressed])":
				colors.controlSurfaceHover,
			"[data-pressed]": toggleColors.pressedBackground,
			default: "transparent",
		},
		borderColor: "transparent",
		borderRadius: shape.controlRadius,
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxShadow: {
			":active:not([data-disabled])": shadows.pressed,
			"[data-pressed]": shadows.filledRest,
			default: "none",
		},
		boxSizing: "border-box",
		color: {
			"[data-pressed]": toggleColors.pressedForeground,
			default: colors.mutedContent,
			[conditions.canHover]: {
				":hover:not([data-disabled]):not([data-pressed])": colors.content,
			},
		},
		cursor: { "[data-disabled]": "not-allowed", default: "pointer" },
		display: "inline-flex",
		flexShrink: 0,
		fontFamily: "inherit",
		fontSize: fontSize["14"],
		fontWeight: fontWeight.medium,
		forcedColorAdjust: {
			default: "auto",
			[conditions.forcedColors]: { "[data-pressed]": "none" },
		},
		gap: space["1"],
		height: { ":is(*) > svg": "1rem" },
		justifyContent: "center",
		lineHeight: lineHeight["20"],
		minInlineSize: 0,
		opacity: { "[data-disabled]": opacity.disabled, default: 1 },
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: `-${borderWidth.focus}px`,
		outlineStyle: { ":focus-visible": "solid", default: "none" },
		outlineWidth: borderWidth.focus,
		paddingBlock: 0,
		position: "relative",
		transitionDuration: {
			default: duration.fast,
			[conditions.reducedMotion]: duration.instant,
		},
		transitionProperty: "background-color, box-shadow, color, outline-color",
		transitionTimingFunction: easing.expoOut,
		userSelect: "none",
		whiteSpace: "nowrap",
		width: { ":is(*) > svg": "1rem" },
	},
	lg: { minBlockSize: "2.25rem", paddingInline: space["3"] },
	root: {
		alignItems: "stretch",
		backgroundColor: colors.controlSurface,
		borderRadius: shape.controlRadiusLarge,
		boxShadow: shadows.recessedRest,
		boxSizing: "border-box",
		display: "inline-flex",
		gap: space["1"],
		maxInlineSize: "100%",
		overflowX: "auto",
		padding: space["1"],
		scrollPaddingInline: space["1"],
		width: "fit-content",
	},
	sm: { minBlockSize: "1.75rem", paddingInline: space["2"] },
	vertical: { flexDirection: "column" },
});
