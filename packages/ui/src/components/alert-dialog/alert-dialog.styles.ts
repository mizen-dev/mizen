import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { space } from "../../styles/spacing.stylex";
import { fontSize, lineHeight } from "../../styles/typography.stylex";

export const alertDialogStyles = create({
	description: {
		fontSize: fontSize["14"],
		lineHeight: lineHeight["20"],
		overflowWrap: "anywhere",
		textWrap: "pretty",
	},
	footer: {
		backgroundColor: colors.workarea,
		flexShrink: 0,
	},
	header: {
		display: "flex",
		flexDirection: "column",
		gap: space["1"],
		minHeight: 0,
		overflowY: "auto",
		overscrollBehavior: "contain",
		paddingBlock: space["6"],
		paddingInline: space["6"],
	},
	popup: { maxWidth: "32rem" },
	title: { fontSize: fontSize["20"], overflowWrap: "anywhere" },
});
