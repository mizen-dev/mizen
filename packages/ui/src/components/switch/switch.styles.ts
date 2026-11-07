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
		"--mizen-switch-thumb-radius": {
			[conditions.reducedMotion]: {
				":is(:active, label:active [data-slot='switch']):not([data-disabled]):not([data-readonly])":
					"50%",
				default: "50%",
			},
			":is(:active, label:active [data-slot='switch']):not([data-disabled]):not([data-readonly])":
				"0.375rem",
			default: "50%",
		},
		"--mizen-switch-thumb-scale-y": {
			[conditions.reducedMotion]: {
				":is(:active, label:active [data-slot='switch']):not([data-disabled]):not([data-readonly])":
					"1",
				default: "1",
			},
			":is(:active, label:active [data-slot='switch']):not([data-disabled]):not([data-readonly])":
				"0.82",
			default: "1",
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
			"[data-checked]:not([data-disabled], [data-readonly]):is(:hover, label:hover [data-slot='switch']):not(:active, label:active [data-slot='switch'])":
				{
					[conditions.canHover]: `color-mix(in oklch, ${colors.accent} 94%, white)`,
				},
			"[data-disabled]": fieldColors.disabled,
			"[data-disabled][data-checked]": colors.accent,
			"[data-slot='switch']:is(:hover, label:hover [data-slot='switch']):not([data-checked], [data-disabled], [data-readonly])":
				{
					[conditions.canHover]: `color-mix(in oklch, ${colors.content} 26%, ${colors.surface})`,
				},
			// Mixed from the text color so the off track reads on any surface.
			default: `color-mix(in oklch, ${colors.content} 18%, ${colors.surface})`,
		},
		borderColor: {
			":is([aria-invalid='true'], [data-invalid]):not([data-disabled])": `color-mix(in oklch, ${colors.destructive} 54%, ${fieldColors.surface})`,
			"[data-checked]:not([data-disabled], [aria-invalid='true'], [data-invalid])":
				colors.accent,
			// The off track has no outline: its fill and the thumb carry the shape.
			default: "transparent",
		},
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxShadow: {
			":is(:active, label:active [data-slot='switch']):not([data-disabled]):not([data-readonly])":
				shadows.pressed,
			":is([aria-invalid='true'], [data-invalid]):not([data-disabled])": `0 0 0 1px color-mix(in oklch, ${colors.destructive} 12%, transparent), ${shadows.outlineRest}`,
			":is([aria-invalid='true'], [data-invalid])[data-checked]:not([data-disabled])": `0 0 0 1px color-mix(in oklch, ${colors.destructive} 12%, transparent), ${shadows.filledRest}`,
			"[data-checked]": shadows.filledRest,
			"[data-checked]:not([data-disabled], [data-readonly]):is(:hover, label:hover [data-slot='switch']):not(:active, label:active [data-slot='switch'])":
				{
					[conditions.canHover]: shadows.filledHover,
				},
			"[data-disabled]": "none",
			"[data-disabled]:hover": "none",
			"[data-disabled][data-checked]": "none",
			"[data-readonly]:not([data-disabled])": shadows.recessedRest,
			"[data-readonly][data-checked]:not([data-disabled])": shadows.filledRest,
			default: shadows.recessedRest,
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
		paddingBlock: 1,
		paddingInline: 1,
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
		borderEndEndRadius: "9999px",
		borderEndStartRadius: "9999px",
		borderStartEndRadius: "9999px",
		borderStartStartRadius: "9999px",
		height: "1.25rem",
		width: "2.25rem",
	},
	sizeLg: {
		borderEndEndRadius: "9999px",
		borderEndStartRadius: "9999px",
		borderStartEndRadius: "9999px",
		borderStartStartRadius: "9999px",
		height: "1.5rem",
		width: "2.75rem",
	},
	sizeSm: {
		borderEndEndRadius: "9999px",
		borderEndStartRadius: "9999px",
		borderStartEndRadius: "9999px",
		borderStartStartRadius: "9999px",
		height: "1.125rem",
		width: "2rem",
	},
	thumb: {
		backgroundColor: {
			[conditions.forcedColors]: "ButtonText",
			// One white thumb for both states; position and track color show state.
			default: colors.controlThumb,
		},
		borderColor: {
			[conditions.forcedColors]: "ButtonText",
			default: "oklch(0 0 0 / 0.06)",
		},
		borderRadius: "var(--mizen-switch-thumb-radius)",
		borderStyle: "solid",
		borderWidth: 1,
		boxShadow: {
			[conditions.forcedColors]: "none",
			default: shadows.filledRest,
		},
		boxSizing: "border-box",
		display: "block",
		transform: "scaleY(var(--mizen-switch-thumb-scale-y))",
		transformOrigin: "center",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty:
			"background-color, border-radius, margin-inline-start, transform",
		transitionTimingFunction: easing.expoOut,
	},
	thumbDefault: {
		height: "1rem",
		marginInlineStart: { "[data-checked]": "1rem", default: 0 },
		width: "1rem",
	},
	thumbLg: {
		height: "1.25rem",
		marginInlineStart: { "[data-checked]": "1.25rem", default: 0 },
		width: "1.25rem",
	},
	thumbSm: {
		height: "0.875rem",
		marginInlineStart: { "[data-checked]": "0.875rem", default: 0 },
		width: "0.875rem",
	},
});
