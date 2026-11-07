import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { controlSize, glyphSize } from "../../styles/dimensions.stylex";
import { fonts } from "../../styles/fonts.stylex";
import {
	borderWidth,
	focus,
	focusMotion,
	focusOutline,
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
import { buttonColors } from "./button-colors.stylex";

const HL = "inset 0 1px 0 oklch(1 0 0 / 0.16)";
const HLB = "inset 0 1px 0 oklch(1 0 0 / 0.2)";

// Labels trim to their cap box. A wrapped label needs the trimmed leading
// back as padding; a single line keeps the size padding.
const wrapLeading = "calc((1lh - 1cap) / 2)";

const ghostInset = { hover: "2px", press: "-1px", rest: "4px" };
export const buttonStyles = create({
	base: {
		// The visible surface lives on ::before so press feedback can move its
		// edges by a fixed distance while the label, icons, and focus ring stay
		// still. -1px covers the transparent layout border.
		"::before": {
			borderColor: "transparent",
			borderEndEndRadius: "inherit",
			borderEndStartRadius: "inherit",
			borderStartEndRadius: "inherit",
			borderStartStartRadius: "inherit",
			borderStyle: "solid",
			borderWidth: borderWidth.thin,
			boxSizing: "border-box",
			content: '""',
			inset: "-1px",
			pointerEvents: "none",
			position: "absolute",
			transitionDuration: pressSurface.restDuration,
			transitionProperty: pressSurface.property,
			transitionTimingFunction: pressSurface.restEasing,
			zIndex: -1,
		},
		alignItems: "center",
		alignSelf: "center",
		animationDuration: {
			":focus-visible": focusMotion.duration,
		},
		animationName: {
			":focus-visible": focusMotion.ring,
		},
		backgroundColor: "transparent",
		borderColor: "transparent",
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxSizing: "border-box",
		cursor: { ":disabled": "not-allowed", default: "pointer" },
		display: "inline-flex",
		// A label too wide to sit beside its icon moves below it instead of
		// breaking one letter per line.
		flexWrap: "wrap",
		fontFamily: "inherit",
		fontSize: fontSize["16"],
		fontSizeAdjust: fonts.sizeAdjust,
		fontWeight: fontWeight.regular,
		gap: space["2"],
		isolation: "isolate",
		justifyContent: "center",
		lineHeight: lineHeight.none,
		maxWidth: "100%",
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
		overflowWrap: "break-word",
		position: "relative",
		textDecoration: "none",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "outline-color, outline-offset",
		transitionTimingFunction: easing.expoOut,
		userSelect: "none",
	},
	brand: {
		"::before": {
			backgroundColor: colors.accent,
			borderColor: colors.accent,
			boxShadow: `${shadows.filledRest}, ${HLB}`,
		},
		color: colors.accentContent,
	},
	default: {
		"::before": {
			backgroundColor: colors.primary,
			borderColor: colors.primary,
			boxShadow: `${shadows.filledRest}, ${HL}`,
		},
		color: colors.primaryContent,
		opacity: 1,
	},
	defaultSize: {
		borderEndEndRadius: shape.controlRadiusLarge,
		borderEndStartRadius: shape.controlRadiusLarge,
		borderStartEndRadius: shape.controlRadiusLarge,
		borderStartStartRadius: shape.controlRadiusLarge,
		fontSize: fontSize["16"],
		fontWeight: fontWeight.regular,
		minHeight: controlSize.md,
		paddingBlock: `max(calc((${controlSize.md} - ${fontSize["16"]}) / 2 - ${borderWidth.thin}px), ${wrapLeading})`,
		paddingInline: "calc(0.75rem - 1px)",
	},
	destructive: {
		"::before": {
			backgroundColor: colors.destructive,
			borderColor: colors.destructive,
			boxShadow: `${shadows.filledRest}, ${HL}`,
		},
		color: colors.destructiveContent,
		opacity: 1,
	},
	"destructive-outline": {
		"::before": {
			backgroundColor: "transparent",
			borderColor: colors.destructive,
			boxShadow: shadows.outlineRest,
		},
		color: colors.destructive,
		opacity: 1,
	},
	disabled: { cursor: "not-allowed", opacity: opacity.disabled },
	// Ghost surfaces start hidden and slightly inset, grow in on hover, and
	// fill the control on press.
	ghost: {
		"::before": {
			backgroundColor: colors.controlSurfaceHover,
			inset: ghostInset.rest,
			opacity: 0,
		},
		color: colors.content,
	},
	icon: {
		borderEndEndRadius: shape.controlRadiusLarge,
		borderEndStartRadius: shape.controlRadiusLarge,
		borderStartEndRadius: shape.controlRadiusLarge,
		borderStartStartRadius: shape.controlRadiusLarge,
		fontSize: glyphSize.md,
		height: controlSize.md,
		minHeight: 0,
		minWidth: 0,
		padding: 0,
		width: controlSize.md,
	},
	"icon-lg": {
		borderEndEndRadius: shape.controlRadiusLarge,
		borderEndStartRadius: shape.controlRadiusLarge,
		borderStartEndRadius: shape.controlRadiusLarge,
		borderStartStartRadius: shape.controlRadiusLarge,
		fontSize: glyphSize.md,
		height: controlSize.lg,
		minHeight: 0,
		minWidth: 0,
		padding: 0,
		width: controlSize.lg,
	},
	"icon-sm": {
		borderEndEndRadius: shape.controlRadius,
		borderEndStartRadius: shape.controlRadius,
		borderStartEndRadius: shape.controlRadius,
		borderStartStartRadius: shape.controlRadius,
		fontSize: glyphSize.sm,
		height: controlSize.sm,
		minHeight: 0,
		minWidth: 0,
		padding: 0,
		width: controlSize.sm,
	},
	"icon-xl": {
		borderEndEndRadius: shape.controlRadiusLarge,
		borderEndStartRadius: shape.controlRadiusLarge,
		borderStartEndRadius: shape.controlRadiusLarge,
		borderStartStartRadius: shape.controlRadiusLarge,
		fontSize: glyphSize.lg,
		height: controlSize.xl,
		minHeight: 0,
		minWidth: 0,
		padding: 0,
		width: controlSize.xl,
	},
	"icon-xs": {
		borderEndEndRadius: shape.controlRadius,
		borderEndStartRadius: shape.controlRadius,
		borderStartEndRadius: shape.controlRadius,
		borderStartStartRadius: shape.controlRadius,
		fontSize: glyphSize.xs,
		height: controlSize.xs,
		minHeight: 0,
		minWidth: 0,
		padding: 0,
		width: controlSize.xs,
	},
	interactionBrand: {
		"::before": {
			backgroundColor: {
				":active": `color-mix(in oklch, ${colors.accent} 90%, ${buttonColors.brandShade})`,
				[conditions.canHover]: {
					":hover:not(:active)": `color-mix(in oklch, ${colors.accent} 94%, ${buttonColors.brandShade})`,
				},
				default: colors.accent,
			},
			boxShadow: {
				":active": shadows.pressed,
				[conditions.canHover]: {
					":hover:not(:active)": `${shadows.filledHover}, ${HLB}`,
				},
				default: `${shadows.filledRest}, ${HLB}`,
			},
		},
	},
	interactionDestructive: {
		"::before": {
			backgroundColor: {
				":active": `color-mix(in oklch, ${colors.destructive} 80%, ${colors.destructiveContent})`,
				[conditions.canHover]: {
					":hover:not(:active)": `color-mix(in oklch, ${colors.destructive} 90%, ${colors.destructiveContent})`,
				},
				default: colors.destructive,
			},
			boxShadow: {
				":active": shadows.pressed,
				[conditions.canHover]: {
					":hover:not(:active)": `${shadows.filledHover}, ${HL}`,
				},
				default: `${shadows.filledRest}, ${HL}`,
			},
		},
	},
	interactionDestructiveOutline: {
		"::before": {
			backgroundColor: {
				":active": colors.destructiveSubtle,
				[conditions.canHover]: {
					":hover:not(:active)": colors.destructiveSubtle,
				},
				default: "transparent",
			},
			boxShadow: {
				":active": shadows.pressed,
				[conditions.canHover]: { ":hover:not(:active)": shadows.outlineHover },
				default: shadows.outlineRest,
			},
		},
	},
	interactionFilled: {
		"::before": {
			backgroundColor: {
				":active": `color-mix(in oklch, ${colors.primary} 80%, ${colors.primaryContent})`,
				[conditions.canHover]: {
					":hover:not(:active)": `color-mix(in oklch, ${colors.primary} 90%, ${colors.primaryContent})`,
				},
				default: colors.primary,
			},
			boxShadow: {
				":active": shadows.pressed,
				[conditions.canHover]: {
					":hover:not(:active)": `${shadows.filledHover}, ${HL}`,
				},
				default: `${shadows.filledRest}, ${HL}`,
			},
		},
	},
	interactionGhost: {
		"::before": {
			inset: {
				":active": ghostInset.press,
				[conditions.canHover]: { ":hover:not(:active)": ghostInset.hover },
				default: ghostInset.rest,
			},
			opacity: {
				":active": 1,
				[conditions.canHover]: { ":hover:not(:active)": 1 },
				default: 0,
			},
			// While held, the surface moves quickly; reduced motion applies at once.
			transitionDuration: {
				":active": duration.press,
				[conditions.reducedMotion]: duration.instant,
				default: pressSurface.restDuration,
			},
			transitionTimingFunction: {
				":active": easing.expoOut,
				default: pressSurface.restEasing,
			},
		},
	},
	interactionLink: {
		textDecoration: {
			":hover": { [conditions.canHover]: "underline" },
			default: "none",
		},
	},
	interactionOutline: {
		"::before": {
			backgroundColor: {
				":active": colors.controlSurface,
				[conditions.canHover]: {
					":hover:not(:active)": colors.controlSurfaceHover,
				},
				default: "transparent",
			},
			borderColor: {
				":active": colors.controlBorderStrong,
				[conditions.canHover]: {
					":hover:not(:active)": colors.controlBorderStrong,
				},
				default: colors.border,
			},
			boxShadow: {
				":active": shadows.pressed,
				[conditions.canHover]: { ":hover:not(:active)": shadows.outlineHover },
				default: shadows.outlineRest,
			},
		},
	},
	interactionSecondary: {
		"::before": {
			backgroundColor: {
				":active": colors.controlSurface,
				[conditions.canHover]: {
					":hover:not(:active)": colors.controlSurfaceHover,
				},
				default: colors.secondary,
			},
		},
	},
	lg: {
		borderEndEndRadius: shape.controlRadiusLarge,
		borderEndStartRadius: shape.controlRadiusLarge,
		borderStartEndRadius: shape.controlRadiusLarge,
		borderStartStartRadius: shape.controlRadiusLarge,
		fontSize: fontSize["16"],
		fontWeight: fontWeight.regular,
		minHeight: controlSize.lg,
		paddingBlock: `max(calc((${controlSize.lg} - ${fontSize["16"]}) / 2 - ${borderWidth.thin}px), ${wrapLeading})`,
		paddingInline: "calc(1rem - 1px)",
	},
	link: {
		backgroundColor: "transparent",
		borderColor: "transparent",
		color: colors.content,
		textDecoration: "none",
		textUnderlineOffset: "0.25rem",
	},
	loading: { position: "relative" },
	loadingContent: { color: "transparent" },
	loadingIndicator: {
		height: glyphSize.sm,
		inset: 0,
		margin: "auto",
		position: "absolute",
		width: glyphSize.sm,
	},
	loadingIndicatorBrand: { color: colors.accentContent },
	loadingIndicatorContent: { color: colors.content },
	loadingIndicatorDefault: { color: colors.primaryContent },
	loadingIndicatorDestructive: { color: colors.destructiveContent },
	loadingIndicatorDestructiveOutline: { color: colors.destructive },
	loadingIndicatorSecondary: { color: colors.secondaryContent },
	outline: {
		"::before": {
			backgroundColor: "transparent",
			borderColor: colors.border,
			boxShadow: shadows.outlineRest,
		},
		color: colors.content,
	},
	// Pressing moves every surface edge 2px inward, the same on any size.
	press: {
		"::before": {
			inset: { ":active": "1px", default: "-1px" },
			// While held, the surface moves quickly; reduced motion applies at once.
			transitionDuration: {
				":active": duration.press,
				[conditions.reducedMotion]: duration.instant,
				default: pressSurface.restDuration,
			},
			transitionTimingFunction: {
				":active": easing.expoOut,
				default: pressSurface.restEasing,
			},
		},
	},
	secondary: {
		"::before": { backgroundColor: colors.secondary },
		color: colors.secondaryContent,
	},
	sm: {
		borderEndEndRadius: shape.controlRadius,
		borderEndStartRadius: shape.controlRadius,
		borderStartEndRadius: shape.controlRadius,
		borderStartStartRadius: shape.controlRadius,
		fontSize: fontSize["14"],
		fontWeight: fontWeight.medium,
		gap: space["1"],
		lineHeight: lineHeight["20"],
		minHeight: controlSize.sm,
		paddingBlock: `max(calc((${controlSize.sm} - ${lineHeight["20"]}) / 2 - ${borderWidth.thin}px), ${wrapLeading})`,
		paddingInline: "calc(0.75rem - 1px)",
	},
	xl: {
		borderEndEndRadius: shape.controlRadiusLarge,
		borderEndStartRadius: shape.controlRadiusLarge,
		borderStartEndRadius: shape.controlRadiusLarge,
		borderStartStartRadius: shape.controlRadiusLarge,
		fontSize: fontSize["16"],
		fontWeight: fontWeight.regular,
		minHeight: controlSize.xl,
		paddingBlock: `max(calc((${controlSize.xl} - ${fontSize["16"]}) / 2 - ${borderWidth.thin}px), ${wrapLeading})`,
		paddingInline: "calc(1rem - 1px)",
	},
	xs: {
		borderEndEndRadius: shape.controlRadius,
		borderEndStartRadius: shape.controlRadius,
		borderStartEndRadius: shape.controlRadius,
		borderStartStartRadius: shape.controlRadius,
		fontSize: fontSize["12"],
		fontWeight: fontWeight.medium,
		gap: space["1"],
		letterSpacing: letterSpacing.caption,
		lineHeight: lineHeight["16"],
		minHeight: controlSize.xs,
		paddingBlock: `max(calc((${controlSize.xs} - ${lineHeight["16"]}) / 2 - ${borderWidth.thin}px), ${wrapLeading})`,
		paddingInline: "calc(0.5rem - 1px)",
	},
});
