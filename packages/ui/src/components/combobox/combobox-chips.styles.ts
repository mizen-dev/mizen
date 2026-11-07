import { create } from "@stylexjs/stylex";
import { colors, fieldColors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { controlSize } from "../../styles/dimensions.stylex";
import {
	borderWidth,
	focus,
	focusMotion,
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

export const comboboxChipsStyles = create({
	chip: {
		alignItems: "center",
		animationDuration: {
			":focus-visible": focusMotion.duration,
		},
		animationName: {
			":focus-visible": focusMotion.ring,
		},
		backgroundColor: colors.secondary,
		borderRadius: shape.controlRadius,
		boxSizing: "border-box",
		color: colors.content,
		display: "inline-flex",
		fontSize: fontSize["14"],
		fontWeight: fontWeight.medium,
		lineHeight: lineHeight["20"],
		minHeight: "1.5rem",
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: {
			":focus-visible": focus.offset,
			default: focus.offset,
		},
		outlineStyle: {
			":focus-visible": "solid",
			default: "solid",
		},
		outlineWidth: {
			":focus-visible": borderWidth.focus,
			default: 0,
		},
		paddingInlineStart: space["2"],
	},
	chipRemove: {
		alignItems: "center",
		// Fill the chip's height: a 24px target, not the 16px glyph.
		alignSelf: "stretch",
		appearance: "none",
		backgroundColor: "transparent",
		borderWidth: 0,
		color: "currentColor",
		cursor: "pointer",
		display: "inline-flex",
		justifyContent: "center",
		opacity: {
			":hover": { [conditions.canHover]: 1 },
			default: 0.8,
		},
		outline: "none",
		paddingBlock: 0,
		paddingInline: space["1"],
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "opacity",
		transitionTimingFunction: easing.expoOut,
	},
	chips: {
		alignItems: "center",

		animationDuration: {
			":focus-within": focusMotion.duration,
		},
		animationName: {
			":focus-within": focusMotion.ring,
		},
		backgroundColor: {
			":has([data-slot='combobox-chips-input']:disabled)": fieldColors.disabled,
			default: fieldColors.surface,
		},
		borderColor: {
			":is([aria-invalid='true'], [data-invalid], :has([data-slot='combobox-chips-input']:is([aria-invalid='true'], [data-invalid]))):not(:has([data-slot='combobox-chips-input']:disabled))": `color-mix(in oklch, ${colors.destructive} 54%, ${fieldColors.surface})`,
			default: "transparent",
		},
		borderRadius: shape.controlRadiusLarge,
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxShadow: {
			":has([data-slot='combobox-chips-input']:disabled)": "none",
			default: shadows.recessedRest,
		},
		boxSizing: "border-box",
		color: {
			":has([data-slot='combobox-chips-input']:disabled)": colors.mutedContent,
			default: colors.content,
		},
		display: "flex",
		flexWrap: "wrap",
		gap: space["1"],
		minHeight: {
			":has([data-size='lg'])": controlSize.lg,
			":has([data-size='sm'])": controlSize.sm,
			default: controlSize.md,
		},
		outlineColor: {
			":focus-within": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: {
			":focus-within": focus.offset,
			default: focus.offset,
		},
		outlineStyle: {
			":focus-within": "solid",
			default: "solid",
		},
		outlineWidth: {
			":focus-within": borderWidth.focus,
			default: 0,
		},
		padding: space["1"],
		position: "relative",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "border-color, box-shadow, outline-color",
		transitionTimingFunction: easing.expoOut,
		width: "100%",
	},
	chipsInput: {
		"::placeholder": { color: colors.mutedContent, opacity: 1 },
		backgroundColor: "transparent",
		borderWidth: 0,
		boxSizing: "border-box",
		color: "inherit",
		flexBasis: "3rem",
		flexGrow: 1,
		flexShrink: 1,
		fontFamily: "inherit",
		fontSize: fontSize["16"],
		lineHeight: lineHeight["24"],
		minWidth: "3rem",
		outline: "none",
		paddingBlock: space["0"],
		paddingInline: space["1"],
	},
	chipsInputDefault: {
		fontSize: fontSize["16"],
		minHeight: "1.75rem",
	},
	chipsInputLg: {
		fontSize: fontSize["16"],
		minHeight: "2rem",
	},
	chipsInputSm: {
		fontSize: { [conditions.sm]: fontSize["14"], default: fontSize["16"] },
		minHeight: "1.5rem",
	},
	startAddon: {
		alignItems: "center",
		color: colors.content,
		display: "inline-flex",
		flexShrink: 0,
		opacity: 0.8,
		paddingInlineEnd: space["1"],
		paddingInlineStart: space["1"],
	},
});
