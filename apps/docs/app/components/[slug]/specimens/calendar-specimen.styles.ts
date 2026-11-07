import { space } from "@mizen-labs/ui/spacing.stylex";
import { create } from "@stylexjs/stylex";

export const specimenStyles = create({
	grid: {
		display: "grid",
		gap: space["4"],
		gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 20rem), 1fr))",
	},
	panel: {
		display: "flex",
		flexDirection: "column",
		gap: space["2"],
		inlineSize: "100%",
		minInlineSize: 0,
	},
	root: {
		display: "flex",
		flexDirection: "column",
		gap: space["4"],
		inlineSize: "100%",
		maxInlineSize: "48rem",
	},
});
