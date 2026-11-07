import { create, keyframes } from "@stylexjs/stylex";
import { conditions } from "../../styles/conditions.stylex";
import { glyphSize } from "../../styles/dimensions.stylex";
import { easing } from "../../styles/motion.stylex";

// Loading: the eight dots hold their places and a bright head travels round
// the ring once a second. Its trail fades over half a lap to the same 40%
// rest the other variants use, so one head leads and the rest stay quiet.
const loaderChase = keyframes({
	"0%": { opacity: 1 },
	"50%, 100%": { opacity: 0.4 },
});

// One dot's cycle: a 0.6s bounce, then rest while the others finish, 1.05s in
// all. It rises on an ease-out and falls on an ease-in, like a dropped ball,
// and is brightest at the top. Lengths are SVG user units.
const typingBounce = keyframes({
	"0%": {
		animationTimingFunction: "cubic-bezier(0.33, 0.66, 0.66, 1)",
		opacity: 0.4,
		transform: "translateY(0)",
	},
	"28.57%": {
		animationTimingFunction: "cubic-bezier(0.33, 0, 0.66, 0.33)",
		opacity: 1,
		transform: "translateY(-6px)",
	},
	"57.14%, 100%": { opacity: 0.4, transform: "translateY(0)" },
});

// Thinking: eight dots on a 3x3 grid with one empty cell, like a sliding
// puzzle. Each 0.5s step, the dot beside the gap slides into it (0.3s, then a
// hold) and brightens while it moves, so the gap travels round the ring. After
// eight moves the same cells are filled, so the loop restarts invisibly.
const thinkEase = "cubic-bezier(0.65, 0, 0.35, 1)";
const think1 = keyframes({
	"0%": {
		animationTimingFunction: thinkEase,
		opacity: 0.4,
		transform: "translate(0px, 0px)",
	},
	"7.5%": { opacity: 1, transform: "translate(-8px, 0px)" },
	"12.5%": { opacity: 0.4, transform: "translate(-8px, 0px)" },
	"87.5%": {
		animationTimingFunction: thinkEase,
		opacity: 0.4,
		transform: "translate(-8px, 0px)",
	},
	"95%": { opacity: 1, transform: "translate(-8px, 8px)" },
	"100%": { opacity: 0.4, transform: "translate(-8px, 8px)" },
});
const think2 = keyframes({
	"0%": { opacity: 0.4, transform: "translate(0px, 0px)" },
	"12.5%": {
		animationTimingFunction: thinkEase,
		opacity: 0.4,
		transform: "translate(0px, 0px)",
	},
	"20%": { opacity: 1, transform: "translate(-8px, 0px)" },
	"25%": { opacity: 0.4, transform: "translate(-8px, 0px)" },
	"100%": { opacity: 0.4, transform: "translate(-8px, 0px)" },
});
const think3 = keyframes({
	"0%": { opacity: 0.4, transform: "translate(0px, 0px)" },
	"25%": {
		animationTimingFunction: thinkEase,
		opacity: 0.4,
		transform: "translate(0px, 0px)",
	},
	"32.5%": { opacity: 1, transform: "translate(0px, -8px)" },
	"37.5%": { opacity: 0.4, transform: "translate(0px, -8px)" },
	"100%": { opacity: 0.4, transform: "translate(0px, -8px)" },
});
const think4 = keyframes({
	"0%": { opacity: 0.4, transform: "translate(0px, 0px)" },
	"37.5%": {
		animationTimingFunction: thinkEase,
		opacity: 0.4,
		transform: "translate(0px, 0px)",
	},
	"45%": { opacity: 1, transform: "translate(0px, -8px)" },
	"50%": { opacity: 0.4, transform: "translate(0px, -8px)" },
	"100%": { opacity: 0.4, transform: "translate(0px, -8px)" },
});
const think5 = keyframes({
	"0%": { opacity: 0.4, transform: "translate(0px, 0px)" },
	"50%": {
		animationTimingFunction: thinkEase,
		opacity: 0.4,
		transform: "translate(0px, 0px)",
	},
	"57.5%": { opacity: 1, transform: "translate(8px, 0px)" },
	"62.5%": { opacity: 0.4, transform: "translate(8px, 0px)" },
	"100%": { opacity: 0.4, transform: "translate(8px, 0px)" },
});
const think6 = keyframes({
	"0%": { opacity: 0.4, transform: "translate(0px, 0px)" },
	"62.5%": {
		animationTimingFunction: thinkEase,
		opacity: 0.4,
		transform: "translate(0px, 0px)",
	},
	"70%": { opacity: 1, transform: "translate(8px, 0px)" },
	"75%": { opacity: 0.4, transform: "translate(8px, 0px)" },
	"100%": { opacity: 0.4, transform: "translate(8px, 0px)" },
});
const think7 = keyframes({
	"0%": { opacity: 0.4, transform: "translate(0px, 0px)" },
	"75%": {
		animationTimingFunction: thinkEase,
		opacity: 0.4,
		transform: "translate(0px, 0px)",
	},
	"82.5%": { opacity: 1, transform: "translate(0px, 8px)" },
	"87.5%": { opacity: 0.4, transform: "translate(0px, 8px)" },
	"100%": { opacity: 0.4, transform: "translate(0px, 8px)" },
});

