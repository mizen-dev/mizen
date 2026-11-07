import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";

export const statusDotStyles = create({
	accent: {
		backgroundColor: colors.brandForeground,
	},
	base: {
		blockSize: 8,
		borderRadius: "50%",
		display: "inline-flex",
		flexShrink: 0,
		inlineSize: 8,
	},
	error: {
		backgroundColor: colors.destructive,
	},
	neutral: {
		backgroundColor: colors.controlBorderStrong,
	},
	success: {
		backgroundColor: colors.successSolid,
	},
	warning: {
		backgroundColor: colors.warningSolid,
	},
});
