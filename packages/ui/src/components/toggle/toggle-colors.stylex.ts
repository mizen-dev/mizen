import { defineVars } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";

// Forced colors keep pressed fills solid system colors in every state.
export const toggleColors = defineVars({
	pressedActiveBackground: {
		[conditions.forcedColors]: "Highlight",
		default: `color-mix(in oklch, ${colors.brandBackground} 84%, ${colors.brandForeground})`,
	},
	pressedBackground: {
		[conditions.forcedColors]: "Highlight",
		default: colors.brandBackground,
	},
	pressedBorder: {
		[conditions.forcedColors]: "Highlight",
		default: colors.brandForeground,
	},
	pressedForeground: {
		[conditions.forcedColors]: "HighlightText",
		default: colors.brandForeground,
	},
	pressedHoverBackground: {
		[conditions.forcedColors]: "Highlight",
		default: `color-mix(in oklch, ${colors.brandBackground} 92%, ${colors.brandForeground})`,
	},
});
