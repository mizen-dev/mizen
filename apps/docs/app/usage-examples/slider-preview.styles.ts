import { space } from "@mizen/ui/spacing.stylex";
import { create } from "@stylexjs/stylex";

export const sliderPreviewStyles = create({
	valueRow: {
		alignItems: "baseline",
		display: "flex",
		gap: space["2"],
		justifyContent: "space-between",
	},
});
