import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { controlSize } from "../../styles/dimensions.stylex";
import {
	borderWidth,
	focusMotion,
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
	lineHeight,
} from "../../styles/typography.stylex";

export const tabsStyles = create({
	activeDefault: {
		"[data-active]": {
			backgroundColor: { [conditions.forcedColors]: "Highlight" },
			color: { [conditions.forcedColors]: "HighlightText" },
			forcedColorAdjust: forcedColorAdjust.selectedState,
		},
	},
	activeUnderline: {
		"[data-active]": {
			color: { [conditions.forcedColors]: "Highlight" },
			forcedColorAdjust: forcedColorAdjust.selectedState,
		},
	},
	automaticIndicator: {
		display: {
			":is([data-slot='tabs-list']:has([data-slot='tabs-indicator']:not([data-auto-indicator])) > *)":
				"none",
			default: "block",
		},
	},
	indicator: {
		height: "var(--active-tab-height)",
		left: "var(--active-tab-left)",
		pointerEvents: "none",
		position: "absolute",
		top: "var(--active-tab-top)",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.overlayEnter,
		},
		transitionProperty: "left, top, width, height",
		transitionTimingFunction: easing.expoOut,
		width: "var(--active-tab-width)",
	},
	indicatorDefault: {
		backgroundColor: {
			[conditions.forcedColors]: "Highlight",
			default: colors.brandBackground,
		},
		borderEndEndRadius: shape.controlRadius,
		borderEndStartRadius: shape.controlRadius,
		borderStartEndRadius: shape.controlRadius,
		borderStartStartRadius: shape.controlRadius,
		boxShadow: shadows.filledRest,
	},
	indicatorUnderline: {
		"::after": {
			backgroundColor: {
				[conditions.forcedColors]: "Highlight",
				default: colors.brandForeground,
			},
			borderRadius: "9999px",
			content: '""',
			height: {
				"[data-orientation='vertical']": "auto",
				default: 2,
			},
			insetBlockEnd: {
				"[data-orientation='vertical']": space["2"],
				default: 0,
			},
			insetBlockStart: {
				"[data-orientation='vertical']": space["2"],
				default: "auto",
			},
			insetInlineEnd: {
				"[data-orientation='vertical']": 0,
				default: space["2"],
			},
			insetInlineStart: {
				"[data-orientation='vertical']": "auto",
				default: space["2"],
			},
			position: "absolute",
			width: {
				"[data-orientation='vertical']": 2,
				default: "auto",
			},
		},
	},
	list: {
		alignItems: "stretch",
		boxSizing: "border-box",
		display: "inline-flex",
		flexDirection: {
			"[data-orientation='vertical']": "column",
			default: "row",
		},
		isolation: "isolate",
		maxWidth: "100%",
		overflowX: {
			"[data-orientation='vertical']": "visible",
			default: "auto",
		},
		position: "relative",
		scrollPaddingInline: space["2"],
		width: "fit-content",
	},
	listDefault: {
		backgroundColor: colors.controlSurface,
		borderRadius: shape.controlRadiusLarge,
		boxShadow: shadows.recessedRest,
		gap: space["1"],
		padding: space["1"],
	},
	listUnderline: {
		boxShadow: {
			"[data-orientation='vertical']": `inset -1px 0 0 0 ${colors.border}`,
			default: `inset 0 -1px 0 0 ${colors.border}`,
		},
		columnGap: space["1"],
		paddingBlock: {
			"[data-orientation='vertical']": 0,
			default: 0,
		},
		paddingInline: {
			"[data-orientation='vertical']": 0,
			default: space["1"],
		},
		rowGap: space["1"],
	},
	panel: {
		color: colors.content,
		fontSize: fontSize["16"],
		lineHeight: lineHeight["24"],
		minWidth: 0,
		paddingBlockStart: {
			"[data-orientation='vertical']": 0,
			default: space["4"],
		},
	},
	rootHorizontal: { display: "block", maxWidth: "100%", minWidth: 0 },
	rootVertical: {
		alignItems: "flex-start",
		columnGap: space["4"],
		display: "flex",
		flexWrap: "wrap",
		maxWidth: "100%",
		minWidth: 0,
		rowGap: space["4"],
	},
	sizeDefault: {
		fontSize: fontSize["14"],
		minHeight: controlSize.sm,
		paddingInline: space["3"],
	},
	sizeLg: {
		fontSize: fontSize["14"],
		minHeight: controlSize.md,
		paddingInline: space["3"],
	},
	sizeSm: {
		fontSize: fontSize["14"],
		minHeight: controlSize.xs,
		paddingInline: space["2"],
	},
	tab: {
		alignItems: "center",
		animationDuration: {
			":focus-visible": focusMotion.duration,
		},
		animationName: {
			":focus-visible": focusMotion.ring,
		},
		appearance: "none",
		backgroundColor: {
			":active:not([data-disabled]):not([data-active])":
				colors.controlSurfaceHover,
			default: "transparent",
		},
		borderColor: "transparent",
		borderRadius: shape.controlRadius,
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxSizing: "border-box",
		color: {
			"[data-active]": colors.brandForeground,
			"[data-slot='tabs-tab']:hover:not([data-disabled], [data-active])": {
				[conditions.canHover]: colors.content,
			},
			default: colors.mutedContent,
		},
		columnGap: space["1"],
		cursor: { "[data-disabled]": "not-allowed", default: "pointer" },
		display: "inline-flex",
		flexShrink: 0,
		fontFamily: "inherit",
		fontWeight: fontWeight.medium,
		height: { ":is(*) > svg": "1rem" },
		justifyContent: "center",
		lineHeight: lineHeight.none,
		maxWidth: "100%",
		minWidth: 0,
		opacity: {
			"[data-disabled]": opacity.disabled,
			default: 1,
		},
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: `-${borderWidth.focus}px`,
		outlineStyle: {
			":focus-visible": "solid",
			default: "none",
		},
		outlineWidth: {
			":focus-visible": borderWidth.focus,
			default: borderWidth.focus,
		},
		paddingBlock: 0,
		position: "relative",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "color, opacity, outline-color",
		transitionTimingFunction: easing.expoOut,
		userSelect: "none",
		whiteSpace: "nowrap",
		width: { ":is(*) > svg": "1rem" },
		zIndex: 1,
	},
});
