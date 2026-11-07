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
import { fontSize, lineHeight } from "../../styles/typography.stylex";

export const inputGroupStyles = create({
	addon: {
		alignItems: "center",
		boxSizing: "border-box",
		color: "inherit",
		display: "flex",
		gap: space["1"],
		position: "relative",
		zIndex: 1,
	},
	alignBlockEnd: {
		"::before": {
			backgroundColor: colors.border,
			blockSize: borderWidth.thin,
			content: '""',
			insetBlockStart: 0,
			insetInline: space["2"],
			pointerEvents: "none",
			position: "absolute",
		},
		alignSelf: "stretch",
		justifyContent: "space-between",
		order: 2,
		paddingBlock: space["1"],
		paddingInline: space["2"],
		width: "100%",
	},
	alignBlockStart: {
		"::before": {
			backgroundColor: colors.border,
			blockSize: borderWidth.thin,
			content: '""',
			insetBlockEnd: 0,
			insetInline: space["2"],
			pointerEvents: "none",
			position: "absolute",
		},
		alignSelf: "stretch",
		order: -2,
		paddingBlock: space["1"],
		paddingInline: space["2"],
		width: "100%",
	},
	alignInlineEnd: {
		order: 1,
		paddingInlineEnd: {
			":has(> [data-slot='button'])": space["1"],
			default: space["2"],
		},
		paddingInlineStart: space["1"],
	},
	alignInlineStart: {
		order: -1,
		paddingInlineEnd: space["2"],
		paddingInlineStart: space["2"],
	},
	root: {
		alignItems: "center",
		animationDuration: {
			":has(> [data-slot='input-group-input']:focus-visible, > [data-slot='input-group-textarea']:focus-visible)":
				focusMotion.duration,
		},
		animationName: {
			":has(> [data-slot='input-group-input']:focus-visible, > [data-slot='input-group-textarea']:focus-visible)":
				focusMotion.ring,
		},
		backgroundColor: {
			":has(> [data-slot='input-group-input']:-webkit-autofill)":
				fieldColors.surface,
			":has(> [data-slot='input-group-input']:disabled, > [data-slot='input-group-textarea']:disabled)":
				fieldColors.disabled,
			default: fieldColors.surface,
		},
		borderColor: {
			":has(> [data-slot='input-group-input']:is([aria-invalid='true'], [data-invalid]):not(:disabled), > [data-slot='input-group-textarea']:is([aria-invalid='true'], [data-invalid]):not(:disabled))": `color-mix(in oklch, ${colors.destructive} 54%, ${fieldColors.surface})`,
			"[data-slot='input-group']:hover:has(> :is([data-slot='input-group-input'], [data-slot='input-group-textarea']):not(:disabled, [data-disabled], [readonly], [aria-invalid='true'], [data-invalid]))":
				{
					[conditions.canHover]: colors.border,
				},
			default: "transparent",
		},
		borderRadius: {
			":has(> [data-slot='input-group-input'][data-size='sm'], > [data-slot='input-group-textarea'][data-size='sm'])":
				shape.controlRadius,
			default: shape.controlRadiusLarge,
		},
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxShadow: {
			":has(> [data-slot='input-group-input']:disabled, > [data-slot='input-group-textarea']:disabled)":
				"none",
			default: shadows.recessedRest,
		},
		boxSizing: "border-box",
		color: {
			":has(> [data-slot='input-group-input']:disabled, > [data-slot='input-group-textarea']:disabled)":
				colors.mutedContent,
			default: colors.content,
		},
		display: "flex",
		flexWrap: "wrap",
		fontSize: {
			"[data-slot='input-group']:has(> [data-slot='input-group-input'][data-size='sm'], > [data-slot='input-group-textarea'][data-size='sm'])":
				{
					[conditions.sm]: fontSize["14"],
					default: fontSize["16"],
				},
			default: fontSize["16"],
		},
		lineHeight: {
			"[data-slot='input-group']:has(> [data-slot='input-group-input'][data-size='sm'], > [data-slot='input-group-textarea'][data-size='sm'])":
				{
					[conditions.sm]: lineHeight["20"],
					default: lineHeight["24"],
				},
			default: lineHeight["24"],
		},
		minHeight: {
			":has(> [data-align='block-start'], > [data-align='block-end'])": "auto",
			":has(> [data-slot='input-group-input'][data-size='lg'], > [data-slot='input-group-textarea'][data-size='lg'])":
				controlSize.lg,
			":has(> [data-slot='input-group-input'][data-size='sm'], > [data-slot='input-group-textarea'][data-size='sm'])":
				controlSize.sm,
			":has(> [data-slot='input-group-textarea'])": "auto",
			default: controlSize.md,
		},
		outlineColor: {
			":has(> [data-slot='input-group-input']:focus-visible, > [data-slot='input-group-textarea']:focus-visible)":
				colors.focusRing,
			default: "transparent",
		},
		outlineOffset: {
			":has(> [data-slot='input-group-input']:focus-visible, > [data-slot='input-group-textarea']:focus-visible)":
				focus.offset,
			default: focus.offset,
		},
		outlineStyle: {
			":has(> [data-slot='input-group-input']:focus-visible, > [data-slot='input-group-textarea']:focus-visible)":
				"solid",
			default: "solid",
		},
		outlineWidth: {
			":has(> [data-slot='input-group-input']:focus-visible, > [data-slot='input-group-textarea']:focus-visible)":
				borderWidth.focus,
			default: 0,
		},
		position: "relative",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty:
			"background-color, border-color, box-shadow, color, outline-color, outline-offset",
		transitionTimingFunction: easing.expoOut,
		width: "100%",
	},
	text: {
		alignItems: "center",
		color: colors.mutedContent,
		display: "inline-flex",
		fontSize: "inherit",
		gap: space["1"],
		lineHeight: "inherit",
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
});
