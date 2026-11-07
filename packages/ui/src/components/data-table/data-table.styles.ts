import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { controlSize } from "../../styles/dimensions.stylex";
import { space } from "../../styles/spacing.stylex";
import { lineHeight } from "../../styles/typography.stylex";

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
	// The 32px sort button overlaps the cell padding so sortable headers keep
	// the row height, and its label aligns with the column text.
	sortButton: {
		display: "inline-flex",
		marginBlock: `calc((${lineHeight["20"]} - ${controlSize.sm}) / 2)`,
		marginInline: `calc(-1 * ${space["3"]})`,
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
