import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { fonts } from "../../styles/fonts.stylex";
import {
	borderWidth,
	focus,
	focusMotion,
	focusOutline,
} from "../../styles/interaction.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import { fontSize, lineHeight } from "../../styles/typography.stylex";

const FLOATING = ":is([data-slot='code-block'] > *)";

// Syntax colors take the chart hues mixed toward the text color, so each stays
// recognizable and still reads at 4.5:1 on the code surface in both themes.
const syntax = (hue: string) => ({
	color: `color-mix(in oklch, ${hue} 62%, ${colors.content})`,
});

export const codeBlockStyles = create({
	code: { font: "inherit" },
	content: {
		animationDuration: {
			":focus-visible": focusMotion.duration,
		},
		animationName: {
			":focus-visible": focusMotion.ring,
		},
		// The focus ring follows the frame's inner corner.
		borderRadius: `calc(${shape.controlRadiusLarge} - ${borderWidth.thin}px)`,
		boxSizing: "border-box",
		color: colors.content,
		// The size adjustment that pairs Mono with the UI font shrinks it, so
		fontSize: fontSize["14"],
		lineHeight: lineHeight["20"],
		margin: 0,
		maxInlineSize: "100%",
		minWidth: 0,
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: {
			":focus-visible": focus.offset,
			default: focus.offset,
		},
		outlineStyle: {
			":focus-visible": "solid",
			default: focusOutline.restingOutlineStyle,
		},
		outlineWidth: borderWidth.focus,
		// Standalone code scrolls itself; inside a ScrollArea it lets the area
		// scroll, so only one styled scrollbar shows.
		overflowX: {
			":is([data-slot='scroll-area-content'] > *)": "visible",
			default: "auto",
		},
		overscrollBehaviorInline: "contain",
		paddingBlock: space["3"],
		paddingInline: space["4"],
		tabSize: 2,
		whiteSpace: "pre",
	},
	// Without a header, Copy floats in the corner over a patch of surface, so
	// code scrolling beneath it stays out of sight.
	copyControl: {
		alignItems: "center",
		backgroundColor: { [FLOATING]: colors.surface, default: "transparent" },
		borderRadius: { [FLOATING]: shape.controlRadius, default: 0 },
		// The ring fills the 8px gap to the frame so no code shows around Copy.
		// With the 28px button, gap, button, and gap fill a one-line row's 44px,
		// so the ring stops at the frame's inner edge.
		boxShadow: {
			[FLOATING]: `0 0 0 ${space["2"]} ${colors.surface}`,
			default: "none",
		},
		display: "inline-flex",
		flexWrap: "wrap",
		gap: space["2"],
		insetBlockStart: { [FLOATING]: space["2"], default: "auto" },
		insetInlineEnd: { [FLOATING]: space["2"], default: "auto" },
		minWidth: 0,
		position: { [FLOATING]: "absolute", default: "static" },
		// Above the scrolling body, which comes later in the figure.
		zIndex: { [FLOATING]: 1, default: "auto" },
	},
	copyStatus: {
		color: colors.mutedContent,
		minWidth: 0,
		overflowWrap: "anywhere",
	},
	header: {
		alignItems: "center",
		borderBlockEndColor: colors.border,
		borderBlockEndStyle: "solid",
		borderBlockEndWidth: borderWidth.thin,
		display: "flex",
		flexWrap: "wrap",
		gap: space["2"],
		justifyContent: "space-between",
		minWidth: 0,
		paddingBlock: space["1"],
		paddingInline: space["4"],
	},
	root: {
		backgroundColor: colors.surface,
		borderColor: colors.border,
		borderRadius: shape.controlRadiusLarge,
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		color: colors.content,
		margin: 0,
		minWidth: 0,
		position: "relative",
	},
	syntaxComment: { color: colors.mutedContent },
	syntaxEntity: syntax(colors.chartSeries6),
	syntaxKeyword: syntax(colors.chartSeries1),
	syntaxProperty: syntax(colors.chartSeries5),
	syntaxString: syntax(colors.chartSeries3),
	title: {
		color: colors.mutedContent,
		fontFamily: fonts.mono,
		minWidth: 0,
		overflowWrap: "anywhere",
	},
});
