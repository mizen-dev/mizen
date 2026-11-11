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
import {
	fontSize,
	fontWeight,
	letterSpacing,
	lineHeight,
} from "../../styles/typography.stylex";

export const accordionStyles = create({
	content: {
		color: colors.mutedContent,
		fontSize: fontSize["14"],
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
		overflowWrap: "anywhere",
		paddingBottom: space["4"],
		paddingInline: space["2"],
		paddingTop: space["0"],
	},
	description: {
		color: colors.mutedContent,
		fontSize: fontSize["13"],
		fontWeight: fontWeight.regular,
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
		overflowWrap: "anywhere",
	},
	header: {
		borderRadius: "inherit",
		display: "flex",
		margin: 0,
		paddingBottom: space["2"],
	},
	icon: {
		alignItems: "center",
		backgroundColor: colors.controlSurface,
		// Concentric with the item's 24px corner, about 16px away.
		borderRadius: `calc(${shape.floatingRadius} - ${space["4"]})`,
		color: colors.mutedContent,
		display: "inline-flex",
		flexShrink: 0,
		height: "2rem",
		justifyContent: "center",
		width: "2rem",
	},
	indicator: {
		color: colors.content,
		flexShrink: 0,
		height: "1rem",
		opacity: 0.8,
		pointerEvents: "none",
		transform: {
			":is([data-panel-open] *)": "rotate(180deg)",
			"[data-panel-open]": "rotate(180deg)",
			default: "none",
		},
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.disclosure,
		},
		transitionProperty: "transform",
		transitionTimingFunction: easing.spring,
		width: "1rem",
	},
	item: {
		borderBottomColor: colors.border,
		borderBottomStyle: "solid",
		borderBottomWidth: borderWidth.thin,
	},
	panel: {
		height: {
			"[data-ending-style]": 0,
			"[data-starting-style]": 0,
			default: "var(--accordion-panel-height)",
		},
		overflow: "hidden",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.disclosure,
		},
		transitionProperty: "height",
		transitionTimingFunction: easing.expoOut,
	},
	root: {
		display: "flex",
		flexDirection: "column",
		gap: { '[data-variant="separated"]': space["0"], default: space["2"] },
		width: "100%",
	},
	title: {
		color: colors.content,
		display: "block",
		fontSize: fontSize["14"],
		fontWeight: fontWeight.medium,
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
		overflowWrap: "anywhere",
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
				":hover:not([data-disabled])": colors.controlSurface,
			},
			default: "transparent",
		},
		borderRadius: shape.controlRadius,
		borderStyle: "none",
		borderWidth: 0,
		boxSizing: "border-box",
		color: colors.content,
		cursor: {
			"[data-disabled]": "not-allowed",
			default: "pointer",
		},
		display: "flex",
		flex: "1",
		fontFamily: "inherit",
		fontSize: fontSize["14"],
		fontWeight: fontWeight.medium,
		gap: space["3"],
		justifyContent: "space-between",
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
		minHeight: "3rem",
		opacity: {
			"[data-disabled]": opacity.disabled,
			default: 1,
		},
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: {
			":focus-visible": focus.offset,
			default: focus.offset,
		},
		outlineStyle: {
			":focus-visible": "solid",
			default: focusOutline.restingOutlineStyle,
		},
		outlineWidth: {
			":focus-visible": borderWidth.focus,
			default: borderWidth.focus,
		},
		paddingBlock: space["3"],
		paddingInline: space["2"],
		textAlign: "start",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "background-color, opacity, outline-color",
		transitionTimingFunction: easing.expoOut,
		width: "100%",
	},
	triggerText: {
		display: "flex",
		flex: "1",
		flexDirection: "column",
		gap: space["1"],
		minWidth: 0,
	},
});

export const separatedAccordionStyles = create({
	content: { paddingBottom: space["4"], paddingInline: space["4"] },
	header: {
		paddingBlock: space["1"],
		paddingBottom: space["1"],
		paddingInline: space["1"],
	},
	item: {
		backgroundColor: {
			"[data-open]": colors.surface,
			default: colors.workarea,
		},
		borderBottomColor: { "[data-open]": colors.border, default: "transparent" },
		borderBottomLeftRadius: {
			":has(+ [data-open])": shape.floatingRadius,
			":last-child": shape.floatingRadius,
			"[data-open]": shape.floatingRadius,
			default: 0,
		},
		borderBottomRightRadius: {
			":has(+ [data-open])": shape.floatingRadius,
			":last-child": shape.floatingRadius,
			"[data-open]": shape.floatingRadius,
			default: 0,
		},
		borderInlineEndColor: {
			"[data-open]": colors.border,
			default: "transparent",
		},
		borderInlineStartColor: {
			"[data-open]": colors.border,
			default: "transparent",
		},
		borderStyle: "solid",
		borderTopColor: { "[data-open]": colors.border, default: "transparent" },
		borderTopLeftRadius: {
			":first-child": shape.floatingRadius,
			":is([data-open] + *)": shape.floatingRadius,
			"[data-open]": shape.floatingRadius,
			default: 0,
		},
		borderTopRightRadius: {
			":first-child": shape.floatingRadius,
			":is([data-open] + *)": shape.floatingRadius,
			"[data-open]": shape.floatingRadius,
			default: 0,
		},
		borderWidth: borderWidth.thin,
		boxShadow: { "[data-open]": shadows.outlineRest, default: "none" },
		marginBlockEnd: { "[data-open]:not(:last-child)": space["2"], default: 0 },
		marginBlockStart: {
			"[data-open]:not(:first-child):not([data-open] + *)": space["2"],
			default: 0,
		},
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.disclosure,
		},
		transitionProperty:
			"margin, border-radius, border-color, background-color, box-shadow",
		transitionTimingFunction: easing.spring,
	},
	trigger: {
		borderRadius: `calc(${shape.floatingRadius} - ${borderWidth.thin}px - ${space["1"]})`,
		minHeight: `calc(3.5rem - ${space["1"]} * 2)`,
		paddingBlock: space["2"],
		paddingInline: space["3"],
	},
});
