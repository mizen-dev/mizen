import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { controlSize } from "../../styles/dimensions.stylex";
import { borderWidth } from "../../styles/interaction.stylex";
import { duration, easing } from "../../styles/motion.stylex";
import { shadows } from "../../styles/shadows.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import { fontWeight } from "../../styles/typography.stylex";

// Rail ticks: 12px apart, each a 1px line up to 16px long. The rows are
// below the 24px control height on purpose: scrolling reaches every turn
// too, which WCAG 2.5.8 accepts as an equivalent.
const TICK_ROW = space["3"];

export const messageScrollerStyles = create({
	// The Scroll Area takes the space its frame leaves, and never grows
	// wider than the frame, whatever a row inside it wants.
	area: { flexGrow: 1, minBlockSize: 0, minInlineSize: 0 },
	// Centered over the bottom of the transcript; it rises into view when
	// there is something below and sinks out when the view is at the end.
	button: {
		backgroundColor: colors.floatingSurface,
		borderColor: colors.border,
		borderEndEndRadius: 9999,
		borderEndStartRadius: 9999,
		borderStartEndRadius: 9999,
		borderStartStartRadius: 9999,
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxShadow: shadows.floating,
		insetBlockEnd: space["3"],
		insetInlineStart: "50%",
		opacity: { ":is([data-active])": 1, default: 0 },
		position: "absolute",
		transform: {
			":is([data-active])": "translateX(-50%)",
			default: `translate(-50%, ${space["2"]})`,
		},
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "opacity, transform",
		transitionTimingFunction: easing.expoOut,
		zIndex: 1,
	},
	// Messages 12px apart; Conversation spaces agent turns 24px apart.
	content: {
		display: "flex",
		flexDirection: "column",
		gap: {
			":is([data-slot='conversation-content'] *)": space["6"],
			default: space["3"],
		},
	},
	// Floats along the end edge of the nearest positioned box, centered on
	// it, clear of the scroll thumb at the very edge.
	navigation: {
		display: "flex",
		flexDirection: "column",
		insetBlock: space["3"],
		insetInlineEnd: space["2"],
		justifyContent: "center",
		position: "absolute",
		zIndex: 1,
	},
	// The turn's text over the start of its reply, two lines at most.
	preview: {
		display: "flex",
		flexDirection: "column",
		gap: space["1"],
		inlineSize: "16rem",
		maxInlineSize: "100%",
		paddingBlock: space["2"],
		paddingInline: space["3"],
	},
	previewReply: {
		color: colors.mutedContent,
		display: "-webkit-box",
		overflow: "hidden",
		WebkitBoxOrient: "vertical",
		WebkitLineClamp: 2,
	},
	previewTitle: {
		color: colors.content,
		fontWeight: fontWeight.medium,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	// Fills a parent with a bounded height; the button floats inside it.
	root: {
		blockSize: "100%",
		display: "flex",
		flexDirection: "column",
		minBlockSize: 0,
		minInlineSize: 0,
		position: "relative",
	},
	// At least as tall as the view, so an empty state can center in it.
	scrollContent: { minBlockSize: "100%" },
	// The preview appears and moves without a transition.
	still: { transitionDuration: duration.instant },
	// One row per turn; the line ends at the row's end edge.
	tick: {
		alignItems: "center",
		appearance: "none",
		backgroundColor: "transparent",
		blockSize: TICK_ROW,
		borderRadius: shape.inlineRadius,
		borderWidth: 0,
		cursor: "pointer",
		display: "flex",
		inlineSize: controlSize.xs,
		justifyContent: "flex-end",
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: `-${borderWidth.focus}px`,
		outlineStyle: { ":focus-visible": "solid", default: "none" },
		outlineWidth: borderWidth.focus,
		padding: 0,
		paddingInlineEnd: space["1"],
	},
	// Full length and full ink in focus; with distance it shortens to 12, 8,
	// and 4px and fades toward muted ink. It eases over duration.disclosure,
	// so the length and ink glide after the pointer instead of snapping.
	tickLine: {
		backgroundColor: {
			":is([data-near='0'] *)": colors.content,
			":is([data-near='1'] *)": `color-mix(in oklab, ${colors.content} 66%, ${colors.mutedContent})`,
			":is([data-near='2'] *)": `color-mix(in oklab, ${colors.content} 33%, ${colors.mutedContent})`,
			default: colors.mutedContent,
		},
		blockSize: 1,
		inlineSize: space["4"],
		transform: {
			":is([data-near='0'] *)": "none",
			":is([data-near='1'] *)": "scaleX(0.75)",
			":is([data-near='2'] *)": "scaleX(0.5)",
			default: "scaleX(0.25)",
		},
		transformOrigin: "right",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.disclosure,
		},
		transitionProperty: "transform, background-color",
		transitionTimingFunction: easing.expoOut,
	},
	ticks: {
		display: "flex",
		flexDirection: "column",
		listStyle: "none",
		margin: 0,
		maxBlockSize: "100%",
		overflowY: "auto",
		padding: 0,
		scrollbarWidth: "none",
	},
	// The store holds the reader's place, so the browser's own anchoring is
	// off to avoid moving twice. The focus ring sits inside the edge.
	viewport: {
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: `-${borderWidth.focus}px`,
		outlineStyle: { ":focus-visible": "solid", default: "none" },
		outlineWidth: borderWidth.focus,
		overflowAnchor: "none",
		overscrollBehaviorY: "contain",
	},
});
