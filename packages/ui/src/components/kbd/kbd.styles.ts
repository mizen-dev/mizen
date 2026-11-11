import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { borderWidth } from "../../styles/interaction.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import {
	fontSize,
	fontWeight,
	letterSpacing,
	lineHeight,
} from "../../styles/typography.stylex";

export const kbdStyles = create({
	group: {
		alignItems: "center",
		display: "inline-flex",
		fontFamily: "inherit",
		gap: space["1"],
	},
	root: {
		alignItems: "center",
		backgroundColor: colors.secondary,
		borderColor: colors.border,
		borderRadius: shape.checkboxRadius,
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxSizing: "border-box",
		color: colors.secondaryContent,
		display: "inline-flex",
		fontFamily: "inherit",
		fontSize: fontSize["12"],
		fontWeight: fontWeight.medium,
		gap: space["1"],
		height: "1.25rem",
		justifyContent: "center",
		letterSpacing: letterSpacing.caption,
		lineHeight: lineHeight["16"],
		minWidth: "1.25rem",
		paddingInline: space["1"],
		pointerEvents: "none",
		userSelect: "none",
		whiteSpace: "nowrap",
	},
});
