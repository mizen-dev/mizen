import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { space } from "../../styles/spacing.stylex";
import { fontWeight } from "../../styles/typography.stylex";

const PILL = "1.25rem";

export const funnelStyles = create({
	// The fill never shrinks below a circle, so tiny stages stay visible.
	fill: (inlineSize: string, backgroundColor: string) => ({
		alignItems: "center",
		backgroundColor,
		borderRadius: "999px",
		color: colors.accentContent,
		display: "flex",
		inlineSize,
		minInlineSize: PILL,
		paddingInlineStart: "0.1875rem",
	}),
	icon: {
		display: "inline-flex",
		height: { ":is(*) > svg": "0.875rem", default: "auto" },
		width: { ":is(*) > svg": "0.875rem", default: "auto" },
	},
	label: {
		color: colors.mutedContent,
		overflow: "hidden",
		textAlign: "end",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	list: {
		alignItems: "center",
		columnGap: space["3"],
		display: "grid",
		gridTemplateColumns: "minmax(0, max-content) minmax(4rem, 1fr) max-content",
		listStyle: "none",
		margin: 0,
		padding: 0,
		rowGap: space["3"],
	},
	root: {
		minWidth: 0,
	},
	// Each stage spans the list's three columns so they align across stages.
	row: {
		display: "grid",
		gridColumnEnd: -1,
		gridColumnStart: 1,
		gridTemplateColumns: "subgrid",
	},
	share: {
		color: colors.mutedContent,
		display: "inline-block",
		fontVariantNumeric: "tabular-nums",
		marginInlineStart: space["2"],
		minInlineSize: "2.5rem",
		textAlign: "end",
	},
	track: {
		backgroundColor: colors.controlSurface,
		blockSize: PILL,
		borderRadius: "999px",
		display: "flex",
		overflow: "hidden",
	},
	value: {
		color: colors.content,
		fontVariantNumeric: "tabular-nums",
		fontWeight: fontWeight.medium,
		textAlign: "end",
	},
});
