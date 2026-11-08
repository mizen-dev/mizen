import { colors } from "@mizen-labs/ui/colors.stylex";
import { space } from "@mizen-labs/ui/spacing.stylex";
import { fontSize, lineHeight } from "@mizen-labs/ui/typography.stylex";
import { create } from "@stylexjs/stylex";

export const pressStyles = create({
	cell: {
		alignItems: "center",
		display: "flex",
		justifyContent: "center",
		padding: space["6"],
	},
	label: {
		color: colors.mutedContent,
		fontSize: fontSize["12"],
		lineHeight: lineHeight["16"],
		margin: 0,
	},
	page: {
		display: "grid",
		gap: space["8"],
		marginInline: "auto",
		maxInlineSize: "64rem",
		paddingBlock: space["8"],
		paddingInline: space["4"],
	},
	row: {
		alignItems: "center",
		display: "flex",
		flexWrap: "wrap",
		gap: space["3"],
	},
	wide: { display: "grid", inlineSize: "22.5rem" },
});
