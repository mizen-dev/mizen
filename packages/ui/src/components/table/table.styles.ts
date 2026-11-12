import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import {
	borderWidth,
	focus,
	focusMotion,
} from "../../styles/interaction.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import {
	fontSize,
	fontWeight,
	letterSpacing,
	lineHeight,
} from "../../styles/typography.stylex";

// A hovered or selected row is a band its cells paint, so the band can round
// its outer corners. Selected rows that touch form one band. A sheet keeps
// square bands, because its column rules meet the row edges.
const HOVERABLE =
	"tr:not([data-selected], [aria-disabled='true'], [aria-hidden='true'])";
const HOVER_ROW = `tbody > ${HOVERABLE}:hover`;
const ROUND = "[data-slot='table']:not([data-grid]) > ";
const HOVER_BAND = `${ROUND}${HOVER_ROW}`;
const BAND_START = `${ROUND}* > tr[data-selected]:not(tr[data-selected] + tr)`;
const BAND_END = `${ROUND}* > tr[data-selected]:not(:has(+ tr[data-selected]))`;
const ABOVE_BAND = `${ROUND}* > tr:not([data-selected]):has(+ tr[data-selected])`;
const ABOVE_HOVER = `${ROUND}tbody > tr:has(+ ${HOVERABLE}:hover)`;
const HOVER_CELL = `:is(${HOVER_ROW} > *)`;
// The cells whose rule a band's edge replaces: its last row and the row above.
const BAND_EDGE = `:is(${ABOVE_BAND} > *, ${BAND_END} > *)`;
const HOVER_EDGE = `:is(${ABOVE_HOVER} > *, ${HOVER_BAND} > *)`;
// Half a secondary fill, so a secondary control or a neutral avatar keeps its
// shape inside a hovered row.
const HOVER_FILL = `color-mix(in oklab, ${colors.secondary} 50%, ${colors.surface})`;
const corner = (band: string, cell: ":first-child" | ":last-child") =>
	({
		[conditions.canHover]: {
			[`:is(${HOVER_BAND} > ${cell})`]: shape.controlRadius,
		},
		[`:is(${band} > ${cell})`]: shape.controlRadius,
		default: null,
	}) as const;

