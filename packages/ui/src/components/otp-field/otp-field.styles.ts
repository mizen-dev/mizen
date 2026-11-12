import { create } from "@stylexjs/stylex";
import { colors, fieldColors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { controlSize } from "../../styles/dimensions.stylex";
import {
	borderWidth,
	focusMotion,
	focusOutline,
} from "../../styles/interaction.stylex";
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

export const otpFieldStyles = create({
	input: {
		// The focused edge takes the focus color; an invalid field keeps its
		// error color.
		"--mizen-field-focus-edge": {
			":is([aria-invalid='true'], [data-invalid])": colors.destructive,
			default: colors.focusRing,
		},
		"::placeholder": { color: colors.mutedContent, opacity: 1 },
		animationDuration: {
			":focus-visible": focusMotion.duration,
		},
		animationName: {
			":focus-visible": focusMotion.ring,
		},
		appearance: "none",
		aspectRatio: 1,
		backgroundColor: {
			":hover": {
				[conditions.canHover]: fieldColors.surface,
			},
			":is(:disabled, [data-disabled])": fieldColors.disabled,
			":is(:read-only, [data-readonly]):not(:disabled):not([data-disabled])":
				fieldColors.surface,
			"[data-disabled]:hover": fieldColors.disabled,
			"[data-readonly]:hover": fieldColors.surface,
			default: fieldColors.surface,
		},
		borderColor: {
			":is([aria-invalid='true'], [data-invalid]):not(:disabled):not([data-disabled])": `color-mix(in oklab, ${colors.destructive} 54%, ${fieldColors.surface})`,
			"[data-slot='otp-field-input']:hover:not(:disabled, [data-disabled], [readonly], [data-readonly], [aria-invalid='true'], [data-invalid])":
				{
					[conditions.canHover]: colors.controlBorderStrong,
				},
			default: colors.controlBorder,
		},
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxShadow: {
			":focus-visible": focusOutline.fieldHalo,
			":is(:disabled, [data-disabled])": "none",
			default: shadows.fieldRest,
		},
		boxSizing: "border-box",
		color: {
			":is(:disabled, [data-disabled])": colors.mutedContent,
			default: colors.content,
		},
		cursor: {
			":is(:disabled, [data-disabled])": "not-allowed",
			default: "text",
		},
		display: "block",
		fontFamily: "inherit",
		fontSize: { [conditions.sm]: fontSize["14"], default: fontSize["16"] },
		fontVariantNumeric: "tabular-nums",
		fontWeight: fontWeight.regular,
		letterSpacing: letterSpacing.ui,
		lineHeight: {
			[conditions.sm]: lineHeight["20"],
			default: lineHeight["24"],
		},
		minWidth: controlSize.xs,
		outlineColor: {
			":focus-visible": "var(--mizen-field-focus-edge)",
			default: "transparent",
		},
		outlineOffset: focusOutline.fieldOffset,
		outlineStyle: {
			":focus-visible": "solid",
			default: focusOutline.restingOutlineStyle,
		},
		outlineWidth: focusOutline.fieldWidth,
		paddingBlock: space["0"],
		paddingInline: space["0"],
		textAlign: "center",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty:
			"background-color, border-color, box-shadow, color, outline-color, outline-offset",
		transitionTimingFunction: easing.expoOut,
	},
	inputDefault: {
		borderRadius: shape.controlRadiusLarge,
		fontSize: { [conditions.sm]: fontSize["14"], default: fontSize["16"] },
		height: "auto",
		width: controlSize.md,
	},
	inputLg: {
		borderRadius: shape.controlRadiusLarge,
		fontSize: fontSize["16"],
		height: "auto",
		width: controlSize.lg,
	},
	inputSm: {
		borderRadius: shape.controlRadius,
		fontSize: { [conditions.sm]: fontSize["13"], default: fontSize["16"] },
		height: "auto",
		width: controlSize.sm,
	},
	root: {
		alignItems: "center",
		boxSizing: "border-box",
		display: "inline-flex",
		gap: space["2"],
		maxWidth: "100%",
		minWidth: 0,
		overflowX: "auto",
		// Room for the focus halo, which the scroller would clip.
		padding: space["1"],
		scrollPaddingInline: space["1"],
	},
	separator: {
		alignItems: "center",
		color: colors.secondaryContent,
		display: "inline-flex",
		fontSize: { [conditions.sm]: fontSize["14"], default: fontSize["16"] },
		justifyContent: "center",
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight.none,
		userSelect: "none",
	},
});
