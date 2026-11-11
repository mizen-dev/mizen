import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { space } from "../../styles/spacing.stylex";
import { fontWeight } from "../../styles/typography.stylex";

export const partToWholeStyles = create({
	chart: {
		alignItems: "center",
		display: "grid",
		gap: space["4"],
		gridTemplateColumns: {
			"@container (min-width: 36rem)": "minmax(0, 1fr) minmax(0, 18rem)",
			default: "minmax(0, 1fr)",
		},
	},
	empty: { marginBlock: 0 },
	label: { overflowWrap: "anywhere" },
	legend: { minInlineSize: 0 },
	plot: { minInlineSize: 0, position: "relative" },
	root: { containerType: "inline-size", minWidth: 0 },
	// Shares fill one column, so the values before them line up across rows.
	share: {
		color: colors.mutedContent,
		display: "inline-block",
		fontWeight: fontWeight.regular,
		minInlineSize: "3rem",
		textAlign: "end",
	},
	total: {
		alignItems: "center",
		color: colors.content,
		display: "flex",
		flexDirection: "column",
		inset: 0,
		justifyContent: "center",
		pointerEvents: "none",
		position: "absolute",
	},
	// The total sits in the donut hole; pointer events pass to the chart.
	totalLabel: { color: colors.mutedContent },
});
