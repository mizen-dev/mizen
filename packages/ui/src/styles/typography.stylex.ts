import { defineConsts, defineVars } from "@stylexjs/stylex";

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

// Role tracking follows one size curve in em. Letterfit belongs to the
// family, so the curve is themable: these defaults suit system fonts, and a
// loosely fitted family overrides them with createTheme. `caption` is 12px
// text, `ui` is 13–16px text, and the rest follow the heading sizes.
export const letterSpacing = defineVars({
	caption: "0.01em",
	display: "-0.025em",
	heading: "-0.012em",
	normal: "0",
	numeric: "-0.03em",
	subheading: "-0.006em",
	title: "-0.02em",
	ui: "0",
	wide: "0.02em",
});
