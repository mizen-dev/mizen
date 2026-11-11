import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import {
	borderWidth,
	focus,
	focusMotion,
} from "../../styles/interaction.stylex";
import { space } from "../../styles/spacing.stylex";
import {
	fontSize,
	fontWeight,
	letterSpacing,
	lineHeight,
} from "../../styles/typography.stylex";

export const markdownStyles = create({
	blockquote: {
		borderInlineStartColor: colors.border,
		borderInlineStartStyle: "solid",
		borderInlineStartWidth: borderWidth.focus,
		marginBlock: space["3"],
		marginInline: 0,
		paddingInlineStart: space["3"],
	},
	checkbox: {
		accentColor: colors.primary,
		marginInlineEnd: space["2"],
		// Stands where the list marker was, at the text edge.
		marginInlineStart: `calc(-1 * (${space["4"]} + ${space["1"]}))`,
	},
	heading: {
		color: colors.content,
		fontWeight: fontWeight.semibold,
		marginBlockEnd: space["2"],
		marginBlockStart: { ":first-child": 0, default: space["3"] },
	},
	headingFive: {
		fontSize: fontSize["14"],
		fontWeight: fontWeight.semibold,
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
	},
	headingFour: {
		fontSize: fontSize["16"],
		fontWeight: fontWeight.semibold,
		letterSpacing: letterSpacing.subheading,
		lineHeight: lineHeight["24"],
	},
	headingSix: {
		fontSize: fontSize["14"],
		fontWeight: fontWeight.semibold,
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
	},
	headingThree: {
		fontSize: fontSize["20"],
		fontWeight: fontWeight.semibold,
		letterSpacing: letterSpacing.heading,
		lineHeight: lineHeight["28"],
	},
	image: { height: "auto", maxWidth: "100%" },
	link: {
		animationDuration: {
			":focus-visible": focusMotion.duration,
		},
		animationName: {
			":focus-visible": focusMotion.ring,
		},
		borderRadius: 2,
		color: colors.primary,
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: focus.offset,
		outlineStyle: "solid",
		outlineWidth: {
			":focus-visible": borderWidth.focus,
			default: 0,
		},
		textDecorationLine: "underline",
		textUnderlineOffset: "0.15em",
	},
	list: {
		marginBlock: 0,
		marginBlockEnd: { ":last-child": 0, default: space["3"] },
		paddingInlineStart: space["4"],
	},
	listItem: {
		// A task shows its checkbox instead of a marker.
		listStyleType: {
			":has(> [data-slot=markdown-task], > p > [data-slot=markdown-task])":
				"none",
			default: null,
		},
		paddingInlineStart: space["1"],
	},
	paragraph: {
		marginBlock: 0,
		marginBlockEnd: { ":last-child": 0, default: space["3"] },
	},
	root: {
		color: colors.content,
		fontWeight: fontWeight.regular,
		minWidth: 0,
		overflowWrap: "break-word",
	},
	rule: {
		borderBlockStartColor: colors.border,
		borderBlockStartStyle: "solid",
		borderBlockStartWidth: borderWidth.thin,
		marginBlock: space["3"],
	},
});
