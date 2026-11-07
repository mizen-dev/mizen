import { defineVars } from "@stylexjs/stylex";

export const fonts = defineVars({
	mono: 'ui-monospace, "SFMono-Regular", Consolas, "Liberation Mono", monospace',
	sans: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
	// Type roles normalize x-height with font-size-adjust so a role keeps its
	// optical size in any family. Set "none" or "from-font" to opt out.
	sizeAdjust: "0.5",
});
