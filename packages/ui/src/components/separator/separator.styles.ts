import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { borderWidth } from "../../styles/interaction.stylex";

export const separatorStyles = create({
	base: {
		backgroundColor: colors.border,
		borderStyle: "none",
		borderWidth: 0,
		height: borderWidth.thin,
		margin: 0,
		width: "100%",
	},
});
