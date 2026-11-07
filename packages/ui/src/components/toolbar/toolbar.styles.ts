import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { controlSize } from "../../styles/dimensions.stylex";
import {
	borderWidth,
	focus,
	focusMotion,
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

const focusClearance = `calc(${borderWidth.focus}px + ${focus.offset})`;

export const toolbarStyles = create({
	group: {
		alignItems: "center",
		display: "inline-flex",
		flexShrink: 0,
		gap: space["1"],
		minWidth: 0,
	},
	horizontal: { flexDirection: "row" },
	link: {
		alignItems: "center",
		animationDuration: {
			":focus-visible": focusMotion.duration,
		},
		animationName: {
			":focus-visible": focusMotion.ring,
		},
		backgroundColor: {
			":hover": { [conditions.canHover]: colors.controlSurfaceHover },
			default: "transparent",
		},
		borderRadius: shape.controlRadius,
		boxSizing: "border-box",
		color: colors.content,
		display: "inline-flex",
		flexShrink: 0,
		fontSize: fontSize["16"],
		fontWeight: fontWeight.regular,
		gap: space["2"],
		justifyContent: "center",
		lineHeight: lineHeight.none,
		minHeight: controlSize.md,
		outline: "none",
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: focus.offset,
		outlineStyle: "solid",
		outlineWidth: {
			":focus-visible": borderWidth.focus,
			default: 0,
		},
		paddingBlock: space["1"],
		paddingInline: space["3"],
		textDecoration: {
			":hover": { [conditions.canHover]: "underline" },
			default: "none",
		},
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "background-color, outline-color",
		transitionTimingFunction: easing.expoOut,
	},
	root: {
		alignItems: "center",
		backgroundColor: colors.surface,
		borderColor: colors.border,
		borderRadius: shape.floatingRadius,
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxShadow: shadows.surface,
		boxSizing: "border-box",
		display: "inline-flex",
		gap: space["1"],
		maxWidth: "100%",
		minWidth: 0,
		overflowX: "auto",
		paddingBlock: focusClearance,
		paddingInline: focusClearance,
		scrollPaddingInline: space["1"],
		width: "fit-content",
	},
	separator: {
		alignSelf: "stretch",
		backgroundColor: colors.border,
		flex: "none",
		height: {
			"[data-orientation='horizontal']": borderWidth.thin,
			default: "auto",
		},
		marginBlock: {
			"[data-orientation='horizontal']": space["1"],
			default: space["1"],
		},
		marginInline: { "[data-orientation='horizontal']": space["1"], default: 0 },
		minHeight: {
			"[data-orientation='horizontal']": 0,
			default: space["3"],
		},
		width: {
			"[data-orientation='horizontal']": "auto",
			default: borderWidth.thin,
		},
	},
	vertical: { flexDirection: "column" },
});
