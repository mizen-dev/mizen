import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { controlSize } from "../../styles/dimensions.stylex";
import {
	borderWidth,
	focus,
	focusMotion,
	focusOutline,
	forcedColorAdjust,
	opacity,
} from "../../styles/interaction.stylex";
import { duration, easing, pressSurface } from "../../styles/motion.stylex";
import { shadows } from "../../styles/shadows.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import {
	fontSize,
	fontWeight,
	letterSpacing,
	lineHeight,
} from "../../styles/typography.stylex";
import { toggleColors } from "./toggle-colors.stylex";

export const toggleStyles = create({
	base: {
		// The surface lives on ::before (see Button): press moves its edges by a
		// fixed 1px while the label and focus ring stay still. Border widths are
		// inherited so joined groups keep their zero-width inner edges.
		"::before": {
			backgroundColor: {
				":active:not([data-disabled])": colors.controlSurfaceHover,
				[conditions.canHover]: {
					":hover:not([data-disabled]):not([data-pressed]):not(:active)":
						colors.controlSurface,
				},
				"[data-pressed]": toggleColors.pressedBackground,
				"[data-pressed]:active:not([data-disabled])":
					toggleColors.pressedActiveBackground,
				"[data-pressed]:not([data-disabled]):not(:active):hover": {
					[conditions.canHover]: toggleColors.pressedHoverBackground,
				},
				default: "var(--mizen-toggle-rest, transparent)",
			},
			borderColor: {
				"[data-pressed]": toggleColors.pressedBorder,
				default: "transparent",
			},
			borderEndEndRadius: "inherit",
			borderEndStartRadius: "inherit",
			borderStartEndRadius: "inherit",
			borderStartStartRadius: "inherit",
			borderStyle: "solid",
			borderWidth: "inherit",
			boxShadow: "none",
			boxSizing: "border-box",
			content: '""',
			inset: { ":active:not([data-disabled])": "0px", default: "-1px" },
			pointerEvents: "none",
			position: "absolute",
			transitionDuration: {
				":active:not([data-disabled])": duration.press,
				[conditions.reducedMotion]: duration.instant,
				default: pressSurface.restDuration,
			},
			transitionProperty: pressSurface.property,
			transitionTimingFunction: {
				":active:not([data-disabled])": easing.expoOut,
				default: pressSurface.restEasing,
			},
			zIndex: -1,
		},
		alignItems: "center",
		animationDuration: {
			":focus-visible": focusMotion.duration,
		},
		animationName: {
			":focus-visible": focusMotion.ring,
		},
		appearance: "none",
		backgroundColor: "transparent",
		borderColor: "transparent",
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxShadow: "none",
		boxSizing: "border-box",
		color: {
			"[data-pressed]": toggleColors.pressedForeground,
			default: colors.content,
		},
		cursor: { "[data-disabled]": "not-allowed", default: "pointer" },
		display: "inline-flex",
		flexShrink: 0,
		fontFamily: "inherit",
		fontSize: fontSize["14"],
		fontWeight: fontWeight.medium,
		forcedColorAdjust: {
			"[data-pressed]": forcedColorAdjust.selectedState,
		},
		gap: space["2"],
		isolation: "isolate",
		justifyContent: "center",
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight.none,
		maxInlineSize: "100%",
		minInlineSize: 0,
		opacity: {
			"[data-disabled]": opacity.disabled,
			default: 1,
		},
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
		overflowWrap: "anywhere",
		position: "relative",
		touchAction: "manipulation",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "color, opacity, outline-color, outline-offset",
		transitionTimingFunction: easing.expoOut,
		userSelect: "none",
		WebkitTapHighlightColor: "transparent",
		zIndex: { ":focus-visible": 1, default: 0 },
	},
	content: {
		minInlineSize: {
			":has(> svg:only-child)": controlSize.md,
			":is([data-size='lg'], [data-size='icon-lg']):has(> svg:only-child)":
				controlSize.lg,
			":is([data-size='sm'], [data-size='icon-sm']):has(> svg:only-child)":
				controlSize.sm,
			default: 0,
		},
		paddingBlock: space["1"],
		paddingInline: {
			":has(> svg:only-child)": 0,
			"[data-size^='icon']": 0,
			"[data-size='lg']": "calc(0.875rem - 1px)",
			"[data-size='lg']:has(> svg:only-child)": 0,
			"[data-size='sm']": "calc(0.625rem - 1px)",
			"[data-size='sm']:has(> svg:only-child)": 0,
			default: "calc(0.75rem - 1px)",
		},
	},
	embeddedGroup: {
		flexShrink: 0,
		overflowX: "visible",
		overflowY: "visible",
		padding: 0,
	},
	group: {
		alignItems: "stretch",
		borderRadius: shape.controlRadiusLarge,
		boxSizing: "border-box",
		display: "inline-flex",
		gap: space["1"],
		maxWidth: "100%",
		minInlineSize: 0,
		padding: `calc(${borderWidth.focus}px + ${focus.offset})`,
		width: "fit-content",
	},
	groupOutline: { gap: 0 },
	horizontal: {
		flexDirection: "row",
		overflowX: "auto",
		scrollPaddingInline: space["1"],
	},
	horizontalSeparator: {
		"::before": {
			blockSize: borderWidth.thin,
			inlineSize: "auto",
			insetBlockEnd: "auto",
			insetBlockStart: 0,
			insetInlineEnd: space["2"],
			insetInlineStart: space["2"],
		},
		height: {
			":is([data-slot='toggle-group'][data-variant='outline'] > *)": 0,
			default: borderWidth.thin,
		},
		width: "auto",
	},
	joinedHorizontal: {
		"::before": { insetInline: "-1px" },
		borderEndEndRadius: { ":last-child": "inherit", default: 0 },
		borderEndStartRadius: { ":first-child": "inherit", default: 0 },
		borderInlineEndWidth: { ":last-child": borderWidth.thin, default: 0 },
		borderInlineStartWidth: { ":first-child": borderWidth.thin, default: 0 },
		borderStartEndRadius: { ":last-child": "inherit", default: 0 },
		borderStartStartRadius: { ":first-child": "inherit", default: 0 },
	},
	joinedVertical: {
		"::before": { insetBlock: "-1px" },
		borderBlockEndWidth: { ":last-child": borderWidth.thin, default: 0 },
		borderBlockStartWidth: { ":first-child": borderWidth.thin, default: 0 },
		borderEndEndRadius: { ":last-child": "inherit", default: 0 },
		borderEndStartRadius: { ":last-child": "inherit", default: 0 },
		borderStartEndRadius: { ":first-child": "inherit", default: 0 },
		borderStartStartRadius: { ":first-child": "inherit", default: 0 },
	},
	outline: {
		// An outline toggle rests on the surface color, like an outline button.
		"--mizen-toggle-rest": colors.outlineSurface,
		"::before": {
			borderColor: {
				"[data-pressed]": toggleColors.pressedBorder,
				default: colors.border,
			},
			// Raised when off; a pressed toggle sits flat in its fill.
			boxShadow: {
				[conditions.canHover]: {
					":hover:not([data-disabled]):not([data-pressed]):not(:active)":
						shadows.outlineHover,
				},
				"[data-pressed]": "none",
				default: shadows.outlineRest,
			},
		},
	},
	separator: {
		"::before": {
			backgroundColor: colors.border,
			content: '""',
			inlineSize: borderWidth.thin,
			insetBlock: space["2"],
			insetInlineStart: 0,
			position: "absolute",
		},
		alignSelf: "stretch",
		backgroundColor: "transparent",
		borderStyle: "none",
		flexShrink: 0,
		margin: 0,
		pointerEvents: "none",
		position: "relative",
		width: {
			":is([data-slot='toggle-group'][data-variant='outline'] > *)": 0,
			default: borderWidth.thin,
		},
		zIndex: 1,
	},
	smallGroup: { borderRadius: shape.controlRadius },
	vertical: { flexDirection: "column" },
});
