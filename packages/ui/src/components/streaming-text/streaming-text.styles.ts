import { create, keyframes } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { controlSize, glyphSize } from "../../styles/dimensions.stylex";
import { borderWidth } from "../../styles/interaction.stylex";
import { duration, easing } from "../../styles/motion.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";

// A word resolves out of a soft blur as it arrives.
const resolve = keyframes({
	from: { filter: "blur(4px)", opacity: 0 },
	to: { filter: "blur(0)", opacity: 1 },
});
// A new word arrives faint and violet, warms to pink, then settles into the
// text color. Words keep landing behind it, so the newest few form a
// gradient at the growing edge of the reply.
const trail = keyframes({
	"0%": {
		color: colors.chartSeries1,
		filter: "blur(4px)",
		opacity: 0,
	},
	"25%": {
		color: colors.chartSeries3,
		filter: "blur(0)",
		opacity: 1,
	},
	"100%": { color: "inherit", filter: "blur(0)", opacity: 1 },
});

const arrive = {
	animationDuration: {
		[conditions.reducedMotion]: duration.instant,
		default: "360ms",
	},
	animationFillMode: "both",
	animationTimingFunction: easing.expoOut,
} as const;

export const streamingTextStyles = create({
	actions: {
		alignItems: "center",
		display: "flex",
		flexWrap: "wrap",
		gap: space["1"],
		// The first glyph lines up with the text, not its button's padding.
		marginInlineStart: `calc((${controlSize.xs} - ${glyphSize.xs}) / -2)`,
		// Held in place while streaming so the reply never jumps on completion.
		opacity: { ":is([data-status='streaming'] *)": 0, default: 1 },
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.disclosure,
		},
		transitionProperty: "opacity",
		transitionTimingFunction: easing.expoOut,
	},
	actionsGroup: { alignItems: "center", display: "flex", gap: 0 },
	error: {
		alignItems: "center",
		color: colors.destructiveText,
		display: "flex",
		gap: space["2"],
		margin: 0,
	},
	followUp: {
		alignItems: "center",
		appearance: "none",
		backgroundColor: {
			[conditions.canHover]: {
				":hover": colors.controlSurfaceHover,
				default: "transparent",
			},
			default: "transparent",
		},
		borderRadius: shape.controlRadius,
		borderWidth: 0,
		color: colors.content,
		cursor: "pointer",
		display: "flex",
		gap: space["2"],
		inlineSize: "100%",
		margin: 0,
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: -2,
		outlineStyle: { ":focus-visible": "solid", default: "none" },
		outlineWidth: borderWidth.focus,
		paddingBlock: space["2"],
		paddingInline: space["2"],
		textAlign: "start",
	},
	followUpIcon: {
		color: colors.mutedContent,
		flexShrink: 0,
		transform: { ":dir(rtl)": "scaleX(-1)", default: "none" },
	},

	followUps: {
		display: "flex",
		flexDirection: "column",
		gap: space["1"],
		marginBlockStart: space["3"],
	},
	followUpsList: {
		display: "flex",
		flexDirection: "column",
		gap: 2,
		listStyle: "none",
		margin: 0,
		marginInline: `calc(-1 * ${space["2"]})`,
		padding: 0,
	},
	followUpsTitle: { color: colors.mutedContent, margin: 0 },
	// Reasoning reads quieter than the reply it leads to.
	reasoningText: { color: colors.mutedContent },
	// Resolves out of blur without the color trail: citations keep their muted
	// color, and reasoning words stay muted.
	resolveArrive: {
		animationName: { [conditions.reducedMotion]: "none", default: resolve },
		...arrive,
	},
	root: {
		color: colors.content,
		display: "flex",
		flexDirection: "column",
		gap: space["2"],
		minInlineSize: 0,
	},
	text: {
		margin: 0,
		overflowWrap: "anywhere",
		// Balanced wrapping would re-wrap visible lines as each word lands.
		textWrap: "wrap",
		// Line breaks in the reply stay; runs of spaces collapse.
		whiteSpace: "pre-line",
	},
	// Clips the line still easing open; the margin keeps the blur visible.
	textFrame: {
		overflow: "clip",
		overflowClipMargin: space["1"],
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: "240ms",
		},
		transitionProperty: "height",
		transitionTimingFunction: easing.expoOut,
	},
	word: {
		animationDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: "1200ms",
		},
		// Backwards only: once settled, the word takes the inherited color.
		animationFillMode: "backwards",
		animationName: { [conditions.reducedMotion]: "none", default: trail },
		animationTimingFunction: easing.easeOut,
	},
});

// A burst of words staggers in, so it never lands all at once.
export const streamingTextDynamic = create({
	delay: (delay: string) => ({ animationDelay: delay }),
});
