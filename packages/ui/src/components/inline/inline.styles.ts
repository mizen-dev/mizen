import { create } from "@stylexjs/stylex";
import { space } from "../../styles/spacing.stylex";

export const inlineStyles = create({
	base: {
		alignItems: "center",
		display: "flex",
		flexDirection: "row",
		flexWrap: "wrap",
		gap: space["3"],
		minWidth: 0,
	},
});
