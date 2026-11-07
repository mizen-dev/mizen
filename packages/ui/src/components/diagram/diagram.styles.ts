import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { fonts } from "../../styles/fonts.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import { fontWeight } from "../../styles/typography.stylex";

// Nodes sit on the workarea gray with a quiet edge; lines stay muted so labels
// lead. Pele's eight series take Mizen's chart palette, so pies and Gantt bars
// match the charts; the last two fall back to the reference gray.
const NODE_BORDER = `color-mix(in oklch, ${colors.content} 16%, transparent)`;
// The canvas frame: room for zoom and pan, and the space a pending or failed
// diagram holds, so rendering never jumps the page.
const FRAME_HEIGHT = "20rem";

export const diagramStyles = create({
	canvas: {
		"--pele-accent": {
			[conditions.forcedColors]: "Highlight",
			default: colors.brandForeground,
		},
		"--pele-bg": {
			[conditions.forcedColors]: "Canvas",
			default: colors.surface,
		},
		"--pele-bold-weight": `${fontWeight.semibold}`,
		"--pele-border": {
			[conditions.forcedColors]: "CanvasText",
			default: NODE_BORDER,
		},
		"--pele-critical": colors.destructive,
		"--pele-error": colors.destructiveText,
		"--pele-fg": {
			[conditions.forcedColors]: "CanvasText",
			default: colors.content,
		},
		"--pele-font-mono": fonts.mono,
		"--pele-heading-weight": `${fontWeight.semibold}`,
		"--pele-line": {
			[conditions.forcedColors]: "CanvasText",
			default: colors.chartReference,
		},
		"--pele-muted": {
			[conditions.forcedColors]: "CanvasText",
			default: colors.mutedContent,
		},
		"--pele-radius": shape.inlineRadius,
		"--pele-series-1": colors.chartSeries1,
		"--pele-series-2": colors.chartSeries2,
		"--pele-series-3": colors.chartSeries3,
		"--pele-series-4": colors.chartSeries4,
		"--pele-series-5": colors.chartSeries5,
		"--pele-series-6": colors.chartSeries6,
		"--pele-series-7": colors.chartReference,
		"--pele-series-8": colors.mutedContent,
		"--pele-surface": {
			[conditions.forcedColors]: "Canvas",
			default: colors.workarea,
		},
		"--pele-surface-alt": {
			[conditions.forcedColors]: "Canvas",
			default: colors.secondary,
		},
		"--pele-title-weight": `${fontWeight.semibold}`,
		"--pele-zoom-right": space["2"],
		"--pele-zoom-top": space["2"],
		// Pele zooms and pans inside this box, so it keeps room around small
		// diagrams instead of clipping them to their own height.
		alignContent: "center",
		display: "grid",
		minBlockSize: FRAME_HEIGHT,
		minInlineSize: 0,
		position: "relative",
	},
	// A failed render leaves nothing to lay out, so the error panel takes its place.
	canvasFailed: { display: "none" },
	// Pele needs the container's width to lay out, so the canvas stays in
	// flow while it renders and only hides.
	canvasPending: { minBlockSize: FRAME_HEIGHT, visibility: "hidden" },
	caption: { color: colors.mutedContent, margin: 0, overflowWrap: "anywhere" },
	content: { minInlineSize: 0, position: "relative" },
	error: { color: colors.destructiveText },
	feedback: {
		alignItems: "center",
		backgroundColor: colors.workarea,
		borderRadius: shape.controlRadiusLarge,
		boxSizing: "border-box",
		color: colors.mutedContent,
		display: "flex",
		flexDirection: "column",
		gap: space["2"],
		justifyContent: "center",
		minBlockSize: FRAME_HEIGHT,
		minInlineSize: 0,
		overflowWrap: "anywhere",
		padding: space["4"],
		textAlign: "center",
	},
	feedbackDetail: { margin: 0, maxInlineSize: "40rem" },
	feedbackTitle: {
		color: colors.content,
		fontWeight: fontWeight.medium,
		margin: 0,
	},
	overlay: { inset: 0, position: "absolute" },
	root: {
		display: "grid",
		gap: space["3"],
		gridTemplateColumns: "minmax(0, 1fr)",
		margin: 0,
		minInlineSize: 0,
		width: "100%",
	},
	// The parser's line with its caret, kept monospace so the caret lines up.
	snippet: {
		backgroundColor: colors.surface,
		borderRadius: shape.controlRadius,
		color: colors.content,
		// Ligatures would merge "-->" into one glyph and shift the caret.
		fontVariantLigatures: "none",
		margin: 0,
		maxInlineSize: "100%",
		overflowX: "auto",
		paddingBlock: space["2"],
		paddingInline: space["3"],
		textAlign: "start",
		whiteSpace: "pre",
	},
});
