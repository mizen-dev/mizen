import { create } from "@stylexjs/stylex";
import { conditions } from "../../styles/conditions.stylex";
import { scale } from "../../styles/interaction.stylex";
import { duration, easing } from "../../styles/motion.stylex";

export const radioStyles = create({
	indicator: {
		backgroundColor: "currentColor",
		borderRadius: "9999px",
		display: "block",
		height: "0.5rem",
		opacity: {
			"[data-ending-style]": 0,
			"[data-starting-style]": 0,
			default: 1,
		},
		pointerEvents: "none",
		transform: {
			"[data-ending-style]": "scale(0)",
			"[data-starting-style]": "scale(0)",
			default: "scale(1)",
		},
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "opacity, transform",
		transitionTimingFunction: {
			"[data-ending-style]": easing.easeOut,
			default: easing.spring,
		},
		width: "0.5rem",
	},
	root: {
		borderEndEndRadius: "9999px",
		borderEndStartRadius: "9999px",
		borderStartEndRadius: "9999px",
		borderStartStartRadius: "9999px",
		transform: {
			[conditions.reducedMotion]: "none",
			":active:not([data-disabled]):not([data-readonly])": `scale(${scale.pressed})`,
			default: "none",
		},
	},
	sizeDefault: {
		height: "1.125rem",
		width: "1.125rem",
	},
	sizeLg: {
		height: "1.25rem",
		width: "1.25rem",
	},
	sizeSm: {
		height: "1rem",
		width: "1rem",
	},
});
