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

export const numberFieldStyles = create({
	group: {
		// The focused edge takes the focus color; an invalid field keeps its
		// error color.
		"--mizen-field-focus-edge": {
			":is([data-invalid])": colors.destructive,
			default: colors.focusRing,
		},
		alignItems: "center",
		animationDuration: {
			":has(> [data-slot='number-field-input']:focus-visible)":
				focusMotion.duration,
		},
		animationName: {
			":has(> [data-slot='number-field-input']:focus-visible)":
				focusMotion.ring,
		},
		backgroundColor: {
			":is([data-disabled])": fieldColors.disabled,
			":is([data-readonly]):not([data-disabled])": fieldColors.surface,
			default: fieldColors.surface,
		},
		borderColor: {
			":is([data-invalid]):not([data-disabled])": `color-mix(in oklab, ${colors.destructive} 54%, ${fieldColors.surface})`,
			"[data-slot='number-field-group']:hover:not([data-disabled], [data-readonly], [data-invalid])":
				{
					[conditions.canHover]: colors.controlBorderStrong,
				},
			default: colors.controlBorder,
		},
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxShadow: {
			":has(> [data-slot='number-field-input']:focus-visible)":
				focusOutline.fieldHalo,
			":is([data-disabled])": "none",
			default: shadows.fieldRest,
		},
		boxSizing: "border-box",
		color: {
			":is([data-disabled])": colors.mutedContent,
			default: colors.content,
		},
		display: "flex",
		outlineColor: {
			":has(> [data-slot='number-field-input']:focus-visible)":
				"var(--mizen-field-focus-edge)",
			default: "transparent",
		},
		outlineOffset: focusOutline.fieldOffset,
		outlineStyle: "solid",
		outlineWidth: {
			":has(> [data-slot='number-field-input']:focus-visible)":
				focusOutline.fieldWidth,
			default: 0,
		},
		overflow: "hidden",
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
	input: {
		"::placeholder": { color: colors.mutedContent, opacity: 1 },
		// The input fills the group height, so the whole field takes text focus.
		alignSelf: "stretch",
		appearance: "none",
		backgroundColor: "transparent",
		borderColor: "transparent",
		borderStyle: "none",
		borderWidth: 0,
		boxShadow: "none",
		boxSizing: "border-box",
		color: "inherit",
		cursor: { ":disabled": "not-allowed", default: "text" },
		display: "block",
		flexBasis: "0%",
		flexGrow: 1,
		flexShrink: 1,
		fontFamily: "inherit",
		fontSize: { [conditions.sm]: fontSize["14"], default: fontSize["16"] },
		fontVariantNumeric: "tabular-nums",
		fontWeight: fontWeight.regular,
		letterSpacing: letterSpacing.ui,
		lineHeight: {
			[conditions.sm]: lineHeight["20"],
			default: lineHeight["24"],
		},
		minWidth: 0,
		opacity: 1,
		outlineColor: "transparent",
		outlineStyle: "none",
		outlineWidth: 0,
		paddingBlock: space["0"],
		paddingInline: space["1"],
		textAlign: "center",
		width: "auto",
	},
	inputDefault: {
		fontSize: { [conditions.sm]: fontSize["14"], default: fontSize["16"] },
	},
	inputLg: {
		fontSize: fontSize["16"],
	},
	inputSm: {
		fontSize: { [conditions.sm]: fontSize["13"], default: fontSize["16"] },
	},
	root: {
		display: "flex",
		flexDirection: "column",
		gap: space["1"],
		width: "100%",
	},
	scrubArea: {
		alignItems: "center",
		cursor: {
			":is([data-disabled], [data-readonly])": "not-allowed",
			default: "ew-resize",
		},
		display: "inline-flex",
		gap: space["1"],
		touchAction: "none",
		userSelect: "none",
		width: "fit-content",
	},
	scrubAreaCursor: {
		alignItems: "center",
		backgroundColor: colors.surface,
		borderColor: colors.controlSurfaceHover,
		borderRadius: shape.controlRadiusLarge,
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxShadow: shadows.filledRest,
		color: colors.content,
		display: "inline-flex",
		height: "1.5rem",
		justifyContent: "center",
		paddingBlock: space["0"],
		paddingInline: space["1"],
		pointerEvents: "none",
		width: "1.5rem",
		zIndex: 50,
	},
	scrubAreaVertical: {
		cursor: {
			":is([data-disabled], [data-readonly])": "not-allowed",
			default: "ns-resize",
		},
	},
	scrubLabel: {
		color: colors.content,
		cursor: "inherit",
		fontSize: { [conditions.sm]: fontSize["14"], default: fontSize["16"] },
		fontWeight: fontWeight.regular,
		letterSpacing: letterSpacing.ui,
		lineHeight: {
			[conditions.sm]: lineHeight["20"],
			default: lineHeight["24"],
		},
		userSelect: "none",
	},
	sizeDefault: {
		borderRadius: shape.controlRadiusLarge,
		minHeight: controlSize.md,
	},
	sizeLg: {
		borderRadius: shape.controlRadiusLarge,
		fontSize: fontSize["16"],
		minHeight: controlSize.lg,
	},
	sizeSm: {
		borderRadius: shape.controlRadius,
		fontSize: fontSize["14"],
		minHeight: controlSize.sm,
	},
	stepper: {
		alignItems: "center",
		alignSelf: "stretch",
		appearance: "none",
		backgroundColor: {
			":active:not([data-disabled], [data-readonly])": colors.secondary,
			"[data-slot]:hover:not([data-disabled], [data-readonly])": {
				[conditions.canHover]: colors.controlSurfaceHover,
			},
			default: "transparent",
		},
		borderColor: "transparent",
		borderStyle: "none",
		borderWidth: 0,
		boxSizing: "border-box",
		color: {
			":is([data-disabled], [data-readonly])": colors.mutedContent,
			default: "inherit",
		},
		cursor: {
			":is([data-disabled], [data-readonly])": "not-allowed",
			default: "pointer",
		},
		display: "inline-flex",
		flexShrink: 0,
		justifyContent: "center",
		minHeight: "1.5rem",
		minWidth: controlSize.sm,
		outlineColor: "transparent",
		outlineStyle: "none",
		outlineWidth: 0,
		paddingBlock: space["0"],
		paddingInline: space["1"],
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "background-color, color",
		transitionTimingFunction: easing.expoOut,
		userSelect: "none",
	},
});
