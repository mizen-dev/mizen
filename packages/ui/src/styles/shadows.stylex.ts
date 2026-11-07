import { defineConsts } from "@stylexjs/stylex";

export const shadows = defineConsts({
	filledHover: "0 1px 2px oklch(0 0 0 / 0.12), 0 2px 4px oklch(0 0 0 / 0.08)",
	filledRest: "0 1px 2px oklch(0 0 0 / 0.06)",
	// A hairline plus a soft drop: popups lift off white surfaces.
	floating:
		"0 1px 2px oklch(0 0 0 / 0.06), 0 8px 24px -6px oklch(0 0 0 / 0.12)",
	outlineHover: "0 1px 2px oklch(0 0 0 / 0.10), 0 2px 4px oklch(0 0 0 / 0.06)",
	outlineRest: "0 1px 2px oklch(0 0 0 / 0.06)",
	pressed: "inset 0 1px 2px oklch(0 0 0 / 0.16)",
	recessedRest: "inset 0 1px 2px oklch(0 0 0 / 0.06)",
	surface: "0 1px 2px oklch(0 0 0 / 0.06)",
});
