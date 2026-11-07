import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { space } from "../../styles/spacing.stylex";

// A readable measure for the thread and the composer under it.
const MEASURE = "48rem";

export const conversationStyles = create({
	// The transcript and its rail side by side; the jump button floats here.
	body: {
		display: "flex",
		flexGrow: 1,
		minBlockSize: 0,
		position: "relative",
	},
	// The thread's column, centered; it fills the view so an empty state can
	// center in it.
	column: {
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "column",
		marginInline: "auto",
		maxInlineSize: MEASURE,
		minBlockSize: "100%",
		paddingBlock: space["6"],
		paddingInline: space["4"],
	},
	// The rail sits at the end edge; on a narrow view the thread keeps clear.
	columnWithRail: { paddingInlineEnd: space["10"] },
	emptyDescription: { color: colors.mutedContent, margin: 0 },
	// Centered in the view before the first turn; Suggestions sit under it.
	emptyState: {
		// Full width, so Suggestions get the whole column; the words center.
		alignItems: "stretch",
		display: "flex",
		flexDirection: "column",
		flexGrow: 1,
		gap: space["4"],
		justifyContent: "center",
		textAlign: "center",
	},
	emptyText: {
		display: "flex",
		flexDirection: "column",
		gap: space["1"],
	},
	emptyTitle: { color: colors.content, margin: 0 },
	footer: {
		boxSizing: "border-box",
		inlineSize: "100%",
		marginInline: "auto",
		maxInlineSize: MEASURE,
		paddingBlockEnd: space["4"],
		paddingInline: space["4"],
	},
});
