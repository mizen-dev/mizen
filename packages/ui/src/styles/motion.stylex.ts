import { defineConsts } from "@stylexjs/stylex";

export const easing = defineConsts({
	back: "cubic-bezier(0.34, 1.4, 0.64, 1)",
	easeIn: "cubic-bezier(0.4, 0, 1, 1)",
	easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
	easeOut: "cubic-bezier(0, 0, 0.2, 1)",
	expoOut: "cubic-bezier(0.16, 1, 0.3, 1)",
	linear: "linear",
	spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
});

export const duration = defineConsts({
	disclosure: "320ms",
	fast: "140ms",
	instant: "0ms",
	overlayEnter: "280ms",
	overlayExit: "200ms",
	press: "100ms",
});

// Press surfaces (Button, Toggle): edges, colors, and shadows ease out together;
// the surface returns a little slower than colors. Lists follow `property`.
export const pressSurface = defineConsts({
	property: "inset, background-color, border-color, box-shadow, opacity",
	restDuration: "200ms, 140ms, 140ms, 140ms, 140ms",
	restEasing: "cubic-bezier(0.16, 1, 0.3, 1)",
});
