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
import { duration, easing, indicatorTravel } from "../../styles/motion.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import {
	fontSize,
	fontWeight,
	letterSpacing,
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
	// The end edges are measured from the list box, not from Base UI's scroll
	// size, so the indicator stays on its tab when the list scrolls.
	indicator: {
		bottom: "calc(100% - var(--active-tab-top) - var(--active-tab-height))",
		left: "var(--active-tab-left)",
		pointerEvents: "none",
		position: "absolute",
		right: "calc(100% - var(--active-tab-left) - var(--active-tab-width))",
		top: "var(--active-tab-top)",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.spring,
		},
		transitionProperty: indicatorTravel.property,
		transitionTimingFunction: {
			":is([data-slot='tabs-list']:has(> [data-active]:nth-child(1 of [data-slot='tabs-tab'])) > *)":
				indicatorTravel.atStart,
			":is([data-slot='tabs-list']:has(> [data-active]:nth-last-child(1 of [data-slot='tabs-tab'])) > *)":
				indicatorTravel.atEnd,
			default: easing.spring,
		},
	},
	indicatorDefault: {
		backgroundColor: {
			[conditions.forcedColors]: "Highlight",
			default: colors.controlIndicator,
		},
		borderEndEndRadius: shape.controlRadius,
		borderEndStartRadius: shape.controlRadius,
		borderStartEndRadius: shape.controlRadius,
		borderStartStartRadius: shape.controlRadius,
		boxShadow: `0 0 0 1px ${colors.border}, 0 1px 2px oklch(0 0 0 / 0.1)`,
	},
	indicatorUnderline: {
		"::after": {
			backgroundColor: {
				[conditions.forcedColors]: "Highlight",
				default: colors.accent,
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
	// The track pads its tabs by 2px, so the list matches the height of a
	// button of the same size and the tab corners stay concentric.
	listDefault: {
		"--mizen-tabs-inset": space.px,
		backgroundColor: colors.controlSurface,
		borderRadius: shape.controlRadiusLarge,
		padding: space.px,
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
		fontSize: fontSize["14"],
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
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
		minHeight: `calc(${controlSize.md} - var(--mizen-tabs-inset, 0px) * 2)`,
		paddingInline: space["3"],
	},
	sizeLg: {
		minHeight: `calc(${controlSize.lg} - var(--mizen-tabs-inset, 0px) * 2)`,
		paddingInline: space["3"],
	},
	sizeSm: {
		minHeight: `calc(${controlSize.sm} - var(--mizen-tabs-inset, 0px) * 2)`,
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
			"[data-active]": colors.content,
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
		fontSize: fontSize["13"],
		fontWeight: fontWeight.medium,
		height: { ":is(*) > svg": "1rem" },
		justifyContent: "center",
		letterSpacing: letterSpacing.ui,
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
		outlineOffset: `-${borderWidth.focus}`,
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
		touchAction: "manipulation",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "color, opacity, outline-color",
		transitionTimingFunction: easing.expoOut,
		userSelect: "none",
		WebkitTapHighlightColor: "transparent",
		whiteSpace: "nowrap",
		width: { ":is(*) > svg": "1rem" },
		zIndex: 1,
	},
});
