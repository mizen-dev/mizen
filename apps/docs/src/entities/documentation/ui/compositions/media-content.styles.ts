import { colors } from "@mizen-labs/ui/colors.stylex";
import { shape } from "@mizen-labs/ui/shape.stylex";
import { space } from "@mizen-labs/ui/spacing.stylex";
import { create } from "@stylexjs/stylex";

export const mediaContentStyles = create({
	image: {
		display: "block",
		height: "100%",
		objectFit: "cover",
		width: "100%",
	},
	preview: {
		borderRadius: shape.controlRadiusLarge,
		marginInline: "auto",
		maxWidth: "36rem",
		overflow: "hidden",
		width: "100%",
	},
	rounded: { borderRadius: shape.controlRadiusLarge },
	study: {
		backgroundColor: colors.surface,
		borderColor: colors.border,
		borderRadius: shape.controlRadiusLarge,
		borderStyle: "solid",
		borderWidth: 1,
		minWidth: 0,
		padding: space["6"],
	},
});
