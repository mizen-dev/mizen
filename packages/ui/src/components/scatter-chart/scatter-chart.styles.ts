import { create } from "@stylexjs/stylex";
import { space } from "../../styles/spacing.stylex";

export const scatterChartStyles = create({
	legend: { marginBlockStart: space["2"] },
	root: { minWidth: 0 },
});
