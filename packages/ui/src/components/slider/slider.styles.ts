import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { controlSize } from "../../styles/dimensions.stylex";
import { fonts } from "../../styles/fonts.stylex";
import {
	borderWidth,
	focus,
	focusMotion,
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

type SliderSize = "default" | "sm" | "lg";

const thumbExtent: Record<SliderSize, string> = {
	default: controlSize.xs,
	lg: controlSize.sm,
	sm: controlSize.xs,
};

function indicatorLeadingEdge(extent: string, range: boolean) {
	return range
		? `calc(-1 * (${extent} + ${space["1"]}))`
		: `calc(-1 * ${space["1"]})`;
}

function tickInlineInset(value: boolean, characters: number, size: SliderSize) {
	return value
		? `max(1.75rem, calc((${characters}ch + ${space["3"]}) / 2))`
		: `calc(${thumbExtent[size]} / 2)`;
}

export const sliderStyles = create({
	control: {
		alignItems: "center",
		boxSizing: "border-box",
		cursor: {
			":is([data-disabled])": "not-allowed",
			default: "pointer",
		},
		display: "flex",
		position: "relative",
		touchAction: "none",
		userSelect: "none",
	},
	controlDefaultHorizontal: {
		paddingBlock: space["1"],
	},
	controlDefaultVertical: {
		paddingInline: space["1"],
	},
	controlHorizontal: {
		flexDirection: "row",
		marginInline: space["1"],
		width: `calc(100% - ${space["1"]})`,
	},
	controlLgHorizontal: {
		paddingBlock: space["2"],
	},
	controlLgVertical: {
		paddingInline: space["2"],
	},
	controlSmHorizontal: {
		paddingBlock: space["1"],
	},
	controlSmVertical: {
		paddingInline: space["1"],
	},
	controlVertical: {
		flexDirection: "column",
		height: `calc(100% - ${space["1"]})`,
		justifyContent: "center",
		marginBlock: space["1"],
		width: "auto",
	},
	indicator: {
		"::before": {
			backgroundColor: {
				":is([data-disabled])": colors.controlBorderStrong,
				":is([data-invalid]):not([data-disabled])": colors.destructive,
				// A solid accent fill, like a checked Switch or Checkbox.
				default: colors.accent,
			},
			borderRadius: "inherit",
			content: '""',
			// Hidden at the minimum so the thumb sits in the plain track.
			opacity: { ":is([data-empty])": 0, default: 1 },
			pointerEvents: "none",
			position: "absolute",
		},
		borderRadius: "inherit",
		boxSizing: "border-box",
		display: "block",
		fontSize: fontSize["12"],
		letterSpacing: letterSpacing.caption,
		position: "absolute",
	},
	indicatorExtent: (
		orientation: "horizontal" | "vertical",
		extent: string,
		range: boolean
	) => ({
		"::before": {
			insetBlockEnd:
				orientation === "vertical" ? indicatorLeadingEdge(extent, range) : 0,
			insetBlockStart:
				orientation === "vertical"
					? `calc(-1 * (${extent} + ${space["1"]}))`
					: 0,
			insetInlineEnd:
				orientation === "horizontal"
					? `calc(-1 * (${extent} + ${space["1"]}))`
					: 0,
			insetInlineStart:
				orientation === "horizontal" ? indicatorLeadingEdge(extent, range) : 0,
		},
	}),
	// Label role, as FieldLabel: 13/20 medium.
	label: {
		color: colors.content,
		fontSize: fontSize["13"],
		fontWeight: fontWeight.medium,
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
	},
	root: {
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "column",
		gap: space["1"],
		opacity: {
			":is([data-disabled])": opacity.disabled,
			default: 1,
		},
		position: "relative",
		userSelect: "none",
		width: "100%",
	},
	rootDisabled: {
		opacity: opacity.disabled,
	},
	rootVertical: {
		alignItems: "center",
		height: "100%",
		width: "auto",
	},
	thumb: {
		"::before": {
			content: "''",
			height: "100%",
			left: "50%",
			minHeight: controlSize.xs,
			minWidth: controlSize.xs,
			position: "absolute",
			top: "50%",
			transform: "translate(-50%, -50%)",
			width: "100%",
		},
		alignItems: "center",
		animationDuration: {
			":is(:focus-visible, :has(:focus-visible))": focusMotion.duration,
		},
		animationName: {
			":is(:focus-visible, :has(:focus-visible))": focusMotion.ring,
		},
		backgroundColor: {
			":is([data-disabled])": colors.controlBorderStrong,
			[conditions.forcedColors]: "ButtonFace",
			default: colors.controlThumb,
		},
		borderColor: {
			":is([data-disabled])": colors.border,
			":is([data-invalid]):not([data-disabled])": colors.destructive,
			default: colors.border,
		},
		borderRadius: shape.controlRadius,
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxShadow: {
			":active:not([data-disabled])": shadows.pressed,
			":is([data-disabled])": "none",
			// Base UI shares dragging across the range; focus identifies its active thumb.
			"[data-dragging]:has(input:focus):not([data-disabled])": shadows.pressed,
			"[data-slot='slider-thumb']:hover:not([data-disabled], :active):not([data-dragging]:has(input:focus))":
				{
					[conditions.canHover]: shadows.filledHover,
				},
			default: shadows.filledRest,
		},
		boxSizing: "border-box",
		color: {
			[conditions.forcedColors]: "ButtonText",
			default: colors.controlThumbContent,
		},
		cursor: {
			":is([data-disabled])": "not-allowed",
			"[data-dragging]:has(input:focus):not([data-disabled])": "grabbing",
			default: "grab",
		},
		display: "flex",
		fontSize: fontSize["12"],
		justifyContent: "center",
		letterSpacing: letterSpacing.caption,
		outlineColor: {
			":is(:focus-visible, :has(:focus-visible))": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: focus.offset,
		outlineStyle: "solid",
		outlineWidth: {
			":is(:focus-visible, :has(:focus-visible))": borderWidth.focus,
			default: 0,
		},
		position: "absolute",
		// Sinks a little while pressed or dragged; scale composes with the
		// positioning transform Base UI sets inline.
		scale: {
			":active:not([data-disabled])": 0.9,
			"[data-dragging]:has(input:focus):not([data-disabled])": 0.9,
			[conditions.reducedMotion]: 1,
			default: 1,
		},
		touchAction: "none",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty:
			"background-color, border-color, box-shadow, outline-color, outline-width, outline-offset, scale",
		transitionTimingFunction: easing.expoOut,
		userSelect: "none",
		zIndex: 2,
	},

	thumbDefault: { height: controlSize.xs, width: controlSize.xs },
	thumbDisabled: { boxShadow: "none", cursor: "not-allowed" },
	thumbLg: { height: controlSize.sm, width: controlSize.sm },
	thumbSm: {
		borderRadius: `calc(${shape.controlRadius} - ${space["1"]})`,
		height: controlSize.xs,
		width: controlSize.xs,
	},
	thumbValue: {
		fontFamily: "inherit",
		fontSize: fontSize["12"],
		fontVariantNumeric: "tabular-nums",
		letterSpacing: letterSpacing.caption,
		lineHeight: lineHeight.none,
		pointerEvents: "none",
		whiteSpace: "nowrap",
	},
	thumbWithValue: (characters: number) => ({
		width: `max(3.5rem, calc(${characters}ch + ${space["3"]}))`,
	}),
	tick: {
		// On the accent fill a dot takes the light accent text color instead.
		backgroundColor: {
			"[data-filled]": colors.accentContent,
			// Muted text is darker in light mode and lighter in dark mode.
			default: colors.mutedContent,
		},
		borderRadius: "50%",
		height: space["1"],
		opacity: 0.5,
		position: "absolute",
		transform: "translate(-50%, -50%)",
		width: space["1"],
	},
	tickInset: (
		alignment: "edge" | "center" | "edge-client-only",
		value: boolean,
		characters: number,
		size: SliderSize
	) => ({
		insetBlock: {
			"[data-orientation='vertical'] > [data-slot='slider-ticks']": `calc(${thumbExtent[size]} / 2)`,
			default: 0,
		},
		insetInline: {
			"[data-orientation='vertical'] > [data-slot='slider-ticks']": 0,
			default:
				alignment === "center" ? 0 : tickInlineInset(value, characters, size),
		},
	}),
	tickPosition: (orientation: "horizontal" | "vertical", position: number) => ({
		left: {
			":dir(rtl)": orientation === "horizontal" ? `${100 - position}%` : "50%",
			default: orientation === "horizontal" ? `${position}%` : "50%",
		},
		top: orientation === "vertical" ? `${100 - position}%` : "50%",
	}),
	ticks: {
		fontSize: fontSize["12"],
		letterSpacing: letterSpacing.caption,
		pointerEvents: "none",
		position: "absolute",
		zIndex: 1,
	},
	ticksHorizontal: { insetBlock: 0 },
	ticksVertical: { insetInline: 0 },
	track: {
		"::before": {
			backgroundColor: {
				":is([data-disabled])": colors.controlSurfaceDisabled,
				default: colors.secondary,
			},
			borderColor: {
				":is([data-disabled])": "transparent",
				":is([data-invalid]):not([data-disabled])": `color-mix(in oklch, ${colors.destructive} 62%, ${colors.controlSurface})`,
				default: "transparent",
			},
			borderRadius: shape.controlRadiusLarge,
			borderStyle: "solid",
			borderWidth: borderWidth.thin,
			content: '""',
			insetBlock: 0,
			insetInline: `calc(-1 * ${space["1"]})`,
			position: "absolute",
		},
		borderRadius: shape.controlRadiusLarge,
		boxSizing: "border-box",
		display: "block",
		position: "relative",
	},
	trackDefaultHorizontal: {
		height: controlSize.md,
	},
	trackDefaultVertical: {
		width: controlSize.md,
	},
	trackHorizontal: {
		width: "100%",
	},
	trackLgHorizontal: {
		height: controlSize.lg,
	},
	trackLgVertical: {
		width: controlSize.lg,
	},
	trackSmHorizontal: {
		"::before": { borderRadius: shape.controlRadius },
		borderRadius: shape.controlRadius,
		height: controlSize.sm,
	},
	trackSmVertical: {
		"::before": { borderRadius: shape.controlRadius },
		borderRadius: shape.controlRadius,
		width: controlSize.sm,
	},
	trackVertical: {
		"::before": { insetBlock: `calc(-1 * ${space["1"]})`, insetInline: 0 },
		height: "100%",
		minHeight: "10rem",
	},
	// Supporting text at 13/20, so values line up with field labels.
	value: {
		color: colors.mutedContent,
		fontSize: fontSize["13"],
		fontSizeAdjust: fonts.sizeAdjust,
		fontVariantNumeric: "tabular-nums",
		fontWeight: fontWeight.regular,
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
	},
});
