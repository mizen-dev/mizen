import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { fonts } from "../../styles/fonts.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";

// Inline code follows the surrounding text: em size with matched x-height,
// and the parent's line height so it never stretches the line box.
export const codeStyles = create({
	base: {
		backgroundColor: colors.controlSurface,
		borderRadius: shape.inlineRadius,
		color: colors.content,
		fontFamily: fonts.mono,
		// eslint-disable-next-line no-restricted-syntax -- inline code scales with its surrounding role.
		fontSize: "0.9em",
		fontSizeAdjust: fonts.sizeAdjust,
		lineHeight: "inherit",
		overflowWrap: "anywhere",
		paddingInline: space["1"],
	},
});
