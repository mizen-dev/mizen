import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import {
	borderWidth,
	focus,
	focusMotion,
} from "../../styles/interaction.stylex";
import { duration, easing } from "../../styles/motion.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import {
	fontSize,
	fontWeight,
	letterSpacing,
	lineHeight,
} from "../../styles/typography.stylex";

export const cardStyles = create({
	action: {
		alignSelf: "center",
		boxSizing: "border-box",
		gridColumn: "2",
		gridRowEnd: "2",
		gridRowStart: "1",
		justifySelf: "end",
	},
	description: {
		boxSizing: "border-box",
		color: colors.mutedContent,
		fontSize: fontSize["14"],
		fontWeight: fontWeight.regular,
		gridColumn: "1",
		lineHeight: lineHeight["20"],
		marginBlock: 0,
	},
	footer: {
		alignItems: "center",
		boxSizing: "border-box",
		display: "flex",
		gap: space["3"],
		paddingBlockEnd: space["6"],
		paddingBlockStart: {
			":not(:first-child)": space["0"],
			default: space["6"],
		},
		paddingInline: space["6"],
	},
	header: {
		alignItems: "center",
		boxSizing: "border-box",
		columnGap: space["3"],
		display: "grid",
		gap: space["1"],
		gridTemplateColumns: "minmax(0, 1fr) auto",
		paddingBlock: space["6"],
		paddingInline: space["6"],
	},
	panel: {
		boxSizing: "border-box",
		color: colors.content,
		flexGrow: 1,
		minWidth: 0,
		paddingBlockEnd: space["6"],
		paddingBlockStart: {
			":not(:first-child)": space["0"],
			default: space["6"],
		},
		paddingInline: space["6"],
	},
	root: {
		animationDuration: {
			":focus-visible": focusMotion.duration,
		},
		animationName: {
			":focus-visible": focusMotion.ring,
		},
		backgroundColor: colors.workarea,
		borderRadius: shape.surfaceRadius,
		boxSizing: "border-box",
		color: colors.content,
		display: "flex",
		flexDirection: "column",
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: {
			":focus-visible": focus.offset,
			default: 0,
		},
		outlineStyle: {
			":focus-visible": "solid",
			default: "none",
		},
		outlineWidth: {
			":focus-visible": borderWidth.focus,
			default: 0,
		},
		position: "relative",
		textDecoration: "none",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "outline-color, outline-offset",
		transitionTimingFunction: easing.expoOut,
		width: "100%",
	},
	title: {
		boxSizing: "border-box",
		color: colors.content,
		fontSize: fontSize["16"],
		fontWeight: fontWeight.semibold,
		gridColumn: "1",
		letterSpacing: letterSpacing.subheading,
		lineHeight: lineHeight["24"],
		marginBlock: 0,
		minInlineSize: 0,
		overflowWrap: "anywhere",
	},
});
