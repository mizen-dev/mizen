import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { controlSize } from "../../styles/dimensions.stylex";
import { borderWidth } from "../../styles/interaction.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import { lineHeight } from "../../styles/typography.stylex";

export const questionCardStyles = create({
	answer: { margin: 0 },
	answers: {
		alignItems: "baseline",
		columnGap: space["3"],
		display: "grid",
		gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
		margin: 0,
		rowGap: space["2"],
	},
	footer: {
		alignItems: "center",
		display: "flex",
		gap: space["2"],
	},
	// The number key, quiet; a box one text line tall centers it on the
	// option's first line.
	key: {
		alignItems: "center",
		blockSize: lineHeight["20"],
		color: colors.mutedContent,
		display: "flex",
		flexShrink: 0,
		fontVariantNumeric: "tabular-nums",
		marginInlineStart: "auto",
	},
	// One choice: the control, its words, and its number key, all one target.
	option: {
		alignItems: "flex-start",
		backgroundColor: {
			[conditions.canHover]: {
				":hover": colors.controlSurfaceHover,
				default: "transparent",
			},
			default: "transparent",
		},
		borderRadius: shape.controlRadius,
		color: colors.content,
		cursor: "pointer",
		display: "flex",
		gap: space["3"],
		paddingBlock: space["2"],
		paddingInline: space["2"],
	},
	optionBody: {
		display: "flex",
		flexDirection: "column",
		gap: 2,
		minInlineSize: 0,
	},
	// The chosen row fills, so the choice reads at a glance.
	optionChosen: {
		backgroundColor: {
			[conditions.canHover]: {
				":hover": colors.controlSurfaceHover,
				default: colors.controlSurface,
			},
			default: colors.controlSurface,
		},
	},
	// Lines the control up with the first line of text.
	optionControl: { display: "flex", flexShrink: 0, paddingBlockStart: 2 },
	optionDescription: { color: colors.mutedContent },
	options: { display: "flex", flexDirection: "column", gap: 2 },
	// A bare field with no inset, so typed text lines up with the other
	// options' labels.
	other: {
		"::placeholder": { color: colors.mutedContent, opacity: 1 },
		appearance: "none",
		backgroundColor: "transparent",
		blockSize: controlSize.sm,
		borderWidth: 0,
		boxSizing: "border-box",
		color: colors.content,
		flexGrow: 1,
		margin: 0,
		minInlineSize: 0,
		outline: "none",
		padding: 0,
	},
	// The field is taller than a line of text, so its control centers on it.
	// The row rings while the field has focus: the row is the field's edge.
	otherRow: {
		alignItems: "center",
		outlineColor: {
			":has(input:focus-visible)": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: 0,
		outlineStyle: { ":has(input:focus-visible)": "solid", default: "none" },
		outlineWidth: borderWidth.focus,
	},
	progress: { fontVariantNumeric: "tabular-nums", marginInlineStart: "auto" },
	question: { color: colors.content, margin: 0, outline: "none" },
	skipped: { color: colors.mutedContent },
	spacer: { flexGrow: 1 },
});
