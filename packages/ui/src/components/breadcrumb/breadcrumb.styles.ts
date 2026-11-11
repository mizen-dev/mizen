import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { controlSize } from "../../styles/dimensions.stylex";
import { borderWidth, focusMotion } from "../../styles/interaction.stylex";
import { duration } from "../../styles/motion.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import {
	fontSize,
	fontWeight,
	letterSpacing,
	lineHeight,
} from "../../styles/typography.stylex";

// A link's label is trimmed to its cap height, about 10px. Padding grows the
// link to the 24px hit area and an equal negative margin keeps the trail in
// place. Without text trim the label keeps its line height.
const TRIMMED = "@supports (text-box: trim-both cap alphabetic)";
const hitInset = (edge: "1cap" | "1lh") =>
	`calc((${controlSize.xs} - ${edge}) / 2)`;

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
		borderRadius: shape.inlineRadius,
		color: {
			[conditions.canHover]: { ":hover": colors.content },
			default: "inherit",
		},
		display: "inline-flex",
		gap: space["1"],
		marginBlock: {
			[TRIMMED]: `calc(-1 * ${hitInset("1cap")})`,
			default: `calc(-1 * ${hitInset("1lh")})`,
		},
		marginInline: `calc(-1 * ${space["1"]})`,
		minWidth: 0,
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: 0,
		outlineStyle: "solid",
		outlineWidth: {
			":focus-visible": borderWidth.focus,
			default: 0,
		},
		overflowWrap: "anywhere",
		paddingBlock: {
			[TRIMMED]: hitInset("1cap"),
			default: hitInset("1lh"),
		},
		paddingInline: space["1"],
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
