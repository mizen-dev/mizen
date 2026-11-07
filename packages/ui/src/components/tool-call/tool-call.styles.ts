import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { borderWidth } from "../../styles/interaction.stylex";
import { duration, easing } from "../../styles/motion.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";

// Rows bleed into the gutter by their padding, so icons line up with the
// text around them while the hover fill has room.
const BLEED = space["2"];

export const toolCallStyles = create({
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
	// Clips the line while it grows in.
	clip: { minBlockSize: 0, overflow: "clip" },
	details: {
		display: "flex",
		flexDirection: "column",
		gap: space["2"],
		paddingBlock: space["2"],
	},
	errorText: { color: colors.destructiveText },
	groupCalls: { display: "flex", flexDirection: "column", gap: 2 },
	groupFailed: { color: colors.destructiveText },
	groupMeta: { color: colors.mutedContent },
	// A flex box, so the glyph centers on the line instead of sitting on the
	// text baseline with descender space under it.
	icon: { color: colors.mutedContent, display: "flex", flexShrink: 0 },
	name: {
		color: colors.mutedContent,
		flexShrink: 1,
		minInlineSize: 0,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	// What needs attention: an error with Retry, or an approval request.
	notice: {
		alignItems: "center",
		backgroundColor: colors.workarea,
		borderRadius: shape.controlRadiusLarge,
		display: "flex",
		flexWrap: "wrap",
		gap: space["2"],
		justifyContent: "space-between",
		paddingBlock: space["2"],
		paddingInline: space["3"],
	},
	noticeActions: { display: "flex", gap: space["2"] },
	noticeError: { backgroundColor: colors.destructiveSubtle },
	// Below the line or the open details, inset like them, so folding the
	// call never hides an action that waits on the person.
	noticeSlot: {
		marginBlockEnd: space["2"],
		marginBlockStart: space["1"],
		marginInline: BLEED,
	},
	noticeText: {
		alignItems: "center",
		display: "flex",
		gap: space["2"],
		margin: 0,
		minInlineSize: 0,
	},
	panel: { paddingInline: BLEED },
	root: {
		display: "grid",
		// One column capped at the container, so long code scrolls instead of
		// widening the call.
		gridTemplateColumns: "minmax(0, 1fr)",
		gridTemplateRows: "1fr",
		marginInline: `calc(-1 * ${BLEED})`,
		minInlineSize: 0,
	},
	// One quiet line: icon, action, tool name, then status at the end.
	row: {
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
		textAlign: "start",
	},
	status: {
		alignItems: "center",
		color: colors.mutedContent,
		display: "inline-flex",
		flexShrink: 0,
		gap: space["1"],
		marginInlineStart: "auto",
		whiteSpace: "nowrap",
	},
	statusApproval: { color: colors.warningSolid },
	statusComplete: { color: colors.successSolid },
	statusError: { color: colors.destructiveText },
	// Holds the status at the end of the line, so a new one can pop in.
	statusSlot: {
		display: "inline-flex",
		flexShrink: 0,
		marginInlineStart: "auto",
	},
	title: {
		flexShrink: 2,
		minInlineSize: 0,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
});
