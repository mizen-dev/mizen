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
		backgroundColor: "inherit",
		borderBlockEndWidth: {
			":is(tbody:last-child > tr:last-child > *, tfoot > tr:last-child > *)": 0,
			default: borderWidth.thin,
		},
		borderBlockStartWidth: 0,
		borderColor: colors.border,
		// Grid tables rule every column except the last, like a sheet.
		borderInlineEndWidth: {
			":is([data-slot='table'][data-grid] > * > tr > :not(:last-child))":
				borderWidth.thin,
			default: 0,
		},
		borderInlineStartWidth: 0,
		borderStyle: "solid",
		// Interactive grids focus cells; the ring sits inside so neighboring
		// cells and the scroll container never clip it.
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: `-${borderWidth.focus}px`,
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
		backgroundColor: "inherit",
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
	rowHover: {
		backgroundColor: {
			":hover": {
				[conditions.canHover]: colors.secondary,
			},
			"[aria-disabled='true']:hover": {
				[conditions.canHover]: "inherit",
			},
			default: "inherit",
		},
	},
	rowSelected: {
		backgroundColor: {
			":hover": {
				[conditions.canHover]: colors.selected,
			},
			"[aria-disabled='true']:hover": {
				[conditions.canHover]: colors.selected,
			},
			default: colors.selected,
		},
		color: colors.content,
	},
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
		textAlign: "start",
	},
});
