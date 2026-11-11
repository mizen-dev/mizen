import { create } from "@stylexjs/stylex";
import { conditions } from "../../styles/conditions.stylex";
import { duration, easing } from "../../styles/motion.stylex";

export const radioStyles = create({
	indicator: {
		backgroundColor: "currentColor",
		borderRadius: "9999px",
		display: "block",
		height: "0.375rem",
		opacity: {
			"[data-ending-style]": 0,
			"[data-starting-style]": 0,
			default: 1,
		},
		pointerEvents: "none",
		transform: {
			"[data-ending-style]": "scale(0.5)",
			"[data-starting-style]": "scale(0.5)",
			default: "scale(1)",
		},
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "opacity, transform",
		transitionTimingFunction: easing.expoOut,
		width: "0.375rem",
	},
	root: {
		borderEndEndRadius: "9999px",
		borderEndStartRadius: "9999px",
		borderStartEndRadius: "9999px",
		borderStartStartRadius: "9999px",
		transform: "none",
	},
	sizeDefault: {
		height: "1rem",
		width: "1rem",
	},
	sizeLg: {
		height: "1.125rem",
		width: "1.125rem",
	},
	sizeSm: {
		height: "0.875rem",
		width: "0.875rem",
	},
});
