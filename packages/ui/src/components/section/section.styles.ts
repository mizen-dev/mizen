import { create } from "@stylexjs/stylex";
import { space } from "../../styles/spacing.stylex";

export const sectionStyles = create({
	base: {
		display: "flex",
		flexDirection: "column",
		gap: space["4"],
		minWidth: 0,
	},
});
