import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import {
	borderWidth,
	focus,
	focusMotion,
	focusOutline,
} from "../../styles/interaction.stylex";
import { duration, easing } from "../../styles/motion.stylex";
import { space } from "../../styles/spacing.stylex";

export const toastStackedStyles = create({
	content: {
		opacity: {
			"[data-behind]:not([data-expanded])": 0,
			"[data-expanded]": 1,
			default: 1,
		},
		pointerEvents: {
			"[data-behind]:not([data-expanded])": "none",
			default: "auto",
		},
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: "250ms",
		},
		transitionProperty: "opacity",
		transitionTimingFunction: easing.expoOut,
	},
	root: {
		"--toast-calc-height": "var(--toast-frontmost-height, var(--toast-height))",
		"--toast-gap": space["3"],
		"--toast-inset": space["5"],
		"--toast-peek": space["3"],
		"--toast-scale": "calc(max(0, 1 - var(--toast-index, 0) * 0.1))",
		"--toast-shrink": "calc(1 - var(--toast-scale))",
		"::after": {
			content: '""',
			height: "calc(var(--toast-gap) + 1px)",
			left: 0,
			position: "absolute",
			width: "100%",
		},
		animationDuration: {
			":focus-visible": focusMotion.duration,
		},
		animationName: {
			":focus-visible": focusMotion.ring,
		},
		boxSizing: "border-box",
		height: {
			"[data-expanded]": "var(--toast-height)",
			default: "var(--toast-calc-height)",
		},
		opacity: {
			"[data-ending-style]": 0,
			"[data-limited]": 0,
			default: 1,
		},
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "var(--toast-focus-ring, transparent)",
		},
		outlineOffset: focus.offset,
		outlineStyle: {
			":focus-visible": "solid",
			default: focusOutline.restingOutlineStyle,
		},
		outlineWidth: borderWidth.focus,
		pointerEvents: "auto",
		position: "absolute",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: "500ms, 500ms, 150ms",
		},
		transitionProperty: "transform, opacity, height",
		transitionTimingFunction: {
			[conditions.reducedMotion]: "linear",
			default: "cubic-bezier(0.22, 1, 0.36, 1)",
		},
		userSelect: "none",
		width: "100%",
	},
	rootBottom: {
		"--toast-calc-offset-y":
			"calc(-1 * var(--toast-offset-y, 0px) - var(--toast-index, 0) * var(--toast-gap) + var(--toast-swipe-movement-y, 0px))",
		"::after": {
			bottom: "100%",
		},
		bottom: 0,
		top: "auto",
		transform: {
			"[data-ending-style]:not([data-limited]):not([data-swipe-direction])": `translateY(calc(100% + var(--toast-inset, ${space["5"]})))`,
			"[data-ending-style][data-swipe-direction='down']": `translateY(calc(var(--toast-calc-offset-y) + 100% + var(--toast-inset, ${space["5"]})))`,
			"[data-ending-style][data-swipe-direction='left']": `translateX(calc(var(--toast-swipe-movement-x, 0px) - 100% - var(--toast-inset, ${space["5"]}))) translateY(var(--toast-calc-offset-y))`,
			"[data-ending-style][data-swipe-direction='right']": `translateX(calc(var(--toast-swipe-movement-x, 0px) + 100% + var(--toast-inset, ${space["5"]}))) translateY(var(--toast-calc-offset-y))`,
			"[data-ending-style][data-swipe-direction='up']": `translateY(calc(var(--toast-calc-offset-y) - 100% - var(--toast-inset, ${space["5"]})))`,
			"[data-expanded]":
				"translateX(var(--toast-swipe-movement-x, 0px)) translateY(var(--toast-calc-offset-y))",
			"[data-starting-style]": `translateY(calc(100% + var(--toast-inset, ${space["5"]})))`,
			default:
				"translateX(var(--toast-swipe-movement-x, 0px)) translateY(calc(var(--toast-swipe-movement-y, 0px) - (var(--toast-index, 0) * var(--toast-peek)) - (var(--toast-shrink) * var(--toast-calc-height)))) scale(var(--toast-scale))",
		},
		transformOrigin: "50% calc(50% + 50% * min(var(--toast-index, 0), 1))",
	},
	rootTop: {
		"--toast-calc-offset-y":
			"calc(var(--toast-offset-y, 0px) + var(--toast-index, 0) * var(--toast-gap) + var(--toast-swipe-movement-y, 0px))",
		"::after": {
			top: "100%",
		},
		bottom: "auto",
		top: 0,
		transform: {
			"[data-ending-style]:not([data-limited]):not([data-swipe-direction])": `translateY(calc(-100% - var(--toast-inset, ${space["5"]})))`,
			"[data-ending-style][data-swipe-direction='down']": `translateY(calc(var(--toast-calc-offset-y) + 100% + var(--toast-inset, ${space["5"]})))`,
			"[data-ending-style][data-swipe-direction='left']": `translateX(calc(var(--toast-swipe-movement-x, 0px) - 100% - var(--toast-inset, ${space["5"]}))) translateY(var(--toast-calc-offset-y))`,
			"[data-ending-style][data-swipe-direction='right']": `translateX(calc(var(--toast-swipe-movement-x, 0px) + 100% + var(--toast-inset, ${space["5"]}))) translateY(var(--toast-calc-offset-y))`,
			"[data-ending-style][data-swipe-direction='up']": `translateY(calc(var(--toast-calc-offset-y) - 100% - var(--toast-inset, ${space["5"]})))`,
			"[data-expanded]":
				"translateX(var(--toast-swipe-movement-x, 0px)) translateY(var(--toast-calc-offset-y))",
			"[data-starting-style]": `translateY(calc(-100% - var(--toast-inset, ${space["5"]})))`,
			default:
				"translateX(var(--toast-swipe-movement-x, 0px)) translateY(calc(var(--toast-swipe-movement-y, 0px) + (var(--toast-index, 0) * var(--toast-peek)) + (var(--toast-shrink) * var(--toast-calc-height)))) scale(var(--toast-scale))",
		},
		transformOrigin: "50% calc(50% - 50% * min(var(--toast-index, 0), 1))",
	},
});
