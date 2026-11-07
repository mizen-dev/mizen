import { create } from "@stylexjs/stylex";
import { colors } from "./colors.stylex";
import { conditions } from "./conditions.stylex";
import { fonts } from "./fonts.stylex";
import {
	fontSize,
	fontWeight,
	letterSpacing,
	lineHeight,
} from "./typography.stylex";

// Trims a control label's box to its cap height so text centers optically
// next to icons.
export const typographyStyles = create({
	controlLabel: {
		minWidth: 0,
		// eslint-disable-next-line @stylexjs/valid-styles -- StyleX 0.19 CSS metadata predates text-box; compilation and browser metrics cover it.
		textBox: "trim-both cap alphabetic",
	},
	tabularNums: { fontVariantNumeric: "tabular-nums" },
});

// Type roles (design direction, "Type roles and spacing rhythm"). Each
// role fixes size, absolute line height, weight, and tracking, and normalizes
// x-height through fonts.sizeAdjust. Roles inherit ink so they work inside
// filled controls; caption defaults to muted. Pair `ui` with muted ink for
// supporting text.
export const typeRoles = create({
	body: {
		fontSize: fontSize["16"],
		fontSizeAdjust: fonts.sizeAdjust,
		fontWeight: fontWeight.regular,
		letterSpacing: letterSpacing.normal,
		lineHeight: lineHeight["24"],
		textWrap: "pretty",
	},
	caption: {
		color: colors.mutedContent,
		fontSize: fontSize["12"],
		fontSizeAdjust: fonts.sizeAdjust,
		fontWeight: fontWeight.regular,
		letterSpacing: letterSpacing.caption,
		lineHeight: lineHeight["16"],
	},
	display: {
		fontSize: { [conditions.sm]: fontSize["40"], default: fontSize["32"] },
		fontSizeAdjust: fonts.sizeAdjust,
		fontWeight: fontWeight.semibold,
		letterSpacing: letterSpacing.display,
		lineHeight: {
			[conditions.sm]: lineHeight["44"],
			default: lineHeight["36"],
		},
		textWrap: "balance",
	},
	heading: {
		fontSize: fontSize["20"],
		fontSizeAdjust: fonts.sizeAdjust,
		fontWeight: fontWeight.semibold,
		letterSpacing: letterSpacing.heading,
		lineHeight: lineHeight["28"],
		textWrap: "balance",
	},
	label: {
		fontSize: fontSize["14"],
		fontSizeAdjust: fonts.sizeAdjust,
		fontWeight: fontWeight.medium,
		letterSpacing: letterSpacing.normal,
		lineHeight: lineHeight["20"],
	},
	mono: {
		fontFamily: fonts.mono,
		fontSize: fontSize["13"],
		fontSizeAdjust: fonts.sizeAdjust,
		fontWeight: fontWeight.regular,
		letterSpacing: letterSpacing.normal,
		lineHeight: lineHeight["20"],
	},
	// Narrow screens step down so values and units stay on one line. Medium
	// weight keeps large figures crisp rather than heavy.
	numeric: {
		fontSize: { [conditions.sm]: fontSize["28"], default: fontSize["20"] },
		fontSizeAdjust: fonts.sizeAdjust,
		fontVariantNumeric: "tabular-nums",
		fontWeight: fontWeight.medium,
		letterSpacing: letterSpacing.title,
		lineHeight: {
			[conditions.sm]: lineHeight["32"],
			default: lineHeight["28"],
		},
	},
	subheading: {
		fontSize: fontSize["16"],
		fontSizeAdjust: fonts.sizeAdjust,
		fontWeight: fontWeight.semibold,
		letterSpacing: letterSpacing.subheading,
		lineHeight: lineHeight["24"],
		textWrap: "balance",
	},
	title: {
		fontSize: fontSize["28"],
		fontSizeAdjust: fonts.sizeAdjust,
		fontWeight: fontWeight.semibold,
		letterSpacing: letterSpacing.title,
		lineHeight: lineHeight["32"],
		textWrap: "balance",
	},
	ui: {
		fontSize: fontSize["14"],
		fontSizeAdjust: fonts.sizeAdjust,
		fontWeight: fontWeight.regular,
		letterSpacing: letterSpacing.normal,
		lineHeight: lineHeight["20"],
		textWrap: "pretty",
	},
});