export const spinnerStyles = create({
	base: {
		display: "inline-block",
		flexShrink: 0,
		height: glyphSize.sm,
		width: glyphSize.sm,
	},
	loaderDot: {
		animationDuration: "1s",
		animationIterationCount: "infinite",
		animationName: {
			[conditions.reducedMotion]: "none",
			default: loaderChase,
		},
		animationTimingFunction: easing.linear,
	},
	// Each dot runs a step behind the next, so the trail fades behind the head.
	// Reduced motion freezes that trail as a still gradient.
	loaderDot0: {
		animationDelay: "-1s",
		opacity: { [conditions.reducedMotion]: 1, default: 1 },
	},
	loaderDot1: {
		animationDelay: "-0.875s",
		opacity: { [conditions.reducedMotion]: 0.4, default: 1 },
	},
	loaderDot2: {
		animationDelay: "-0.75s",
		opacity: { [conditions.reducedMotion]: 0.4, default: 1 },
	},
	loaderDot3: {
		animationDelay: "-0.625s",
		opacity: { [conditions.reducedMotion]: 0.4, default: 1 },
	},
	loaderDot4: {
		animationDelay: "-0.5s",
		opacity: { [conditions.reducedMotion]: 0.4, default: 1 },
	},
	loaderDot5: {
		animationDelay: "-0.375s",
		opacity: { [conditions.reducedMotion]: 0.55, default: 1 },
	},
	loaderDot6: {
		animationDelay: "-0.25s",
		opacity: { [conditions.reducedMotion]: 0.7, default: 1 },
	},
	loaderDot7: {
		animationDelay: "-0.125s",
		opacity: { [conditions.reducedMotion]: 0.85, default: 1 },
	},

	// A standalone Spinner matches the text beside it.
	textSize: { height: "1em", width: "1em" },
	thinking: {
		display: "inline-block",
		flexShrink: 0,
		height: "1em",
		width: "1em",
	},
	thinkingDot: {
		animationDuration: "4s",
		animationIterationCount: "infinite",
		opacity: { [conditions.reducedMotion]: 0.7, default: 0.4 },
	},
	thinkingDot1: {
		animationName: { [conditions.reducedMotion]: "none", default: think1 },
	},
	thinkingDot2: {
		animationName: { [conditions.reducedMotion]: "none", default: think2 },
	},
	thinkingDot3: {
		animationName: { [conditions.reducedMotion]: "none", default: think3 },
	},
	thinkingDot4: {
		animationName: { [conditions.reducedMotion]: "none", default: think4 },
	},
	thinkingDot5: {
		animationName: { [conditions.reducedMotion]: "none", default: think5 },
	},
	thinkingDot6: {
		animationName: { [conditions.reducedMotion]: "none", default: think6 },
	},
	thinkingDot7: {
		animationName: { [conditions.reducedMotion]: "none", default: think7 },
	},
	typing: {
		display: "inline-block",
		flexShrink: 0,
		height: "1em",
		// The dots rise above the box; the frame must not clip them.
		overflow: "visible",
		width: "1em",
	},
	typingDot: {
		animationDuration: "1.05s",
		animationIterationCount: "infinite",
		animationName: {
			[conditions.reducedMotion]: "none",
			default: typingBounce,
		},
		opacity: 0.4,
	},
	// Each dot starts 0.1s after the one before it.
	typingFirst: { opacity: { [conditions.reducedMotion]: 0.4, default: 0.4 } },
	typingSecond: {
		animationDelay: "0.1s",
		opacity: { [conditions.reducedMotion]: 0.7, default: 0.4 },
	},
	typingThird: {
		animationDelay: "0.2s",
		opacity: { [conditions.reducedMotion]: 1, default: 0.4 },
	},
});
