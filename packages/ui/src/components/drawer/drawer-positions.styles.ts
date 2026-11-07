import { create } from "@stylexjs/stylex";
import { conditions } from "../../styles/conditions.stylex";
import { borderWidth } from "../../styles/interaction.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";

export const drawerPositionsStyles = create({
	popup_bottom: {
		"--drawer-keyboard-snap-offset":
			"max(0px, calc(var(--drawer-snap-point-offset, 0px) - var(--drawer-keyboard-inset, 0px)))",
		borderBlockStartStyle: "solid",
		borderBlockStartWidth: borderWidth.thin,
		borderStartEndRadius: shape.floatingRadius,
		borderStartStartRadius: shape.floatingRadius,
		maxHeight: "calc(100dvh - 2rem)",
		paddingBlockEnd:
			"max(0px, calc(max(env(safe-area-inset-bottom, 0px), var(--drawer-keyboard-inset, 0px)) + var(--drawer-keyboard-snap-offset, 0px) + var(--drawer-swipe-movement-y, 0px)))",
		transform: {
			"[data-ending-style]":
				"translateY(calc(100% + var(--drawer-viewport-inset, 0px)))",
			"[data-starting-style]":
				"translateY(calc(100% + var(--drawer-viewport-inset, 0px)))",
			default:
				"translateY(calc(var(--drawer-keyboard-snap-offset, 0px) + var(--drawer-swipe-movement-y, 0px)))",
		},
		width: "100%",
	},
	popup_inset: {
		borderRadius: {
			[conditions.sm]: shape.floatingRadius,
			default: 0,
		},
		borderStyle: "solid",
		borderWidth: {
			[conditions.sm]: borderWidth.thin,
			default: 0,
		},
	},
	popup_left: {
		borderEndEndRadius: shape.floatingRadius,
		borderInlineEndStyle: "solid",
		borderInlineEndWidth: borderWidth.thin,
		borderStartEndRadius: shape.floatingRadius,
		height: "100%",
		maxWidth: "calc(100vw - 2rem)",
		paddingBlockEnd: "env(safe-area-inset-bottom, 0px)",
		transform: {
			"[data-ending-style]":
				"translateX(calc(-100% - var(--drawer-viewport-inset, 0px)))",
			"[data-starting-style]":
				"translateX(calc(-100% - var(--drawer-viewport-inset, 0px)))",
			default: "translateX(var(--drawer-swipe-movement-x, 0px))",
		},
		width: "24rem",
	},
	popup_right: {
		borderEndStartRadius: shape.floatingRadius,
		borderInlineStartStyle: "solid",
		borderInlineStartWidth: borderWidth.thin,
		borderStartStartRadius: shape.floatingRadius,
		height: "100%",
		maxWidth: "calc(100vw - 2rem)",
		paddingBlockEnd: "env(safe-area-inset-bottom, 0px)",
		transform: {
			"[data-ending-style]":
				"translateX(calc(100% + var(--drawer-viewport-inset, 0px)))",
			"[data-starting-style]":
				"translateX(calc(100% + var(--drawer-viewport-inset, 0px)))",
			default: "translateX(var(--drawer-swipe-movement-x, 0px))",
		},
		width: "24rem",
	},
	popup_straight: {
		borderEndEndRadius: 0,
		borderEndStartRadius: 0,
		borderStartEndRadius: 0,
		borderStartStartRadius: 0,
	},
	popup_top: {
		borderBlockEndStyle: "solid",
		borderBlockEndWidth: borderWidth.thin,
		borderEndEndRadius: shape.floatingRadius,
		borderEndStartRadius: shape.floatingRadius,
		maxHeight: "calc(100dvh - 2rem)",
		transform: {
			"[data-ending-style]":
				"translateY(calc(-100% - var(--drawer-viewport-inset, 0px)))",
			"[data-starting-style]":
				"translateY(calc(-100% - var(--drawer-viewport-inset, 0px)))",
			default: "translateY(var(--drawer-swipe-movement-y, 0px))",
		},
		width: "100%",
	},
	swipeArea_bottom: { height: "2rem", insetBlockEnd: 0, insetInline: 0 },
	swipeArea_left: { insetBlock: 0, insetInlineStart: 0, width: "2rem" },
	swipeArea_right: { insetBlock: 0, insetInlineEnd: 0, width: "2rem" },
	swipeArea_top: { height: "2rem", insetBlockStart: 0, insetInline: 0 },
	viewport_bottom: {
		alignItems: "flex-end",
		justifyContent: "stretch",
	},
	viewport_inset: {
		"--drawer-viewport-inset": {
			[conditions.sm]: space["3"],
			default: "0px",
		},
		padding: {
			[conditions.sm]: space["3"],
			default: 0,
		},
	},
	viewport_left: {
		alignItems: "stretch",
		justifyContent: "flex-start",
	},
	viewport_right: {
		alignItems: "stretch",
		justifyContent: "flex-end",
	},
	viewport_top: {
		alignItems: "flex-start",
		justifyContent: "stretch",
	},
});

export const drawerViewportPositionStyles = {
	bottom: drawerPositionsStyles.viewport_bottom,
	left: drawerPositionsStyles.viewport_left,
	right: drawerPositionsStyles.viewport_right,
	top: drawerPositionsStyles.viewport_top,
};

export const drawerPopupPositionStyles = {
	bottom: drawerPositionsStyles.popup_bottom,
	left: drawerPositionsStyles.popup_left,
	right: drawerPositionsStyles.popup_right,
	top: drawerPositionsStyles.popup_top,
};
