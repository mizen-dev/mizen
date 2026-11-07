import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";

export const headingStyles = create({
	base: {
		color: colors.content,
		marginBlock: 0,
		overflowWrap: "anywhere",
	},
});
