import { defineConsts } from "@stylexjs/stylex";

export const fontSize = defineConsts({
	"12": "0.75rem",
	"13": "0.8125rem",
	"14": "0.875rem",
	"16": "1rem",
	"20": "1.25rem",
	"28": "1.75rem",
	"32": "2rem",
	"40": "2.5rem",
});

export const fontWeight = defineConsts({
	bold: 700,
	medium: 500,
	regular: 400,
	semibold: 600,
});

// Absolute line heights keep every role on the 4px grid, independent of font
// metrics. Keys name the pixel height at a 16px root; `none` is for single-line
// boxes such as badges and glyph wrappers.
export const lineHeight = defineConsts({
	"16": "1rem",
	"20": "1.25rem",
	"24": "1.5rem",
	"28": "1.75rem",
	"32": "2rem",
	"36": "2.25rem",
	"44": "2.75rem",
	none: 1,
});

// Role tracking follows one size curve in em, small enough for any family.
export const letterSpacing = defineConsts({
	caption: "0.01em",
	display: "-0.025em",
	heading: "-0.012em",
	normal: "0",
	subheading: "-0.006em",
	title: "-0.02em",
	wide: "0.02em",
});
