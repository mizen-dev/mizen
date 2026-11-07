import { create } from "@stylexjs/stylex";
import { space } from "../../styles/spacing.stylex";

export const groupStyles = create({
	base: {
		alignItems: "center",
		display: "flex",
		flexDirection: "row",
		flexWrap: "wrap",
		gap: space["2"],
		minWidth: 0,
	},
});
