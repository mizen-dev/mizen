import { create } from "@stylexjs/stylex";
import { space } from "../../styles/spacing.stylex";

export const timeSeriesStyles = create({
	empty: {
		marginBlock: 0,
	},
	legend: {
		marginBlockStart: space["2"],
	},
	root: {
		minWidth: 0,
	},
	sparkline: {
		maxWidth: 256,
		width: "100%",
	},
});
