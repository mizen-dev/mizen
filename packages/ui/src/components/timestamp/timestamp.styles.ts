import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";

export const timestampStyles = create({
	root: {
		color: colors.mutedContent,
		fontVariantNumeric: "tabular-nums",
	},
});
