import { colors } from "../../styles/colors.stylex";

export const chartColors = {
	// Reference series such as last year: a dashed line or quieter bars.
	muted: colors.chartReference,
	series1: colors.chartSeries1,
	series2: colors.chartSeries2,
	series3: colors.chartSeries3,
	series4: colors.chartSeries4,
	series5: colors.chartSeries5,
	series6: colors.chartSeries6,
} as const;

export type ChartSeriesTone = keyof typeof chartColors;
