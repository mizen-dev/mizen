import { create, keyframes } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { controlSize } from "../../styles/dimensions.stylex";
import { easing } from "../../styles/motion.stylex";
import { shape } from "../../styles/shape.stylex";

const shimmer = keyframes({
	"0%": {
		backgroundPosition: "200% 0",
	},
	"100%": {
		backgroundPosition: "-200% 0",
	},
});

export const skeletonStyles = create({
	base: {
		animationDuration: "2s",
		animationIterationCount: "infinite",
		animationName: {
			[conditions.reducedMotion]: "none",
			default: shimmer,
		},
		animationTimingFunction: easing.linear,
		backgroundAttachment: "fixed",
		// The tile tone, like icon tiles and badges: present but quiet.
		backgroundColor: colors.controlSurface,
		backgroundImage: `linear-gradient(120deg, transparent 40%, color-mix(in oklch, ${colors.content} 8%, transparent) 50%, transparent 60%)`,
		backgroundRepeat: "no-repeat",
		backgroundSize: "200% 100%",
		boxSizing: "border-box",
		display: "block",
	},
	circle: {
		borderRadius: "9999px",
		flexShrink: 0,
		height: controlSize.lg,
		width: controlSize.lg,
	},
	line: {
		borderRadius: shape.checkboxRadius,
		height: "1rem",
		width: "100%",
	},
	rectangle: {
		aspectRatio: "16 / 9",
		borderRadius: shape.controlRadius,
		minHeight: controlSize.xs,
		width: "100%",
	},
});
