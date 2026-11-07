import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { fonts } from "../../styles/fonts.stylex";
import {
	fontSize,
	fontWeight,
	letterSpacing,
	lineHeight,
} from "../../styles/typography.stylex";

export const fieldsetStyles = create({
	// Subheading role.
	legend: {
		color: colors.content,
		fontSize: fontSize["16"],
		fontSizeAdjust: fonts.sizeAdjust,
		fontWeight: fontWeight.semibold,
		letterSpacing: letterSpacing.subheading,
		lineHeight: lineHeight["24"],
	},
	root: {
		borderStyle: "none",
		borderWidth: 0,
		margin: 0,
		minWidth: 0,
		padding: 0,
	},
});
