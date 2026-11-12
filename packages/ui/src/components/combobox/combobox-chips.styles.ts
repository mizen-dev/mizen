import { create } from "@stylexjs/stylex";
import { colors, fieldColors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { controlSize } from "../../styles/dimensions.stylex";
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
	letterSpacing,
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
		borderRadius: shape.controlRadiusSmall,
		boxSizing: "border-box",
		color: colors.content,
		display: "inline-flex",
		fontSize: fontSize["14"],
		fontWeight: fontWeight.medium,
		letterSpacing: letterSpacing.ui,
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
		// The focused edge takes the focus color; an invalid field keeps its
		// error color.
		"--mizen-field-focus-edge": {
			":is([aria-invalid='true'], [data-invalid], :has([data-slot='combobox-chips-input']:is([aria-invalid='true'], [data-invalid])))":
				colors.destructive,
			default: colors.focusRing,
		},
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
			":is([aria-invalid='true'], [data-invalid], :has([data-slot='combobox-chips-input']:is([aria-invalid='true'], [data-invalid]))):not(:has([data-slot='combobox-chips-input']:disabled))": `color-mix(in oklab, ${colors.destructive} 54%, ${fieldColors.surface})`,
			default: colors.controlBorder,
		},
		borderRadius: shape.controlRadiusLarge,
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxShadow: {
			":focus-within": focusOutline.fieldHalo,
			":has([data-slot='combobox-chips-input']:disabled)": "none",
			default: shadows.fieldRest,
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
			":focus-within": "var(--mizen-field-focus-edge)",
			default: "transparent",
		},
		outlineOffset: focusOutline.fieldOffset,
		outlineStyle: "solid",
		outlineWidth: {
			":focus-within": focusOutline.fieldWidth,
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
		fontSize: { [conditions.sm]: fontSize["14"], default: fontSize["16"] },
		letterSpacing: letterSpacing.ui,
		lineHeight: {
			[conditions.sm]: lineHeight["20"],
			default: lineHeight["24"],
		},
		minWidth: "3rem",
		outline: "none",
		paddingBlock: space["0"],
		paddingInline: space["1"],
	},
	chipsInputDefault: {
		fontSize: { [conditions.sm]: fontSize["14"], default: fontSize["16"] },
		minHeight: "1.75rem",
	},
	chipsInputLg: {
		fontSize: fontSize["16"],
		minHeight: "2rem",
	},
	chipsInputSm: {
		fontSize: { [conditions.sm]: fontSize["13"], default: fontSize["16"] },
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
