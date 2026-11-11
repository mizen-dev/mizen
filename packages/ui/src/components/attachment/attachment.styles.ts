import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { borderWidth } from "../../styles/interaction.stylex";
import { shadows } from "../../styles/shadows.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import { fontSize, fontWeight } from "../../styles/typography.stylex";

export const attachmentStyles = create({
	actions: {
		alignItems: "center",
		display: "flex",
		flexShrink: 0,
		flexWrap: "wrap",
		gap: space["1"],
		maxInlineSize: "100%",
		minInlineSize: 0,
		overflowWrap: "anywhere",
	},
	content: {
		display: "flex",
		flexDirection: "column",
		flexGrow: 1,
		gap: space["1"],
		minWidth: 0,
	},
	description: {
		color: colors.mutedContent,
		display: "block",
		fontSize: fontSize["13"],
		minWidth: 0,
		overflowWrap: "anywhere",
	},
	media: {
		alignItems: "center",
		aspectRatio: 1,
		backgroundColor: colors.secondary,
		// Nests inside the card corner: its radius minus the inset and border.
		borderRadius: `calc(${shape.surfaceRadius} - ${space["4"]} - ${borderWidth.thin})`,
		// A file-type glyph recedes so the name leads.
		color: colors.mutedContent,
		display: "grid",
		flexShrink: 0,
		height: "3rem",
		justifyItems: "center",
		overflow: "hidden",
		width: "3rem",
	},
	name: {
		display: "block",
		fontWeight: fontWeight.medium,
		minWidth: 0,
		overflowWrap: "anywhere",
	},
	root: {
		alignItems: "center",
		backgroundColor: colors.surface,
		borderColor: colors.border,
		borderRadius: shape.surfaceRadius,
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxShadow: shadows.surface,
		boxSizing: "border-box",
		color: colors.content,
		display: "flex",
		flexWrap: "wrap",
		gap: space["3"],
		minWidth: 0,
		padding: space["4"],
		width: "100%",
	},
});
