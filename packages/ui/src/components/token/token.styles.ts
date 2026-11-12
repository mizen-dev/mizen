import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { controlSize } from "../../styles/dimensions.stylex";
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
		inset: `calc(-1 * ${borderWidth.thin})`,
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
	lg: {
		"--mizen-token-remove-inset": "0px",
		"--mizen-token-size": controlSize.md,
		borderRadius: shape.controlRadiusLarge,
		fontSize: fontSize["16"],
	},
	md: {
		"--mizen-token-remove-inset": "0px",
		"--mizen-token-size": controlSize.sm,
		borderRadius: shape.controlRadius,
		fontSize: fontSize["14"],
	},
	// A 24px target whose gap to the token's end edge equals its gap to the
	// top and bottom edges, so its corners stay concentric with the token's.
	remove: {
		alignItems: "center",
		animationDuration: {
			":focus-visible": focusMotion.duration,
		},
		animationName: {
			":focus-visible": focusMotion.ring,
		},
		backgroundClip: "content-box",
		backgroundColor: {
			":hover": {
				[conditions.canHover]:
					"color-mix(in oklch, currentColor 12%, transparent)",
			},
			default: "transparent",
		},
		borderRadius: shape.controlRadiusSmall,
		borderWidth: 0,
		boxSizing: "border-box",
		color: "inherit",
		cursor: "pointer",
		display: "inline-flex",
		flexShrink: 0,
		height: controlSize.xs,
		justifyContent: "center",
		marginBlock: `calc(-1 * ${borderWidth.thin})`,
		marginInlineEnd: `calc((var(--mizen-token-size) - ${controlSize.xs}) / 2 - ${space["1"]} - ${borderWidth.thin})`,
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: focus.offset,
		outlineStyle: "solid",
		outlineWidth: borderWidth.focus,
		padding: "var(--mizen-token-remove-inset)",
		position: "relative",
		width: controlSize.xs,
		zIndex: 1,
	},
	root: {
		alignItems: "center",
		backgroundColor: colors.controlSurface,
		borderColor: "transparent",
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
		minHeight: "var(--mizen-token-size)",
		minWidth: 0,
		paddingInline: space["1"],
		position: "relative",
		verticalAlign: "middle",
	},
	// The small token is as tall as its remove button. The button paints 2px
	// inside its own box, so its hover surface keeps the same gap to the edge.
	sm: {
		"--mizen-token-remove-inset": "2px",
		"--mizen-token-size": controlSize.xs,
		borderRadius: shape.controlRadiusSmall,
		fontSize: fontSize["12"],
	},
	tint: (tone: string) => ({
		backgroundColor: `color-mix(in oklab, ${tone} 18%, ${colors.surface})`,
		borderColor: `color-mix(in oklab, ${tone} 28%, ${colors.surface})`,
		color: `color-mix(in oklab, ${tone} 45%, ${colors.content})`,
	}),
});
