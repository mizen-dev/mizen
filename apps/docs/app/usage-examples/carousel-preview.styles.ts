import { shape } from "@mizen/ui/shape.stylex";
import { space } from "@mizen/ui/spacing.stylex";
import { create } from "@stylexjs/stylex";

export const carouselPreviewStyles = create({
	controls: {
		alignItems: "center",
		display: "flex",
		gap: space["2"],
		justifyContent: "space-between",
		marginBlockStart: space["3"],
	},
	image: {
		blockSize: "100%",
		borderRadius: shape.controlRadiusLarge,
		display: "block",
		inlineSize: "100%",
		objectFit: "cover",
	},
	// A carousel reads at a comfortable photo width, not the full stage.
	root: { inlineSize: "100%", marginInline: "auto", maxInlineSize: "32rem" },
});
