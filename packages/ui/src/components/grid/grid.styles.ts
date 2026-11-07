import { create } from "@stylexjs/stylex";
import { conditions } from "../../styles/conditions.stylex";
import { space } from "../../styles/spacing.stylex";

export const gridStyles = create({
	base: {
		display: "grid",
		gap: space["3"],
		gridTemplateColumns: {
			default: "minmax(0, 1fr)",
			[conditions.sm]: "repeat(2, minmax(0, 1fr))",
		},
		minWidth: 0,
	},
});
