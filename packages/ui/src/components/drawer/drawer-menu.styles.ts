import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import {
	borderWidth,
	focus,
	focusMotion,
	opacity,
} from "../../styles/interaction.stylex";
import { lineHeight } from "../../styles/typography.stylex";

export const drawerMenuStyles = create({
	item: {
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
		borderStyle: "none",
		borderWidth: 0,
		cursor: {
			":disabled": "not-allowed",
			"[data-disabled]": "not-allowed",
			default: "pointer",
		},
		lineHeight: lineHeight["24"],
		minHeight: "2.25rem",
		opacity: {
			":disabled": opacity.disabled,
			"[data-disabled]": opacity.disabled,
			default: 1,
		},
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: focus.offset,
		outlineStyle: { ":focus-visible": "solid", default: "none" },
		outlineWidth: { ":focus-visible": borderWidth.focus, default: 0 },
		textAlign: "start",
		width: "100%",
	},
});
