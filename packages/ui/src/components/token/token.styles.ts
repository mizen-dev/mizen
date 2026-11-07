import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import {
	borderWidth,
	focus,
	focusMotion,
	opacity,
} from "../../styles/interaction.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import {
	fontSize,
	fontWeight,
	lineHeight,
} from "../../styles/typography.stylex";

export const tokenStyles = create({
	action: {
		animationDuration: {
			":focus-visible": focusMotion.duration,
		},
		animationName: {
			":focus-visible": focusMotion.ring,
		},
		// Tints with the token's own ink, so hover reads in light and dark.
		backgroundColor: {
			":hover": {
				[conditions.canHover]:
					"color-mix(in oklch, currentColor 6%, transparent)",
			},
			default: "transparent",
		},
		borderColor: {
			[conditions.forcedColors]: "ButtonText",
			default: "transparent",
		},
		borderRadius: "inherit",
		borderStyle: "solid",
		borderWidth: 0,
		cursor: "pointer",
		// Covers the token's border: the hit area is the whole visible chip.
		inset: `calc(-1 * ${borderWidth.thin}px)`,
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: focus.offset,
		outlineStyle: "solid",
		outlineWidth: borderWidth.focus,
		padding: 0,
		position: "absolute",
	},
	adornment: {
		alignItems: "center",
		display: "inline-flex",
		flexShrink: 0,
		justifyContent: "center",
		pointerEvents: "none",
	},
	disabled: { opacity: opacity.disabled },
	label: {
		// Keep glyph ink outside the trimmed cap box inside the overflow clip.
		marginBlock: "-0.5em",
		minWidth: 0,
		overflow: "hidden",
		paddingBlock: "0.5em",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	lg: { fontSize: fontSize["16"], minHeight: "2rem" },
	md: { fontSize: fontSize["14"], minHeight: "1.75rem" },
	remove: {
		alignItems: "center",
		animationDuration: {
			":focus-visible": focusMotion.duration,
		},
		animationName: {
			":focus-visible": focusMotion.ring,
		},
		backgroundColor: {
			":hover": {
				[conditions.canHover]:
					"color-mix(in oklch, currentColor 12%, transparent)",
			},
			default: "transparent",
		},
		borderRadius: shape.controlRadius,
		borderWidth: 0,
		color: "inherit",
		cursor: "pointer",
		display: "inline-flex",
		flexShrink: 0,
		height: "1.5rem",
		justifyContent: "center",
		marginInlineEnd: "-0.25rem",
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: focus.offset,
		outlineStyle: "solid",
		outlineWidth: borderWidth.focus,
		padding: 0,
		position: "relative",
		width: "1.5rem",
		zIndex: 1,
	},
	root: {
		alignItems: "center",
		backgroundColor: colors.controlSurface,
		borderColor: "transparent",
		borderRadius: shape.controlRadius,
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxSizing: "border-box",
		color: colors.content,
		display: "inline-flex",
		fontFamily: "inherit",
		fontWeight: fontWeight.medium,
		gap: space["1"],
		lineHeight: lineHeight.none,
		maxWidth: "100%",
		minWidth: 0,
		paddingInline: space["1"],
		position: "relative",
		verticalAlign: "middle",
	},
	sm: { fontSize: fontSize["12"], minHeight: "1.5rem" },
	tint: (tone: string) => ({
		backgroundColor: `color-mix(in oklch, ${tone} 18%, ${colors.surface})`,
		borderColor: `color-mix(in oklch, ${tone} 28%, ${colors.surface})`,
		color: `color-mix(in oklch, ${tone} 45%, ${colors.content})`,
	}),
});
