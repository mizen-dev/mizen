import { defineVars } from "@stylexjs/stylex";

// md is the default control height. xs is 24px, the smallest hit area a
// control may have (WCAG 2.5.8).
export const controlSize = defineVars({
	lg: "2.5rem",
	md: "2rem",
	sm: "1.75rem",
	xl: "2.75rem",
	xs: "1.5rem",
});

export const glyphSize = defineVars({
	lg: "1.25rem",
	md: "1.125rem",
	sm: "1rem",
	xs: "0.875rem",
});
