import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { borderWidth, focusMotion } from "../../styles/interaction.stylex";
import { duration, easing } from "../../styles/motion.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";

export const dataTableStyles = create({
	column: (width: number) => ({ width }),
	controls: {
		alignItems: "center",
		display: "flex",
		flexWrap: "wrap",
		gap: space["1"],
	},
	footer: {
		alignItems: "center",
		display: "flex",
		flexWrap: "wrap",
		fontVariantNumeric: "tabular-nums",
		gap: space["2"],
		justifyContent: "space-between",
	},
	// An 8px hit area inside the column's trailing edge; it shows a 2px line on
	// the column rule while hovered or dragged.
	resizeHandle: {
		"::after": {
			backgroundColor: {
				"[data-resizing]": colors.focusRing,
				[conditions.canHover]: { ":hover": colors.focusRing },
				default: "transparent",
			},
			content: '""',
			insetBlock: 0,
			insetInlineEnd: 0,
			position: "absolute",
			width: "2px",
		},
		cursor: "col-resize",
		insetBlock: 0,
		insetInlineEnd: 0,
		position: "absolute",
		touchAction: "none",
		userSelect: "none",
		width: "8px",
		zIndex: 1,
	},
	// A sortable header keeps the header type and ink. Its 24px hit area
	// overlaps the cell padding, so the label aligns with the column text and
	// the row keeps its height.
	sortButton: {
		alignItems: "center",
		animationDuration: { ":focus-visible": focusMotion.duration },
		animationName: { ":focus-visible": focusMotion.ring },
		appearance: "none",
		backgroundColor: {
			":active": colors.controlSurfaceHover,
			[conditions.canHover]: { ":hover:not(:active)": colors.controlSurface },
			default: "transparent",
		},
		borderRadius: shape.inlineRadius,
		borderWidth: 0,
		color: {
			":focus-visible": colors.content,
			[conditions.canHover]: { ":hover": colors.content },
			default: "inherit",
		},
		cursor: "pointer",
		display: "inline-flex",
		fontFamily: "inherit",
		fontSize: "inherit",
		fontWeight: "inherit",
		gap: space["1"],
		lineHeight: "inherit",
		marginBlock: `calc(-1 * ${space["1"]})`,
		marginInline: "-0.375rem",
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: 0,
		outlineStyle: "solid",
		outlineWidth: { ":focus-visible": borderWidth.focus, default: 0 },
		paddingBlock: space["1"],
		paddingInline: "0.375rem",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "background-color, color, outline-color",
		transitionTimingFunction: easing.expoOut,
		verticalAlign: "top",
	},
	spacerCell: {
		borderWidth: 0,
		height: 0,
		paddingBlock: 0,
		paddingInline: 0,
	},
	spacerHeight: (height: number) => ({ height, minHeight: height }),
});
