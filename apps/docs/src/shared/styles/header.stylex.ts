import { defineConsts } from "@stylexjs/stylex";

// The floating header: a 3.5rem card inset 0.5rem from the viewport, with
// 0.5rem below it. Sticky regions sit at the offset.
export const header = defineConsts({
	height: "3.5rem",
	inset: "0.5rem",
	offset: "4.5rem",
});
