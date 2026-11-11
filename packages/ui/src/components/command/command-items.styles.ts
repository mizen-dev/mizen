import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { floatingItemColors } from "../../styles/floating-item-colors.stylex";
import {
	borderWidth,
	forcedColorAdjust,
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

export const commandItemsStyles = create({
	empty: {
		boxSizing: "border-box",
		color: colors.mutedContent,
		fontSize: fontSize["14"],
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
		paddingBlock: {
			":empty": space["0"],
			default: space["5"],
		},
		paddingInline: space["3"],
		textAlign: "center",
		width: "100%",
	},
	footer: {
		alignItems: "center",
		backgroundColor: colors.workarea,
		borderTopColor: colors.border,
		borderTopStyle: "solid",
		borderTopWidth: borderWidth.thin,
		boxSizing: "border-box",
		color: colors.mutedContent,
		display: "flex",
		flexWrap: "wrap",
		fontSize: fontSize["12"],
		gap: space["2"],
		justifyContent: "space-between",
		letterSpacing: letterSpacing.caption,
		paddingBlock: space["3"],
		// Row labels sit 16px in: the list's 8px inset plus the row's 8px.
		paddingInline: space["4"],
		userSelect: "none",
		width: "100%",
	},
	group: {
		borderTopColor: colors.border,
		borderTopStyle: { ":not(:first-child)": "solid", default: "none" },
		borderTopWidth: borderWidth.thin,
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "column",
		gap: space["0"],
		marginBlockStart: { ":not(:first-child)": space["2"], default: space["0"] },
		paddingBlockStart: {
			":not(:first-child)": space["2"],
			default: space["0"],
		},
		width: "100%",
	},
	groupLabel: {
		color: colors.mutedContent,
		fontSize: fontSize["12"],
		fontWeight: fontWeight.medium,
		letterSpacing: letterSpacing.caption,
		paddingBlock: space["1"],
		paddingInline: space["2"],
		userSelect: "none",
	},
	item: {
		alignItems: "center",
		backgroundColor: {
			"[data-highlighted]": floatingItemColors.highlightBackground,
			default: "transparent",
		},
		// Concentric with the 24px popup: its radius minus the 8px row inset.
		borderRadius: `calc(${shape.floatingRadius} - ${space["2"]})`,
		boxSizing: "border-box",
		color: {
			"[data-highlighted]": floatingItemColors.highlightForeground,
			default: colors.content,
		},
		cursor: {
			"[data-disabled]": "not-allowed",
			default: "pointer",
		},
		display: "flex",
		fontSize: fontSize["14"],
		fontWeight: fontWeight.regular,
		forcedColorAdjust: {
			"[data-highlighted]": forcedColorAdjust.selectedState,
		},
		gap: space["2"],
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
		minHeight: "2rem",
		opacity: {
			"[data-disabled]": opacity.disabled,
			default: 1,
		},
		// Focus stays in the input, so the row under the pointer keeps the tint
		// and a row highlighted from the keyboard draws the ring.
		outlineColor: {
			"[data-highlighted]:not(:hover)": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: `-${borderWidth.focus}px`,
		outlineStyle: {
			"[data-highlighted]:not(:hover)": "solid",
			default: "none",
		},
		outlineWidth: borderWidth.focus,
		paddingBlock: space["1"],
		paddingInline: space["2"],
		pointerEvents: {
			"[data-disabled]": "none",
			default: "auto",
		},
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "background-color, color, opacity",
		transitionTimingFunction: easing.expoOut,
		userSelect: "none",
		width: "100%",
	},
	list: {
		// Keep end spacing scrollable when results exceed the list's height cap.
		"::after": {
			content: '""',
			flexShrink: 0,
			height: space["2"],
		},
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "column",
		gap: space["0"],
		maxHeight: "20rem",
		outline: "none",
		padding: space["2"],
		paddingBottom: space["0"],
		width: "100%",
	},
	panel: {
		backgroundColor: colors.floatingSurface,
		borderTopColor: colors.border,
		borderTopStyle: "solid",
		borderTopWidth: borderWidth.thin,
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "column",
		flexGrow: 1,
		minHeight: 0,
		position: "relative",
		width: "100%",
	},
	separator: {
		backgroundColor: colors.border,
		height: borderWidth.thin,
		marginBlock: space["1"],
		marginInline: space["2"],
	},
	shortcut: { flexShrink: 0, marginInlineStart: "auto" },
});
