import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import { fontWeight } from "../../styles/typography.stylex";

export const progressRingsStyles = create({
	compact: {
		display: "inline-flex",
	},
	label: {
		alignItems: "center",
		color: colors.mutedContent,
		display: "flex",
		gap: space["2"],
		minWidth: 0,
	},
	list: {
		display: "grid",
		gap: space["2"],
		gridTemplateColumns: "repeat(auto-fit, minmax(7rem, 1fr))",
		listStyle: "none",
		margin: 0,
		padding: 0,
	},
	// A figure, so the browser margin is reset.
	root: {
		alignItems: "center",
		display: "flex",
		flexDirection: "column",
		gap: space["4"],
		margin: 0,
		minWidth: 0,
	},
	share: {
		color: colors.mutedContent,
		fontVariantNumeric: "tabular-nums",
		marginInlineStart: space["1"],
	},
	swatch: (backgroundColor: string) => ({
		backgroundColor,
		blockSize: "0.625rem",
		borderRadius: 3,
		flexShrink: 0,
		inlineSize: "0.625rem",
	}),
	// Value tiles sit on the surface inside a workarea card.
	tile: {
		alignSelf: "stretch",
		backgroundColor: colors.surface,
		borderRadius: shape.controlRadius,
		display: "flex",
		flexDirection: "column",
		gap: space["1"],
		minWidth: 0,
		paddingBlock: space["2"],
		paddingInline: space["3"],
	},
	tiles: { alignSelf: "stretch" },
	value: {
		color: colors.content,
		fontVariantNumeric: "tabular-nums",
		fontWeight: fontWeight.medium,
	},
});
