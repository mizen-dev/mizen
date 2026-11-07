import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import {
	fontSize,
	fontWeight,
	lineHeight,
} from "../../styles/typography.stylex";

export const metricStyles = create({
	// A rounded rectangle, not a pill, so it reads as data beside the value.
	delta: {
		borderRadius: shape.inlineRadius,
		display: "inline-flex",
		flexShrink: 0,
		fontVariantNumeric: "tabular-nums",
		paddingBlock: space.px,
		paddingInline: `calc(${space["1"]} + ${space.px})`,
		whiteSpace: "nowrap",
		// Keeps the chip its own size when Metric stacks it in a column.
		width: "fit-content",
	},
	deltaBetter: {
		backgroundColor: colors.success,
		color: colors.successContent,
	},
	deltaFlat: { backgroundColor: colors.secondary, color: colors.mutedContent },
	deltaWorse: {
		backgroundColor: colors.destructiveSubtle,
		color: colors.destructiveText,
	},
	description: {
		color: colors.mutedContent,
		fontSize: fontSize["14"],
		fontWeight: fontWeight.regular,
		lineHeight: lineHeight["20"],
		margin: 0,
		minWidth: 0,
		overflowWrap: "break-word",
	},
	label: {
		color: colors.mutedContent,
		fontSize: fontSize["14"],
		fontWeight: fontWeight.medium,
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
