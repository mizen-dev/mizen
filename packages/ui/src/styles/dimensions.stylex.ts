import { defineConsts } from "@stylexjs/stylex";

// md is the default control height. 2xs and xs share 24px, the smallest hit
// area a control may have (WCAG 2.5.8).
export const controlSize = defineConsts({
	"2xs": "1.5rem",
	lg: "2.5rem",
	md: "2rem",
	sm: "1.75rem",
	xl: "2.75rem",
	xs: "1.5rem",
});

export const glyphSize = defineConsts({
	lg: "1.25rem",
	md: "1.125rem",
	sm: "1rem",
	xs: "0.875rem",
});
