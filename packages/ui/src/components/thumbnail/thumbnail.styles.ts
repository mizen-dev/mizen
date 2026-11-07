import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { shape } from "../../styles/shape.stylex";

export const thumbnailStyles = create({
	defaultSize: {
		height: "3rem",
		width: "3rem",
	},
	image: {
		aspectRatio: 1,
		backgroundColor: colors.secondary,
		// Filling an attachment tile, it follows the tile's nested corner.
		borderRadius: {
			":is([data-slot='attachment-media'] > *)": "inherit",
			default: shape.controlRadiusLarge,
		},
		display: "block",
		objectFit: "cover",
	},
	lg: {
		height: "4rem",
		width: "4rem",
	},
	sm: {
		borderRadius: {
			":is([data-slot='attachment-media'] > *)": "inherit",
			default: shape.controlRadius,
		},
		height: "2rem",
		width: "2rem",
	},
});
