import { space } from "@mizen/ui/spacing.stylex";
import { create } from "@stylexjs/stylex";
export const chartExampleStyles = create({
	header: {
		alignItems: "flex-start",
		display: "flex",
		flexWrap: "wrap",
		gap: space["4"],
		justifyContent: "space-between",
	},
	workarea: { maxInlineSize: "56rem", minInlineSize: 0 },
});
