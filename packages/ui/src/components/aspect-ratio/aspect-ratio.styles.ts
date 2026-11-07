import { create } from "@stylexjs/stylex";

export const aspectRatioStyles = create({
	content: {
		insetBlockEnd: 0,
		insetBlockStart: 0,
		insetInlineEnd: 0,
		insetInlineStart: 0,
		minHeight: 0,
		minWidth: 0,
		position: "absolute",
	},
	// Fills its container's width: its content is absolutely positioned, so
	// in a flex or grid parent the box would otherwise shrink to nothing.
	root: (ratio: number) => ({
		aspectRatio: ratio,
		position: "relative",
		width: "100%",
	}),
});
