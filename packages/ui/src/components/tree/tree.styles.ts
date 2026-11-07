import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import {
	borderWidth,
	focus,
	focusMotion,
	opacity,
} from "../../styles/interaction.stylex";
import { duration, easing } from "../../styles/motion.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import { fontWeight, lineHeight } from "../../styles/typography.stylex";

// Rows are 32px. The chevron sits 8px in, so its center is 16px from the
// row edge; each group draws its guide there and steps children 24px in.
const GUIDE_INSET = "calc(1rem - 0.5px)";

export const treeStyles = create({
	chevronIcon: {
		blockSize: "1rem",
		inlineSize: "1rem",
		rotate: { ":is([data-expanded] > *)": "90deg", default: "0deg" },
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "rotate",
		transitionTimingFunction: easing.expoOut,
	},
	group: {
		borderInlineStartColor: colors.border,
		borderInlineStartStyle: "solid",
		borderInlineStartWidth: borderWidth.thin,
		display: "flex",
		flexDirection: "column",
		gap: space.px,
		listStyleType: "none",
		marginBlock: 0,
		marginBlockStart: space.px,
		marginInlineStart: GUIDE_INSET,
		minInlineSize: 0,
		paddingBlock: 0,
		paddingInlineStart: "calc(0.5rem - 0.5px)",
	},
	// Muted by default; the selected row tints its icon with its label.
	icon: {
		alignItems: "center",
		blockSize: "1rem",
		color: {
			":is([data-selected] > *)": "inherit",
			default: colors.mutedContent,
		},
		display: "inline-flex",
		flexShrink: 0,
		inlineSize: "1rem",
		justifyContent: "center",
	},
	indicator: {
		alignItems: "center",
		blockSize: "1rem",
		color: colors.mutedContent,
		display: "inline-flex",
		flexShrink: 0,
		inlineSize: "1rem",
		justifyContent: "center",
		transform: { ":dir(rtl)": "scaleX(-1)", default: "none" },
	},
	item: { listStyleType: "none", minInlineSize: 0 },
	label: {
		fontWeight: {
			":is([data-selected] > *)": fontWeight.medium,
			default: fontWeight.regular,
		},
		minInlineSize: 0,
		overflowWrap: "anywhere",
	},
	root: {
		animationDuration: { ":focus-visible": focusMotion.duration },
		animationName: { ":focus-visible": focusMotion.ring },
		boxSizing: "border-box",
		color: colors.content,
		display: "flex",
		flexDirection: "column",
		gap: space.px,
		inlineSize: "100%",
		listStyleType: "none",
		margin: 0,
		minInlineSize: 0,
		outlineColor: colors.focusRing,
		outlineOffset: focus.offset,
		outlineStyle: { ":focus-visible": "solid", default: "none" },
		outlineWidth: borderWidth.focus,
		paddingInlineStart: 0,
	},
	row: {
		alignItems: "center",
		backgroundColor: {
			":is([data-selected])": colors.brandBackground,
			":not([data-selected]):not([data-disabled]):hover":
				colors.controlSurfaceHover,
			default: "transparent",
		},
		borderRadius: shape.controlRadius,
		boxSizing: "border-box",
		color: {
			":is([data-selected])": colors.brandForeground,
			default: colors.content,
		},
		cursor: { ":is([data-disabled])": "not-allowed", default: "pointer" },
		display: "flex",
		gap: space["2"],
		minBlockSize: "2rem",
		minInlineSize: 0,
		opacity: { ":is([data-disabled])": opacity.disabled, default: 1 },
		outlineColor: colors.focusRing,
		outlineOffset: -1,
		// The keyboard row shows a ring; a mouse click shows the selection only.
		outlineStyle: {
			":is([role='tree']:focus-visible [data-active])": "solid",
			default: "none",
		},
		outlineWidth: 1,
		overflowWrap: "anywhere",
		paddingBlock: `calc((2rem - ${lineHeight["20"]}) / 2)`,
		paddingInline: space["2"],
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "background-color, color",
	},
});
