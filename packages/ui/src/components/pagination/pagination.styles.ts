import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import {
	borderWidth,
	focus,
	focusMotion,
} from "../../styles/interaction.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import {
	fontSize,
	fontWeight,
	lineHeight,
} from "../../styles/typography.stylex";

export const paginationStyles = create({
	active: {
		backgroundColor: {
			default: colors.brandBackground,
			[conditions.forcedColors]: "Highlight",
		},
		color: {
			default: colors.brandForeground,
			[conditions.forcedColors]: "HighlightText",
		},
		forcedColorAdjust: { default: "auto", [conditions.forcedColors]: "none" },
	},
	content: {
		alignItems: "center",
		display: "flex",
		flexWrap: "wrap",
		gap: space["1"],
		justifyContent: "center",
		listStyle: "none",
		margin: 0,
		minWidth: 0,
		padding: 0,
	},
	// Phones show chevrons only, so the pager stays on one line; the links
	// keep their names through aria-label.
	directionLabel: {
		display: { [conditions.sm]: "inline", default: "none" },
	},
	disabled: {
		color: colors.mutedContent,
		cursor: "not-allowed",
		opacity: 0.5,
	},
	ellipsis: {
		alignItems: "center",
		display: "inline-flex",
		justifyContent: "center",
		minBlockSize: "2.25rem",
		minInlineSize: "2.25rem",
		userSelect: "none",
	},
	icon: {
		flex: "none",
		height: "1rem",
		transform: {
			":dir(rtl)": "scaleX(-1)",
			":is([dir='rtl'] *):not(:is([dir='ltr'] *))": "scaleX(-1)",
			default: "none",
		},
		width: "1rem",
	},
	iconSize: {
		blockSize: "2.25rem",
		inlineSize: "2.25rem",
		padding: 0,
	},
	interactive: {
		backgroundColor: {
			[conditions.canHover]: {
				":hover:not(:active):not([aria-current])": colors.secondary,
			},
			":active:not([aria-current])": colors.controlSurfaceHover,
			default: "transparent",
		},
	},
	item: { minWidth: 0 },
	labelled: { paddingInline: space["3"] },
	link: {
		alignItems: "center",
		animationDuration: {
			":focus-visible": focusMotion.duration,
		},
		animationName: {
			":focus-visible": focusMotion.ring,
		},
		backgroundColor: "transparent",
		borderRadius: shape.controlRadiusLarge,
		boxSizing: "border-box",
		color: colors.content,
		display: "inline-flex",
		fontSize: "inherit",
		fontVariantNumeric: "tabular-nums",
		fontWeight: fontWeight.medium,
		// Matches Button's icon gap at the same 36px control size.
		gap: space["2"],
		justifyContent: "center",
		maxWidth: "100%",
		minBlockSize: "2.25rem",
		minInlineSize: "2.25rem",
		minWidth: 0,
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: { ":focus-visible": focus.offset, default: 0 },
		outlineStyle: { ":focus-visible": "solid", default: "none" },
		outlineWidth: { ":focus-visible": borderWidth.focus, default: 0 },
		overflowWrap: "anywhere",
		paddingBlock: 0,
		paddingInline: space["2"],
		textAlign: "center",
		textDecoration: "none",
	},
	root: {
		color: colors.mutedContent,
		// Control role: 36px links carry 16/24 text, like Button md.
		fontSize: fontSize["16"],
		lineHeight: lineHeight["24"],
		maxWidth: "100%",
	},
	srOnly: {
		clip: "rect(0, 0, 0, 0)",
		clipPath: "inset(50%)",
		height: 1,
		margin: -1,
		overflow: "hidden",
		position: "absolute",
		whiteSpace: "nowrap",
		width: 1,
	},
});
