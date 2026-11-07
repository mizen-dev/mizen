import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { duration, easing } from "../../styles/motion.stylex";
import { space } from "../../styles/spacing.stylex";
import { fontWeight } from "../../styles/typography.stylex";

export const meterStyles = create({
	indicator: {
		backgroundColor: colors.primary,
		borderRadius: "9999px",
		boxSizing: "border-box",
		display: "block",
		height: "inherit",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.disclosure,
		},
		transitionProperty: "width",
		transitionTimingFunction: easing.expoOut,
	},
	label: {
		color: colors.content,
		fontWeight: fontWeight.medium,
	},
	root: {
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "column",
		gap: space["1"],
		width: "100%",
	},
	track: {
		// A translucent tint, like Progress, so the track shows on any surface.
		backgroundColor: colors.border,
		borderRadius: "9999px",
		boxSizing: "border-box",
		display: "block",
		height: "0.5rem",
		overflow: "hidden",
		position: "relative",
		width: "100%",
	},
	value: {
		color: colors.content,
		fontVariantNumeric: "tabular-nums",
	},
});
