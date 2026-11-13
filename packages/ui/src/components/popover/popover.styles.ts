import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { borderWidth } from "../../styles/interaction.stylex";
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

export const popoverStyles = create({
	description: {
		color: colors.mutedContent,
		fontSize: fontSize["13"],
		fontWeight: fontWeight.regular,
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
		marginBlockEnd: 0,
		// A description right after its title sits 2px below it, not at the
		// 16px content gap.
		marginBlockStart: {
			":is([data-slot='popover-title'] + *)": `calc(${space.px} - ${space["4"]})`,
			default: 0,
		},
		overflowWrap: "anywhere",
		textWrap: "pretty",
	},
	popup: {
		backgroundColor: colors.floatingSurface,
		borderColor: {
			[conditions.moreContrast]: colors.controlBorderStrong,
			default: colors.border,
		},
		borderRadius: shape.floatingRadius,
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxShadow: shadows.floating,
		boxSizing: "border-box",
		color: colors.content,
		display: "grid",
		// Base UI sets --popup-width to auto, so the column holds the default
		// width: 18rem with the border, wider only when the content cannot
		// shrink, and narrower when the popup has less room.
		gridTemplateColumns: `minmax(min-content, calc(18rem - 2 * ${borderWidth.thin}))`,
		height: "var(--popup-height, auto)",
		maxWidth: "min(var(--available-width), calc(100vw - 2rem))",
		opacity: {
			"[data-ending-style]": 0,
			"[data-starting-style]": 0,
			default: 1,
		},
		outline: "none",
		position: "relative",
		transform: {
			"[data-ending-style][data-side='bottom']":
				"translateY(-0.25rem) scale(0.98)",
			"[data-ending-style][data-side='inline-end']":
				"translateX(-0.25rem) scale(0.98)",
			"[data-ending-style][data-side='inline-start']":
				"translateX(0.25rem) scale(0.98)",
			"[data-ending-style][data-side='left']":
				"translateX(0.25rem) scale(0.98)",
			"[data-ending-style][data-side='right']":
				"translateX(-0.25rem) scale(0.98)",
			"[data-ending-style][data-side='top']": "translateY(0.25rem) scale(0.98)",
			"[data-starting-style][data-side='bottom']":
				"translateY(-0.25rem) scale(0.98)",
			"[data-starting-style][data-side='inline-end']":
				"translateX(-0.25rem) scale(0.98)",
			"[data-starting-style][data-side='inline-start']":
				"translateX(0.25rem) scale(0.98)",
			"[data-starting-style][data-side='left']":
				"translateX(0.25rem) scale(0.98)",
			"[data-starting-style][data-side='right']":
				"translateX(-0.25rem) scale(0.98)",
			"[data-starting-style][data-side='top']":
				"translateY(0.25rem) scale(0.98)",
			default: "none",
		},
		transformOrigin: "var(--transform-origin)",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			"[data-ending-style]": duration.overlayExit,
			"[data-instant]": duration.instant,
			default: duration.overlayEnter,
		},
		transitionProperty: "width, height, opacity, transform",
		transitionTimingFunction: easing.expoOut,
		width: "var(--popup-width, auto)",
	},
	popupBare: {
		backgroundColor: "transparent",
		borderColor: "transparent",
		borderStyle: "none",
		borderWidth: 0,
		boxShadow: "none",
		gap: space["0"],
		gridTemplateColumns: "auto",
		padding: space["0"],
	},
	popupTooltip: {
		borderRadius: shape.controlRadius,
		fontSize: fontSize["12"],
		gridTemplateColumns: "auto",
		letterSpacing: letterSpacing.caption,
		width: "var(--popup-width, max-content)",
	},
	positioner: {
		height: "var(--positioner-height)",
		maxWidth: "min(var(--available-width), calc(100vw - 2rem))",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			"[data-instant]": duration.instant,
			default: duration.overlayEnter,
		},
		transitionProperty: "top, left, right, bottom, transform",
		transitionTimingFunction: easing.expoOut,
		width: "var(--positioner-width)",
		zIndex: 50,
	},
	positionerBare: {
		width: "auto",
	},
	title: {
		color: colors.content,
		fontSize: fontSize["14"],
		fontWeight: fontWeight.semibold,
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
		marginBlock: 0,
		overflowWrap: "anywhere",
		textWrap: "balance",
	},
	viewport: {
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "column",
		gap: space["4"],
		height: "100%",
		maxHeight: "var(--available-height)",
		overflowX: "clip",
		overflowY: { "[data-transitioning]": "clip", default: "auto" },
		overscrollBehavior: "contain",
		// Compact floating surface: 16px inset, subheading title.
		padding: space["4"],
		position: "relative",
		width: "100%",
	},
	viewportBare: { gap: 0, padding: 0 },
	viewportContent: {
		display: { ":is(*) > :is([data-current], [data-previous])": "flex" },
		flexDirection: {
			":is(*) > :is([data-current], [data-previous])": "column",
		},
		gap: { ":is(*) > :is([data-current], [data-previous])": space["4"] },
		opacity: {
			":is(*) > :is([data-current], [data-previous])": 1,
			":is(*) > :is([data-current], [data-previous]):is([data-starting-style], [data-ending-style])": 0,
		},
		transitionDuration: {
			[conditions.reducedMotion]: {
				":is(*) > :is([data-current], [data-previous])": duration.instant,
			},
			":is(*) > :is([data-current], [data-previous])": duration.overlayEnter,
		},
		transitionProperty: {
			":is(*) > :is([data-current], [data-previous])": "opacity",
		},
	},
	viewportContentBare: {
		gap: { ":is(*) > :is([data-current], [data-previous])": 0 },
	},
	viewportContentTooltip: {
		gap: { ":is(*) > :is([data-current], [data-previous])": space["1"] },
	},
	viewportTooltip: {
		gap: space["1"],
		paddingBlock: space["1"],
		paddingInline: space["3"],
	},
});
