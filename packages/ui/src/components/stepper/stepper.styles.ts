import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import {
	borderWidth,
	focus,
	focusMotion,
	opacity,
} from "../../styles/interaction.stylex";
import { duration, easing } from "../../styles/motion.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import {
	fontSize,
	fontWeight,
	letterSpacing,
	lineHeight,
} from "../../styles/typography.stylex";
export const stepperStyles = create({
	autoNumber: {
		display: {
			":is([data-slot='stepper-item'][data-status='complete'] *)": "none",
			":is([data-slot='stepper-item'][data-status='current'] *)": "none",
			default: "inline-flex",
		},
	},
	check: {
		display: {
			":is([data-slot='stepper-item'][data-status='complete'] *)": "block",
			default: "none",
		},
	},
	complete: {
		color: colors.content,
	},
	content: {
		color: colors.content,
		display: {
			"@container (max-width: 27.999rem)": {
				":is([data-slot='stepper'][data-orientation='horizontal'] *)": "none",
			},
			default: "block",
		},
		gridColumn: 2,
		gridRow: 3,
		minInlineSize: 0,
		paddingBlockStart: space["3"],
	},
	current: {
		color: colors.content,
	},
	currentDot: {
		backgroundColor: "currentColor",
		borderRadius: "50%",
		display: {
			":is([data-slot='stepper-item'][data-status='current'] *)": "block",
			default: "none",
		},
		height: 4,
		width: 4,
	},
	description: {
		clipPath: {
			"@container (max-width: 27.999rem)": {
				":is([data-slot='stepper'][data-orientation='horizontal'] *)":
					"inset(50%)",
			},
		},
		color: colors.mutedContent,
		fontSize: fontSize["12"],
		fontWeight: fontWeight.regular,
		gridColumn: {
			"@container (min-width: 28rem)": {
				":is([data-slot='stepper'][data-orientation='horizontal'][data-layout='on-track'] *)": 1,
			},
			default: 2,
		},
		gridRow: {
			"@container (min-width: 28rem)": {
				":is([data-slot='stepper'][data-orientation='horizontal'][data-layout='on-track'] *)": 3,
			},
			default: 2,
		},
		height: {
			"@container (max-width: 27.999rem)": {
				":is([data-slot='stepper'][data-orientation='horizontal'] *)": 1,
			},
		},
		letterSpacing: letterSpacing.caption,
		lineHeight: lineHeight["16"],
		marginBlock: 0,
		overflowWrap: "anywhere",
		position: {
			"@container (max-width: 27.999rem)": {
				":is([data-slot='stepper'][data-orientation='horizontal'] *)":
					"absolute",
			},
		},
		textAlign: {
			"@container (min-width: 28rem)": {
				":is([data-slot='stepper'][data-orientation='horizontal'][data-layout='on-track'] *)":
					"center",
			},
		},
		textWrap: "pretty",
		width: {
			"@container (max-width: 27.999rem)": {
				":is([data-slot='stepper'][data-orientation='horizontal'] *)": 1,
			},
		},
	},
	frame: {
		containerType: "inline-size",
		minInlineSize: 0,
		width: "100%",
	},
	// Only horizontal steppers query their width; a vertical list fits its steps.
	frameVertical: {
		containerType: "normal",
		maxWidth: "100%",
		width: "fit-content",
	},
	indicator: {
		alignItems: "center",
		alignSelf: "start",
		backgroundColor: {
			[conditions.forcedColors]: {
				":is([data-slot='stepper-item'][data-status='complete'] *)":
					"Highlight",
			},
			":is([data-slot='stepper-item'][data-status='complete'] *)":
				colors.brandForeground,
			default: "transparent",
		},
		// Upcoming steps keep a quiet ring, so every step shows the same mark.
		borderColor: {
			":is([data-slot='stepper-item'][data-status='complete'] *)":
				"transparent",
			":is([data-slot='stepper-item'][data-status='current'] *)":
				colors.brandForeground,
			default: colors.border,
		},
		borderRadius: "50%",
		borderStyle: "solid",
		borderWidth: 2,
		boxSizing: "border-box",
		color: {
			[conditions.forcedColors]: {
				":is([data-slot='stepper-item'][data-status='complete'] *)":
					"HighlightText",
			},
			":is([data-slot='stepper-item'][data-status='complete'] *)":
				colors.surface,
			":is([data-slot='stepper-item'][data-status='upcoming'] *)":
				colors.mutedContent,
			default: "inherit",
		},
		display: {
			"@container (max-width: 27.999rem)": {
				":is([data-slot='stepper'][data-orientation='horizontal'] *)": "none",
				":is([data-slot='stepper'][data-orientation='horizontal'] > [data-status='current'] *)":
					"inline-flex",
			},
			default: "inline-flex",
		},
		fontSize: fontSize["12"],
		fontVariantNumeric: "tabular-nums",
		fontWeight: fontWeight.medium,
		forcedColorAdjust: {
			":is([data-slot='stepper-item'][data-status='complete'] *)": "none",
		},
		gridColumn: 1,
		gridRow: 1,
		height: "1rem",
		insetBlockEnd: {
			"@container (max-width: 27.999rem)": {
				":is([data-slot='stepper'][data-orientation='horizontal'] > [data-status='current'] *)": 2,
			},
		},
		insetInlineStart: {
			"@container (max-width: 27.999rem)": {
				":is([data-slot='stepper'][data-orientation='horizontal'] > [data-status='current'] *)": 0,
			},
		},
		justifyContent: "center",
		letterSpacing: letterSpacing.caption,
		lineHeight: lineHeight.none,
		marginBlockStart: {
			"@container (max-width: 27.999rem)": {
				":is([data-slot='stepper'][data-orientation='horizontal'] > [data-status='current'] *)": 0,
			},
			"@container (min-width: 28rem)": {
				":is([data-slot='stepper'][data-orientation='horizontal'][data-layout='on-track'] *)": 0,
			},
			default: 2,
		},
		marginInline: {
			"@container (min-width: 28rem)": {
				":is([data-slot='stepper'][data-orientation='horizontal'][data-layout='on-track'] *)":
					"auto",
			},
		},
		position: {
			"@container (max-width: 27.999rem)": {
				":is([data-slot='stepper'][data-orientation='horizontal'] > [data-status='current'] *)":
					"absolute",
			},
		},
		visibility: {
			"[data-mode='none']": "hidden",
			default: "visible",
		},
		width: "1rem",
	},
	item: {
		"::before": {
			backgroundColor: {
				default: colors.border,
				[conditions.forcedColors]: {
					"[data-status='complete']": "Highlight",
					"[data-status='current']": "Highlight",
					default: "GrayText",
				},
			},
			backgroundImage: `linear-gradient(${colors.brandForeground}, ${colors.brandForeground})`,
			backgroundPosition: { ":dir(rtl)": "right top", default: "left top" },
			backgroundRepeat: "no-repeat",
			backgroundSize: {
				":is([data-slot='stepper'][data-orientation='horizontal'] > [data-status='current'])":
					"100% 100%",
				":is([data-slot='stepper'][data-orientation='horizontal'] > *)":
					"0% 100%",
				"[data-status='complete']": "100% 100%",
				"@container (min-width: 28rem)": {
					":is([data-slot='stepper'][data-orientation='horizontal'][data-layout='on-track'] > [data-status='current'])":
						"0% 100%",
				},
				default: "100% 0%",
			},
			borderRadius: "9999px",
			content: '""',
			display: {
				":last-child": "none",
				"@container (max-width: 27.999rem)": {
					":is([data-slot='stepper'][data-orientation='horizontal'] > *)":
						"block",
				},
				"@container (min-width: 28rem)": {
					":is([data-layout='on-track'] > *):last-child": "none",
					":is([data-slot='stepper'][data-orientation='horizontal'] > *)":
						"block",
				},
				default: "block",
			},
			forcedColorAdjust: "none",
			gridColumn: {
				"@container (max-width: 27.999rem)": {
					":is([data-slot='stepper'][data-orientation='horizontal'] > *)": 1,
				},
			},
			gridRow: {
				"@container (max-width: 27.999rem)": {
					":is([data-slot='stepper'][data-orientation='horizontal'] > *)": 1,
				},
			},
			height: {
				"@container (max-width: 27.999rem)": {
					":is([data-slot='stepper'][data-orientation='horizontal'] > *)": 4,
				},
				"@container (min-width: 28rem)": {
					":is([data-slot='stepper'][data-orientation='horizontal'] > *)": 4,
					":is([data-slot='stepper'][data-orientation='horizontal'][data-layout='on-track'] > *)": 2,
				},
				default: "calc(100% - 1.75rem)",
			},
			insetBlockStart: {
				"@container (max-width: 27.999rem)": {
					":is([data-slot='stepper'][data-orientation='horizontal'] > *)":
						"auto",
				},
				"@container (min-width: 28rem)": {
					":is([data-slot='stepper'][data-orientation='horizontal'] > *)": 0,
					":is([data-slot='stepper'][data-orientation='horizontal'][data-layout='on-track'] > *)": 7,
				},
				default: "1.5rem",
			},
			insetInlineStart: {
				"@container (max-width: 27.999rem)": {
					":is([data-slot='stepper'][data-orientation='horizontal'] > *)":
						"auto",
				},
				"@container (min-width: 28rem)": {
					":is([data-slot='stepper'][data-orientation='horizontal'] > *)": 0,
					":is([data-slot='stepper'][data-orientation='horizontal'][data-layout='on-track'] > *)":
						"calc(50% + 12px)",
				},
				default: 7,
			},
			pointerEvents: "none",
			position: {
				"@container (max-width: 27.999rem)": {
					":is([data-slot='stepper'][data-orientation='horizontal'] > *)":
						"relative",
				},
				default: "absolute",
			},
			transitionDuration: {
				"[data-motion='forward']": {
					[conditions.reducedMotion]: duration.instant,
					default: duration.disclosure,
				},
				default: duration.instant,
			},
			transitionProperty: "background-size",
			transitionTimingFunction: easing.easeInOut,
			width: {
				"@container (max-width: 27.999rem)": {
					":is([data-slot='stepper'][data-orientation='horizontal'] > *)":
						"100%",
				},
				"@container (min-width: 28rem)": {
					":is([data-slot='stepper'][data-orientation='horizontal'] > *)":
						"100%",
					":is([data-slot='stepper'][data-orientation='horizontal'][data-layout='on-track'] > *)":
						"calc(100% - 18px)",
				},
				default: 2,
			},
			zIndex: 1,
		},
		alignContent: "start",
		columnGap: space["2"],
		display: "grid",
		flexBasis: 0,
		flexGrow: 1,
		gridTemplateColumns: {
			"@container (max-width: 27.999rem)": {
				":is([data-slot='stepper'][data-orientation='horizontal'] > *)":
					"minmax(0, 1fr)",
			},
			"@container (min-width: 28rem)": {
				":is([data-slot='stepper'][data-orientation='horizontal'][data-layout='on-track'] > *)":
					"minmax(0, 1fr)",
			},
			default: "1rem minmax(0, 1fr)",
		},
		gridTemplateRows: "auto auto",
		minWidth: 0,
		opacity: { "[data-disabled]": opacity.disabled, default: 1 },
		paddingBlockEnd: {
			":is([data-orientation='vertical'][data-density='compact'] > *):not(:last-child)":
				space["4"],
			":is([data-orientation='vertical'][data-density='spacious'] > *):not(:last-child)":
				space["8"],
			":last-child": 0,
			"@container (max-width: 27.999rem)": {
				":is([data-slot='stepper'][data-orientation='horizontal'] > *)": 0,
			},
			"@container (min-width: 28rem)": {
				":is([data-slot='stepper'][data-orientation='horizontal'] > *)": 0,
			},
			default: space["6"],
		},
		paddingBlockStart: {
			"@container (max-width: 27.999rem)": {
				":is([data-slot='stepper'][data-orientation='horizontal'] > *)": 0,
			},
			"@container (min-width: 28rem)": {
				":is([data-slot='stepper'][data-orientation='horizontal'] > *)":
					space["4"],
				":is([data-slot='stepper'][data-orientation='horizontal'][data-layout='on-track'] > *)": 0,
			},
			default: 0,
		},
		position: {
			"@container (max-width: 27.999rem)": {
				":is([data-slot='stepper'][data-orientation='horizontal'] > *)":
					"static",
			},
			default: "relative",
		},
		rowGap: space["1"],
	},
	markerContent: {
		alignItems: "center",
		display: "inline-flex",
		justifyContent: "center",
		lineHeight: lineHeight.none,
		minInlineSize: 0,
	},
	optional: {
		color: colors.mutedContent,
		flexShrink: 0,
		fontSize: fontSize["12"],
		fontWeight: fontWeight.regular,
		letterSpacing: letterSpacing.caption,
		lineHeight: lineHeight["16"],
		marginInlineStart: space["2"],
	},
	root: {
		boxSizing: "border-box",
		display: "flex",
		flexDirection: {
			"[data-slot='stepper'][data-orientation='horizontal']": "row",
			default: "column",
		},
		gap: {
			"[data-slot='stepper'][data-orientation='horizontal']": space["1"],
			default: 0,
		},
		isolation: "isolate",
		listStyle: "none",
		margin: 0,
		padding: 0,
		paddingBlockEnd: {
			"@container (max-width: 27.999rem)": {
				"[data-slot='stepper'][data-orientation='horizontal']": space["6"],
			},
			default: 0,
		},
		position: "relative",
		width: "100%",
	},
	title: {
		alignItems: "center",
		clipPath: {
			"@container (max-width: 27.999rem)": {
				":is([data-slot='stepper'][data-orientation='horizontal'] *)":
					"inset(50%)",
				":is([data-slot='stepper'][data-orientation='horizontal'] > [data-status='current'] *)":
					"none",
			},
		},
		display: "inline-flex",
		fontSize: fontSize["14"],
		fontWeight: {
			":is([data-slot='stepper-item'][data-status='current'] *)":
				fontWeight.semibold,
			default: fontWeight.regular,
		},
		gridColumn: {
			"@container (min-width: 28rem)": {
				":is([data-slot='stepper'][data-orientation='horizontal'][data-layout='on-track'] *)": 1,
			},
			default: 2,
		},
		gridRow: {
			"@container (min-width: 28rem)": {
				":is([data-slot='stepper'][data-orientation='horizontal'][data-layout='on-track'] *)": 2,
			},
			default: 1,
		},
		height: {
			"@container (max-width: 27.999rem)": {
				":is([data-slot='stepper'][data-orientation='horizontal'] *)": 1,
				":is([data-slot='stepper'][data-orientation='horizontal'] > [data-status='current'] *)":
					"auto",
			},
		},
		insetBlockEnd: {
			"@container (max-width: 27.999rem)": {
				":is([data-slot='stepper'][data-orientation='horizontal'] > [data-status='current'] *)": 0,
			},
		},
		insetInlineStart: {
			"@container (max-width: 27.999rem)": {
				":is([data-slot='stepper'][data-orientation='horizontal'] > [data-status='current'] *)": 24,
			},
		},
		justifyContent: {
			"@container (min-width: 28rem)": {
				":is([data-slot='stepper'][data-orientation='horizontal'][data-layout='on-track'] *)":
					"center",
			},
		},
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
		minBlockSize: "1.25rem",
		minInlineSize: 0,
		overflow: "hidden",
		position: {
			"@container (max-width: 27.999rem)": {
				":is([data-slot='stepper'][data-orientation='horizontal'] *)":
					"absolute",
			},
		},
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
		width: {
			"@container (max-width: 27.999rem)": {
				":is([data-slot='stepper'][data-orientation='horizontal'] *)": 1,
				":is([data-slot='stepper'][data-orientation='horizontal'] > [data-status='current'] *)":
					"calc(100% - 24px)",
			},
		},
	},
	titleLabel: {
		display: "block",
		minInlineSize: 0,
		overflow: "hidden",
		paddingBlock: "0.3em",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	trigger: {
		alignContent: "start",
		animationDuration: { ":focus-visible": focusMotion.duration },
		animationName: { ":focus-visible": focusMotion.ring },
		appearance: "none",
		backgroundColor: {
			[conditions.canHover]: {
				":hover:not(:disabled)": colors.secondary,
			},
			default: "transparent",
		},
		borderRadius: shape.controlRadius,
		borderStyle: "none",
		color: "inherit",
		columnGap: space["2"],
		cursor: {
			":disabled": "not-allowed",
			default: "pointer",
		},
		display: "grid",
		fontFamily: "inherit",
		gridColumnEnd: "-1",
		gridColumnStart: "1",
		gridRowEnd: "3",
		gridRowStart: "1",
		gridTemplateColumns: {
			"@container (min-width: 28rem)": {
				":is([data-slot='stepper'][data-orientation='horizontal'][data-layout='on-track'] *)":
					"minmax(0, 1fr)",
			},
			default: "1rem minmax(0, 1fr)",
		},
		margin: `calc(-1 * ${space["1"]})`,
		opacity: {
			":disabled": opacity.disabled,
			":is([data-disabled] *):disabled": 1,
			default: 1,
		},
		outlineColor: colors.focusRing,
		outlineOffset: focus.offset,
		outlineStyle: {
			":focus-visible": "solid",
			default: "none",
		},
		outlineWidth: borderWidth.focus,
		padding: space["1"],
		rowGap: space["1"],
		textAlign: "start",
	},
	upcoming: {
		color: colors.mutedContent,
	},
	visuallyHidden: {
		borderStyle: "none",
		borderWidth: 0,
		clipPath: "inset(50%)",
		height: 1,
		margin: -1,
		overflow: "hidden",
		padding: 0,
		position: "absolute",
		whiteSpace: "nowrap",
		width: 1,
	},
});
