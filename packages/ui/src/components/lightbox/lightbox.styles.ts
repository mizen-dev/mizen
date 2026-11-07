import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { borderWidth, focus } from "../../styles/interaction.stylex";
import { duration, easing } from "../../styles/motion.stylex";
import { shadows } from "../../styles/shadows.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";

const ROUND = "9999px";
// Room for Close above the image and the paging pill below it: each sits
// 16px from the edge and keeps 24px clear of the photo.
const CHROME = `calc(${space["4"]} + ${space["10"]} + ${space["6"]})`;

const enterExit = {
	transitionDuration: {
		[conditions.reducedMotion]: duration.instant,
		"[data-ending-style]": duration.overlayExit,
		default: duration.overlayEnter,
	},
	transitionTimingFunction: {
		"[data-ending-style]": easing.easeInOut,
		default: easing.expoOut,
	},
} as const;

export const lightboxStyles = create({
	// A near-black scrim in both themes, so photos read at their true colors.
	backdrop: {
		...enterExit,
		backdropFilter: {
			[conditions.forcedColors]: "none",
			"@media (prefers-reduced-transparency: reduce)": "none",
			default: "blur(4px)",
		},
		backgroundColor: `color-mix(in srgb, ${colors.backdrop} 86%, transparent)`,
		inset: 0,
		opacity: {
			"[data-ending-style]": 0,
			"[data-starting-style]": 0,
			default: 1,
		},
		position: "fixed",
		transitionProperty: "opacity",
		zIndex: 0,
	},
	chevron: {
		transform: { ":dir(rtl)": "scaleX(-1)", default: "none" },
	},
	close: {
		borderColor: colors.border,
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxShadow: shadows.floating,
		insetBlockStart: space["4"],
		insetInlineEnd: space["4"],
		position: "absolute",
	},
	// Round floating buttons: Close, and Previous and Next inside the pill.
	control: {
		alignItems: "center",
		appearance: "none",
		backgroundColor: {
			[conditions.canHover]: {
				":hover": colors.controlSurfaceHover,
				default: colors.floatingSurface,
			},
			default: colors.floatingSurface,
		},
		blockSize: space["10"],
		borderRadius: ROUND,
		borderWidth: 0,
		boxSizing: "border-box",
		color: colors.content,
		cursor: "pointer",
		display: "inline-flex",
		inlineSize: space["10"],
		justifyContent: "center",
		margin: 0,
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: { ":focus-visible": focus.offset, default: 0 },
		outlineStyle: { ":focus-visible": "solid", default: "none" },
		outlineWidth: borderWidth.focus,
		padding: 0,
		pointerEvents: "auto",
	},
	// Keeps the counter from shifting the buttons as "9 of 10" becomes "10 of 10".
	counter: {
		color: colors.mutedContent,
		fontVariantNumeric: "tabular-nums",
		minInlineSize: "4.5rem",
		textAlign: "center",
	},
	gallery: {
		display: "grid",
		gap: space["2"],
		gridTemplateColumns: "repeat(auto-fit, minmax(7rem, 1fr))",
		listStyle: "none",
		margin: 0,
		minInlineSize: 0,
		padding: 0,
	},
	galleryCell: { display: "grid", minInlineSize: 0 },
	galleryImage: {
		blockSize: "100%",
		display: "block",
		inlineSize: "100%",
		objectFit: "cover",
		opacity: {
			[conditions.canHover]: { ":hover": 0.88, default: 1 },
			default: 1,
		},
	},
	galleryItem: {
		appearance: "none",
		aspectRatio: "1",
		backgroundColor: colors.workarea,
		borderRadius: shape.controlRadiusLarge,
		borderWidth: 0,
		cursor: "zoom-in",
		margin: 0,
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: 2,
		outlineStyle: { ":focus-visible": "solid", default: "none" },
		outlineWidth: borderWidth.focus,
		overflow: "hidden",
		padding: 0,
	},
	// Frameless: the photo keeps its own proportions within the viewport.
	image: {
		blockSize: "auto",
		borderRadius: shape.controlRadius,
		display: "block",
		inlineSize: "auto",
		maxBlockSize: "100%",
		maxInlineSize: "100%",
		minBlockSize: 0,
		objectFit: "contain",
		pointerEvents: "auto",
	},
	// Previous, the position, and Next, floating at the foot of the overlay.
	pill: {
		alignItems: "center",
		backgroundColor: colors.floatingSurface,
		borderColor: colors.border,
		borderRadius: ROUND,
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxShadow: shadows.floating,
		display: "flex",
		gap: space["1"],
		insetBlockEnd: space["4"],
		insetInline: 0,
		marginInline: "auto",
		padding: space["1"],
		pointerEvents: "auto",
		position: "absolute",
		width: "fit-content",
	},
	pillButton: { blockSize: space["8"], inlineSize: space["8"] },
	// Covers the viewport but lets clicks on empty space reach the scrim, so
	// they dismiss the overlay.
	popup: {
		...enterExit,
		alignItems: "center",
		boxSizing: "border-box",
		display: "grid",
		gridTemplateColumns: "minmax(0, 1fr)",
		gridTemplateRows: "minmax(0, 1fr)",
		inset: 0,
		justifyItems: "center",
		opacity: {
			"[data-ending-style]": 0,
			"[data-starting-style]": 0,
			default: 1,
		},
		outline: "none",
		paddingBlock: CHROME,
		paddingInline: { [conditions.sm]: CHROME, default: space["4"] },
		pointerEvents: "none",
		position: "fixed",
		transform: {
			"[data-ending-style]": "scale(0.98)",
			"[data-starting-style]": "scale(0.96)",
			default: "none",
		},
		transitionProperty: "opacity, transform",
		zIndex: 1,
	},
});
