import { create, keyframes, when } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { controlSize, glyphSize } from "../../styles/dimensions.stylex";
import { borderWidth } from "../../styles/interaction.stylex";
import { duration, easing } from "../../styles/motion.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import {
	fontSize,
	fontWeight,
	letterSpacing,
	lineHeight,
} from "../../styles/typography.stylex";
import { attachmentMarker } from "./attachment-marker.stylex";

// The light's angle around the composer: one slow lap.
const lap = keyframes({
	from: { transform: "translate(-50%, -50%) rotate(0turn)" },
	to: { transform: "translate(-50%, -50%) rotate(1turn)" },
});

// The recording ring grows a little and fades, then comes back.
const breathe = keyframes({
	from: { transform: "scale(0.9)" },
	to: { opacity: 0.15, transform: "scale(1.15)" },
});

const WORKING = ":is([data-working] > *)";
// The bands sit deeper, inside the glow's rings.
const WORKING_BAND = ":is([data-working] *)";

export const composerPartStyles = create({
	// A 56px tile with a hairline edge. Images fill it; files show their
	// glyph at the top and their type at the bottom, 8px in.
	attachment: {
		borderColor: colors.border,
		borderRadius: shape.controlRadius,
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxSizing: "border-box",
		color: colors.mutedContent,
		display: "flex",
		flexDirection: "column",
		flexShrink: 0,
		height: `calc(${space["12"]} + ${space["2"]})`,
		justifyContent: "space-between",
		padding: space["2"],
		position: "relative",
		width: `calc(${space["12"]} + ${space["2"]})`,
	},
	attachmentGlyph: {
		display: "flex",
		height: glyphSize.sm,
		width: glyphSize.sm,
	},
	// Concentric with the tile: its radius less the 1px edge.
	attachmentImage: {
		borderRadius: `calc(${shape.controlRadius} - ${borderWidth.thin}px)`,
		display: "block",
		height: "100%",
		inset: 0,
		objectFit: "cover",
		position: "absolute",
		width: "100%",
	},
	attachmentMeta: {
		fontSize: fontSize["12"],
		fontVariantNumeric: "tabular-nums",
		fontWeight: fontWeight.medium,
		letterSpacing: letterSpacing.caption,
		lineHeight: lineHeight["16"],
	},
	// Covers the tile; the focus ring follows its corners.
	attachmentOpen: {
		appearance: "none",
		backgroundColor: "transparent",
		borderRadius: `calc(${shape.controlRadius} - ${borderWidth.thin}px)`,
		borderWidth: 0,
		cursor: "pointer",
		inset: 0,
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: borderWidth.thin,
		outlineStyle: { ":focus-visible": "solid", default: "none" },
		outlineWidth: borderWidth.focus,
		padding: 0,
		position: "absolute",
	},
	// A tile that opens darkens its edge under the pointer.
	attachmentOpenable: {
		borderColor: {
			":hover": { [conditions.canHover]: colors.controlBorderStrong },
			default: colors.border,
		},
	},
	// Inside the tile's top-end corner, translucent so a thumbnail shows
	// through. With a pointer it appears on hover or focus; touch keeps it.
	attachmentRemove: {
		alignItems: "center",
		backdropFilter: "blur(4px)",
		backgroundColor: `color-mix(in oklch, ${colors.surface} 80%, transparent)`,
		borderRadius: "50%",
		borderWidth: 0,
		color: {
			":hover": { [conditions.canHover]: colors.content },
			default: colors.mutedContent,
		},
		cursor: "pointer",
		display: "inline-flex",
		height: controlSize["2xs"],
		insetBlockStart: space["1"],
		insetInlineEnd: space["1"],
		justifyContent: "center",
		opacity: {
			[conditions.canHover]: {
				[when.ancestor(":focus-within", attachmentMarker)]: 1,
				[when.ancestor(":hover", attachmentMarker)]: 1,
				default: 0,
			},
			default: 1,
		},
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: 0,
		outlineStyle: "solid",
		outlineWidth: borderWidth.focus,
		padding: 0,
		position: "absolute",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "opacity, color",
		transitionTimingFunction: easing.expoOut,
		width: controlSize["2xs"],
	},
	attachments: {
		display: "flex",
		flexWrap: "wrap",
		gap: space["2"],
		listStyle: "none",
		margin: 0,
		paddingBlockStart: space["2"],
		paddingInline: space["2"],
	},
	// The context card: counts, a bar, the breakdown, and the total.
	contextCard: {
		display: "flex",
		flexDirection: "column",
		gap: space["3"],
		inlineSize: "16rem",
		maxInlineSize: "100%",
	},
	contextCost: { color: colors.mutedContent },
	contextLabel: { color: colors.mutedContent },
	contextRow: {
		alignItems: "baseline",
		display: "flex",
		gap: space["3"],
		justifyContent: "space-between",
	},
	contextRows: {
		display: "flex",
		flexDirection: "column",
		gap: space["1"],
		margin: 0,
	},
	contextTitle: { fontWeight: fontWeight.medium },
	contextTotal: {
		borderBlockStartColor: colors.border,
		borderBlockStartStyle: "solid",
		borderBlockStartWidth: borderWidth.thin,
		fontWeight: fontWeight.medium,
		paddingBlockStart: space["3"],
	},
	contextValue: {
		fontVariantNumeric: "tabular-nums",
		margin: 0,
		whiteSpace: "nowrap",
	},
	// While recording, the microphone turns brand and a soft ring breathes
	// around it. Reduced motion keeps the ring still.
	dictation: {
		"::after": {
			animationDirection: "alternate",
			animationDuration: "900ms",
			animationIterationCount: "infinite",
			animationName: {
				[conditions.reducedMotion]: "none",
				":is([data-listening])": breathe,
				default: "none",
			},
			animationTimingFunction: easing.easeInOut,
			borderColor: colors.brandForeground,
			borderRadius: "50%",
			borderStyle: "solid",
			borderWidth: borderWidth.thin,
			content: '""',
			inset: `calc(-1 * ${space["1"]})`,
			opacity: { ":is([data-listening])": 0.5, default: 0 },
			position: "absolute",
		},
		color: { ":is([data-listening])": colors.brandForeground },
		display: "flex",
		position: "relative",
	},
	// The working light: two copies of one rotating band. Both stay inside the
	// frame's box, so they add no overflow, and fade in together.
	glow: {
		inset: 0,
		opacity: { [WORKING]: 1, default: 0 },
		pointerEvents: "none",
		position: "absolute",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.overlayEnter,
		},
		transitionProperty: "opacity",
	},
	glowBand: {
		animationDuration: "4s",
		animationIterationCount: "infinite",
		animationName: { [conditions.reducedMotion]: "none", default: lap },
		animationPlayState: {
			[WORKING_BAND]: "running",
			default: "paused",
		},
		animationTimingFunction: "linear",
		aspectRatio: "1",
		backgroundImage: {
			[conditions.reducedMotion]: `linear-gradient(color-mix(in oklch, ${colors.brandForeground} 40%, transparent), color-mix(in oklch, ${colors.brandForeground} 40%, transparent))`,
			default: `conic-gradient(transparent 0turn, transparent 0.72turn, color-mix(in oklch, ${colors.brandForeground} 70%, transparent) 0.9turn, transparent 0.97turn)`,
		},
		insetBlockStart: "50%",
		insetInlineStart: "50%",
		position: "absolute",
		transform: "translate(-50%, -50%)",
		width: "150%",
	},
	// The blurred copy: a soft bloom that spills a little each side of the
	// line, only where the band is.
	glowBloom: {
		filter: "blur(10px)",
		inset: 0,
		opacity: 0.6,
		position: "absolute",
	},
	// A 2px ring just inside the border: the mask cuts out the middle, so only
	// a thin line of the band shows.
	glowRing: {
		borderRadius: `calc(${shape.floatingRadius} - ${borderWidth.thin}px)`,
		inset: 0,
		maskClip: "content-box, border-box",
		maskComposite: "exclude",
		maskImage: "linear-gradient(#000 0 0), linear-gradient(#000 0 0)",
		overflow: "hidden",
		padding: 2,
		position: "absolute",
	},
	// A status item whose number changes in place.
	meter: { flexShrink: 0, fontVariantNumeric: "tabular-nums" },
	// A quiet label in the toolbar that gains a surface on hover or while its
	// menu is open, so at rest it reads as text beside the buttons.
	picker: {
		alignItems: "center",
		appearance: "none",
		backgroundColor: {
			":is([data-popup-open])": colors.controlSurface,
			[conditions.canHover]: {
				":hover": colors.controlSurfaceHover,
				default: "transparent",
			},
			default: "transparent",
		},
		borderRadius: shape.controlRadius,
		borderWidth: 0,
		color: {
			":is([data-popup-open])": colors.content,
			[conditions.canHover]: {
				":hover": colors.content,
				default: colors.mutedContent,
			},
			default: colors.mutedContent,
		},
		cursor: "pointer",
		display: "inline-flex",
		fontFamily: "inherit",
		gap: space["1"],
		maxInlineSize: "100%",
		minBlockSize: controlSize.sm,
		minInlineSize: 0,
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: 0,
		outlineStyle: "solid",
		outlineWidth: borderWidth.focus,
		paddingInline: space["2"],
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "background-color, color",
		whiteSpace: "nowrap",
	},
	pickerChevron: { flexShrink: 0 },
	// On a narrow composer the choice shortens with an ellipsis instead of
	// pushing past the frame.
	pickerChoice: {
		minInlineSize: 0,
		overflow: "hidden",
		textOverflow: "ellipsis",
	},
	pickerDescription: { color: colors.mutedContent },
	// The chosen model's effort level: a small chip that opens the levels.
	pickerEffort: {
		alignItems: "center",
		backgroundColor: colors.controlSurface,
		borderRadius: shape.inlineRadius,
		color: colors.mutedContent,
		display: "inline-flex",
		flexShrink: 0,
		gap: 2,
		paddingInlineEnd: space["1"],
		paddingInlineStart: space["2"],
		whiteSpace: "nowrap",
	},
	// Points toward the side the levels open on.
	pickerEffortChevron: {
		transform: { ":dir(rtl)": "scaleX(-1)", default: "none" },
	},
	// A 16px mark centered on the label's 20px first line.
	pickerFirstLine: { alignSelf: "flex-start", marginBlockStart: 2 },
	// The menu's title row; a "Learn more" link can sit at its end.
	pickerHeader: {
		alignItems: "center",
		display: "flex",
		gap: space["2"],
		justifyContent: "space-between",
		minBlockSize: controlSize["2xs"],
		paddingInlineStart: space["2"],
	},
	pickerIcon: { display: "flex", flexShrink: 0 },
	pickerLearnMore: {
		borderRadius: shape.inlineRadius,
		color: {
			":hover": { [conditions.canHover]: colors.content },
			"[data-highlighted]": colors.content,
			default: colors.mutedContent,
		},
		cursor: "pointer",
		fontSize: fontSize["12"],
		letterSpacing: letterSpacing.caption,
		lineHeight: lineHeight["16"],
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineStyle: "solid",
		outlineWidth: borderWidth.focus,
		paddingBlock: space["1"],
		paddingInline: space["2"],
		textDecoration: "none",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "color",
	},
	pickerOption: {
		display: "flex",
		flexDirection: "column",
		flexGrow: 1,
		gap: 2,
		minInlineSize: 0,
	},
	// The circle sits at the row's end, on the label's line.
	pickerRadio: {
		alignItems: "center",
		alignSelf: "flex-start",
		display: "inline-flex",
		flexShrink: 0,
		justifyContent: "center",
		marginBlockStart: 2,
	},
	pickerRadioDot: {
		opacity: { ":is([data-checked] > *)": 1, default: 0 },
	},
	pickerTitle: {
		color: colors.mutedContent,
		fontSize: fontSize["12"],
		fontWeight: fontWeight.medium,
		letterSpacing: letterSpacing.caption,
		lineHeight: lineHeight["16"],
	},
	pickerTriggerEffort: { color: colors.mutedContent },
	// Groups wrap inside; the bar itself never wraps, so an end group such as
	// the context meter stays at the end.
	statusBar: {
		alignItems: "start",
		color: colors.mutedContent,
		display: "flex",
		gap: space["2"],
		justifyContent: "space-between",
		minInlineSize: 0,
		paddingInline: space["3"],
	},
	statusBarGroup: {
		alignItems: "center",
		display: "flex",
		flexWrap: "wrap",
		gap: space["3"],
		minInlineSize: 0,
	},
	// Bare text that darkens on hover; the hit area extends 4px past the text
	// without moving it.
	statusItem: {
		alignItems: "center",
		backgroundColor: "transparent",
		borderRadius: shape.inlineRadius,
		borderWidth: 0,
		color: {
			":hover": { [conditions.canHover]: colors.content },
			":is([data-popup-open])": colors.content,
			default: colors.mutedContent,
		},
		cursor: "pointer",
		display: "inline-flex",
		fontFamily: "inherit",
		fontSize: "inherit",
		fontWeight: fontWeight.regular,
		gap: space["1"],
		lineHeight: "inherit",
		marginInline: `calc(-1 * ${space["1"]})`,
		minBlockSize: controlSize["2xs"],
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: 0,
		outlineStyle: "solid",
		outlineWidth: borderWidth.focus,
		paddingBlock: 0,
		paddingInline: space["1"],
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "color",
		transitionTimingFunction: easing.expoOut,
		// An item moves to the next row whole; it never breaks inside.
		whiteSpace: "nowrap",
	},
});
