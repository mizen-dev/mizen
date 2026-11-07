import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { shadows } from "../../styles/shadows.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import { fontWeight } from "../../styles/typography.stylex";

export const chartTooltipSwatches = create({
	muted: { backgroundColor: colors.chartReference },
	series1: { backgroundColor: colors.chartSeries1 },
	series2: { backgroundColor: colors.chartSeries2 },
	series3: { backgroundColor: colors.chartSeries3 },
	series4: { backgroundColor: colors.chartSeries4 },
	series5: { backgroundColor: colors.chartSeries5 },
	series6: { backgroundColor: colors.chartSeries6 },
});

export const chartTooltipStyles = create({
	label: {
		fontWeight: fontWeight.semibold,
		margin: 0,
	},
	root: {
		backgroundColor: colors.floatingSurface,
		borderColor: {
			[conditions.moreContrast]: colors.controlBorderStrong,
			default: colors.border,
		},
		borderRadius: shape.controlRadius,
		borderStyle: "solid",
		borderWidth: 1,
		boxShadow: shadows.floating,
		color: colors.content,
		display: "grid",
		gap: space["2"],
		minWidth: 0,
		paddingBlock: space["2"],
		paddingInline: space["3"],
	},
	row: {
		alignItems: "baseline",
		display: "grid",
		gap: space["3"],
		gridTemplateColumns: "minmax(0, 1fr) auto",
	},
	rows: {
		display: "grid",
		gap: space["1"],
		margin: 0,
	},
	swatch: {
		blockSize: 6,
		borderRadius: "50%",
		flexShrink: 0,
		inlineSize: 6,
	},
	term: {
		alignItems: "center",
		color: colors.secondaryContent,
		display: "flex",
		gap: space["1"],
		minWidth: 0,
	},
	value: {
		fontVariantNumeric: "tabular-nums",
		fontWeight: fontWeight.medium,
		margin: 0,
		textAlign: "end",
	},
});
