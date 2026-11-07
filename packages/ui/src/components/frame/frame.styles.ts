import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { borderWidth } from "../../styles/interaction.stylex";
import { shadows } from "../../styles/shadows.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import {
	fontSize,
	fontWeight,
	lineHeight,
} from "../../styles/typography.stylex";

export const frameStyles = create({
	description: {
		boxSizing: "border-box",
		color: colors.secondaryContent,
		fontSize: fontSize["14"],
		fontWeight: fontWeight.regular,
		lineHeight: lineHeight["20"],
	},
	footer: {
		boxSizing: "border-box",
		paddingBlock: space["4"],
		paddingInline: space["5"],
	},
	frame: {
		backgroundColor: colors.secondary,
		borderRadius: shape.surfaceRadiusLarge,
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "column",
		// with flex gap, which also spaces header, panel, and footer siblings by 4px.
		gap: space["1"],
		minWidth: 0,
		padding: space["1"],
		position: "relative",
		width: "100%",
	},
	header: {
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "column",
		paddingBlock: space["4"],
		paddingInline: space["5"],
	},
	panel: {
		backgroundClip: "padding-box",
		backgroundColor: colors.surface,
		borderColor: colors.border,
		borderRadius: shape.surfaceRadius,
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxShadow: shadows.outlineRest,
		boxSizing: "border-box",
		minWidth: 0,
		padding: space["5"],
		position: "relative",
	},
	title: {
		boxSizing: "border-box",
		color: colors.content,
		fontSize: fontSize["14"],
		fontWeight: fontWeight.semibold,
		lineHeight: lineHeight["20"],
	},
});
