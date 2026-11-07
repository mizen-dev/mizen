import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import {
	borderWidth,
	focus,
	focusMotion,
	focusOutline,
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

export const toastStyles = create({
	action: {
		alignItems: "center",
		alignSelf: "center",
		animationDuration: {
			":focus-visible": focusMotion.duration,
		},
		animationName: {
			":focus-visible": focusMotion.ring,
		},
		backgroundColor: {
			[conditions.canHover]: {
				":hover:not(:disabled)": colors.controlSurfaceHover,
			},
			default: colors.controlSurface,
		},
		borderColor: colors.border,
		borderRadius: shape.controlRadius,
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxSizing: "border-box",
		color: colors.content,
		cursor: { ":disabled": "not-allowed", default: "pointer" },
		display: "inline-flex",
		flexShrink: 0,
		fontFamily: "inherit",
		fontSize: fontSize["14"],
		fontWeight: fontWeight.medium,
		gap: space["1"],
		justifyContent: "center",
		lineHeight: lineHeight.none,
		marginInlineStart: space["1"],
		minHeight: "1.75rem",
		opacity: { ":disabled": opacity.disabled, default: 1 },
		outline: "none",
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: focus.offset,
		outlineStyle: {
			":focus-visible": "solid",
			default: focusOutline.restingOutlineStyle,
		},
		outlineWidth: borderWidth.focus,
		paddingBlock: space["1"],
		paddingInline: space["3"],
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "background-color, border-color, color, outline-color",
		transitionTimingFunction: easing.expoOut,
	},
	body: {
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "column",
		flexGrow: 1,
		gap: space["1"],
		minWidth: 0,
	},
	bottomCenter: {
		alignItems: "center",
		bottom: space["5"],
		left: "50%",
		transform: "translateX(-50%)",
	},
	bottomLeft: {
		alignItems: "flex-start",
		bottom: space["5"],
		left: space["5"],
	},
	bottomRight: {
		alignItems: "flex-end",
		bottom: space["5"],
		right: space["5"],
	},
	content: {
		alignItems: "flex-start",
		boxSizing: "border-box",
		display: "flex",
		gap: space["2"],
		overflow: "hidden",
		padding: space["4"],
		pointerEvents: "auto",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "opacity, box-shadow",
		transitionTimingFunction: easing.expoOut,
		width: "100%",
	},
	description: {
		boxSizing: "border-box",
		color: colors.mutedContent,
		fontSize: fontSize["14"],
		fontWeight: fontWeight.regular,
		lineHeight: lineHeight["20"],
		margin: space["0"],
		wordBreak: "break-word",
	},
	icon: {
		alignItems: "center",
		display: "inline-flex",
		flexShrink: 0,
		height: "1rem",
		marginBlockStart: "2px",
		width: "1rem",
	},
	iconError: { color: colors.destructive },
	iconInfo: { color: colors.infoContent },
	iconLoading: { color: colors.content },
	iconSuccess: { color: colors.successContent },
	iconWarning: { color: colors.warningContent },
	surface: {
		backgroundColor: colors.floatingSurface,
		borderColor: {
			[conditions.moreContrast]: colors.controlBorderStrong,
			default: colors.border,
		},
		borderRadius: shape.floatingRadius,
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxShadow: shadows.floating,
		color: colors.content,
	},
	title: {
		boxSizing: "border-box",
		color: colors.content,
		fontSize: fontSize["14"],
		fontWeight: fontWeight.medium,
		lineHeight: lineHeight["20"],
		margin: space["0"],
		wordBreak: "break-word",
	},
	topCenter: {
		alignItems: "center",
		left: "50%",
		top: space["5"],
		transform: "translateX(-50%)",
	},
	topLeft: {
		alignItems: "flex-start",
		left: space["5"],
		top: space["5"],
	},
	topRight: {
		alignItems: "flex-end",
		right: space["5"],
		top: space["5"],
	},
	viewport: {
		"--toast-focus-ring": {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "column",
		gap: space["1"],
		maxWidth: "400px",
		outlineColor: {
			[conditions.forcedColors]: "Highlight",
			default: "transparent",
		},
		outlineOffset: focus.offset,
		outlineStyle: {
			":focus-visible": "solid",
			default: focusOutline.restingOutlineStyle,
		},
		outlineWidth: borderWidth.focus,
		position: "fixed",
		width: "calc(100% - 2.5rem)",
		zIndex: 1000,
	},
});
