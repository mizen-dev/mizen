import { colors } from "@mizen-labs/ui/colors.stylex";
import { shape } from "@mizen-labs/ui/shape.stylex";
import { space } from "@mizen-labs/ui/spacing.stylex";
import { create } from "@stylexjs/stylex";

export const specimenStyles = create({
	examples: {
		display: "grid",
		gap: space["8"],
		gridTemplateColumns: "minmax(0, 1fr)",
		minInlineSize: 0,
	},
	gallery: {
		backgroundColor: colors.workarea,
		borderRadius: shape.controlRadiusLarge,
		boxSizing: "border-box",
		display: "grid",
		gap: space["8"],
		gridTemplateColumns: "minmax(0, 1fr)",
		minInlineSize: 0,
		padding: space["6"],
		width: "100%",
	},
	identity: {
		alignItems: "center",
		display: "grid",
		gap: space["3"],
		gridTemplateColumns: "auto minmax(0, 1fr)",
		minInlineSize: 0,
	},
});
