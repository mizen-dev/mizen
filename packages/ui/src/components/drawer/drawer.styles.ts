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
import { shadows } from "../../styles/shadows.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import {
	fontSize,
	fontWeight,
	letterSpacing,
	lineHeight,
} from "../../styles/typography.stylex";

export const drawerStyles = create({
	backdrop: {
		backgroundColor: colors.backdrop,
		inset: 0,
		opacity: {
			"[data-ending-style]": 0,
			"[data-starting-style]": 0,
			default: "calc(1 - var(--drawer-swipe-progress, 0))",
		},
		position: "fixed",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			"[data-ending-style]": duration.overlayExit,
			"[data-swiping]": duration.instant,
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
		insetBlockStart: space["5"],
		insetInlineEnd: space["5"],
		justifyContent: "center",
		opacity: {
			":disabled": opacity.disabled,
			"[data-disabled]": opacity.disabled,
			default: 1,
		},
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
		zIndex: 1,
	},
	content: {
		boxSizing: "border-box",
	},
	description: {
		color: colors.mutedContent,
		fontSize: fontSize["14"],
		fontWeight: fontWeight.regular,
		lineHeight: lineHeight["20"],
		marginBlock: 0,
		overflowWrap: "anywhere",
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
	footerBare: {
		backgroundColor: "transparent",
		borderBlockStartStyle: "none",
		borderBlockStartWidth: 0,
	},
	header: {
		display: "flex",
		flexDirection: "column",
		flexShrink: 0,
		gap: space["1"],
		minHeight: 0,
		overflowY: "auto",
		paddingBlockEnd: space["4"],
		paddingBlockStart: space["6"],
		paddingInline: space["6"],
	},
	headerWithClose: {
		paddingInlineEnd: "3.5rem",
	},
	noSelection: {
		userSelect: "none",
	},
	panel: {
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "column",
		gap: space["4"],
		minHeight: 0,
		paddingBlock: space["4"],
		paddingBlockStart: {
			":is([data-slot='drawer-popup']:has([data-slot='drawer-header']) *)": 0,
			default: space["6"],
		},
		paddingInline: space["6"],
	},
	popup: {
		"--drawer-ending-duration": {
			[conditions.reducedMotion]: duration.instant,
			default: "calc(var(--drawer-swipe-strength, 1) * 400ms)",
		},
		backgroundColor: colors.floatingSurface,
		borderColor: {
			[conditions.moreContrast]: colors.controlBorderStrong,
			default: colors.border,
		},
		boxShadow: shadows.floating,
		boxSizing: "border-box",
		color: colors.content,
		display: "flex",
		flexDirection: "column",
		minHeight: 0,
		minWidth: 0,
		opacity: { "[data-nested-drawer-open]": 0, default: 1 },
		outline: "none",
		overflow: "hidden",
		pointerEvents: "auto",
		position: "relative",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			"[data-ending-style]": "var(--drawer-ending-duration, 0ms)",
			"[data-swiping]": duration.instant,
			default: duration.overlayEnter,
		},
		transitionProperty: "transform, opacity",
		transitionTimingFunction: easing.expoOut,
	},
	scrollArea: {
		display: "flex",
		flexDirection: "column",
		flexGrow: 1,
		flexShrink: 1,
		minHeight: 0,
		touchAction: "auto",
		width: "100%",
	},
	swipeArea: { position: "fixed", touchAction: "none", zIndex: 50 },
	title: {
		color: colors.content,
		fontSize: fontSize["20"],
		fontWeight: fontWeight.semibold,
		letterSpacing: letterSpacing.heading,
		lineHeight: lineHeight["28"],
		marginBlock: 0,
		overflowWrap: "anywhere",
		textWrap: "balance",
	},
	viewport: {
		"--drawer-viewport-inset": "0px",
		boxSizing: "border-box",
		display: "flex",
		height: "100%",
		insetBlockStart: 0,
		insetInlineStart: 0,
		overflow: "hidden",
		overscrollBehavior: "contain",
		pointerEvents: "none",
		position: "fixed",
		width: "100%",
		zIndex: 51,
	},
});
