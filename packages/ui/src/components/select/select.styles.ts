import { create } from "@stylexjs/stylex";
import { colors, fieldColors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { controlSize } from "../../styles/dimensions.stylex";
import { floatingItemColors } from "../../styles/floating-item-colors.stylex";
import { fonts } from "../../styles/fonts.stylex";
import {
	borderWidth,
	focusMotion,
	focusOutline,
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

export const selectStyles = create({
	checkIcon: { display: "block", height: "1rem", width: "1rem" },
	chevron: {
		color: "currentColor",
		flexShrink: 0,
		height: "1rem",
		width: "1rem",
	},
	group: { display: "flex", flexDirection: "column", gap: space.px },
	groupLabel: {
		color: colors.mutedContent,
		fontSize: fontSize["12"],
		fontSizeAdjust: fonts.sizeAdjust,
		fontWeight: fontWeight.medium,
		letterSpacing: letterSpacing.caption,
		lineHeight: lineHeight["16"],
		paddingBlockEnd: space["1"],
		paddingBlockStart: space["2"],
		paddingInline: space["2"],
	},
	icon: {
		alignItems: "center",
		display: "inline-flex",
		justifyContent: "center",
		transform: { "[data-popup-open]": "rotate(180deg)", default: "none" },
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "transform",
		transitionTimingFunction: easing.expoOut,
	},
	item: {
		alignItems: "center",
		backgroundColor: {
			"[data-highlighted]": floatingItemColors.highlightBackground,
			default: "transparent",
		},
		// Concentric with the 24px popup: its radius minus the 8px row inset.
		borderRadius: `calc(${shape.floatingRadius} - ${space["2"]})`,
		boxSizing: "border-box",
		color: {
			"[data-highlighted]": floatingItemColors.highlightForeground,
			default: colors.content,
		},
		cursor: { "[data-disabled]": "not-allowed", default: "pointer" },
		display: "flex",
		fontSize: fontSize["14"],
		fontSizeAdjust: fonts.sizeAdjust,
		fontWeight: {
			"[data-selected]": fontWeight.medium,
			default: fontWeight.regular,
		},
		forcedColorAdjust: {
			"[data-highlighted]": forcedColorAdjust.selectedState,
		},
		gap: space["2"],
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
		minHeight: controlSize.sm,
		opacity: { "[data-disabled]": opacity.disabled, default: 1 },
		// Keyboard focus draws the ring; the row under the pointer keeps the tint.
		outlineColor: {
			":focus-visible:not(:hover)": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: `-${borderWidth.focus}`,
		outlineStyle: { ":focus-visible:not(:hover)": "solid", default: "none" },
		outlineWidth: borderWidth.focus,
		paddingBlock: `calc((2rem - ${lineHeight["20"]}) / 2)`,
		paddingInlineEnd: space["2"],
		paddingInlineStart: space["2"],
		position: "relative",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "background-color, color, opacity",
		transitionTimingFunction: easing.expoOut,
	},
	itemIcon: {
		alignItems: "center",
		color: "currentColor",
		display: "inline-flex",
		flexGrow: 0,
		flexShrink: 0,
		height: "1rem",
		justifyContent: "center",
		lineHeight: 0,
		width: "1rem",
	},
	itemIndicator: {
		alignItems: "center",
		display: "inline-flex",
		flexShrink: 0,
		justifyContent: "center",
		marginInlineStart: "auto",
		opacity: { "[data-selected]": 1, default: 0 },
		transform: {
			"[data-selected]": "scale(1)",
			default: "scale(0.25)",
		},
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "opacity, transform",
		transitionTimingFunction: easing.expoOut,
	},
	itemText: {
		alignItems: "center",
		display: "flex",
		gap: space["2"],
		minWidth: 0,
	},
	// Label role, matching FieldLabel: 4px margin plus the Field's 4px gap.
	// Label role, as FieldLabel: 13/20 medium, 6px above the trigger. Inside a
	// Field the root gap already supplies the 6px.
	label: {
		color: colors.content,
		display: "block",
		fontSize: fontSize["13"],
		fontSizeAdjust: fonts.sizeAdjust,
		fontWeight: fontWeight.medium,
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
		marginBlockEnd: {
			":is([data-slot='field'] > *)": space["0"],
			default: space["1.5"],
		},
	},
	// A hairline gap keeps neighboring selected rows apart.
	list: { display: "flex", flexDirection: "column", gap: space.px },
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
		minWidth: "var(--anchor-width)",
		opacity: {
			"[data-ending-style]": 0,
			"[data-starting-style]": 0,
			default: 1,
		},
		padding: space["2"],
		transform: {
			"[data-ending-style]": "translateY(-0.25rem) scale(0.98)",
			"[data-starting-style]": "translateY(-0.25rem) scale(0.98)",
			default: "none",
		},
		transformOrigin: "var(--transform-origin)",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "opacity, transform",
		transitionTimingFunction: easing.expoOut,
	},
	positioner: { zIndex: 50 },
	separator: {
		backgroundColor: colors.border,
		height: borderWidth.thin,
		marginBlock: space["1"],
		marginInline: space["2"],
	},
	sizeDefault: {
		height: controlSize.md,
	},
	sizeLg: {
		height: controlSize.lg,
	},
	sizeSm: {
		borderEndEndRadius: shape.controlRadius,
		borderEndStartRadius: shape.controlRadius,
		borderStartEndRadius: shape.controlRadius,
		borderStartStartRadius: shape.controlRadius,
		fontSize: fontSize["13"],
		height: controlSize.sm,
		lineHeight: lineHeight["20"],
	},
	trigger: {
		// The focused edge takes the focus color; an invalid field keeps its
		// error color.
		"--mizen-field-focus-edge": {
			":is([aria-invalid='true'], [data-invalid])": colors.destructive,
			default: colors.focusRing,
		},
		alignItems: "center",
		animationDuration: {
			":focus-visible": focusMotion.duration,
		},
		animationName: {
			":focus-visible": focusMotion.ring,
		},
		appearance: "none",
		backgroundColor: {
			"[data-disabled]": fieldColors.disabled,
			default: fieldColors.surface,
		},
		borderColor: {
			":is([aria-invalid='true'], [data-invalid]):not([data-disabled])": `color-mix(in oklab, ${colors.destructive} 54%, ${fieldColors.surface})`,
			"[aria-haspopup='listbox']:hover:not([data-disabled], [data-readonly], [aria-invalid='true'], [data-invalid])":
				{ [conditions.canHover]: colors.controlBorderStrong },
			"[data-disabled]": colors.border,
			default: colors.controlBorder,
		},
		borderRadius: shape.controlRadiusLarge,
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxShadow: {
			":focus-visible": focusOutline.fieldHalo,
			"[data-disabled]": "none",
			default: shadows.fieldRest,
		},
		boxSizing: "border-box",
		color: { "[data-disabled]": colors.mutedContent, default: colors.content },
		cursor: {
			"[data-disabled]": "not-allowed",
			"[data-readonly]:not([data-disabled])": "default",
			default: "pointer",
		},
		display: "flex",
		fontFamily: "inherit",
		fontSize: fontSize["14"],
		fontSizeAdjust: fonts.sizeAdjust,
		fontWeight: fontWeight.regular,
		gap: space["2"],
		justifyContent: "space-between",
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
		minWidth: 0,
		outlineColor: {
			":focus-visible": "var(--mizen-field-focus-edge)",
			default: "transparent",
		},
		outlineOffset: focusOutline.fieldOffset,
		outlineStyle: {
			":focus-visible": "solid",
			default: focusOutline.restingOutlineStyle,
		},
		outlineWidth: focusOutline.fieldWidth,
		paddingBlock: 0,
		paddingInline: space["3"],
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty:
			"background-color, border-color, box-shadow, color, outline-color",
		transitionTimingFunction: easing.expoOut,
	},
	value: {
		alignItems: "center",
		color: {
			"[data-placeholder]": colors.mutedContent,
			default: colors.content,
		},
		display: "flex",
		flexGrow: 1,
		gap: space["2"],
		minWidth: 0,
		opacity: 1,
		overflow: "hidden",
		// Keep accents and descenders inside the horizontal clipping boundary.
		paddingBlock: "0.25em",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
});
