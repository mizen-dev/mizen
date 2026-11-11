import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { controlSize } from "../../styles/dimensions.stylex";
import {
	borderWidth,
	focus,
	focusMotion,
	focusOutline,
} from "../../styles/interaction.stylex";
import { space } from "../../styles/spacing.stylex";
import {
	fontSize,
	fontWeight,
	letterSpacing,
	lineHeight,
} from "../../styles/typography.stylex";

// A status badge is a hairline pill with ink text; a dot carries the status
// color, so the label never depends on color alone. An icon replaces the dot.
const status = (dot: string) =>
	({
		"::before": {
			backgroundColor: dot,
			borderRadius: "9999px",
			content: '""',
			display: { ":has(svg)": "none", default: "block" },
			flexShrink: 0,
			height: "0.375rem",
			width: "0.375rem",
		},
		backgroundColor: "transparent",
		borderColor: colors.border,
		color: colors.content,
		gap: "0.375rem",
	}) as const;

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
	// Each radius is half the one-line height: a pill that stays a rounded
	// rectangle when the label wraps.
	defaultSize: {
		borderRadius: "0.6875rem",
		fontSize: fontSize["12"],
		letterSpacing: letterSpacing.caption,
		lineHeight: lineHeight["16"],
		minHeight: "1.375rem",
		paddingInline: space["2"],
	},
	destructive: status(colors.destructive),
	info: status(colors.infoSolid),
	lg: {
		borderRadius: "0.75rem",
		fontSize: fontSize["13"],
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
		minHeight: controlSize.xs,
		paddingInline: "0.625rem",
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
		borderRadius: "0.625rem",
		fontSize: fontSize["12"],
		letterSpacing: letterSpacing.caption,
		lineHeight: lineHeight["16"],
		minHeight: "1.25rem",
		paddingInline: "0.375rem",
	},
	success: status(colors.successSolid),
	warning: status(colors.warningSolid),
});
