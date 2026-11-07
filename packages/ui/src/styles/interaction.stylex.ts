import { defineConsts, defineVars, keyframes } from "@stylexjs/stylex";
import { conditions } from "./conditions.stylex";

export const borderWidth = defineConsts({ focus: 3, thin: 1 });
export const focus = defineConsts({ offset: "0px" });
// The focus ring fades in at full width; outline widths snap to device
// pixels, so growing them steps. Pair `animationName: focusMotion.ring` with
// `animationDuration: focusMotion.duration`.
export const focusMotion = defineVars({
	duration: {
		[conditions.reducedMotion]: "0s",
		default: "200ms",
	},
	ring: keyframes({
		from: {
			animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
			outlineColor: "transparent",
		},
	}),
});
export const focusOutline = defineVars({
	restingOutlineStyle: {
		[conditions.forcedColors]: "none",
		default: "solid",
	},
});
export const forcedColorAdjust = defineVars({
	selectedState: {
		[conditions.forcedColors]: "none",
		default: "auto",
	},
});
export const opacity = defineConsts({ disabled: 0.55 });
export const scale = defineConsts({ pressed: 0.98 });
