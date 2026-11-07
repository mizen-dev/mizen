import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { borderWidth } from "../../styles/interaction.stylex";
import { duration, easing } from "../../styles/motion.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";

// Lines bleed into the gutter by their padding, so favicons line up with the
// text around them while the hover fill has room.
const BLEED = space["2"];

const line = {
	alignItems: "center",
	backgroundColor: {
		[conditions.canHover]: {
			":hover": colors.controlSurfaceHover,
			default: "transparent",
		},
		default: "transparent",
	},
	borderRadius: shape.controlRadius,
	color: colors.content,
	display: "flex",
	gap: space["2"],
	minBlockSize: space["8"],
	minInlineSize: 0,
	outlineColor: {
		":focus-visible": colors.focusRing,
		default: "transparent",
	},
	outlineOffset: -2,
	outlineStyle: { ":focus-visible": "solid", default: "none" },
	outlineWidth: borderWidth.focus,
	paddingBlock: space["1"],
	paddingInline: BLEED,
	textDecoration: "none",
} as const;

export const sourcesStyles = create({
	chevron: {
		color: colors.mutedContent,
		flexShrink: 0,
		transform: {
			":is([data-panel-open] *)": "rotate(180deg)",
			default: "none",
		},
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.disclosure,
		},
		transitionProperty: "transform",
		transitionTimingFunction: easing.expoOut,
	},
	// The count grows while a reply streams.
	count: { fontVariantNumeric: "tabular-nums" },
	domain: {
		color: colors.mutedContent,
		marginInlineStart: "auto",
		whiteSpace: "nowrap",
	},
	list: {
		display: "flex",
		flexDirection: "column",
		gap: 2,
		listStyle: "none",
		margin: 0,
		padding: 0,
	},
	root: { marginInline: `calc(-1 * ${BLEED})`, minInlineSize: 0 },
	row: line,
	// Overlapping favicons; the first three show who answered.
	stack: { display: "flex" },
	// Each icon sits on a small disc, ringed in the surface color, so
	// overlapping icons read as separate.
	stackIcon: {
		alignItems: "center",
		backgroundColor: colors.controlSurface,
		blockSize: 18,
		borderRadius: "50%",
		boxShadow: `0 0 0 1.5px ${colors.surface}`,
		display: "inline-flex",
		inlineSize: 18,
		justifyContent: "center",
		marginInlineStart: { ":not(:first-child)": -5, default: 0 },
		overflow: "hidden",
	},
	title: {
		minInlineSize: 0,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	trigger: {
		...line,
		appearance: "none",
		borderWidth: 0,
		cursor: "pointer",
		gap: space["2"],
		inlineSize: "fit-content",
		margin: 0,
		maxInlineSize: "100%",
		textAlign: "start",
	},
});
