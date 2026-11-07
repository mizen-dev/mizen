import { fonts } from "@mizen-labs/ui/fonts.stylex";
import { createTheme } from "@stylexjs/stylex";

// The site chooses its fonts; shared components do not require these families.
export const docsFonts = createTheme(fonts, {
	mono: '"JetBrains Mono Variable", ui-monospace, monospace',
	sans: '"Wix Madefor Text Variable", ui-sans-serif, system-ui, sans-serif',
});
