import { create, keyframes } from "@stylexjs/stylex";
import { colors, fieldColors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import {
	borderWidth,
	focus,
	focusMotion,
	focusOutline,
	opacity,
} from "../../styles/interaction.stylex";
import { duration, easing } from "../../styles/motion.stylex";
import { shape } from "../../styles/shape.stylex";

// The mark draws on along its stroke; pathLength="1" makes one unit the
// whole path.
const draw = keyframes({
	from: { strokeDashoffset: 1 },
	to: { strokeDashoffset: 0 },
});

export const checkboxStyles = create({
	base: {
		// The box is smaller than the smallest hit area; this extends it.
		"::after": {
			content: '""',
			inset: "min(0px, calc((100% - 1.5rem) / 2))",
			position: "absolute",
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
			"[data-checked]": colors.accent,
			"[data-checked]:not([data-disabled], [data-readonly]):hover": {
				[conditions.canHover]: `color-mix(in oklch, ${colors.accent} 94%, white)`,
			},
			"[data-disabled]": fieldColors.disabled,
			"[data-disabled][data-checked]": colors.accent,
			"[data-disabled][data-indeterminate]": colors.accent,
			"[data-indeterminate]": colors.accent,
			"[data-indeterminate]:not([data-disabled], [data-readonly]):hover": {
				[conditions.canHover]: `color-mix(in oklch, ${colors.accent} 94%, white)`,
			},
			default: colors.surface,
		},
		borderColor: {
			":is([aria-invalid='true'], [data-invalid]):not([data-disabled])":
				colors.destructive,
			"[aria-invalid='true'][data-checked]:not([data-disabled])":
				colors.destructive,
			"[aria-invalid='true'][data-indeterminate]:not([data-disabled])":
				colors.destructive,
			"[data-checked]:not([data-disabled])": colors.accent,
			"[data-disabled]": colors.controlBorder,
			"[data-disabled]:is([data-checked], [data-indeterminate])": colors.accent,
			"[data-indeterminate]:not([data-disabled])": colors.accent,
			"[data-invalid][data-checked]:not([data-disabled])": colors.destructive,
			"[data-invalid][data-indeterminate]:not([data-disabled])":
				colors.destructive,
			// Flat controls show hover on the border instead of a shadow.
			"[data-unchecked]:not([data-indeterminate], [data-disabled], [data-readonly], [aria-invalid='true'], [data-invalid]):hover":
				{
					[conditions.canHover]: colors.content,
				},
			default: colors.controlBorderStrong,
		},
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		// Flat: only an invalid control carries a ring.
		boxShadow: {
			":is([aria-invalid='true'], [data-invalid]):not([data-disabled])": `0 0 0 1px color-mix(in oklch, ${colors.destructive} 12%, transparent)`,
			default: "none",
		},
		boxSizing: "border-box",
		color: colors.accentContent,
		cursor: {
			"[data-disabled]": "not-allowed",
			"[data-readonly]:not([data-disabled])": "default",
			default: "pointer",
		},
		display: "inline-flex",
		flexShrink: 0,
		justifyContent: "center",
		lineHeight: 0,
		opacity: { "[data-disabled]": opacity.disabled, default: 1 },
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: { ":focus-visible": focus.offset, default: focus.offset },
		outlineStyle: {
			":focus-visible": "solid",
			default: focusOutline.restingOutlineStyle,
		},
		outlineWidth: {
			":focus-visible": borderWidth.focus,
			default: borderWidth.focus,
		},
		position: "relative",
		transform: "translateY(-1px)",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty:
			"background-color, border-color, box-shadow, color, outline-color, outline-offset",
		transitionTimingFunction: easing.expoOut,
		userSelect: "none",
		verticalAlign: "middle",
	},
	// Only a mark that appears on a check draws on; one that is checked when
	// it first renders is already drawn.
	draw: {
		animationDelay: {
			[conditions.reducedMotion]: duration.instant,
			default: "60ms",
		},
		animationDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: "300ms",
		},
		animationFillMode: "both",
		animationName: draw,
		animationTimingFunction: easing.expoOut,
	},
	forcedColorsSelected: {
		"[data-checked]": {
			backgroundColor: { [conditions.forcedColors]: "Highlight" },
			borderColor: { [conditions.forcedColors]: "Highlight" },
			color: { [conditions.forcedColors]: "HighlightText" },
		},
		"[data-indeterminate]": {
			backgroundColor: { [conditions.forcedColors]: "Highlight" },
			borderColor: { [conditions.forcedColors]: "Highlight" },
			color: { [conditions.forcedColors]: "HighlightText" },
		},
	},
	icon: {
		display: "block",
		height: "100%",
		overflow: "visible",
		width: "100%",
	},
	indicator: {
		alignItems: "center",
		display: "inline-flex",
		height: "100%",
		justifyContent: "center",
		lineHeight: 0,
		opacity: {
			"[data-ending-style]": 0,
			"[data-starting-style]": 0,
			default: 1,
		},
		pointerEvents: "none",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "opacity",
		transitionTimingFunction: easing.expoOut,
		width: "100%",
	},
	mark: {
		strokeDasharray: 1,
		strokeWidth: 2,
	},
	sizeDefault: {
		borderEndEndRadius: shape.checkboxRadius,
		borderEndStartRadius: shape.checkboxRadius,
		borderStartEndRadius: shape.checkboxRadius,
		borderStartStartRadius: shape.checkboxRadius,
		height: "1rem",
		width: "1rem",
	},
	sizeLg: {
		borderEndEndRadius: shape.checkboxRadius,
		borderEndStartRadius: shape.checkboxRadius,
		borderStartEndRadius: shape.checkboxRadius,
		borderStartStartRadius: shape.checkboxRadius,
		height: "1.125rem",
		width: "1.125rem",
	},
	sizeSm: {
		borderEndEndRadius: shape.checkboxRadius,
		borderEndStartRadius: shape.checkboxRadius,
		borderStartEndRadius: shape.checkboxRadius,
		borderStartStartRadius: shape.checkboxRadius,
		height: "0.875rem",
		width: "0.875rem",
	},
});
