import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import {
	borderWidth,
	focus,
	focusMotion,
} from "../../styles/interaction.stylex";
import { duration } from "../../styles/motion.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import {
	fontSize,
	fontWeight,
	letterSpacing,
	lineHeight,
} from "../../styles/typography.stylex";

export const breadcrumbStyles = create({
	ellipsis: {
		alignItems: "center",
		display: "inline-flex",
		fontSize: fontSize["12"],
		justifyContent: "center",
		letterSpacing: letterSpacing.caption,
		lineHeight: lineHeight.none,
		userSelect: "none",
	},
	iconContent: {
		flexShrink: { ":is(*) > svg": 0 },
		height: { ":is(*) > svg": "1rem" },
		width: { ":is(*) > svg": "1rem" },
	},
	item: {
		alignItems: "center",
		display: "inline-flex",
		gap: space["1"],
		minWidth: 0,
	},
	link: {
		alignItems: "center",
		animationDuration: {
			":focus-visible": focusMotion.duration,
		},
		animationName: {
			":focus-visible": focusMotion.ring,
		},
		borderRadius: `calc(${shape.controlRadius} / 3)`,
		color: {
			[conditions.canHover]: { ":hover": colors.content },
			default: "inherit",
		},
		display: "inline-flex",
		gap: space["1"],
		minWidth: 0,
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
		overflowWrap: "anywhere",
		textDecoration: "none",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "color",
	},
	list: {
		alignItems: "center",
		display: "flex",
		flexWrap: "wrap",
		gap: space["2"],
		listStyle: "none",
		margin: 0,
		minWidth: 0,
		padding: 0,
	},
	page: {
		alignItems: "center",
		color: colors.content,
		display: "inline-flex",
		fontWeight: fontWeight.regular,
		gap: space["1"],
		minWidth: 0,
		overflowWrap: "anywhere",
	},
	root: {
		color: colors.mutedContent,
		fontSize: fontSize["14"],
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
	},
	separator: {
		alignItems: "center",
		color: colors.mutedContent,
		display: "inline-flex",
		flex: "none",
		fontSize: fontSize["14"],
		justifyContent: "center",
		userSelect: "none",
	},
	separatorIcon: {
		height: "1rem",
		transform: {
			":dir(rtl)": "scaleX(-1)",
			":is([dir='rtl'] *):not(:is([dir='ltr'] *))": "scaleX(-1)",
			default: "none",
		},
		width: "1rem",
	},
});
