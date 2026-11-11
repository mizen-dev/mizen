import { create } from "@stylexjs/stylex";
import { colors, fieldColors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { controlSize } from "../../styles/dimensions.stylex";
import { fonts } from "../../styles/fonts.stylex";
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

export const fieldStyles = create({
	// Supporting text: 13/20 in muted ink.
	description: {
		color: colors.mutedContent,
		fontSize: fontSize["13"],
		fontSizeAdjust: fonts.sizeAdjust,
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
		marginBlock: space["0"],
		textWrap: "pretty",
	},
	error: {
		color: colors.destructiveText,
		fontSize: fontSize["13"],
		fontSizeAdjust: fonts.sizeAdjust,
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
		marginBlock: space["0"],
		textWrap: "pretty",
	},
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
		backgroundColor: {
			":disabled": fieldColors.disabled,
			default: fieldColors.surface,
		},
		borderColor: {
			":is([aria-invalid='true'], [data-invalid]):not(:disabled)": `color-mix(in oklch, ${colors.destructive} 54%, ${fieldColors.surface})`,
			"[data-hovered='true']:not(:disabled, [readonly], [data-readonly], [aria-invalid='true'], [data-invalid])":
				{
					[conditions.canHover]: colors.controlBorderStrong,
				},
			"[data-slot='combobox-input']:hover:not(:disabled, [readonly], [data-readonly], [aria-invalid='true'], [data-invalid])":
				{
					[conditions.canHover]: colors.controlBorderStrong,
				},
			default: colors.controlBorder,
		},
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxShadow: {
			":disabled": "none",
			":focus-visible": focusOutline.fieldHalo,
			default: shadows.fieldRest,
		},
		boxSizing: "border-box",
		color: { ":disabled": colors.mutedContent, default: colors.content },
		cursor: { ":disabled": "not-allowed", default: "text" },
		display: "block",
		fontFamily: "inherit",
		// Values are 14/20; narrow screens keep 16px so iOS does not zoom on focus.
		fontSize: { [conditions.sm]: fontSize["14"], default: fontSize["16"] },
		fontSizeAdjust: fonts.sizeAdjust,
		fontWeight: fontWeight.regular,
		letterSpacing: letterSpacing.ui,
		lineHeight: {
			[conditions.sm]: lineHeight["20"],
			default: lineHeight["24"],
		},
		minWidth: 0,
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
		paddingBlock: space["2"],
		paddingInline: space["3"],
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty:
			"background-color, border-color, box-shadow, color, outline-color, outline-offset",
		transitionTimingFunction: easing.expoOut,
		width: "100%",
	},
	item: { display: "flex", flexDirection: "column", gap: space["1"] },
	// Label role: 13/20 medium.
	label: {
		alignItems: "center",
		color: colors.content,
		display: "inline-flex",
		fontSize: fontSize["13"],
		fontSizeAdjust: fonts.sizeAdjust,
		fontWeight: fontWeight.medium,
		gap: space["2"],
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
	},
	// Label, control, and help text sit 6px apart.
	root: { display: "flex", flexDirection: "column", gap: space["1.5"] },
	sizeDefault: {
		borderEndEndRadius: shape.controlRadiusLarge,
		borderEndStartRadius: shape.controlRadiusLarge,
		borderStartEndRadius: shape.controlRadiusLarge,
		borderStartStartRadius: shape.controlRadiusLarge,
		height: controlSize.md,
	},
	sizeLg: {
		borderEndEndRadius: shape.controlRadiusLarge,
		borderEndStartRadius: shape.controlRadiusLarge,
		borderStartEndRadius: shape.controlRadiusLarge,
		borderStartStartRadius: shape.controlRadiusLarge,
		fontSize: fontSize["16"],
		height: controlSize.lg,
	},
	sizeSm: {
		borderEndEndRadius: shape.controlRadius,
		borderEndStartRadius: shape.controlRadius,
		borderStartEndRadius: shape.controlRadius,
		borderStartStartRadius: shape.controlRadius,
		fontSize: { [conditions.sm]: fontSize["13"], default: fontSize["16"] },
		height: controlSize.sm,
	},
});
