import { defineConsts } from "@stylexjs/stylex";

// CSS-only glyphs for native controls that cannot render an icon component.
// Each mirrors the matching export in icons.ts; swap both with the pack.
export const iconMasks = defineConsts({
	x: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M18 6l-12 12'/%3E%3Cpath d='M6 6l12 12'/%3E%3C/svg%3E")`,
});
