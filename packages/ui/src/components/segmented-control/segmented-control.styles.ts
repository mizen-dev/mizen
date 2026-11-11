import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { controlSize } from "../../styles/dimensions.stylex";
import {
	borderWidth,
	focusMotion,
	opacity,
} from "../../styles/interaction.stylex";
import { duration, easing, indicatorTravel } from "../../styles/motion.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import {
	fontSize,
	fontWeight,
	letterSpacing,
	lineHeight,
} from "../../styles/typography.stylex";

// The track pads its items by 2px, so the control matches the height of a
// button of the same size and the item corners stay concentric.
const itemSize = (size: string) => `calc(${size} - ${space.px} * 2)`;
const raised = `0 0 0 1px ${colors.border}, 0 1px 2px oklch(0 0 0 / 0.1)`;

export const segmentedStyles = create({
	defaultSize: {
		minBlockSize: itemSize(controlSize.md),
		paddingInline: space["3"],
	},
	iconSize: { aspectRatio: "1", paddingInline: 0 },
	// One raised chip follows the pressed item and springs between items.
	indicator: {
		backgroundColor: colors.controlIndicator,
		borderRadius: shape.controlRadius,
		bottom: "anchor(bottom)",
		boxShadow: raised,
		display: {
			":is(:not(:has([data-pressed])) > *)": "none",
			[conditions.anchored]: "block",
			[conditions.forcedColors]: "none",
			default: "none",
		},
		left: "anchor(left)",
		pointerEvents: "none",
		position: "absolute",
		// eslint-disable-next-line @stylexjs/valid-styles -- StyleX 0.19 CSS metadata predates anchor positioning; compilation and browser tests cover it.
		positionAnchor: "--mizen-segmented",
		right: "anchor(right)",
		top: "anchor(top)",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.spring,
		},
		transitionProperty: indicatorTravel.property,
		transitionTimingFunction: {
			":is([data-slot='segmented-control']:has(> [data-pressed]:nth-child(1 of [data-slot='segmented-control-item'])) > *)":
				indicatorTravel.atStart,
			":is([data-slot='segmented-control']:has(> [data-pressed]:nth-last-child(1 of [data-slot='segmented-control-item'])) > *)":
				indicatorTravel.atEnd,
			default: easing.spring,
		},
	},
	item: {
		alignItems: "center",
		// eslint-disable-next-line @stylexjs/valid-styles -- StyleX 0.19 CSS metadata predates anchor positioning; compilation and browser tests cover it.
		anchorName: { "[data-pressed]": "--mizen-segmented", default: "none" },
		animationDuration: {
			":focus-visible": focusMotion.duration,
		},
		animationName: {
			":focus-visible": focusMotion.ring,
		},
		appearance: "none",
		// Without anchor positioning the pressed item carries the chip itself.
		backgroundColor: {
			":active:not([data-disabled]):not([data-pressed])":
				colors.controlSurfaceHover,
			"[data-pressed]": {
				[conditions.anchored]: "transparent",
				[conditions.forcedColors]: "Highlight",
				default: colors.controlIndicator,
			},
			default: "transparent",
		},
		borderColor: "transparent",
		borderRadius: shape.controlRadius,
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxShadow: {
			"[data-pressed]": {
				[conditions.anchored]: "none",
				[conditions.forcedColors]: "none",
				default: raised,
			},
			default: "none",
		},
		boxSizing: "border-box",
		color: {
			"[data-pressed]": {
				[conditions.forcedColors]: "HighlightText",
				default: colors.content,
			},
			default: colors.mutedContent,
			[conditions.canHover]: {
				":hover:not([data-disabled]):not([data-pressed])": colors.content,
			},
		},
		cursor: { "[data-disabled]": "not-allowed", default: "pointer" },
		display: "inline-flex",
		flexShrink: 0,
		fontFamily: "inherit",
		fontSize: fontSize["13"],
		fontWeight: fontWeight.medium,
		forcedColorAdjust: {
			default: "auto",
			[conditions.forcedColors]: { "[data-pressed]": "none" },
		},
		gap: space["1"],
		height: { ":is(*) > svg": "1rem" },
		justifyContent: "center",
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
		minInlineSize: 0,
		opacity: { "[data-disabled]": opacity.disabled, default: 1 },
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		// The track clips an outer ring, so the ring sits inside the item.
		outlineOffset: `-${borderWidth.focus}`,
		outlineStyle: { ":focus-visible": "solid", default: "none" },
		outlineWidth: borderWidth.focus,
		paddingBlock: 0,
		position: "relative",
		touchAction: "manipulation",
		transitionDuration: {
			default: duration.fast,
			[conditions.reducedMotion]: duration.instant,
		},
		transitionProperty: "background-color, color, outline-color",
		transitionTimingFunction: easing.expoOut,
		userSelect: "none",
		WebkitTapHighlightColor: "transparent",
		whiteSpace: "nowrap",
		width: { ":is(*) > svg": "1rem" },
	},
	lg: {
		minBlockSize: itemSize(controlSize.lg),
		paddingInline: space["3"],
	},
	root: {
		alignItems: "stretch",
		// eslint-disable-next-line @stylexjs/valid-styles -- StyleX 0.19 CSS metadata predates anchor positioning; compilation and browser tests cover it.
		anchorScope: "--mizen-segmented",
		backgroundColor: colors.controlSurface,
		borderRadius: shape.controlRadiusLarge,
		boxSizing: "border-box",
		display: "inline-flex",
		isolation: "isolate",
		maxInlineSize: "100%",
		overflowX: "auto",
		padding: space.px,
		position: "relative",
		scrollPaddingInline: space.px,
		width: "fit-content",
	},
	sm: {
		minBlockSize: itemSize(controlSize.sm),
		paddingInline: space["2"],
	},
	vertical: { flexDirection: "column" },
});
