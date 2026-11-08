import { create } from "@stylexjs/stylex";

// The list is inline, so centered text centers it with its panel. A zero
// minimum and a full maximum keep a wide list scrolling inside the stage.
export const tabsPreviewStyles = create({
	centered: { maxInlineSize: "100%", minInlineSize: 0, textAlign: "center" },
});
