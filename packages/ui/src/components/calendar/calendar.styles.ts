import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import {
	borderWidth,
	focus,
	forcedColorAdjust,
	opacity,
} from "../../styles/interaction.stylex";
import { shadows } from "../../styles/shadows.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import {
	fontSize,
	fontWeight,
	letterSpacing,
	lineHeight,
} from "../../styles/typography.stylex";
import { buttonColors } from "../button/button-colors.stylex";

export const calendarStyles = create({
	captionLabel: {
		color: colors.content,
		fontSize: fontSize["14"],
		fontVariantNumeric: "tabular-nums",
		fontWeight: fontWeight.medium,
		letterSpacing: letterSpacing.ui,
	},
	chevron: {
		display: "inline-block",
		flexShrink: 0,
	},
	day: {
		fontVariantNumeric: "tabular-nums",
		height: {
			default: "2rem",
			[conditions.sm]: "2.25rem",
		},
		padding: 0,
		textAlign: "center",
		width: {
			default: "2rem",
			[conditions.sm]: "2.25rem",
		},
	},
	// Matches range ends, and nests inside the floating corner.
	dayButton: {
		borderEndEndRadius: shape.controlRadius,
		borderEndStartRadius: shape.controlRadius,
		borderStartEndRadius: shape.controlRadius,
		borderStartStartRadius: shape.controlRadius,
		color: "inherit",
		fontSize: fontSize["14"],
		fontWeight: fontWeight.regular,
		height: "2rem",
		letterSpacing: letterSpacing.ui,
		position: "relative",
		width: "2rem",
	},
	dayButtonReadOnly: {
		backgroundColor: {
			":hover": { [conditions.canHover]: "transparent" },
			default: "transparent",
		},
		cursor: "default",
	},
	dayDisabled: {
		cursor: "not-allowed",
		opacity: opacity.disabled,
	},
	dayPickerRoot: {
		display: "flex",
		flexDirection: "column",
		gap: space["2"],
		position: "relative",
	},
	disabled: {
		opacity: opacity.disabled,
		pointerEvents: "none",
	},
	dropdown: { flexShrink: 0, inlineSize: "5rem" },
	dropdowns: {
		alignItems: "center",
		display: "flex",
		gap: space["1"],
		paddingInline: "2rem",
	},
	invalid: {
		borderColor: colors.destructive,
	},
	month: {
		display: "flex",
		flexDirection: "column",
		gap: space["3"],
	},
	monthCaption: {
		alignItems: "center",
		display: "flex",
		height: "2rem",
		justifyContent: "center",
		position: "relative",
	},
	monthGrid: {
		borderCollapse: "collapse",
		width: "100%",
	},
	months: {
		"::after": {
			content: '""',
			flex: `0 0 calc(${borderWidth.focus}px + ${focus.offset})`,
			marginInlineStart: `calc(-1 * ${space["3"]})`,
		},
		display: "flex",
		gap: space["3"],
	},
	nav: {
		alignItems: "center",
		display: "flex",
		insetInline: 0,
		justifyContent: "space-between",
		pointerEvents: "none",
		position: "absolute",
		zIndex: 1,
	},
	navigationButton: { pointerEvents: "auto" },
	outside: {
		color: `color-mix(in oklch, ${colors.mutedContent} 90%, ${colors.floatingSurface})`,
	},
	// Caps wrap the day button: its radius plus the 2px gap of a wider cell.
	rangeEnd: {
		borderEndEndRadius: {
			default: shape.controlRadius,
			[conditions.sm]: `calc(${shape.controlRadius} + ${space.px})`,
		},
		borderStartEndRadius: {
			default: shape.controlRadius,
			[conditions.sm]: `calc(${shape.controlRadius} + ${space.px})`,
		},
		color: colors.content,
		forcedColorAdjust: forcedColorAdjust.selectedState,
	},
	rangeMiddle: {
		backgroundColor: colors.selected,
		color: colors.content,
		forcedColorAdjust: forcedColorAdjust.selectedState,
	},
	rangeStart: {
		borderEndStartRadius: {
			default: shape.controlRadius,
			[conditions.sm]: `calc(${shape.controlRadius} + ${space.px})`,
		},
		borderStartStartRadius: {
			default: shape.controlRadius,
			[conditions.sm]: `calc(${shape.controlRadius} + ${space.px})`,
		},
		color: colors.content,
		forcedColorAdjust: forcedColorAdjust.selectedState,
	},
	readOnly: {
		cursor: "default",
	},
	root: {
		backgroundColor: colors.floatingSurface,
		borderColor: colors.border,
		borderRadius: shape.floatingRadius,
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxShadow: shadows.surface,
		boxSizing: "border-box",
		color: colors.content,
		display: "inline-block",
		maxWidth: "100%",
		overflowX: "auto",
		paddingBlock: space["2"],
		paddingInline: {
			default: `calc(${borderWidth.focus}px + ${focus.offset})`,
			[conditions.sm]: space["2"],
		},
		scrollPaddingInline: space["1"],
		userSelect: "none",
	},
	rootEmbedded: {
		backgroundColor: "transparent",
		borderColor: "transparent",
		borderRadius: 0,
		borderWidth: 0,
	},
	selected: {
		color: colors.accentContent,
	},
	// Selected days reuse the Button brand fill; forced colors swap its inks
	// and hover shade for system selection colors, so every state stays solid.
	selectedDay: {
		[colors.accent]: { [conditions.forcedColors]: "Highlight", default: null },
		[colors.accentContent]: {
			[conditions.forcedColors]: "HighlightText",
			default: null,
		},
		[buttonColors.brandShade]: {
			[conditions.forcedColors]: "Highlight",
			default: null,
		},
		forcedColorAdjust: forcedColorAdjust.selectedState,
	},
	selectedRange: {
		backgroundColor: {
			[conditions.forcedColors]: "Highlight",
			default: colors.selected,
		},
		color: {
			[conditions.forcedColors]: "HighlightText",
			default: colors.content,
		},
		fontWeight: fontWeight.medium,
		forcedColorAdjust: forcedColorAdjust.selectedState,
	},
	today: {
		fontWeight: fontWeight.bold,
	},
	// Today carries a dot and medium weight; fills stay with selection.
	todayButton: { fontWeight: fontWeight.medium },
	todayIndicator: {
		"::after": {
			backgroundColor: colors.accent,
			borderRadius: "50%",
			bottom: "0.1875rem",
			content: '""',
			height: "0.25rem",
			insetInlineStart: "calc(50% - 0.125rem)",
			pointerEvents: "none",
			position: "absolute",
			width: "0.25rem",
		},
	},
	todayIndicatorSelected: {
		"::after": { backgroundColor: colors.accentContent },
	},
	week: {
		display: "table-row",
	},
	weekday: {
		color: colors.mutedContent,
		fontSize: fontSize["12"],
		fontWeight: fontWeight.medium,
		height: "2rem",
		letterSpacing: letterSpacing.caption,
		lineHeight: lineHeight["16"],
		textAlign: "center",
		width: {
			default: "2rem",
			[conditions.sm]: "2.25rem",
		},
	},
	weekdays: {
		borderBottomColor: colors.border,
		borderBottomStyle: "solid",
		borderBottomWidth: borderWidth.thin,
	},
	weeks: {
		margin: 0,
	},
});
