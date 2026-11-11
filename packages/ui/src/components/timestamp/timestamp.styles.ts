import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";

export const timestampStyles = create({
	// Size and line height come from the text around it.
	root: {
		color: colors.mutedContent,
		fontVariantNumeric: "tabular-nums",
	},
});
