import { colors } from "@mizen-labs/ui/colors.stylex";
import { conditions } from "@mizen-labs/ui/conditions.stylex";
import { fonts } from "@mizen-labs/ui/fonts.stylex";
import { shape } from "@mizen-labs/ui/shape.stylex";
import { space } from "@mizen-labs/ui/spacing.stylex";
import {
	fontSize,
	fontWeight,
	letterSpacing,
	lineHeight,
} from "@mizen-labs/ui/typography.stylex";
import { create } from "@stylexjs/stylex";

export const compositionStyles = create({
	actions: {
		borderBlockStartColor: colors.border,
		borderBlockStartStyle: "solid",
		borderBlockStartWidth: "1px",
		paddingBlockStart: space["4"],
	},
	buttons: {
		display: "flex",
		flexWrap: "wrap",
		gap: space["2"],
		justifyContent: "end",
	},
	compactWorkspace: { maxInlineSize: "40rem" },
	controls: {
		alignItems: "end",
		display: "grid",
		gap: space["4"],
		gridTemplateColumns: {
			default: "minmax(0, 1fr)",
			[conditions.sm]: "minmax(0, 2fr) minmax(12rem, 1fr)",
		},
	},
	header: {
		alignItems: "start",
		display: "flex",
		flexWrap: "wrap",
		gap: space["4"],
		justifyContent: "space-between",
		marginBlockEnd: space["4"],
	},
	intro: { display: "grid", gap: space["2"], marginBlockEnd: space["4"] },
	preference: {
		alignItems: "center",
		display: "flex",
		gap: space["4"],
		justifyContent: "space-between",
		minInlineSize: 0,
	},
	section: {
		borderBlockStartColor: colors.border,
		borderBlockStartStyle: "solid",
		borderBlockStartWidth: "1px",
		display: "grid",
		gap: space["5"],
		gridTemplateColumns: {
			default: "minmax(0, 1fr)",
			[conditions.md]: "minmax(0, 1fr) minmax(0, 2fr)",
		},
		paddingBlock: space["8"],
	},
	sectionDescription: {
		color: colors.mutedContent,
		fontSize: fontSize["14"],
		lineHeight: lineHeight["20"],
		marginBlock: space["1"],
		maxInlineSize: "28rem",
	},
	// Subheading role, for non-heading section labels; real headings use
	// <Heading size="subheading">.
	sectionTitle: {
		color: colors.content,
		fontSize: fontSize["16"],
		fontSizeAdjust: fonts.sizeAdjust,
		fontWeight: fontWeight.semibold,
		letterSpacing: letterSpacing.subheading,
		lineHeight: lineHeight["24"],
		margin: 0,
	},
	status: { minBlockSize: "1.5rem" },
	workarea: {
		backgroundColor: colors.workarea,
		borderRadius: shape.surfaceRadius,
		minInlineSize: 0,
		padding: { default: space["2"], [conditions.sm]: space["6"] },
	},
	workspace: {
		backgroundColor: colors.surface,
		borderColor: colors.border,
		borderRadius: shape.surfaceRadius,
		borderStyle: "solid",
		borderWidth: "1px",
		boxSizing: "border-box",
		inlineSize: "100%",
		marginInline: "auto",
		maxInlineSize: "64rem",
		minInlineSize: 0,
		overflowWrap: "anywhere",
		padding: { default: space["2"], [conditions.sm]: space["8"] },
	},
});
