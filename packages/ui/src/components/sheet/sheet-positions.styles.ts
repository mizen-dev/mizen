import { create } from "@stylexjs/stylex";
import { conditions } from "../../styles/conditions.stylex";
import { borderWidth } from "../../styles/interaction.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";

export const sheetPositionsStyles = create({
	popup_bottom: {
		borderBlockStartWidth: borderWidth.thin,
		borderStartEndRadius: shape.floatingRadius,
		borderStartStartRadius: shape.floatingRadius,
		maxHeight: "calc(100dvh - 2rem)",
		transform: {
			"[data-ending-style]": "translateY(2rem)",
			"[data-starting-style]": "translateY(2rem)",
			default: "none",
		},
		width: "100%",
	},
	popup_inset: {
		borderRadius: {
			[conditions.sm]: shape.floatingRadius,
			default: 0,
		},
		borderWidth: {
			[conditions.sm]: borderWidth.thin,
			default: 0,
		},
	},
	popup_left: {
		borderEndEndRadius: shape.floatingRadius,
		borderInlineEndWidth: borderWidth.thin,
		borderStartEndRadius: shape.floatingRadius,
		height: "100%",
		maxWidth: "calc(100vw - 2rem)",
		transform: {
			"[data-ending-style]": "translateX(-2rem)",
			"[data-starting-style]": "translateX(-2rem)",
			default: "none",
		},
		width: "24rem",
	},
	popup_right: {
		borderEndStartRadius: shape.floatingRadius,
		borderInlineStartWidth: borderWidth.thin,
		borderStartStartRadius: shape.floatingRadius,
		height: "100%",
		maxWidth: "calc(100vw - 2rem)",
		transform: {
			"[data-ending-style]": "translateX(2rem)",
			"[data-starting-style]": "translateX(2rem)",
			default: "none",
		},
		width: "24rem",
	},
	popup_top: {
		borderBlockEndWidth: borderWidth.thin,
		borderEndEndRadius: shape.floatingRadius,
		borderEndStartRadius: shape.floatingRadius,
		maxHeight: "calc(100dvh - 2rem)",
		transform: {
			"[data-ending-style]": "translateY(-2rem)",
			"[data-starting-style]": "translateY(-2rem)",
			default: "none",
		},
		width: "100%",
	},
	viewport_bottom: {
		alignItems: "flex-end",
		justifyContent: "stretch",
	},
	viewport_inset: {
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

export const viewportSideStyles = {
	bottom: sheetPositionsStyles.viewport_bottom,
	left: sheetPositionsStyles.viewport_left,
	right: sheetPositionsStyles.viewport_right,
	top: sheetPositionsStyles.viewport_top,
};

export const popupSideStyles = {
	bottom: sheetPositionsStyles.popup_bottom,
	left: sheetPositionsStyles.popup_left,
	right: sheetPositionsStyles.popup_right,
	top: sheetPositionsStyles.popup_top,
};
