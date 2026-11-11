import { create } from "@stylexjs/stylex";
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
import { shadows } from "../../styles/shadows.stylex";

export const switchStyles = create({
	base: {
		// A held thumb stretches toward the other side.
		"--mizen-switch-thumb-stretch": {
			":is(:active, label:active [data-slot='switch']):not([data-disabled]):not([data-readonly])":
				"0.3125rem",
			default: "0rem",
		},
		// The track is shorter than the smallest hit area; this extends it.
		"::after": {
			content: '""',
			insetBlock: "min(0px, calc((100% - 1.5rem) / 2))",
			insetInline: 0,
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
			"[data-checked]:not([data-disabled], [data-readonly]):is(:hover, label:hover [data-slot='switch'])":
				{
					[conditions.canHover]: `color-mix(in oklch, ${colors.accent} 90%, white)`,
				},
			"[data-disabled]": fieldColors.disabled,
			"[data-disabled][data-checked]": colors.accent,
			"[data-slot='switch']:is(:hover, label:hover [data-slot='switch']):not([data-checked], [data-disabled], [data-readonly])":
				{
					[conditions.canHover]: colors.controlSurfaceHover,
				},
			default: colors.controlSurface,
		},
		borderColor: {
			":is([aria-invalid='true'], [data-invalid]):not([data-disabled])": `color-mix(in oklch, ${colors.destructive} 54%, ${fieldColors.surface})`,
			"[data-checked]:not([aria-invalid='true'], [data-invalid])":
				colors.accent,
			"[data-disabled]:not([data-checked])": colors.border,
			// A light track with a thin edge: quiet when off, below 3:1 by design.
			default: colors.controlBorder,
		},
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxShadow: {
			":is([aria-invalid='true'], [data-invalid]):not([data-disabled])": `0 0 0 1px color-mix(in oklch, ${colors.destructive} 12%, transparent)`,
			default: "none",
		},
		boxSizing: "border-box",
		cursor: {
			"[data-disabled]": "not-allowed",
			"[data-readonly]:not([data-disabled])": "default",
			default: "pointer",
		},
		display: "inline-flex",
		flexShrink: 0,
		justifyContent: "flex-start",
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
		paddingBlock: 2,
		paddingInline: 2,
		position: "relative",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty:
			"background-color, border-color, box-shadow, opacity, outline-color, outline-offset",
		transitionTimingFunction: easing.expoOut,
		userSelect: "none",
		verticalAlign: "middle",
	},
	forcedColorsChecked: {
		"[data-checked]": {
			backgroundColor: { [conditions.forcedColors]: "Highlight" },
			borderColor: { [conditions.forcedColors]: "Highlight" },
		},
	},
	sizeDefault: {
		"--mizen-switch-thumb-size": "0.875rem",
		"--mizen-switch-thumb-travel": "1rem",
		borderEndEndRadius: "9999px",
		borderEndStartRadius: "9999px",
		borderStartEndRadius: "9999px",
		borderStartStartRadius: "9999px",
		height: "1.25rem",
		width: "2.25rem",
	},
	sizeLg: {
		"--mizen-switch-thumb-size": "1.125rem",
		"--mizen-switch-thumb-travel": "1.25rem",
		borderEndEndRadius: "9999px",
		borderEndStartRadius: "9999px",
		borderStartEndRadius: "9999px",
		borderStartStartRadius: "9999px",
		height: "1.5rem",
		width: "2.75rem",
	},
	sizeSm: {
		"--mizen-switch-thumb-size": "0.625rem",
		"--mizen-switch-thumb-travel": "0.75rem",
		borderEndEndRadius: "9999px",
		borderEndStartRadius: "9999px",
		borderStartEndRadius: "9999px",
		borderStartStartRadius: "9999px",
		height: "1rem",
		width: "1.75rem",
	},
	thumb: {
		backgroundColor: {
			[conditions.forcedColors]: "ButtonText",
			// One thumb for both states; position and track color show state.
			default: colors.controlThumb,
		},
		borderRadius: "9999px",
		boxShadow: {
			[conditions.forcedColors]: "none",
			default: `0 0 0 1px oklch(0 0 0 / 0.06), ${shadows.filledRest}`,
		},
		boxSizing: "border-box",
		display: "block",
		height: "var(--mizen-switch-thumb-size)",
		marginInlineStart: {
			"[data-checked]":
				"calc(var(--mizen-switch-thumb-travel) - var(--mizen-switch-thumb-stretch))",
			default: 0,
		},
		// Travel springs; the stretch and color changes ease out.
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: `${duration.fast}, ${duration.spring}, 200ms`,
		},
		transitionProperty: "background-color, margin-inline-start, width",
		transitionTimingFunction: `${easing.expoOut}, ${easing.spring}, ${easing.expoOut}`,
		width:
			"calc(var(--mizen-switch-thumb-size) + var(--mizen-switch-thumb-stretch))",
	},
});