export const tableStyles = create({
	body: { backgroundColor: colors.surface },
	caption: {
		captionSide: "bottom",
		color: colors.mutedContent,
		fontSize: fontSize["13"],
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
		paddingBlock: space["2"],
		// Aligns with the cells' inline padding.
		paddingInline: space["3"],
		textAlign: "start",
	},
	cell: {
		animationDuration: { ":focus-visible": focusMotion.duration },
		animationName: { ":focus-visible": focusMotion.ring },
		backgroundColor: {
			[conditions.canHover]: { [HOVER_CELL]: HOVER_FILL },
			":is(tr[data-selected] > *)": colors.selected,
			default: "inherit",
		},
		// A band's own edge closes it, so the rules above and below it go.
		borderBlockEndColor: {
			[BAND_EDGE]: "transparent",
			[conditions.canHover]: { [HOVER_EDGE]: "transparent" },
			default: colors.border,
		},
		borderBlockEndWidth: {
			":is(tbody:last-child > tr:last-child > *, tfoot > tr:last-child > *)": 0,
			default: borderWidth.thin,
		},
		borderBlockStartWidth: 0,
		borderColor: colors.border,
		borderEndEndRadius: corner(BAND_END, ":last-child"),
		borderEndStartRadius: corner(BAND_END, ":first-child"),
		// Grid tables rule every column except the last, like a sheet.
		borderInlineEndWidth: {
			":is([data-slot='table'][data-grid] > * > tr > :not(:last-child))":
				borderWidth.thin,
			default: 0,
		},
		borderInlineStartWidth: 0,
		borderStartEndRadius: corner(BAND_START, ":last-child"),
		borderStartStartRadius: corner(BAND_START, ":first-child"),
		borderStyle: "solid",
		// Interactive grids focus cells; the ring sits inside so neighboring
		// cells and the scroll container never clip it.
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: `-${borderWidth.focus}`,
		outlineStyle: { ":focus-visible": "solid", default: "none" },
		outlineWidth: borderWidth.focus,
		// Rows are 40px: 10px block around a 20px line, 12px inline. Grid tables
		// are compact: 8px block.
		paddingBlock: {
			":is([data-slot='table'][data-grid] *)": space["2"],
			default: "0.625rem",
		},
		paddingInline: space["3"],
		textAlign: "start",
		verticalAlign: "middle",
	},
	cellCenter: { textAlign: "center" },
	cellEnd: { textAlign: "end" },
	cellNumeric: {
		fontVariantNumeric: "tabular-nums",
		whiteSpace: "nowrap",
	},
	container: {
		animationDuration: {
			":focus-visible": focusMotion.duration,
		},
		animationName: {
			":focus-visible": focusMotion.ring,
		},
		// Frameless: hairlines between rows are the only rules. The table paints
		// the surface color so sticky cells cover the rows that scroll under them.
		backgroundColor: colors.surface,
		borderRadius: shape.controlRadiusLarge,
		maxWidth: "100%",
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "inherit",
		},
		outlineOffset: focus.offset,
		outlineStyle: {
			":focus-visible": "solid",
			default: "none",
		},
		outlineWidth: borderWidth.focus,
		overflowX: "auto",
		overflowY: "hidden",
		overscrollBehaviorInline: "contain",
		WebkitOverflowScrolling: "touch",
	},
	containerBoth: {
		maxBlockSize: "28rem",
		overflowY: "auto",
	},
	fixedWidth: (width: number) => ({
		minWidth: 0,
		tableLayout: "fixed",
		width,
	}),
	footer: {
		backgroundColor: "inherit",
		fontWeight: fontWeight.medium,
	},
	head: {
		// Column headers recede to 12px muted meta so the data leads; row headers
		// keep full ink at the cell size.
		color: { ":is(thead *)": colors.mutedContent, default: colors.content },
		fontSize: { ":is(thead *)": fontSize["12"], default: fontSize["14"] },
		fontWeight: fontWeight.medium,
		letterSpacing: {
			":is(thead *)": letterSpacing.caption,
			default: letterSpacing.ui,
		},
		lineHeight: { ":is(thead *)": lineHeight["16"], default: lineHeight["20"] },
		minInlineSize: {
			':is([scope="row"], [scope="rowgroup"])': "8rem",
			[conditions.sm]: {
				':is([scope="row"], [scope="rowgroup"])': "16rem",
			},
			default: null,
		},
		// Anchors header affordances such as column resize handles.
		position: "relative",
		textAlign: "start",
	},
	header: {
		backgroundColor: "inherit",
		color: colors.mutedContent,
		fontWeight: fontWeight.medium,
	},
	headSticky: {
		insetBlockStart: 0,
		position: "sticky",
		zIndex: 2,
	},
	row: {
		backgroundColor: "inherit",
	},
	rowSelected: { color: colors.content },
	stickyStart: {
		borderInlineEndColor: colors.border,
		borderInlineEndStyle: "solid",
		borderInlineEndWidth: {
			default: 0,
			[conditions.sm]: borderWidth.thin,
		},
		insetInlineStart: { default: null, [conditions.sm]: 0 },
		position: { default: "static", [conditions.sm]: "sticky" },
		zIndex: { default: null, [conditions.sm]: 1 },
	},
	table: {
		backgroundColor: colors.surface,
		borderCollapse: "separate",
		borderSpacing: 0,
		color: colors.content,
		// Tabular data uses the ui role, the same size as headers.
		fontSize: fontSize["14"],
		fontWeight: fontWeight.regular,
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
		minWidth: "100%",
		// A container may break words anywhere, which lets columns shrink below
		// a word. Here a word breaks only when it cannot fit its column.
		overflowWrap: "break-word",
		textAlign: "start",
	},
});
