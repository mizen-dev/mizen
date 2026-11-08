import { colors } from "@mizen-labs/ui/colors.stylex";
import { create } from "@stylexjs/stylex";

// Reuse Mizen's categorical swatches, including their dark-theme values.
export const fileTypeIconStyles = create({
	code: { color: colors.chartSeries6 },
	document: { color: colors.brandForeground },
	presentation: { color: colors.chartSeries2 },
	spreadsheet: { color: colors.chartSeries3 },
	video: { color: colors.chartSeries5 },
});
