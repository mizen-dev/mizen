import { defineConsts, defineVars, keyframes } from "@stylexjs/stylex";
import { colors } from "./colors.stylex";
import { conditions } from "./conditions.stylex";
import { shadows } from "./shadows.stylex";

export const borderWidth = defineConsts({ focus: 2, thin: 1 });
export const focus = defineConsts({ offset: "2px" });
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
	// A focused field colors its edge: a 1px ring drawn over the border, with
	// a soft halo behind it. The halo is a tint of the edge, so an invalid
	// field's halo follows its error color. Forced colors drop the halo, so
	// the ring widens and steps outside the border.
	// The halo joins the field's resting drop.
	fieldHalo: `0 0 0 3px color-mix(in oklch, var(--mizen-field-focus-edge, ${colors.focusRing}) 20%, transparent), ${shadows.fieldRest}`,
	fieldOffset: {
		[conditions.forcedColors]: "0px",
		default: "-1px",
	},
	fieldWidth: {
		[conditions.forcedColors]: "2px",
		default: "1px",
	},
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
