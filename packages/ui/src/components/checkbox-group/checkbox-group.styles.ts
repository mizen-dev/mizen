import { create } from "@stylexjs/stylex";
import { space } from "../../styles/spacing.stylex";

export const checkboxGroupStyles = create({
	root: {
		display: "flex",
		flexDirection: "column",
		gap: space["2"],
		width: "100%",
	},
});
