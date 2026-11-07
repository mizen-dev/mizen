import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import {
	borderWidth,
	focus,
	focusMotion,
	focusOutline,
} from "../../styles/interaction.stylex";
import { shape } from "../../styles/shape.stylex";

export const linkStyles = create({
	root: {
		animationDuration: {
			":focus-visible": focusMotion.duration,
		},
		animationName: {
			":focus-visible": focusMotion.ring,
		},
		borderRadius: `calc(${shape.controlRadius} / 3)`,
		color: colors.brandForeground,
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
		overflowWrap: "anywhere",
		textDecorationLine: "underline",
		textDecorationThickness: {
			":active": "0.16em",
			[conditions.canHover]: { ":hover:not(:active)": "0.12em" },
			default: "0.08em",
		},
		textUnderlineOffset: "0.25em",
	},
});
