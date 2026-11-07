import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";

export const drawerAffordanceStyles = create({
	bar: {
		alignItems: "center",
		boxSizing: "border-box",
		display: "flex",
		justifyContent: "center",
		pointerEvents: "auto",
		position: "absolute",
		touchAction: "none",
		zIndex: 2,
	},
	bar_bottom: {
		insetBlockStart: 0,
	},
	bar_left: {
		insetInlineEnd: 0,
	},
	bar_right: {
		insetInlineStart: 0,
	},
	bar_top: {
		insetBlockEnd: 0,
	},
	barHandle: {
		backgroundColor: colors.border,
		borderEndEndRadius: shape.controlRadiusLarge,
		borderEndStartRadius: shape.controlRadiusLarge,
		borderStartEndRadius: shape.controlRadiusLarge,
		borderStartStartRadius: shape.controlRadiusLarge,
	},
	barHandleHorizontal: {
		height: "3rem",
		width: "0.25rem",
	},
	barHandleVertical: {
		height: "0.25rem",
		width: "3rem",
	},
	barHorizontal: {
		insetBlock: 0,
		paddingInline: space["2"],
		width: "1.5rem",
	},
	barVertical: {
		height: "1.5rem",
		insetInline: 0,
		paddingBlock: space["2"],
	},
});

export const drawerBarPositionStyles = {
	bottom: drawerAffordanceStyles.bar_bottom,
	left: drawerAffordanceStyles.bar_left,
	right: drawerAffordanceStyles.bar_right,
	top: drawerAffordanceStyles.bar_top,
};
