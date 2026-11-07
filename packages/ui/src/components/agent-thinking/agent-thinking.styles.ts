import { create, keyframes } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { controlSize } from "../../styles/dimensions.stylex";
import { borderWidth } from "../../styles/interaction.stylex";
import { duration, easing } from "../../styles/motion.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import { lineHeight } from "../../styles/typography.stylex";

// A soft highlight sweeps across the step label while the model works.
const sweep = keyframes({
	from: { backgroundPosition: "100% 0" },
	to: { backgroundPosition: "-100% 0" },
});

// Five lines of reasoning stay in view while it streams.
const WINDOW_LINES = 5;

export const agentThinkingStyles = create({
	chevron: {
		color: colors.mutedContent,
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
	// Sources above the reasoning. The space above sits inside the panel, so
	// it folds away with it instead of snapping at the end.
	content: {
		display: "flex",
		flexDirection: "column",
		paddingBlockStart: space["2"],
	},
	duration: { color: colors.mutedContent },
	header: {
		alignItems: "flex-start",
		color: colors.content,
		display: "flex",
		gap: space["2"],
		margin: 0,
		minBlockSize: lineHeight["20"],
	},
	// Holds the thinking indicator on the first line of a wrapping step.
	indicator: {
		alignItems: "center",
		blockSize: lineHeight["20"],
		display: "inline-flex",
		flexShrink: 0,
	},
	inner: { display: "flex", flexDirection: "column", gap: space["2"] },
	root: {
		display: "flex",
		flexDirection: "column",
		minInlineSize: 0,
	},
	sources: {
		display: "flex",
		flexWrap: "wrap",
		gap: space["1"],
		marginInlineStart: `calc(-1 * ${space["1"]})`,
	},
	// Text clipped to a moving gradient, so a light sweeps across it.
	stage: {
		animationDuration: "2s",
		animationIterationCount: "infinite",
		animationName: {
			[conditions.forcedColors]: "none",
			[conditions.reducedMotion]: "none",
			default: sweep,
		},
		animationTimingFunction: easing.linear,
		backgroundClip: {
			[conditions.forcedColors]: "border-box",
			default: "text",
		},
		backgroundImage: {
			[conditions.forcedColors]: "none",
			default: `linear-gradient(90deg, ${colors.mutedContent} 30%, ${colors.content} 50%, ${colors.mutedContent} 70%)`,
		},
		backgroundSize: "200% 100%",
		color: {
			[conditions.forcedColors]: "CanvasText",
			[conditions.reducedMotion]: colors.content,
			default: "transparent",
		},
	},
	// A plain line when there is nothing to open.
	summary: {
		alignItems: "center",
		color: colors.content,
		display: "flex",
		gap: space["1"],
		margin: 0,
	},
	toggle: {
		alignItems: "center",
		appearance: "none",
		backgroundColor: "transparent",
		borderRadius: shape.controlRadius,
		borderWidth: 0,
		color: colors.content,
		cursor: "pointer",
		display: "inline-flex",
		gap: space["1"],
		margin: 0,
		marginInlineStart: `calc(-1 * ${space["1"]})`,
		// The smallest control height: a 24px target around one line of text.
		minBlockSize: controlSize["2xs"],
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: 0,
		outlineStyle: { ":focus-visible": "solid", default: "none" },
		outlineWidth: borderWidth.focus,
		paddingBlock: 0,
		paddingInline: space["1"],
		textAlign: "start",
	},
	// While streaming, the newest lines sit at the bottom of a fixed window,
	// and older lines fade out at the top once it overflows.
	window: {
		justifyContent: "flex-end",
		maskImage: {
			// Clear through the padding, so a clipped line never shows its edge.
			"[data-overflowing]": `linear-gradient(to bottom, transparent ${space["2"]}, black calc(${space["2"]} + ${lineHeight["20"]}))`,
			default: "none",
		},
		// The padding above stays clear of the five lines.
		maxBlockSize: `calc(${WINDOW_LINES} * ${lineHeight["20"]} + ${space["2"]})`,
		overflow: "hidden",
	},
});
