import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { borderWidth } from "../../styles/interaction.stylex";
import { shadows } from "../../styles/shadows.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";

export const approvalCardStyles = create({
	actions: {
		display: "flex",
		flexWrap: "wrap",
		gap: space["2"],
		marginInlineStart: "auto",
	},
	// The surface that waits on the person, like Composer: raised, with a
	// hairline and a soft shadow, and a 16px inset as in compact popovers.
	card: {
		backgroundColor: colors.surface,
		borderColor: colors.border,
		borderRadius: shape.floatingRadius,
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxShadow: shadows.surface,
		display: "flex",
		flexDirection: "column",
		gap: space["4"],
		margin: 0,
		minInlineSize: 0,
		padding: space["4"],
	},
	description: { color: colors.mutedContent, margin: 0 },
	detailLabel: { color: colors.mutedContent },
	// Each pair is one row of the grid.
	detailRow: { display: "contents" },
	// Label and value pairs, what the action will do.
	details: {
		// Labels and values share a baseline across their two type sizes.
		alignItems: "baseline",
		columnGap: space["3"],
		display: "grid",
		gridTemplateColumns: "max-content minmax(0, 1fr)",
		margin: 0,
		rowGap: space["1"],
	},
	detailValue: { margin: 0, minInlineSize: 0, overflowWrap: "anywhere" },
	footer: {
		alignItems: "center",
		display: "flex",
		flexWrap: "wrap",
		gap: space["2"],
		justifyContent: "space-between",
	},
	// What kind of request this is, the request, then why.
	head: { display: "flex", flexDirection: "column", gap: space["1"] },
	kind: {
		alignItems: "center",
		color: colors.mutedContent,
		display: "flex",
		gap: space["2"],
		margin: 0,
		marginBlockEnd: space["1"],
	},
	kindIcon: { display: "flex", flexShrink: 0 },
	note: { display: "flex", flexDirection: "column", gap: space["2"] },
	noteLabel: { color: colors.mutedContent },
	resolvedApproved: { color: colors.successSolid },
	resolvedDenied: { color: colors.mutedContent },
	title: { color: colors.content, margin: 0 },
});
