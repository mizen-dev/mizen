import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { controlSize, glyphSize } from "../../styles/dimensions.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import {
	fontSize,
	fontWeight,
	lineHeight,
} from "../../styles/typography.stylex";

export const metricTrendStyles = create({
	actions: {
		alignItems: "center",
		display: "flex",
		flexShrink: 0,
		flexWrap: "wrap",
		gap: space["2"],
	},
	// An inset strip 8px from the card's edges, so its corners are the card's
	// radius less 8px.
	footer: {
		alignItems: "center",
		backgroundColor: colors.surface,
		borderRadius: `calc(${shape.controlRadiusLarge} - ${space["2"]})`,
		display: "flex",
		gap: space["3"],
		justifyContent: "space-between",
		// The card's 12px bottom inset less 4px leaves the strip 8px from the edge.
		marginBlockEnd: `calc(-1 * ${space["1"]})`,
		marginBlockStart: "auto",
		marginInline: `calc(-1 * ${space["2"]})`,
		minWidth: 0,
		paddingBlock: space["2"],
		paddingInline: space["3"],
	},
	header: {
		alignItems: "flex-start",
		display: "flex",
		flexWrap: "wrap",
		gap: space["3"],
		justifyContent: "space-between",
		minWidth: 0,
	},
	// The glyph sits in a quiet brand tile, like a stat card's category mark.
	// A small brand tile leads the label: Mizen's mark on every card.
	icon: {
		alignItems: "center",
		backgroundColor: colors.brandBackground,
		borderRadius: shape.inlineRadius,
		color: colors.brandForeground,
		display: "inline-flex",
		flexShrink: 0,
		height: { ":is(*) > svg": glyphSize.xs, default: controlSize["2xs"] },
		justifyContent: "center",
		width: { ":is(*) > svg": glyphSize.xs, default: controlSize["2xs"] },
	},
	labelRow: {
		alignItems: "center",
		display: "inline-flex",
		gap: space["2"],
		minWidth: 0,
	},
	lead: {
		alignItems: "flex-start",
		display: "flex",
		flexDirection: "column",
		gap: space["3"],
		minWidth: 0,
	},
	prefix: { marginInlineEnd: space.px },
	// A dashboard card: tighter corners than page Cards, a roomy gap between the
	// headline and the chart, and a shorter bottom inset under axis labels.
	root: {
		backgroundColor: colors.workarea,
		borderRadius: shape.controlRadiusLarge,
		display: "flex",
		flexDirection: "column",
		gap: space["6"],
		minWidth: 0,
		paddingBlock: space["4"],
		paddingInline: space["4"],
	},
	suffix: { marginInlineStart: space.px },
	// Units sit one step below the numeral, which is 20px on phones, 28px above.
	unit: {
		color: colors.mutedContent,
		fontSize: { [conditions.sm]: fontSize["20"], default: fontSize["16"] },
		fontWeight: fontWeight.medium,
		lineHeight: {
			[conditions.sm]: lineHeight["28"],
			default: lineHeight["24"],
		},
	},
	valueRow: {
		alignItems: "center",
		display: "flex",
		flexWrap: "wrap",
		gap: space["2"],
		minWidth: 0,
	},
});
