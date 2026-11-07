import { create, keyframes } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import {
	borderWidth,
	focus,
	focusMotion,
	focusOutline,
} from "../../styles/interaction.stylex";
import { duration, easing } from "../../styles/motion.stylex";
import { space } from "../../styles/spacing.stylex";

// A slide is full size when snapped and recedes as it scrolls in or out.
const recede = keyframes({
	"0%": { opacity: 0.6, scale: 0.92 },
	"50%": { opacity: 1, scale: 1 },
	"100%": { opacity: 0.6, scale: 0.92 },
});
// Without scroll timelines the animation would run once and stay shrunk, so it
// applies only where the browser drives it from scrolling.
const SCROLL_TIMELINE = "@supports (animation-timeline: view())";

export const carouselStyles = create({
	dot: {
		backgroundColor: {
			":is(:hover:not([aria-current]) > *)": colors.mutedContent,
			":is([aria-current] > *)": colors.content,
			default: `color-mix(in oklch, ${colors.content} 24%, transparent)`,
		},
		blockSize: 6,
		borderRadius: 3,
		display: "block",
		inlineSize: { ":is([aria-current] > *)": 18, default: 6 },
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.disclosure,
		},
		transitionProperty: "inline-size, background-color",
		transitionTimingFunction: easing.expoOut,
	},
	icon: {
		transform: { ":dir(rtl)": "scaleX(-1)", default: "none" },
	},
	// Dots, with a 24px hit area around each; the current slide stretches to a
	// short pill, so position reads without color alone.
	indicator: {
		alignItems: "center",
		appearance: "none",
		backgroundColor: "transparent",
		blockSize: 24,
		borderWidth: 0,
		cursor: "pointer",
		display: "inline-flex",
		justifyContent: "center",
		margin: 0,
		minInlineSize: 16,
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: -2,
		outlineStyle: { ":focus-visible": "solid", default: "none" },
		outlineWidth: borderWidth.focus,
		padding: 0,
		paddingInline: space["1"],
	},
	indicators: {
		alignItems: "center",
		display: "flex",
		gap: 0,
		minWidth: 0,
	},
	item: {
		boxSizing: "border-box",
		flexBasis: "100%",
		flexGrow: 0,
		flexShrink: 0,
		minWidth: 0,
		scrollSnapAlign: "start",
	},
	root: {
		minWidth: 0,
		width: "100%",
	},
	surface: {
		animationDuration: { [SCROLL_TIMELINE]: "1ms", default: null },
		animationFillMode: { [SCROLL_TIMELINE]: "both", default: null },
		animationName: {
			[conditions.reducedMotion]: "none",
			[SCROLL_TIMELINE]: recede,
			default: "none",
		},
		animationTimeline: { [SCROLL_TIMELINE]: "view(inline)", default: null },
		animationTimingFunction: { [SCROLL_TIMELINE]: "linear", default: null },
		// Fills slides that stretch to the tallest one in the track.
		blockSize: "100%",
	},
	track: {
		display: "flex",
		gap: space["3"],
		minWidth: 0,
	},
	viewport: {
		animationDuration: {
			":focus-visible": focusMotion.duration,
		},
		animationName: {
			":focus-visible": focusMotion.ring,
		},
		borderRadius: "inherit",
		boxSizing: "border-box",
		// A mouse can drag slides; while it does, snapping waits for the release.
		cursor: { "[data-dragging]": "grabbing", default: "grab" },
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: {
			":focus-visible": focus.offset,
			default: focus.offset,
		},
		outlineStyle: {
			":focus-visible": "solid",
			default: focusOutline.restingOutlineStyle,
		},
		outlineWidth: {
			":focus-visible": borderWidth.focus,
			default: borderWidth.focus,
		},
		overflowX: "auto",
		overscrollBehaviorX: "contain",
		// Indicators and arrows show position, so the native bar stays hidden.
		scrollbarWidth: "none",
		scrollSnapType: {
			":is([data-dragging], [data-settling])": "none",
			default: "x mandatory",
		},
		touchAction: "pan-x pan-y",
		userSelect: { "[data-dragging]": "none", default: null },
		width: "100%",
	},
});
