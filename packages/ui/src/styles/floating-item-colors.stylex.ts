import { defineVars } from "@stylexjs/stylex";
import { colors } from "./colors.stylex";
import { conditions } from "./conditions.stylex";

export const floatingItemColors = defineVars({
	destructiveHighlightBackground: {
		[conditions.forcedColors]: "Highlight",
		default: colors.destructiveSubtle,
	},
	destructiveHighlightForeground: {
		[conditions.forcedColors]: "HighlightText",
		default: colors.destructive,
	},
	highlightBackground: {
		[conditions.forcedColors]: "Highlight",
		default: colors.floatingHighlight,
	},
	highlightForeground: {
		[conditions.forcedColors]: "HighlightText",
		default: colors.content,
	},
});
