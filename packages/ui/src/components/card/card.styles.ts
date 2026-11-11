import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import {
	borderWidth,
	focus,
	focusMotion,
} from "../../styles/interaction.stylex";
import { duration, easing } from "../../styles/motion.stylex";
import { shadows } from "../../styles/shadows.stylex";
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
		// A badge or small button overhangs the title line instead of
		// stretching it.
		marginBlock: `calc(-1 * ${space["1"]})`,
	},
	description: {
		boxSizing: "border-box",
		color: colors.mutedContent,
		fontSize: fontSize["13"],
		fontWeight: fontWeight.regular,
		gridColumn: "1",
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
		marginBlock: 0,
		textWrap: "pretty",
	},
	footer: {
		alignItems: "center",
		boxSizing: "border-box",
		display: "flex",
		gap: space["3"],
		paddingBlockEnd: space["5"],
		paddingBlockStart: {
			":not(:first-child)": space["0"],
			default: space["5"],
		},
		paddingInline: space["5"],
	},
	// The card reads as one group: every gap looks like the 20px side padding.
	// A text line box adds about 5px above and below its glyphs, so the header
	// uses 16px above its title and 12px below its text.
	header: {
		alignItems: "center",
		boxSizing: "border-box",
		columnGap: space["3"],
		display: "grid",
		gridTemplateColumns: "minmax(0, 1fr) auto",
		paddingBlockEnd: { ":not(:last-child)": space["3"], default: space["4"] },
		paddingBlockStart: space["4"],
		paddingInline: space["5"],
		rowGap: space.px,
	},
	panel: {
		boxSizing: "border-box",
		color: colors.content,
		flexGrow: 1,
		minWidth: 0,
		paddingBlockEnd: { ":not(:last-child)": space["4"], default: space["5"] },
		paddingBlockStart: {
			":not(:first-child)": space["0"],
			default: space["5"],
		},
		paddingInline: space["5"],
	},
	root: {
		animationDuration: {
			":focus-visible": focusMotion.duration,
		},
		animationName: {
			":focus-visible": focusMotion.ring,
		},
		// A card is a raised panel: surface color, hairline edge, soft drop.
		backgroundColor: colors.surface,
		borderColor: colors.border,
		borderRadius: shape.surfaceRadius,
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxShadow: shadows.surface,
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
		fontSize: fontSize["14"],
		fontWeight: fontWeight.semibold,
		gridColumn: "1",
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
		marginBlock: 0,
		minInlineSize: 0,
		overflowWrap: "anywhere",
		textWrap: "balance",
	},
});
