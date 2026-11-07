import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { controlSize, glyphSize } from "../../styles/dimensions.stylex";
import { borderWidth } from "../../styles/interaction.stylex";
import { duration, easing } from "../../styles/motion.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import { lineHeight } from "../../styles/typography.stylex";

// Pulls a row of small icon buttons out by their padding, so the glyph at
// the edge lines up with the bubble's edge.
const BUTTON_INSET = `calc((${controlSize.xs} - ${glyphSize.xs}) / -2)`;

export const messageStyles = create({
	// Time, Copy, and Edit under the bubble. They appear on hover or keyboard
	// focus and always on touch screens, and keep their space so nothing moves.
	actions: {
		alignItems: "center",
		color: colors.mutedContent,
		display: "flex",
		gap: space["1"],
		minBlockSize: controlSize.xs,
		opacity: {
			default: 1,
			[conditions.canHover]: {
				":focus-within": 1,
				":is([data-slot='message']:hover *)": 1,
				default: 0,
			},
		},
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "opacity",
		transitionTimingFunction: easing.easeOut,
	},
	actionsEnd: { marginInlineEnd: BUTTON_INSET },
	// A failed message keeps its row in view.
	actionsShown: { opacity: 1 },
	actionsStart: {
		flexDirection: "row-reverse",
		marginInlineStart: BUTTON_INSET,
	},
	// The agent's parts, such as thinking, tool calls, and the reply.
	agentBody: { gap: space["3"] },
	attachments: {
		display: "flex",
		flexWrap: "wrap",
		gap: space["2"],
		listStyle: "none",
		margin: 0,
		maxInlineSize: "85%",
		padding: 0,
	},
	attachmentsEnd: { justifyContent: "flex-end" },
	// Lines up with the text inside the bubble.
	author: { color: colors.mutedContent, paddingInline: space["4"] },
	avatar: { flexShrink: 0 },
	body: {
		display: "flex",
		flexDirection: "column",
		flexGrow: 1,
		gap: space["2"],
		minInlineSize: 0,
	},
	// The person's words on a quiet surface.
	bubble: {
		backgroundColor: colors.workarea,
		borderRadius: shape.controlRadiusLarge,
		color: colors.content,
		display: "flex",
		flexDirection: "column",
		margin: 0,
		maxInlineSize: "85%",
		overflowWrap: "anywhere",
		paddingBlock: space["2"],
		paddingInline: space["4"],
		whiteSpace: "pre-wrap",
	},
	editor: {
		display: "flex",
		flexDirection: "column",
		gap: space["2"],
		inlineSize: "100%",
	},
	editorActions: {
		display: "flex",
		gap: space["2"],
		justifyContent: "flex-end",
	},
	end: { alignItems: "flex-end" },
	error: {
		alignItems: "center",
		color: colors.destructiveText,
		display: "inline-flex",
		gap: space["1"],
		paddingInline: space["1"],
	},
	// Eight lines, the last fading out once the text runs longer.
	folded: {
		maskImage: {
			":is([data-long] > *)": `linear-gradient(to bottom, black calc(100% - ${lineHeight["24"]}), transparent)`,
			default: "none",
		},
		maxBlockSize: `calc(${lineHeight["24"]} * 8)`,
		overflow: "hidden",
	},
	more: {
		alignItems: "center",
		alignSelf: "flex-start",
		appearance: "none",
		backgroundColor: "transparent",
		borderRadius: shape.inlineRadius,
		borderWidth: 0,
		color: {
			":hover": { [conditions.canHover]: colors.content },
			default: colors.mutedContent,
		},
		cursor: "pointer",
		display: { ":is([data-long] > *)": "inline-flex", default: "none" },
		marginBlockStart: space["1"],
		// The smallest control height: a 24px target around one line of text.
		minBlockSize: controlSize["2xs"],
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: 2,
		outlineStyle: { ":focus-visible": "solid", default: "none" },
		outlineWidth: borderWidth.focus,
		padding: 0,
	},
	reverse: { flexDirection: "row-reverse" },
	root: {
		alignItems: "flex-start",
		display: "flex",
		gap: space["3"],
		minInlineSize: 0,
	},
	start: { alignItems: "flex-start" },
	text: { margin: 0 },
	time: { fontVariantNumeric: "tabular-nums", paddingInline: space["1"] },
});
