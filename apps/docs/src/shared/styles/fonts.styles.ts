import { fonts } from "@mizen-labs/ui/fonts.stylex";
import { letterSpacing } from "@mizen-labs/ui/typography.stylex";
import { createTheme } from "@stylexjs/stylex";

// The site chooses its fonts; shared components do not require these families.
export const docsFonts = createTheme(fonts, {
	mono: '"JetBrains Mono Variable", ui-monospace, monospace',
	// Keep Geist at its set size; only fallbacks scale to its x-height.
	sizeAdjust: "from-font",
});

// Geist is fitted for interface sizes, so small text keeps its own spacing
// and headings tighten as they grow.
export const docsTracking = createTheme(letterSpacing, {
	caption: "0",
	display: "-0.05em",
	heading: "-0.02em",
	subheading: "-0.02em",
	title: "-0.04em",
});
