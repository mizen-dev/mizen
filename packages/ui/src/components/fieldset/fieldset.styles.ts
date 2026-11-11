import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { fonts } from "../../styles/fonts.stylex";
import { space } from "../../styles/spacing.stylex";
import {
	fontSize,
	fontWeight,
	letterSpacing,
	lineHeight,
} from "../../styles/typography.stylex";

export const fieldsetStyles = create({
	// Titles a group of fields at the content size.
	legend: {
		color: colors.content,
		fontSize: fontSize["14"],
		fontSizeAdjust: fonts.sizeAdjust,
		fontWeight: fontWeight.semibold,
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
		// A legend that titles a choice group adds 4px to the 8px item gap.
		marginBlockEnd: {
			":is([role='group'] > *, [role='radiogroup'] > *)": space["1"],
			default: 0,
		},
	},
	root: {
		borderStyle: "none",
		borderWidth: 0,
		margin: 0,
		minWidth: 0,
		padding: 0,
	},
});
