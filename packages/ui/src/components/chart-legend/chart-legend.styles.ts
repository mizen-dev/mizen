import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import { fontWeight } from "../../styles/typography.stylex";

export const chartLegendSwatches = create({
	muted: { backgroundColor: colors.chartReference },
	series1: { backgroundColor: colors.chartSeries1 },
	series2: { backgroundColor: colors.chartSeries2 },
	series3: { backgroundColor: colors.chartSeries3 },
	series4: { backgroundColor: colors.chartSeries4 },
	series5: { backgroundColor: colors.chartSeries5 },
	series6: { backgroundColor: colors.chartSeries6 },
});

export const chartLegendStyles = create({
	item: {
		alignItems: "center",
		display: "flex",
		gap: space["2"],
		maxInlineSize: "100%",
		minWidth: 0,
	},
	list: {
		columnGap: space["3"],
		display: "flex",
		flexWrap: "wrap",
		listStyle: "none",
		margin: 0,
		padding: 0,
		rowGap: space["2"],
	},
	name: {
		alignItems: "center",
		display: "flex",
		gap: space["2"],
		minWidth: 0,
	},
	// Labels are quiet so the swatches and values carry the legend.
	root: {
		color: colors.mutedContent,
		fontWeight: fontWeight.medium,
		minWidth: 0,
	},
	swatch: {
		blockSize: 6,
		borderRadius: "999px",
		flexShrink: 0,
		inlineSize: 6,
	},
	// A value tile on the surface inside a workarea card; its corners nest
	// inside the card's 16px corners.
	tile: {
		backgroundColor: colors.surface,
		borderRadius: `calc(${shape.controlRadiusLarge} - ${space["2"]})`,
		display: "flex",
		flexDirection: "column",
		gap: space["1"],
		minWidth: 0,
		paddingBlock: space["2"],
		paddingInline: space["3"],
	},
	tileSwatch: { blockSize: 12, borderRadius: 4, inlineSize: 12 },
	tiles: {
		display: "grid",
		gap: space["2"],
		gridTemplateColumns: "repeat(auto-fit, minmax(7rem, 1fr))",
		listStyle: "none",
		margin: 0,
		padding: 0,
	},
	tileValue: { marginInlineStart: 0 },
	value: {
		color: colors.content,
		fontVariantNumeric: "tabular-nums",
		fontWeight: fontWeight.medium,
		marginInlineStart: space["1"],
	},
});
