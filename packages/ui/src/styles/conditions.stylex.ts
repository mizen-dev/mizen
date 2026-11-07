import { defineConsts } from "@stylexjs/stylex";
export const conditions = defineConsts({
	canHover: "@media (hover: hover)",
	forcedColors: "@media (forced-colors: active)",
	lg: "@media (min-width: 64rem)",
	md: "@media (min-width: 48rem)",
	moreContrast: "@media (prefers-contrast: more)",
	reducedMotion: "@media (prefers-reduced-motion: reduce)",
	sm: "@media (min-width: 40rem)",
});
