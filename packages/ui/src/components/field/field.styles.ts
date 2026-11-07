import { create } from "@stylexjs/stylex";
import { colors, fieldColors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { controlSize } from "../../styles/dimensions.stylex";
import { fonts } from "../../styles/fonts.stylex";
import {
	borderWidth,
	focus,
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
	lineHeight,
} from "../../styles/typography.stylex";

export const fieldStyles = create({
	// ui role in muted ink.
	description: {
		color: colors.mutedContent,
		fontSize: fontSize["14"],
		fontSizeAdjust: fonts.sizeAdjust,
		lineHeight: lineHeight["20"],
		marginBlock: space["0"],
		textWrap: "pretty",
	},
	error: {
		color: colors.destructiveText,
		fontSize: fontSize["14"],
		fontSizeAdjust: fonts.sizeAdjust,
		lineHeight: lineHeight["20"],
		marginBlock: space["0"],
		textWrap: "pretty",
	},
	input: {
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
					[conditions.canHover]: colors.border,
				},
			"[data-slot='combobox-input']:hover:not(:disabled, [readonly], [data-readonly], [aria-invalid='true'], [data-invalid])":
				{
					[conditions.canHover]: colors.border,
				},
			default: "transparent",
		},
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxShadow: { ":disabled": "none", default: shadows.recessedRest },
		boxSizing: "border-box",
		color: { ":disabled": colors.mutedContent, default: colors.content },
		cursor: { ":disabled": "not-allowed", default: "text" },
		display: "block",
		fontFamily: "inherit",
		// Control role: values stay 16/24 at every width.
		fontSize: fontSize["16"],
		fontSizeAdjust: fonts.sizeAdjust,
		fontWeight: fontWeight.regular,
		lineHeight: lineHeight["24"],
		minWidth: 0,
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: { ":focus-visible": focus.offset, default: focus.offset },
		outlineStyle: {
			":focus-visible": "solid",
			default: focusOutline.restingOutlineStyle,
		},
		outlineWidth: {
			":focus-visible": borderWidth.focus,
			default: borderWidth.focus,
		},
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
	// Label role: 14/20 medium. Its 4px margin plus the 4px root gap gives 8px
	// to the control; descriptions and errors sit 4px below it.
	label: {
		alignItems: "center",
		color: colors.content,
		display: "inline-flex",
		fontSize: fontSize["14"],
		fontSizeAdjust: fonts.sizeAdjust,
		fontWeight: fontWeight.medium,
		gap: space["2"],
		lineHeight: lineHeight["20"],
		marginBlockEnd: space["1"],
	},
	root: { display: "flex", flexDirection: "column", gap: space["1"] },
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
		fontSize: { [conditions.sm]: fontSize["14"], default: fontSize["16"] },
		height: controlSize.sm,
	},
});
