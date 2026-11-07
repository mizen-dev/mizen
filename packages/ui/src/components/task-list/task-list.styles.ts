import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { borderWidth } from "../../styles/interaction.stylex";
import { space } from "../../styles/spacing.stylex";

// Steps line up with the header: marker under its icon, title under its text.
export const taskListStyles = create({
	detail: { color: colors.mutedContent, margin: 0 },
	duration: {
		color: colors.mutedContent,
		fontVariantNumeric: "tabular-nums",
		whiteSpace: "nowrap",
	},
	error: {
		alignItems: "flex-start",
		display: "flex",
		flexWrap: "wrap",
		gap: space["2"],
		justifyContent: "space-between",
	},
	errorText: { color: colors.destructiveText, margin: 0 },
	marker: {
		alignItems: "center",
		blockSize: space["6"],
		color: colors.mutedContent,
		display: "inline-flex",
		flexShrink: 0,
		inlineSize: space["4"],
		justifyContent: "center",
	},
	markerComplete: { color: colors.successSolid },
	markerError: { color: colors.destructiveText },
	meta: { color: colors.mutedContent, fontVariantNumeric: "tabular-nums" },
	step: {
		alignItems: "flex-start",
		display: "flex",
		gap: space["2"],
		minInlineSize: 0,
		paddingBlock: space["1"],
		position: "relative",
	},
	stepBody: {
		display: "flex",
		flexDirection: "column",
		flexGrow: 1,
		gap: space["1"],
		minInlineSize: 0,
		paddingBlock: 2,
	},
	// A hairline from this marker's box to the next one's, through the marker
	// column's center. The icons' own padding leaves air at each end. It is
	// drawn on ::after; ::before is where press surfaces paint their fill.
	stepConnected: {
		"::after": {
			backgroundColor: colors.controlBorderStrong,
			content: "''",
			inlineSize: borderWidth.thin,
			insetBlockEnd: `calc(-1 * (${space["2"]} + ${space["1"]}))`,
			insetBlockStart: `calc(${space["1"]} + ${space["6"]})`,
			insetInlineStart: `calc(${space["4"]} / 2 - ${borderWidth.thin}px / 2)`,
			position: "absolute",
		},
	},
	stepHead: {
		alignItems: "baseline",
		display: "flex",
		gap: space["2"],
		justifyContent: "space-between",
		minInlineSize: 0,
	},
	steps: {
		display: "flex",
		flexDirection: "column",
		gap: space["2"],
		listStyle: "none",
		margin: 0,
		padding: 0,
	},
	// A plan is read in full, so long titles wrap instead of cutting off.
	stepTitle: { minInlineSize: 0, overflowWrap: "anywhere" },
	titlePending: { color: colors.mutedContent },
});
