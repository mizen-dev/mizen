import { create } from "@stylexjs/stylex";
import { conditions } from "../../styles/conditions.stylex";
import { duration, easing } from "../../styles/motion.stylex";
import { space } from "../../styles/spacing.stylex";

export const collapsibleStyles = create({
	content: { paddingBlockStart: space["2"] },
	panel: {
		height: {
			"[data-ending-style]": 0,
			"[data-starting-style]": 0,
			default: "var(--collapsible-panel-height)",
		},
		overflow: "hidden",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.disclosure,
		},
		transitionProperty: "height",
		transitionTimingFunction: easing.expoOut,
	},
});
