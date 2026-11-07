import { create } from "@stylexjs/stylex";
import { palette } from "../../styles/palette.stylex";

export const characterStyles = create({
	amber: { color: palette.amber300 },
	blue: { color: palette.blue500 },
	body: { fill: "currentColor" },
	face: {
		color: "color-mix(in oklch, currentColor 28%, black)",
		fill: "currentColor",
	},
	green: { color: palette.green500 },
	orange: { color: palette.orange300 },
	pink: { color: palette.pink500 },
	root: {
		backgroundColor: "color-mix(in oklch, currentColor 24%, white)",
		borderRadius: "9999px",
		display: "inline-block",
		flexShrink: 0,
		overflow: "hidden",
		verticalAlign: "middle",
	},
	rose: { color: palette.rose500 },
	stroke: {
		fill: "none",
		stroke: "currentColor",
		strokeLinecap: "round",
		strokeWidth: 2.2,
	},
	teal: { color: palette.teal300 },
	violet: { color: palette.violet500 },
});
