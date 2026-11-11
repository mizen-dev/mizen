import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { borderWidth } from "../../styles/interaction.stylex";
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

export const checkboxCardStyles = create({
	content: {
		display: "flex",
		flexBasis: "0%",
		flexDirection: "column",
		flexGrow: 1,
		flexShrink: 1,
		gap: space["1"],
		minWidth: 0,
	},
	label: {
		alignItems: "flex-start",
		backgroundColor: {
			":has([data-disabled])": colors.controlSurfaceDisabled,
			default: colors.surface,
		},
		borderColor: {
			":has([aria-invalid='true'], [data-invalid]):not(:has([data-disabled]))":
				colors.destructive,
			":has([data-checked], [data-indeterminate]):not(:has([data-disabled], [aria-invalid='true'], [data-invalid]))":
				colors.accent,
			":has([data-disabled])": "transparent",
			[conditions.canHover]: {
				":not(:has([data-disabled], [data-readonly], [data-checked], [data-indeterminate], [aria-invalid='true'], [data-invalid])):hover":
					colors.controlBorderStrong,
			},
			default: colors.controlBorder,
		},
		borderRadius: shape.controlRadiusLarge,
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxShadow: { ":has([data-disabled])": "none", default: shadows.fieldRest },
		boxSizing: "border-box",
		color: colors.content,
		cursor: {
			":has([data-disabled])": "not-allowed",
			":has([data-readonly]):not(:has([data-disabled]))": "default",
			default: "pointer",
		},
		display: "flex",
		fontSize: fontSize["14"],
		fontWeight: fontWeight.medium,
		gap: space["2"],
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
		paddingBlock: space["3"],
		paddingInline: space["3"],
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "background-color, border-color",
		transitionTimingFunction: easing.expoOut,
		width: "100%",
	},
});
