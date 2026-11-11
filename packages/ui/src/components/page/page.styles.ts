import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { space } from "../../styles/spacing.stylex";
import {
	fontSize,
	fontWeight,
	letterSpacing,
	lineHeight,
} from "../../styles/typography.stylex";

// The header follows its own width: the action sits beside the title when
// there is room, and under the text when there is not. Only the header is a
// query container, so the page does not contain its content.
const WIDE = "@container (min-width: 30rem)";

export const pageStyles = create({
	// Centered on the title line; it overhangs the line instead of stretching
	// it. Under the text, it sits 12px below.
	action: {
		alignItems: "center",
		alignSelf: "center",
		display: "flex",
		flexWrap: "wrap",
		gap: space["2"],
		gridColumn: { [WIDE]: "2", default: "1 / -1" },
		gridRow: { [WIDE]: "1", default: "auto" },
		justifySelf: { [WIDE]: "end", default: "start" },
		marginBlock: {
			[WIDE]: `calc(-1 * ${space["1"]})`,
			default: `${space["3"]} 0`,
		},
		marginInlineStart: { [WIDE]: space["4"], default: 0 },
		minWidth: 0,
	},
	description: {
		color: colors.mutedContent,
		fontSize: fontSize["14"],
		fontWeight: fontWeight.regular,
		gridColumn: { [WIDE]: "1", default: "1 / -1" },
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
		margin: 0,
		minWidth: 0,
		textWrap: "pretty",
	},
	// The query container and the grid in one element. A container cannot
	// change its own columns, so the parts choose their places instead. With
	// no width from its parent, it is 16rem wide instead of nothing.
	header: {
		alignItems: "center",
		containerType: "inline-size",
		containIntrinsicInlineSize: "16rem",
		display: "grid",
		gridTemplateColumns: "minmax(0, 1fr) auto",
		minWidth: 0,
		rowGap: space["1"],
	},
	// A form or settings page reads best in one narrow column.
	narrow: { maxWidth: "42rem" },
	// The page owns the content inset and the rhythm between its sections; the
	// app shell around it adds no padding. Beside a sidebar in a flex row, or
	// under a top bar in a flex column, it takes the space that is left.
	root: {
		boxSizing: "border-box",
		display: "flex",
		flexBasis: 0,
		flexDirection: "column",
		flexGrow: 1,
		gap: space["8"],
		minWidth: 0,
		paddingBlock: space["6"],
		paddingInline: { [conditions.sm]: space["6"], default: space["4"] },
		width: "100%",
	},
	title: {
		color: colors.content,
		gridColumn: { [WIDE]: "1", default: "1 / -1" },
		margin: 0,
		minWidth: 0,
	},
});
