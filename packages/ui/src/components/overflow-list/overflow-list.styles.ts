import { create } from "@stylexjs/stylex";
import { space } from "../../styles/spacing.stylex";

export const overflowListStyles = create({
	items: {
		alignItems: "center",
		display: "flex",
		flexWrap: "wrap",
		gap: space["2"],
		listStyleType: "none",
		margin: 0,
		minWidth: 0,
		paddingInlineStart: 0,
	},
	menu: {
		display: "flex",
		flexDirection: "column",
		gap: space["1"],
		listStyleType: "none",
		margin: 0,
		minWidth: 0,
		paddingInlineStart: 0,
	},
	triggerItem: { fontVariantNumeric: "tabular-nums" },
});
