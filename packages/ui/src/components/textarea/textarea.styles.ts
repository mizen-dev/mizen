import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import {
	fontSize,
	fontWeight,
	letterSpacing,
	lineHeight,
} from "../../styles/typography.stylex";

export const textareaStyles = create({
	base: {
		minHeight: "8rem",
		resize: "vertical",
		verticalAlign: "top",
	},
	default: {
		borderEndEndRadius: shape.controlRadiusLarge,
		borderEndStartRadius: shape.controlRadiusLarge,
		borderStartEndRadius: shape.controlRadiusLarge,
		borderStartStartRadius: shape.controlRadiusLarge,
	},
	lg: {
		borderEndEndRadius: shape.controlRadiusLarge,
		borderEndStartRadius: shape.controlRadiusLarge,
		borderStartEndRadius: shape.controlRadiusLarge,
		borderStartStartRadius: shape.controlRadiusLarge,
		fontSize: fontSize["16"],
		minHeight: "10rem",
	},
	sm: {
		borderEndEndRadius: shape.controlRadius,
		borderEndStartRadius: shape.controlRadius,
		borderStartEndRadius: shape.controlRadius,
		borderStartStartRadius: shape.controlRadius,
		fontSize: { [conditions.sm]: fontSize["13"], default: fontSize["16"] },
		lineHeight: {
			[conditions.sm]: lineHeight["20"],
			default: lineHeight["24"],
		},
		minHeight: "6rem",
	},
	unstyled: {
		"::placeholder": { color: colors.mutedContent, opacity: 1 },
		appearance: "none",
		backgroundColor: "transparent",
		borderColor: "transparent",
		borderStyle: "none",
		borderWidth: 0,
		boxShadow: "none",
		boxSizing: "border-box",
		color: { ":disabled": colors.mutedContent, default: colors.content },
		cursor: { ":disabled": "not-allowed", default: "text" },
		display: "block",
		flexBasis: "0%",
		flexGrow: 1,
		flexShrink: 1,
		fontFamily: "inherit",
		fontSize: { [conditions.sm]: fontSize["14"], default: fontSize["16"] },
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
		paddingBlock: space["2"],
		paddingInline: space["3"],
		resize: "vertical",
		verticalAlign: "top",
		width: "auto",
	},
	unstyledDefault: {
		minHeight: "6rem",
	},
	unstyledLg: {
		fontSize: fontSize["16"],
		minHeight: "8rem",
	},
	unstyledSm: {
		fontSize: { [conditions.sm]: fontSize["13"], default: fontSize["16"] },
		minHeight: "4rem",
	},
});
