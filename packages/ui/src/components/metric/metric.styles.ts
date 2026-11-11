import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { borderWidth } from "../../styles/interaction.stylex";
import { space } from "../../styles/spacing.stylex";
import {
	fontSize,
	fontWeight,
	letterSpacing,
	lineHeight,
} from "../../styles/typography.stylex";

export const metricStyles = create({
	// A hairline pill with ink text, like a status badge; the dot says whether
	// the change is good.
	delta: {
		"::before": {
			backgroundColor: "var(--mizen-metric-delta)",
			borderRadius: "9999px",
			content: '""',
			flexShrink: 0,
			height: "0.375rem",
			width: "0.375rem",
		},
		alignItems: "center",
		borderColor: colors.border,
		borderRadius: "0.625rem",
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxSizing: "border-box",
		color: colors.content,
		display: "inline-flex",
		flexShrink: 0,
		fontSize: fontSize["12"],
		fontVariantNumeric: "tabular-nums",
		gap: "0.375rem",
		letterSpacing: letterSpacing.normal,
		lineHeight: lineHeight["16"],
		minHeight: "1.25rem",
		paddingInline: "0.375rem",
		whiteSpace: "nowrap",
		// Keeps the chip its own size when Metric stacks it in a column.
		width: "fit-content",
	},
	deltaBetter: { "--mizen-metric-delta": colors.successSolid },
	deltaFlat: { "--mizen-metric-delta": colors.controlBorderStrong },
	deltaWorse: { "--mizen-metric-delta": colors.destructive },
	description: {
		color: colors.mutedContent,
		fontSize: fontSize["13"],
		fontWeight: fontWeight.regular,
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
		margin: 0,
		minWidth: 0,
		overflowWrap: "break-word",
		textWrap: "pretty",
	},
	label: {
		color: colors.mutedContent,
		fontSize: fontSize["13"],
		fontWeight: fontWeight.medium,
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
		margin: 0,
		minWidth: 0,
		overflowWrap: "break-word",
	},
	root: {
		display: "flex",
		flexDirection: "column",
		gap: space["1"],
		margin: 0,
		minWidth: 0,
	},
	value: {
		color: colors.content,
		margin: 0,
		minWidth: 0,
		overflowWrap: "anywhere",
	},
});
