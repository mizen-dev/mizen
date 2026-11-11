import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { floatingItemColors } from "../../styles/floating-item-colors.stylex";
import { fonts } from "../../styles/fonts.stylex";
import {
	borderWidth,
	forcedColorAdjust,
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

export const menuStyles = create({
	checkIcon: {
		display: "block",
		height: "1rem",
		width: "1rem",
	},
	chevron: {
		color: "currentColor",
		flexShrink: 0,
		height: "1rem",
		marginInlineStart: "auto",
		width: "1rem",
	},
	// The rows' 8px inset, inside the scroll area so the fade reaches the edge.
	content: { padding: space["2"] },
	group: {
		display: "flex",
		flexDirection: "column",
	},
	groupLabel: {
		color: colors.mutedContent,
		fontSize: fontSize["12"],
		fontSizeAdjust: fonts.sizeAdjust,
		fontWeight: fontWeight.medium,
		letterSpacing: letterSpacing.caption,
		lineHeight: lineHeight["16"],
		overflowWrap: "anywhere",
		paddingBlockEnd: space["1"],
		paddingBlockStart: space["2"],
		paddingInline: space["2"],
	},
	indicator: {
		alignItems: "center",
		color: { "[data-checked]": colors.accent },
		display: "inline-flex",
		flexShrink: 0,
		height: "1rem",
		justifyContent: "center",
		opacity: { "[data-checked]": 1, default: 0 },
		transform: { "[data-checked]": "scale(1)", default: "scale(0.5)" },
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "opacity, transform",
		transitionTimingFunction: easing.expoOut,
		width: "1rem",
	},
	inset: {
		paddingInlineStart: space["8"],
	},
	item: {
		alignItems: "center",
		// Concentric with the 24px popup: its radius minus the 8px row inset.
		borderEndEndRadius: `calc(${shape.floatingRadius} - ${space["2"]})`,
		borderEndStartRadius: `calc(${shape.floatingRadius} - ${space["2"]})`,
		borderStartEndRadius: `calc(${shape.floatingRadius} - ${space["2"]})`,
		borderStartStartRadius: `calc(${shape.floatingRadius} - ${space["2"]})`,
		boxSizing: "border-box",
		cursor: { "[data-disabled]": "not-allowed", default: "default" },
		display: "flex",
		fontFamily: "inherit",
		fontSize: fontSize["14"],
		fontSizeAdjust: fonts.sizeAdjust,
		fontWeight: fontWeight.regular,
		forcedColorAdjust: {
			"[data-highlighted]": forcedColorAdjust.selectedState,
		},
		gap: space["2"],
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
		minHeight: "2rem",
		minWidth: 0,
		opacity: { "[data-disabled]": opacity.disabled, default: 1 },
		// Keyboard focus draws the ring; the row under the pointer keeps the tint.
		outlineColor: {
			":focus-visible:not(:hover)": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: `-${borderWidth.focus}`,
		outlineStyle: { ":focus-visible:not(:hover)": "solid", default: "none" },
		outlineWidth: borderWidth.focus,
		overflowWrap: "anywhere",
		paddingBlock: `calc((2rem - ${lineHeight["20"]}) / 2)`,
		paddingInline: space["2"],
		textDecoration: "none",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "background-color, color, opacity",
		transitionTimingFunction: easing.expoOut,
		userSelect: "none",
	},
	itemDefault: {
		backgroundColor: {
			"[data-highlighted]": floatingItemColors.highlightBackground,
			default: "transparent",
		},
		color: {
			"[data-highlighted]": floatingItemColors.highlightForeground,
			default: colors.content,
		},
	},
	itemDestructive: {
		backgroundColor: {
			"[data-highlighted]": floatingItemColors.destructiveHighlightBackground,
			default: "transparent",
		},
		color: {
			"[data-highlighted]": floatingItemColors.destructiveHighlightForeground,
			default: colors.destructive,
		},
	},
	popup: {
		backgroundColor: colors.floatingSurface,
		borderColor: {
			[conditions.moreContrast]: colors.controlBorderStrong,
			default: colors.border,
		},
		borderRadius: shape.floatingRadius,
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxShadow: shadows.floating,
		boxSizing: "border-box",
		color: colors.content,
		display: "flex",
		flexDirection: "column",
		// About ten rows, then the list scrolls; long menus never fill the screen.
		maxHeight: "min(var(--available-height), 20rem)",
		maxWidth: "min(var(--available-width), calc(100vw - 2rem))",
		minWidth: "12rem",
		opacity: {
			"[data-ending-style]": 0,
			"[data-starting-style]": 0,
			default: 1,
		},
		outline: "none",
		overflow: "hidden",
		transform: {
			"[data-ending-style][data-side='bottom']":
				"translateY(-0.25rem) scale(0.98)",
			"[data-ending-style][data-side='inline-end']":
				"translateX(-0.25rem) scale(0.98)",
			"[data-ending-style][data-side='inline-start']":
				"translateX(0.25rem) scale(0.98)",
			"[data-ending-style][data-side='left']":
				"translateX(0.25rem) scale(0.98)",
			"[data-ending-style][data-side='right']":
				"translateX(-0.25rem) scale(0.98)",
			"[data-ending-style][data-side='top']": "translateY(0.25rem) scale(0.98)",
			"[data-starting-style][data-side='bottom']":
				"translateY(-0.25rem) scale(0.98)",
			"[data-starting-style][data-side='inline-end']":
				"translateX(-0.25rem) scale(0.98)",
			"[data-starting-style][data-side='inline-start']":
				"translateX(0.25rem) scale(0.98)",
			"[data-starting-style][data-side='left']":
				"translateX(0.25rem) scale(0.98)",
			"[data-starting-style][data-side='right']":
				"translateX(-0.25rem) scale(0.98)",
			"[data-starting-style][data-side='top']":
				"translateY(0.25rem) scale(0.98)",
			default: "none",
		},
		transformOrigin: "var(--transform-origin)",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			"[data-instant]": duration.instant,
			default: duration.fast,
		},
		transitionProperty: "opacity, transform",
		transitionTimingFunction: easing.expoOut,
	},
	positioner: {
		maxWidth: "calc(100vw - 2rem)",
		zIndex: 50,
	},
	radioDot: {
		backgroundColor: "currentColor",
		borderEndEndRadius: "50%",
		borderEndStartRadius: "50%",
		borderStartEndRadius: "50%",
		borderStartStartRadius: "50%",
		height: "0.375rem",
		width: "0.375rem",
	},
	separator: {
		backgroundColor: colors.border,
		height: borderWidth.thin,
		marginBlock: space["1"],
		marginInline: space["2"],
	},
	shortcut: {
		color: {
			[conditions.forcedColors]: "inherit",
			default: colors.mutedContent,
		},
		flexShrink: 0,
		fontFamily: "inherit",
		fontSize: fontSize["12"],
		fontSizeAdjust: fonts.sizeAdjust,
		fontVariantNumeric: "tabular-nums",
		fontWeight: fontWeight.regular,
		letterSpacing: letterSpacing.caption,
		marginInlineStart: "auto",
		whiteSpace: "nowrap",
	},
	subTrigger: {
		backgroundColor: {
			"[data-popup-open]": floatingItemColors.highlightBackground,
		},
		color: { "[data-popup-open]": floatingItemColors.highlightForeground },
	},
	switchIndicator: {
		alignItems: "center",
		backgroundColor: colors.controlSurfaceHover,
		borderEndEndRadius: "9999px",
		borderEndStartRadius: "9999px",
		borderStartEndRadius: "9999px",
		borderStartStartRadius: "9999px",
		boxSizing: "border-box",
		display: "inline-flex",
		flexShrink: 0,
		height: "1rem",
		marginInlineStart: "auto",
		padding: "0.125rem",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "background-color",
		transitionTimingFunction: easing.expoOut,
		width: "1.75rem",
	},
	switchIndicatorChecked: {
		backgroundColor: colors.accent,
	},
	switchThumb: {
		backgroundColor: colors.controlThumb,
		borderEndEndRadius: "50%",
		borderEndStartRadius: "50%",
		borderStartEndRadius: "50%",
		borderStartStartRadius: "50%",
		boxShadow: shadows.filledRest,
		height: "0.75rem",
		marginInlineStart: 0,
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "background-color, margin-inline-start",
		transitionTimingFunction: easing.expoOut,
		width: "0.75rem",
	},
	switchThumbChecked: {
		backgroundColor: colors.controlThumb,
		marginInlineStart: "0.75rem",
	},
});
