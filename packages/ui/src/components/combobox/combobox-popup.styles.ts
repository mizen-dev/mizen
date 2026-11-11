import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { floatingItemColors } from "../../styles/floating-item-colors.stylex";
import { fonts } from "../../styles/fonts.stylex";
import {
	borderWidth,
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
	letterSpacing,
	lineHeight,
} from "../../styles/typography.stylex";

export const comboboxPopupStyles = create({
	empty: {
		color: colors.mutedContent,
		fontSize: fontSize["14"],
		fontSizeAdjust: fonts.sizeAdjust,
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
		paddingBlock: {
			":empty": space["0"],
			default: space["3"],
		},
		paddingInline: space["2"],
		textAlign: "center",
	},
	group: {
		display: "flex",
		flexDirection: "column",
		gap: space.px,
	},
	groupLabel: {
		color: colors.mutedContent,
		fontSize: fontSize["12"],
		fontSizeAdjust: fonts.sizeAdjust,
		fontWeight: fontWeight.medium,
		letterSpacing: letterSpacing.caption,
		lineHeight: lineHeight["16"],
		paddingBlockEnd: space["1"],
		paddingBlockStart: space["2"],
		paddingInline: space["2"],
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
		cursor: { "[data-disabled]": "not-allowed", default: "pointer" },
		display: "grid",
		fontSize: fontSize["14"],
		fontSizeAdjust: fonts.sizeAdjust,
		fontWeight: {
			"[data-selected]": fontWeight.medium,
			default: fontWeight.regular,
		},
		forcedColorAdjust: {
			"[data-highlighted]": forcedColorAdjust.selectedState,
		},
		gap: space["2"],
		gridTemplateColumns: "1rem minmax(0, 1fr)",
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
		minHeight: "2rem",
		opacity: { "[data-disabled]": opacity.disabled, default: 1 },
		// Focus stays in the input, so the row under the pointer keeps the tint
		// and a row highlighted from the keyboard draws the ring.
		outlineColor: {
			"[data-highlighted]:not(:hover)": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: `-${borderWidth.focus}`,
		outlineStyle: {
			"[data-highlighted]:not(:hover)": "solid",
			default: "none",
		},
		outlineWidth: borderWidth.focus,
		paddingBlock: `calc((2rem - ${lineHeight["20"]}) / 2)`,
		paddingInlineEnd: space["2"],
		paddingInlineStart: space["2"],
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "background-color, color, opacity",
		transitionTimingFunction: easing.expoOut,
	},
	itemContent: {
		gridColumnStart: "2",
		minWidth: 0,
		overflowWrap: "anywhere",
	},
	itemIndicator: {
		alignItems: "center",
		display: "inline-flex",
		height: "1rem",
		justifyContent: "center",
		opacity: { "[data-selected]": 1, default: 0 },
		width: "1rem",
	},
	// A hairline gap keeps neighboring selected rows apart.
	list: {
		display: "flex",
		flexDirection: "column",
		gap: space.px,
		padding: space["2"],
	},
	popup: {
		backgroundColor: colors.floatingSurface,
		borderColor: {
			[conditions.moreContrast]: colors.controlBorderStrong,
			default: colors.border,
		},
		borderRadius: shape.floatingRadius,
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxShadow: shadows.floating,
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "column",
		maxHeight: "min(var(--available-height), 23rem)",
		maxWidth: "var(--available-width)",
		minWidth: "var(--anchor-width)",
		opacity: {
			"[data-ending-style]": 0,
			"[data-starting-style]": 0,
			default: 1,
		},
		overflow: "hidden",
		transform: {
			"[data-ending-style]": "translateY(-0.25rem) scale(0.98)",
			"[data-starting-style]": "translateY(-0.25rem) scale(0.98)",
			default: "none",
		},
		transformOrigin: "var(--transform-origin)",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "opacity, transform",
		transitionTimingFunction: easing.expoOut,
	},
	positioner: {
		maxWidth: "var(--available-width)",
		minWidth: "var(--anchor-width)",
		userSelect: "none",
		zIndex: 50,
	},
	row: {
		alignItems: "center",
		display: "flex",
		width: "100%",
	},
	separator: {
		backgroundColor: colors.border,
		height: borderWidth.thin,
		marginBlock: space["1"],
		marginInline: space["2"],
	},
	status: {
		color: colors.mutedContent,
		fontSize: fontSize["12"],
		fontSizeAdjust: fonts.sizeAdjust,
		fontWeight: fontWeight.medium,
		letterSpacing: letterSpacing.caption,
		lineHeight: lineHeight["16"],
		paddingBlock: space["2"],
		paddingInline: space["2"],
	},
});
