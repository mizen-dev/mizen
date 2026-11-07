import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import {
	borderWidth,
	focus,
	focusMotion,
	focusOutline,
	opacity,
} from "../../styles/interaction.stylex";
import { duration, easing } from "../../styles/motion.stylex";
import { shadows } from "../../styles/shadows.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";

export const menubarStyles = create({
	root: {
		backgroundColor: colors.surface,
		borderColor: colors.border,
		borderRadius: shape.controlRadiusLarge,
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxShadow: shadows.surface,
		boxSizing: "border-box",
		display: "flex",
		flexDirection: {
			"[data-orientation='vertical']": "column",
			default: "row",
		},
		flexWrap: {
			"[data-orientation='vertical']": "nowrap",
			default: "wrap",
		},
		gap: space["1"],
		maxWidth: "100%",
		minWidth: 0,
		padding: space["1"],
	},
	trigger: {
		alignItems: "center",
		animationDuration: {
			":focus-visible": focusMotion.duration,
		},
		animationName: {
			":focus-visible": focusMotion.ring,
		},
		backgroundColor: {
			[conditions.canHover]: {
				":hover:not([data-disabled])": colors.controlSurfaceHover,
			},
			":active:not([data-disabled])": colors.controlSurfaceHover,
			"[data-highlighted]:not([data-disabled])": colors.controlSurfaceHover,
			"[data-popup-open]:not([data-disabled])": colors.controlSurfaceHover,
			default: "transparent",
		},
		borderEndEndRadius: shape.controlRadius,
		borderEndStartRadius: shape.controlRadius,
		borderStartEndRadius: shape.controlRadius,
		borderStartStartRadius: shape.controlRadius,
		borderStyle: "solid",
		borderWidth: 0,
		boxSizing: "border-box",
		color: colors.content,
		cursor: { "[data-disabled]": "not-allowed", default: "default" },
		display: "inline-flex",
		flexShrink: { ":is(*) > svg": 0 },
		fontFamily: "inherit",
		gap: space["1"],
		height: { ":is(*) > svg": "1rem" },
		justifyContent: "flex-start",
		maxWidth: "100%",
		minHeight: "2rem",
		minWidth: 0,
		opacity: { "[data-disabled]": opacity.disabled, default: 1 },
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: focus.offset,
		outlineStyle: {
			":focus-visible": "solid",
			default: focusOutline.restingOutlineStyle,
		},
		outlineWidth: borderWidth.focus,
		overflowWrap: "anywhere",
		paddingBlock: space["1"],
		paddingInline: space["2"],
		textAlign: "start",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "background-color, color, outline-color",
		transitionTimingFunction: easing.expoOut,
		width: { ":is(*) > svg": "1rem" },
	},
});
