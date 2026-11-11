import { defineVars } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";

// A pressed toggle holds a neutral fill and ink text; the accent stays with
// actions and checked controls. Forced colors keep pressed fills solid system
// colors in every state.
export const toggleColors = defineVars({
	pressedActiveBackground: {
		[conditions.forcedColors]: "Highlight",
		default: `color-mix(in oklch, ${colors.selected} 88%, ${colors.content})`,
	},
	pressedBackground: {
		[conditions.forcedColors]: "Highlight",
		default: colors.selected,
	},
	pressedBorder: {
		[conditions.forcedColors]: "Highlight",
		default: colors.border,
	},
	pressedForeground: {
		[conditions.forcedColors]: "HighlightText",
		default: colors.content,
	},
	pressedHoverBackground: {
		[conditions.forcedColors]: "Highlight",
		default: `color-mix(in oklch, ${colors.selected} 94%, ${colors.content})`,
	},
});
