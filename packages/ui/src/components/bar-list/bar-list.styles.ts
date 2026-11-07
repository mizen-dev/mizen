import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { glyphSize } from "../../styles/dimensions.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import { fontWeight } from "../../styles/typography.stylex";

export const barListStyles = create({
	// The bar sits behind the label; its width is the row's share of the largest.
	bar: (inlineSize: string, backgroundColor: string) => ({
		backgroundColor,
		borderRadius: shape.controlRadius,
		inlineSize,
		insetBlock: 0,
		insetInlineStart: 0,
		position: "absolute",
	}),
	header: {
		color: colors.mutedContent,
		display: "flex",
		justifyContent: "space-between",
		paddingInline: space["3"],
	},
	icon: {
		color: colors.mutedContent,
		display: "inline-flex",
		flexShrink: 0,
		height: { ":is(*) > svg": glyphSize.sm, default: "auto" },
		width: { ":is(*) > svg": glyphSize.sm, default: "auto" },
	},
	item: {
		alignItems: "center",
		display: "flex",
		gap: space["3"],
		justifyContent: "space-between",
		minBlockSize: "2rem",
		paddingInline: space["3"],
		position: "relative",
	},
	label: {
		alignItems: "center",
		color: colors.content,
		display: "flex",
		gap: space["2"],
		minWidth: 0,
		overflow: "hidden",
		position: "relative",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	list: {
		display: "flex",
		flexDirection: "column",
		gap: space["1"],
		listStyle: "none",
		margin: 0,
		padding: 0,
	},
	root: {
		display: "flex",
		flexDirection: "column",
		gap: space["2"],
		minWidth: 0,
	},
	value: {
		color: colors.content,
		flexShrink: 0,
		fontVariantNumeric: "tabular-nums",
		fontWeight: fontWeight.medium,
		position: "relative",
	},
});
