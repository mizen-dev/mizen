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
	label: {
		borderBlockEndColor: colors.border,
		borderBlockEndStyle: "solid",
		borderBlockEndWidth: 1,
		display: "grid",
		gap: space["3"],
		gridTemplateColumns: "minmax(0, 1fr) auto",
		inlineSize: "100%",
		minInlineSize: 0,
		overflowWrap: "anywhere",
		paddingBlock: space["2"],
		textAlign: "start",
	},
	legend: { minInlineSize: 0 },
	plot: { minInlineSize: 0, position: "relative" },
	root: { containerType: "inline-size", minWidth: 0 },
	share: {
		color: colors.mutedContent,
		display: "inline-block",
		fontVariantNumeric: "tabular-nums",
		minInlineSize: "2.5rem",
		textAlign: "end",
	},
	// The total sits in the donut hole; pointer events pass to the chart.
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
	value: {
		color: colors.content,
		fontVariantNumeric: "tabular-nums",
		fontWeight: fontWeight.medium,
	},
});
