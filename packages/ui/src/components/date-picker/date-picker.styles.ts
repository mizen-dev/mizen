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
import { space } from "../../styles/spacing.stylex";

export const datePickerStyles = create({
	triggerButton: {
		alignItems: "center",
		animationDuration: {
			":focus-visible": focusMotion.duration,
		},
		animationName: {
			":focus-visible": focusMotion.ring,
		},
		backgroundColor: {
			":hover": { [conditions.canHover]: colors.secondary },
			default: "transparent",
		},
		borderColor: "transparent",
		borderRadius: shape.controlRadiusSmall,
		borderStyle: "none",
		color: colors.content,
		cursor: "pointer",
		display: "inline-flex",
		height: "100%",
		justifyContent: "center",
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: focus.offset,
		outlineStyle: {
			default: focusOutline.restingOutlineStyle,
		},
		outlineWidth: borderWidth.focus,
		padding: space["1"],
	},
	triggerButtonDisabled: {
		cursor: "not-allowed",
	},
	triggerIcon: {
		display: "inline-flex",
		flexShrink: 0,
		lineHeight: 0,
	},
});
