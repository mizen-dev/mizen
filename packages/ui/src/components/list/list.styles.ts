import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { borderWidth } from "../../styles/interaction.stylex";
import { space } from "../../styles/spacing.stylex";

export const listStyles = create({
	actions: {
		alignItems: "center",
		display: "flex",
		flexWrap: "wrap",
		gap: space["2"],
		justifyContent: "flex-end",
		minWidth: 0,
	},
	content: {
		flexBasis: "16rem",
		flexGrow: 1,
		minWidth: 0,
		overflowWrap: "anywhere",
	},
	item: {
		alignItems: "center",
		borderBlockEndColor: colors.border,
		borderBlockEndStyle: "solid",
		// Rows in a vertical list get dividers; chips in an Overflow List do not.
		borderBlockEndWidth: {
			":is([data-slot='overflow-list-items'] > *)": 0,
			":last-child": 0,
			default: borderWidth.thin,
		},
		display: "flex",
		flexWrap: "wrap",
		gap: space["3"],
		minWidth: 0,
		paddingBlock: {
			":is([data-slot='overflow-list-items'] > *)": 0,
			default: space["3"],
		},
	},
	root: {
		display: "flex",
		flexDirection: "column",
		gap: space["0"],
		listStyleType: "none",
		margin: 0,
		minWidth: 0,
		paddingInlineStart: 0,
	},
});
