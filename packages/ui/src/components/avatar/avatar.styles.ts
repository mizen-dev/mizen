import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { controlSize } from "../../styles/dimensions.stylex";
import { palette } from "../../styles/palette.stylex";
import { space } from "../../styles/spacing.stylex";
import {
	fontSize,
	fontWeight,
	letterSpacing,
	lineHeight,
} from "../../styles/typography.stylex";

export const avatarStyles = create({
	defaultSize: {
		fontSize: fontSize["12"],
		height: controlSize.md,
		letterSpacing: letterSpacing.caption,
		width: controlSize.md,
	},
	fallback: {
		alignItems: "center",
		backgroundColor: colors.secondary,
		boxSizing: "border-box",
		color: colors.secondaryContent,
		display: "flex",
		fontWeight: fontWeight.medium,
		height: "100%",
		insetBlock: 0,
		insetInline: 0,
		justifyContent: "center",
		lineHeight: lineHeight.none,
		position: "absolute",
		width: "100%",
	},
	group: {
		alignItems: "center",
		boxSizing: "border-box",
		display: "inline-flex",
		flexDirection: "row",
	},
	// Grouped avatars overlap by an eighth of their size, so two-letter
	// initials stay readable beside the 2px separating ring.
	groupOverlapDefault: {
		marginInlineStart: {
			":not(:first-child)": `calc(-0.125 * ${controlSize.md})`,
			default: space["0"],
		},
	},
	groupOverlapLg: {
		marginInlineStart: {
			":not(:first-child)": `calc(-0.125 * ${controlSize.lg})`,
			default: space["0"],
		},
	},
	groupOverlapSm: {
		marginInlineStart: {
			":not(:first-child)": `calc(-0.125 * ${controlSize.xs})`,
			default: space["0"],
		},
	},
	groupRing: {
		boxShadow: `0 0 0 2px ${colors.surface}`,
	},
	image: {
		boxSizing: "border-box",
		display: {
			"[data-error]": "none",
			"[data-loading]": "none",
			default: "block",
		},
		height: "100%",
		objectFit: "cover",
		width: "100%",
	},
	lg: {
		fontSize: fontSize["14"],
		height: controlSize.lg,
		letterSpacing: letterSpacing.ui,
		width: controlSize.lg,
	},
	root: {
		alignItems: "center",
		backgroundColor: colors.secondary,
		borderRadius: "9999px",
		boxSizing: "border-box",
		color: colors.secondaryContent,
		display: "inline-flex",
		flexShrink: 0,
		fontWeight: fontWeight.medium,
		justifyContent: "center",
		lineHeight: lineHeight.none,
		overflow: "hidden",
		position: "relative",
		userSelect: "none",
		verticalAlign: "middle",
	},
	sm: {
		fontSize: fontSize["12"],
		height: controlSize.xs,
		letterSpacing: letterSpacing.caption,
		width: controlSize.xs,
	},
});

export const avatarFallbackColors = create({
	blue: {
		backgroundColor: `color-mix(in oklab, ${palette.blue700} 18%, ${colors.surface})`,
		color: `color-mix(in oklab, ${palette.blue700} 45%, ${colors.content})`,
	},
	green: {
		backgroundColor: `color-mix(in oklab, ${palette.green700} 18%, ${colors.surface})`,
		color: `color-mix(in oklab, ${palette.green700} 45%, ${colors.content})`,
	},
	orange: {
		backgroundColor: `color-mix(in oklab, ${palette.orange700} 18%, ${colors.surface})`,
		color: `color-mix(in oklab, ${palette.orange700} 45%, ${colors.content})`,
	},
	purple: {
		backgroundColor: `color-mix(in oklab, ${palette.violet700} 18%, ${colors.surface})`,
		color: `color-mix(in oklab, ${palette.violet700} 45%, ${colors.content})`,
	},
});
