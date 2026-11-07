import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { controlSize } from "../../styles/dimensions.stylex";
import {
	borderWidth,
	focus,
	focusMotion,
	focusOutline,
	opacity,
} from "../../styles/interaction.stylex";
import { duration, easing } from "../../styles/motion.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import {
	fontSize,
	fontWeight,
	lineHeight,
} from "../../styles/typography.stylex";

export const navigationMenuStyles = create({
	active: {
		backgroundColor: colors.brandBackground,
		color: colors.brandForeground,
	},
	content: {
		display: "flex",
		flexDirection: "column",
		maxHeight: "calc(var(--available-height) - 1.5rem - 2px)",
		opacity: {
			"[data-ending-style]": 0,
			"[data-starting-style]": 0,
			default: 1,
		},
		overflowY: "auto",
		transform: {
			"[data-ending-style]": "translateY(-0.25rem)",
			"[data-starting-style]": "translateY(-0.25rem)",
			default: "none",
		},
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			"[data-ending-style]": duration.overlayExit,
			default: duration.overlayEnter,
		},
		transitionProperty: "opacity, transform",
		transitionTimingFunction: easing.expoOut,
	},
	icon: {
		alignItems: "center",
		color: "currentColor",
		display: "inline-flex",
		flexShrink: 0,
		height: "1rem",
		justifyContent: "center",
		transform: { "[data-popup-open]": "rotate(180deg)", default: "none" },
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "transform",
		transitionTimingFunction: easing.expoOut,
		width: "1rem",
	},
	interactive: {
		backgroundColor: {
			[conditions.canHover]: {
				":hover:not([data-disabled])": colors.controlSurfaceHover,
			},
			":active:not([data-disabled])": colors.controlSurfaceHover,
			"[data-popup-open]:not([data-disabled])": colors.controlSurfaceHover,
			default: "transparent",
		},
	},
	item: {
		listStyle: "none",
		minWidth: 0,
	},
	link: {
		alignItems: "center",
		animationDuration: {
			":focus-visible": focusMotion.duration,
		},
		animationName: {
			":focus-visible": focusMotion.ring,
		},
		backgroundColor: "transparent",
		borderRadius: shape.controlRadius,
		boxSizing: "border-box",
		color: colors.content,
		cursor: { "[data-disabled]": "not-allowed", default: "pointer" },
		display: "inline-flex",
		flexShrink: { ":is(*) > svg": 0 },
		fontFamily: "inherit",
		fontSize: fontSize["14"],
		fontWeight: fontWeight.regular,
		gap: space["1"],
		height: { ":is(*) > svg": "1rem" },
		justifyContent: "flex-start",
		lineHeight: lineHeight["20"],
		maxWidth: "100%",
		minHeight: controlSize.sm,
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
		paddingInline: space["3"],
		textDecoration: "none",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "background-color, color, outline-color",
		transitionTimingFunction: easing.expoOut,
		width: { ":is(*) > svg": "1rem" },
	},
	linkDescription: {
		color: colors.mutedContent,
		fontSize: fontSize["14"],
		lineHeight: lineHeight["20"],
	},
	linkTitle: {
		fontWeight: fontWeight.medium,
	},
	// A title over one muted line.
	linkWithDescription: {
		alignItems: "flex-start",
		display: "flex",
		flexDirection: "column",
		gap: 0,
		paddingBlock: space["2"],
	},
	list: {
		alignItems: "center",
		display: "flex",
		flexWrap: "wrap",
		gap: space["1"],
		listStyle: "none",
		marginBlock: 0,
		marginInline: 0,
		minWidth: 0,
		paddingBlock: 0,
		paddingInline: 0,
	},
	popup: {
		maxHeight: "var(--available-height)",
		minWidth: 0,
		overflow: "hidden",
		padding: space["3"],
		width: "100%",
	},
	positioner: {
		maxWidth: "min(18rem, var(--available-width, calc(100vw - 2rem)))",
		width: "min(18rem, var(--available-width, calc(100vw - 2rem)))",
		zIndex: 50,
	},
	root: {
		maxWidth: "100%",
		minWidth: 0,
		position: "relative",
		width: "fit-content",
	},
	trigger: {
		appearance: "none",
		borderStyle: "none",
		borderWidth: 0,
	},
	viewport: {
		maxHeight: "var(--available-height)",
		overflow: "hidden",
		width: "100%",
	},
});
