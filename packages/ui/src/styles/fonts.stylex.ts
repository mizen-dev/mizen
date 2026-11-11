import { defineVars } from "@stylexjs/stylex";

// Components inherit the interface family from the app's body, so only the
// code family is a token.
export const fonts = defineVars({
	mono: 'ui-monospace, "SFMono-Regular", Consolas, "Liberation Mono", monospace',
	// Type roles normalize x-height with font-size-adjust so a role keeps its
	// optical size in any family. Set "none" or "from-font" to opt out.
	sizeAdjust: "0.5",
});
