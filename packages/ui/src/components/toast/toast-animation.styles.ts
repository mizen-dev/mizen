import { create, keyframes } from "@stylexjs/stylex";
import { conditions } from "../../styles/conditions.stylex";
import { duration, easing } from "../../styles/motion.stylex";

const pulseA = keyframes({
	"0%": { scale: "1" },
	"50%": { scale: "1.03" },
	"100%": { scale: "1" },
});

const pulseB = keyframes({
	"0%": { scale: "1" },
	"50%": { scale: "1.03" },
	"100%": { scale: "1" },
});

const shakeA = keyframes({
	"0%": { translate: "0 0" },
	"25%": { translate: "-4px 0" },
	"75%": { translate: "4px 0" },
	"100%": { translate: "0 0" },
});

const shakeB = keyframes({
	"0%": { translate: "0 0" },
	"25%": { translate: "-4px 0" },
	"75%": { translate: "4px 0" },
	"100%": { translate: "0 0" },
});

export const toastAnimationStyles = create({
	pulseEven: {
		animationDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		animationName: { [conditions.reducedMotion]: "none", default: pulseA },
		animationTimingFunction: easing.easeOut,
	},
	pulseOdd: {
		animationDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		animationName: { [conditions.reducedMotion]: "none", default: pulseB },
		animationTimingFunction: easing.easeOut,
	},
	shakeEven: {
		animationDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		animationName: { [conditions.reducedMotion]: "none", default: shakeA },
		animationTimingFunction: easing.easeOut,
	},
	shakeOdd: {
		animationDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		animationName: { [conditions.reducedMotion]: "none", default: shakeB },
		animationTimingFunction: easing.easeOut,
	},
});
