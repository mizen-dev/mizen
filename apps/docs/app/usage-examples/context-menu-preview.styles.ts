import { colors } from "@mizen/ui/colors.stylex";
import { shape } from "@mizen/ui/shape.stylex";
import { space } from "@mizen/ui/spacing.stylex";
import { fontSize, fontWeight, lineHeight } from "@mizen/ui/typography.stylex";
import { create } from "@stylexjs/stylex";

// A dashed file area reads as a surface to right-click, not a button.
export const contextMenuPreviewStyles = create({
	area: {
		alignItems: "center",
		borderColor: `color-mix(in oklch, ${colors.content} 22%, transparent)`,
		borderRadius: shape.controlRadiusLarge,
		borderStyle: "dashed",
		borderWidth: 1,
		boxSizing: "border-box",
		cursor: "context-menu",
		display: "flex",
		flexDirection: "column",
		gap: space["1"],
		inlineSize: "18rem",
		justifyContent: "center",
		maxInlineSize: "100%",
		minBlockSize: "9rem",
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: 2,
		outlineStyle: "solid",
		outlineWidth: 3,
		padding: space["4"],
		userSelect: "none",
	},
	hint: {
		color: colors.mutedContent,
		fontSize: fontSize["14"],
		lineHeight: lineHeight["20"],
	},
	icon: { color: colors.brandForeground, marginBlockEnd: space["1"] },
	name: {
		color: colors.content,
		fontSize: fontSize["14"],
		fontWeight: fontWeight.medium,
		lineHeight: lineHeight["20"],
	},
});
