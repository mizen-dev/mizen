import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { controlSize } from "../../styles/dimensions.stylex";
import { borderWidth } from "../../styles/interaction.stylex";
import { space } from "../../styles/spacing.stylex";
import {
	fontSize,
	fontWeight,
	letterSpacing,
	lineHeight,
} from "../../styles/typography.stylex";

export const commandFieldStyles = create({
	// A plain search row, not a field: focus never leaves this input while the
	// arrows move through results, so the caret marks focus and a ring would
	// sit there permanently (design contract, section 5).
	input: {
		"::placeholder": { color: colors.mutedContent, opacity: 1 },
		appearance: "none",
		backgroundColor: "transparent",
		borderWidth: 0,
		boxSizing: "border-box",
		color: { ":disabled": colors.mutedContent, default: colors.content },
		cursor: { ":disabled": "not-allowed", default: "text" },
		display: "block",
		fontFamily: "inherit",
		fontSize: fontSize["16"],
		fontWeight: fontWeight.regular,
		height: controlSize.xl,
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["24"],
		minWidth: 0,
		outline: "none",
		paddingBlock: 0,
		paddingInlineEnd: space["3"],
		paddingInlineStart: space["10"],
		width: "100%",
	},
	inputGroup: { position: "relative", width: "100%" },
	inputWrapper: {
		borderBlockEndColor: colors.border,
		borderBlockEndStyle: "solid",
		borderBlockEndWidth: borderWidth.thin,
		boxSizing: "border-box",
		paddingInline: space["1"],
		width: "100%",
	},
	startAddon: {
		alignItems: "center",
		color: colors.mutedContent,
		display: "inline-flex",
		height: "100%",
		insetBlock: 0,
		insetInlineStart: space["3"],
		justifyContent: "center",
		pointerEvents: "none",
		position: "absolute",
		width: "1rem",
		zIndex: 1,
	},
});
