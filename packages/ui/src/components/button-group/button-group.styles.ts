import { create } from "@stylexjs/stylex";
import { borderWidth, focus } from "../../styles/interaction.stylex";
import { space } from "../../styles/spacing.stylex";

export const buttonGroupStyles = create({
	base: {
		"--mizen-joined-divider-color":
			"color-mix(in oklch, currentColor 12%, transparent)",
		"--mizen-joined-divider-inset": space["2"],
		alignItems: "stretch",
		display: "inline-flex",
		maxWidth: "100%",
		minWidth: 0,
		width: "fit-content",
	},
	horizontal: {
		flexDirection: "row",
		overflowX: "auto",
		paddingBlock: `calc(${borderWidth.focus}px + ${focus.offset})`,
		paddingInline: `calc(${borderWidth.focus}px + ${focus.offset})`,
		scrollPaddingInline: space["1"],
	},
	vertical: { flexDirection: "column" },
});
