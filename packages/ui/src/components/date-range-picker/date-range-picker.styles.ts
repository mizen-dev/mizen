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
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import {
	fontSize,
	fontWeight,
	letterSpacing,
	lineHeight,
} from "../../styles/typography.stylex";

export const dateRangePickerStyles = create({
	popupContainer: {
		backgroundColor: colors.floatingSurface,
		borderColor: colors.border,
		borderRadius: shape.floatingRadius,
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "column",
		maxWidth: "100vw",
		overflow: "hidden",
	},
	presetButton: {
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
		borderColor: colors.border,
		borderRadius: shape.controlRadius,
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		color: colors.content,
		cursor: "pointer",
		display: "inline-flex",
		fontSize: fontSize["13"],
		fontWeight: fontWeight.medium,
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: focus.offset,
		outlineStyle: {
			default: focusOutline.restingOutlineStyle,
		},
		outlineWidth: borderWidth.focus,
		paddingBlock: space["1"],
		paddingInline: space["1"],
		whiteSpace: "nowrap",
	},
	presetButtonDisabled: {
		cursor: "not-allowed",
		opacity: opacity.disabled,
	},
	presetsRow: {
		borderBottomColor: colors.border,
		borderBottomStyle: "solid",
		borderBottomWidth: borderWidth.thin,
		display: "flex",
		flexWrap: "wrap",
		gap: space["1"],
		padding: space["3"],
	},
});
