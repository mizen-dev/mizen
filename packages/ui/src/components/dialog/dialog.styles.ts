import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
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
	letterSpacing,
	lineHeight,
} from "../../styles/typography.stylex";

export const dialogStyles = create({
	backdrop: {
		backgroundColor: colors.backdrop,
		inset: 0,
		opacity: {
			"[data-ending-style]": 0,
			"[data-starting-style]": 0,
			default: 1,
		},
		position: "fixed",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			"[data-ending-style]": duration.overlayExit,
			default: duration.overlayEnter,
		},
		transitionProperty: "opacity",
		transitionTimingFunction: easing.easeInOut,
		zIndex: 50,
	},
	close: {
		alignItems: "center",
		animationDuration: {
			":focus-visible": focusMotion.duration,
		},
		animationName: {
			":focus-visible": focusMotion.ring,
		},
		backgroundColor: {
			[conditions.canHover]: {
				":hover:not(:disabled):not([data-disabled])":
					colors.controlSurfaceHover,
				default: "transparent",
			},
			default: "transparent",
		},
		borderEndEndRadius: shape.controlRadius,
		borderEndStartRadius: shape.controlRadius,
		borderStartEndRadius: shape.controlRadius,
		borderStartStartRadius: shape.controlRadius,
		borderStyle: "none",
		borderWidth: 0,
		color: colors.content,
		cursor: {
			":disabled": "not-allowed",
			"[data-disabled]": "not-allowed",
			default: "pointer",
		},
		display: "inline-flex",
		height: "2rem",
		// Centers the 32px button on the 28px heading line, and puts the 16px
		// glyph's edge on the 24px content edge.
		insetBlockStart: `calc(${space["6"]} + (${lineHeight["28"]} - 2rem) / 2)`,
		insetInlineEnd: space["4"],
		justifyContent: "center",
		outline: "none",
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: { ":focus-visible": focus.offset, default: 0 },
		outlineStyle: { ":focus-visible": "solid", default: "none" },
		outlineWidth: { ":focus-visible": borderWidth.focus, default: 0 },
		padding: 0,
		position: "absolute",
		transform: {
			[conditions.reducedMotion]: {
				":active:not(:disabled):not([data-disabled])": "none",
				default: "none",
			},
			":active:not(:disabled):not([data-disabled])": "scale(0.96)",
			default: "none",
		},
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "background-color, transform",
		transitionTimingFunction: easing.expoOut,
		width: "2rem",
	},
	description: {
		color: colors.mutedContent,
		fontSize: fontSize["14"],
		fontWeight: fontWeight.regular,
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
		marginBlock: 0,
		overflowWrap: "anywhere",
		textWrap: "pretty",
	},
	footer: {
		alignItems: "center",
		backgroundColor: colors.workarea,
		borderBlockStartColor: colors.border,
		borderBlockStartStyle: "solid",
		borderBlockStartWidth: borderWidth.thin,
		display: "flex",
		flexShrink: 0,
		flexWrap: "wrap",
		gap: space["2"],
		justifyContent: "flex-end",
		// One inset on every side: the last action lines up under the close
		// button and sits as far from the side as from the bottom.
		paddingBlock: space["4"],
		paddingInline: space["4"],
	},
	header: {
		display: "flex",
		flexDirection: "column",
		gap: space["1"],
		minHeight: 0,
		overflowY: "auto",
		paddingBlockEnd: space["6"],
		paddingBlockStart: space["6"],
		paddingInline: space["6"],
		paddingInlineEnd: "3.5rem",
	},
	panel: {
		display: "flex",
		flexDirection: "column",
		gap: space["4"],
		minHeight: 0,
		overflowY: "auto",
		overscrollBehavior: "contain",
		paddingBlock: space["4"],
		paddingBlockStart: {
			":is([data-slot='dialog-header'] + *)": space["0"],
			default: space["4"],
		},
		paddingInline: space["6"],
	},
	popup: {
		backgroundColor: colors.floatingSurface,
		borderColor: {
			[conditions.moreContrast]: colors.controlBorderStrong,
			default: colors.border,
		},
		borderEndEndRadius: shape.floatingRadius,
		borderEndStartRadius: shape.floatingRadius,
		borderStartEndRadius: shape.floatingRadius,
		borderStartStartRadius: shape.floatingRadius,
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxShadow: shadows.floating,
		boxSizing: "border-box",
		color: colors.content,
		display: "flex",
		flexDirection: "column",
		maxHeight: "calc(100dvh - 2rem)",
		opacity: {
			"[data-ending-style]": 0,
			"[data-nested-dialog-open]": 0,
			"[data-starting-style]": 0,
			default: 1,
		},
		overflow: "hidden",
		position: "relative",
		transform: {
			"[data-ending-style]": "translateY(0.25rem) scale(0.98)",
			"[data-starting-style]": "translateY(0.5rem) scale(0.96)",
			default: "none",
		},
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			"[data-ending-style]": duration.overlayExit,
			"[data-instant]": duration.instant,
			default: duration.overlayEnter,
		},
		transitionProperty: "opacity, transform",
		transitionTimingFunction: {
			"[data-ending-style]": easing.easeInOut,
			default: easing.expoOut,
		},
		width: "calc(100vw - 2rem)",
	},
	popupLg: { maxWidth: "42rem" },
	popupMd: { maxWidth: "32rem" },
	popupSm: { maxWidth: "24rem" },
	popupXl: { maxWidth: "56rem" },
	title: {
		color: colors.content,
		fontSize: fontSize["16"],
		fontWeight: fontWeight.semibold,
		letterSpacing: letterSpacing.subheading,
		lineHeight: lineHeight["24"],
		marginBlock: 0,
		overflowWrap: "anywhere",
		textWrap: "balance",
	},
	viewport: {
		alignItems: "center",
		boxSizing: "border-box",
		display: "flex",
		height: "100%",
		insetBlockStart: 0,
		insetInlineStart: 0,
		justifyContent: "center",
		overflowY: "auto",
		overscrollBehavior: "contain",
		paddingBlockEnd: "max(1rem, env(safe-area-inset-bottom))",
		paddingBlockStart: "max(1rem, env(safe-area-inset-top))",
		paddingInlineEnd: "max(1rem, env(safe-area-inset-right))",
		paddingInlineStart: "max(1rem, env(safe-area-inset-left))",
		position: "fixed",
		width: "100%",
		zIndex: 51,
	},
});
