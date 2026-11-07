import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import {
	borderWidth,
	focus,
	focusMotion,
	focusOutline,
} from "../../styles/interaction.stylex";
import { duration, easing } from "../../styles/motion.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";

// A 6px thumb with 2px of padding on each side.
const scrollbarSize = "0.625rem";

export const scrollAreaStyles = create({
	content: {
		boxSizing: "border-box",
	},
	contentFill: {
		height: "100%",
		width: "100%",
	},
	corner: {
		backgroundColor: "transparent",
	},
	// A flex column, so the viewport shrinks to the root's used height even
	// when the root's own height comes only from a parent's max-height, as in
	// a menu or a combobox popup. A percentage height cannot do that.
	root: {
		borderRadius: "inherit",
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "column",
		height: "100%",
		minHeight: 0,
		minWidth: 0,
		position: "relative",
		width: "100%",
	},
	rootFadeFocus: {
		animationDuration: {
			":has(> [data-slot=scroll-area-viewport]:focus-visible)":
				focusMotion.duration,
		},
		animationName: {
			":has(> [data-slot=scroll-area-viewport]:focus-visible)":
				focusMotion.ring,
		},
		outlineColor: {
			":has(> [data-slot=scroll-area-viewport]:focus-visible)":
				colors.focusRing,
			default: "transparent",
		},
		outlineOffset: focus.offset,
		outlineStyle: "solid",
		outlineWidth: borderWidth.focus,
	},
	scrollbar: {
		boxSizing: "border-box",
		display: "flex",
		margin: space.px,
		opacity: {
			":active": 1,
			":has(:active)": 1,
			":is([data-hovering])": 1,
			":is([data-scrolling])": 1,
			":is([data-slot=scroll-area]:focus-within *)": 1,
			default: 0,
		},
		padding: space.px,
		transitionDelay: {
			":active": "0ms",
			":has(:active)": "0ms",
			":is([data-hovering])": "0ms",
			":is([data-scrolling])": "0ms",
			":is([data-slot=scroll-area]:focus-within *)": "0ms",
			default: "300ms",
		},
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "opacity",
		transitionTimingFunction: easing.expoOut,
	},
	scrollbarHorizontal: {
		flexDirection: "column",
		height: scrollbarSize,
	},
	scrollbarVertical: {
		width: scrollbarSize,
	},
	thumb: {
		backgroundColor: {
			":active": colors.mutedContent,
			":hover": { [conditions.canHover]: colors.mutedContent },
			default: colors.controlBorderStrong,
		},
		borderRadius: shape.controlRadius,
		height: "100%",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "background-color",
		transitionTimingFunction: easing.expoOut,
		width: "100%",
	},
	// Positioned, so absolutely placed content inside, such as visually
	// hidden text, scrolls and clips with it instead of stretching the page.
	viewport: {
		animationDuration: {
			":focus-visible": focusMotion.duration,
		},
		animationName: {
			":focus-visible": focusMotion.ring,
		},
		borderRadius: "inherit",
		boxSizing: "border-box",
		flexGrow: 1,
		height: "100%",
		minHeight: 0,
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
		position: "relative",
		width: "100%",
	},
	viewportFade: {
		maskComposite: "intersect",
		maskImage:
			"linear-gradient(to right, transparent, black min(1.5rem, var(--scroll-area-overflow-x-start, 0px)), black calc(100% - min(1.5rem, var(--scroll-area-overflow-x-end, 0px))), transparent), linear-gradient(to bottom, transparent, black min(1.5rem, var(--scroll-area-overflow-y-start, 0px)), black calc(100% - min(1.5rem, var(--scroll-area-overflow-y-end, 0px))), transparent)",
		outlineWidth: 0,
	},
	viewportGutter: {
		paddingBottom: {
			":is([data-has-overflow-x] *)": space["4"],
			"[data-has-overflow-x]": space["4"],
			default: space["0"],
		},
		paddingInlineEnd: {
			":is([data-has-overflow-y] *)": space["4"],
			"[data-has-overflow-y]": space["4"],
			default: space["0"],
		},
	},
	viewportOverscrollContain: {
		overscrollBehaviorX: {
			":is([data-has-overflow-x] *)": "contain",
			"[data-has-overflow-x]": "contain",
			default: "auto",
		},
		overscrollBehaviorY: {
			":is([data-has-overflow-y] *)": "contain",
			"[data-has-overflow-y]": "contain",
			default: "auto",
		},
	},
});
