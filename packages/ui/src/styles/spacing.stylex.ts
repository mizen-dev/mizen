import { defineConsts } from "@stylexjs/stylex";

// Numeric keys follow the 4px grid: step × 4 = px. `1.5` (6px) joins a control
// to its label and help text; `px` (2px) joins a title to its description and
// makes optical corrections.
export const space = defineConsts({
	"0": "0",
	"1": "0.25rem",
	"1.5": "0.375rem",
	"2": "0.5rem",
	"3": "0.75rem",
	"4": "1rem",
	"5": "1.25rem",
	"6": "1.5rem",
	"8": "2rem",
	"10": "2.5rem",
	"12": "3rem",
	"16": "4rem",
	px: "0.125rem",
});
