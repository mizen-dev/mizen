import { conditions } from "@mizen/ui/conditions.stylex";
import { space } from "@mizen/ui/spacing.stylex";
import { create } from "@stylexjs/stylex";

export const foundationStudyStyles = create({
	actions: {
		alignItems: "center",
		display: "flex",
		flexWrap: "wrap",
		gap: space["2"],
	},
	choice: {
		flexBasis: "auto",
		flexGrow: 0,
		flexShrink: 1,
		maxInlineSize: "100%",
		minWidth: 0,
	},
	choices: {
		alignItems: "start",
		display: "flex",
		flexWrap: "wrap",
		gap: space["3"],
	},
	comparison: {
		display: "grid",
		gap: space["4"],
		gridTemplateColumns: {
			default: "minmax(0, 1fr)",
			[conditions.sm]: "repeat(2, minmax(0, 1fr))",
		},
	},
	context: { minWidth: 0 },
	controlPair: {
		display: "grid",
		gap: space["3"],
		gridTemplateColumns: {
			default: "minmax(0, 1fr)",
			[conditions.sm]: "repeat(2, minmax(0, 1fr))",
		},
	},
	section: { scrollMarginBlockStart: "6rem" },
	tableContent: {
		minWidth: { default: "28rem", [conditions.sm]: "100%" },
	},
	tableScrollHint: {
		display: { default: "block", [conditions.sm]: "none" },
	},
});
