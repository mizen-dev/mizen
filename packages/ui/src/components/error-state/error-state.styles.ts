import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { controlSize } from "../../styles/dimensions.stylex";
import { borderWidth } from "../../styles/interaction.stylex";
import { shadows } from "../../styles/shadows.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import {
	fontSize,
	fontWeight,
	letterSpacing,
	lineHeight,
} from "../../styles/typography.stylex";

export const errorStateStyles = create({
	content: {
		alignItems: "center",
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "column",
		gap: space["4"],
		maxWidth: "24rem",
		minWidth: 0,
		textWrap: "balance",
		width: "100%",
	},
	description: {
		boxSizing: "border-box",
		color: colors.secondaryContent,
		fontSize: fontSize["16"],
		fontWeight: fontWeight.regular,
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["24"],
		marginBlock: 0,
		minWidth: 0,
		textWrap: "pretty",
	},
	header: {
		alignItems: "center",
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "column",
		maxWidth: "24rem",
		minWidth: 0,
		textAlign: "center",
		width: "100%",
	},
	media: {
		alignItems: "center",
		backgroundColor: colors.destructiveSubtle,
		borderColor: colors.destructive,
		borderRadius: shape.controlRadius,
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxShadow: shadows.outlineRest,
		boxSizing: "border-box",
		color: colors.destructive,
		display: "flex",
		flexShrink: 0,
		height: controlSize.md,
		justifyContent: "center",
		marginBlockEnd: space["6"],
		position: "relative",
		width: controlSize.md,
	},
	root: {
		alignItems: "center",
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "column",
		gap: space["6"],
		justifyContent: "center",
		minWidth: 0,
		paddingBlock: {
			default: space["6"],
			[conditions.sm]: space["8"],
		},
		paddingInline: {
			default: space["4"],
			[conditions.sm]: space["5"],
		},
		textAlign: "center",
		width: "100%",
	},
	title: {
		boxSizing: "border-box",
		color: colors.content,
		fontSize: fontSize["20"],
		fontWeight: fontWeight.semibold,
		letterSpacing: letterSpacing.heading,
		lineHeight: lineHeight["28"],
		marginBlock: 0,
		marginBlockEnd: space["1"],
		minWidth: 0,
		textWrap: "balance",
	},
});
