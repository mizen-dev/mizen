import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { controlSize } from "../../styles/dimensions.stylex";
import {
	borderWidth,
	focus,
	focusMotion,
	focusOutline,
} from "../../styles/interaction.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import {
	fontSize,
	fontWeight,
	lineHeight,
} from "../../styles/typography.stylex";

export const badgeStyles = create({
	base: {
		alignItems: "center",
		animationDuration: {
			":focus-visible": focusMotion.duration,
		},
		animationName: {
			":focus-visible": focusMotion.ring,
		},
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxSizing: "border-box",
		display: "inline-flex",
		flexShrink: 1,
		fontFamily: "inherit",
		fontWeight: fontWeight.medium,
		gap: space["1"],
		justifyContent: "center",
		maxWidth: "100%",
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
		overflowWrap: "anywhere",
		whiteSpace: "normal",
	},
	brand: {
		backgroundColor: colors.brandBackground,
		borderColor: "transparent",
		color: colors.brandForeground,
	},
	// The tile tone: visible on the page surface and on card fills alike.
	default: {
		backgroundColor: colors.controlSurface,
		borderColor: "transparent",
		color: colors.secondaryContent,
	},
	defaultSize: {
		borderRadius: shape.controlRadius,
		fontSize: fontSize["14"],
		lineHeight: lineHeight["20"],
		minHeight: controlSize.xs,
		paddingInline: space["2"],
	},
	destructive: {
		backgroundColor: colors.destructiveSubtle,
		borderColor: "transparent",
		color: colors.content,
	},
	info: {
		backgroundColor: colors.info,
		borderColor: "transparent",
		color: colors.infoContent,
	},
	lg: {
		borderRadius: shape.controlRadiusLarge,
		fontSize: fontSize["16"],
		lineHeight: lineHeight["24"],
		minHeight: controlSize.sm,
		paddingInline: space["3"],
	},
	outline: {
		backgroundColor: "transparent",
		borderColor: colors.border,
		color: colors.content,
	},
	secondary: {
		backgroundColor: colors.secondary,
		borderColor: "transparent",
		color: colors.secondaryContent,
	},
	sm: {
		borderRadius: shape.controlRadius,
		fontSize: fontSize["12"],
		lineHeight: lineHeight["16"],
		minHeight: controlSize["2xs"],
		paddingInline: space["2"],
	},
	success: {
		backgroundColor: colors.success,
		borderColor: "transparent",
		color: colors.successContent,
	},
	warning: {
		backgroundColor: colors.warning,
		borderColor: "transparent",
		color: colors.warningContent,
	},
});
