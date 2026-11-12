import { defineConsts, defineVars } from "@stylexjs/stylex";

export const easing = defineVars({
	back: "cubic-bezier(0.34, 1.4, 0.64, 1)",
	easeIn: "cubic-bezier(0.4, 0, 1, 1)",
	easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
	easeOut: "cubic-bezier(0, 0, 0.2, 1)",
	expoOut: "cubic-bezier(0.16, 1, 0.3, 1)",
	linear: "linear",
	// One overshoot, then settle: for a part that travels, such as a switch
	// thumb or a selection indicator. Pair with duration.spring.
	spring:
		"linear(0, 0.35 8%, 0.86 19%, 1.07 29%, 1.11 37%, 1.06 49%, 1.01 67%, 1)",
});

export const duration = defineVars({
	disclosure: "320ms",
	fast: "140ms",
	instant: "0ms",
	overlayEnter: "280ms",
	overlayExit: "200ms",
	press: "100ms",
	spring: "450ms",
});

// A selection indicator springs between items by its four edges. An edge that
// lands on its track's own edge follows the spring up to the target and stops
// there, so the overshoot never carries the indicator outside the track; the
// opposite edge still springs, and the indicator compresses against the edge.
// The properties are logical, so the start edge is the right one in RTL.
// Each easing lists block-start, inline-end, block-end, inline-start.
export const indicatorTravel = defineConsts({
	atEnd:
		"linear(0, 0.35 8%, 0.86 19%, 1.07 29%, 1.11 37%, 1.06 49%, 1.01 67%, 1), linear(0, 0.35 8%, 0.86 19%, 1 27%, 1), linear(0, 0.35 8%, 0.86 19%, 1 27%, 1), linear(0, 0.35 8%, 0.86 19%, 1.07 29%, 1.11 37%, 1.06 49%, 1.01 67%, 1)",
	atStart:
		"linear(0, 0.35 8%, 0.86 19%, 1 27%, 1), linear(0, 0.35 8%, 0.86 19%, 1.07 29%, 1.11 37%, 1.06 49%, 1.01 67%, 1), linear(0, 0.35 8%, 0.86 19%, 1.07 29%, 1.11 37%, 1.06 49%, 1.01 67%, 1), linear(0, 0.35 8%, 0.86 19%, 1 27%, 1)",
	property:
		"inset-block-start, inset-inline-end, inset-block-end, inset-inline-start",
});

// Press surfaces (Button, Toggle): edges, colors, and shadows ease out together;
// the surface returns a little slower than colors. Lists follow `property`.
export const pressSurface = defineConsts({
	property: "inset, background-color, border-color, box-shadow, opacity",
	restDuration: `200ms, ${duration.fast}, ${duration.fast}, ${duration.fast}, ${duration.fast}`,
	restEasing: easing.expoOut,
});
