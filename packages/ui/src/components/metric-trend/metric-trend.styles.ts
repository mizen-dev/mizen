import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { controlSize, glyphSize } from "../../styles/dimensions.stylex";
import { borderWidth, focus } from "../../styles/interaction.stylex";
import { duration, easing } from "../../styles/motion.stylex";
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
	// An inset strip 4px from the card's edges, so its corners are the card's
	// radius less 4px and its text lines up with the card's content.
	footer: {
		alignItems: "center",
		backgroundColor: colors.surface,
		borderRadius: `calc(${shape.controlRadiusLarge} - ${space["1"]})`,
		display: "flex",
		gap: space["3"],
		justifyContent: "space-between",
		marginBlockEnd: `calc(-1 * ${space["3"]})`,
		marginBlockStart: "auto",
		marginInline: `calc(-1 * ${space["3"]})`,
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
		height: { ":is(*) > svg": glyphSize.xs, default: controlSize.xs },
		justifyContent: "center",
		width: { ":is(*) > svg": glyphSize.xs, default: controlSize.xs },
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
	// A dashboard card: tighter corners than page Cards, a roomy gap between the
	// headline and the chart, and a shorter bottom inset under axis labels.
	// The whole card is a link: it answers hover and shows the focus ring.
	linked: {
		backgroundColor: {
			[conditions.canHover]: { ":hover": colors.workareaControlSurface },
			default: colors.workarea,
		},
		color: colors.content,
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: focus.offset,
		outlineStyle: "solid",
		outlineWidth: borderWidth.focus,
		textDecoration: "none",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "background-color, outline-color",
		transitionTimingFunction: easing.expoOut,
	},
	// A loading card draws a bar in each line of text it will hold. The box is
	// one line tall and sits in that line, so the card keeps the height of its
	// loaded state.
	placeholder: {
		alignItems: "center",
		blockSize: "1lh",
		display: "inline-flex",
		maxInlineSize: "100%",
		verticalAlign: "top",
	},
	placeholderBar: {
		blockSize: "0.75em",
		borderRadius: shape.checkboxRadius,
		inlineSize: "100%",
	},
	// The change chip keeps its own height and pill shape.
	placeholderDelta: { blockSize: "1.25rem", inlineSize: "3rem" },
	placeholderDeltaBar: { blockSize: "100%", borderRadius: "0.625rem" },
	placeholderDescription: { inlineSize: "8em" },
	placeholderValue: { inlineSize: "4em" },
	prefix: { marginInlineEnd: space.px },
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
	// A loading card keeps its units in the line, hidden and without width, so
	// the line keeps the height of the loaded value.
	unitLoading: {
		display: "inline-block",
		inlineSize: 0,
		marginInlineEnd: 0,
		marginInlineStart: 0,
		visibility: "hidden",
	},
	valueRow: {
		alignItems: "center",
		display: "flex",
		flexWrap: "wrap",
		gap: space["2"],
		minWidth: 0,
	},
});
