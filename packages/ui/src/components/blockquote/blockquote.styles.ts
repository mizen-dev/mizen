import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { space } from "../../styles/spacing.stylex";

export const blockquoteStyles = create({
	attribution: {
		color: colors.mutedContent,
		minWidth: 0,
		overflowWrap: "anywhere",
	},
	content: {
		borderInlineStartColor: colors.border,
		borderInlineStartStyle: "solid",
		borderInlineStartWidth: 2,
		margin: 0,
		minWidth: 0,
		overflowWrap: "anywhere",
		paddingInlineStart: space["3"],
	},
	root: {
		display: "grid",
		gap: space["3"],
		margin: 0,
		minWidth: 0,
	},
});
