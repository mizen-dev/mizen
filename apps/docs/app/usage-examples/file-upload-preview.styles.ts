import { colors } from "@mizen/ui/colors.stylex";
import { space } from "@mizen/ui/spacing.stylex";
import { fontSize, fontWeight, lineHeight } from "@mizen/ui/typography.stylex";
import { create } from "@stylexjs/stylex";

export const uploadPreviewStyles = create({
	actions: {
		alignItems: "center",
		display: "flex",
		flexDirection: "column",
		flexShrink: 0,
		gap: space["1"],
	},
	copy: {
		display: "flex",
		flexBasis: "12rem",
		flexDirection: "column",
		flexGrow: 1,
		minInlineSize: 0,
	},
	detail: {
		alignItems: "center",
		display: "flex",
		flexWrap: "wrap",
		gap: space["2"],
		justifyContent: "flex-start",
	},
	header: {
		alignItems: "center",
		display: "flex",
		gap: space["3"],
		inlineSize: "100%",
		minInlineSize: 0,
	},
	icon: {
		color: colors.brandForeground,
		display: "flex",
		flexShrink: 0,
		// The icon lifts while files hover over the drop row.
		transform: {
			":is([data-dragging] *)": "translateY(-0.1875rem)",
			default: "none",
		},
		transitionDuration: {
			"@media (prefers-reduced-motion: reduce)": "0ms",
			default: "240ms",
		},
		transitionProperty: "transform",
		transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
	},
	limits: {
		color: colors.mutedContent,
		fontSize: fontSize["14"],
		lineHeight: lineHeight["20"],
		margin: 0,
	},
	limitsError: { color: colors.destructive },
	metadata: {
		alignItems: "flex-start",
		display: "flex",
		flexDirection: "column",
		flexGrow: 1,
		gap: space["1"],
		minInlineSize: 0,
	},
	percentage: {
		color: colors.secondaryContent,
		fontSize: fontSize["12"],
		fontVariantNumeric: "tabular-nums",
		lineHeight: lineHeight["16"],
	},
	percentageDisabled: { color: colors.secondaryContent },
	percentageError: { color: colors.destructive },
	percentageSuccess: { color: colors.successContent },
	// The line folds away once the upload finishes; the gap above folds with it.
	progressClip: { minBlockSize: 0, overflow: "hidden" },
	progressSlot: {
		display: "grid",
		gridTemplateRows: "1fr",
		inlineSize: "100%",
		marginBlockStart: 0,
		opacity: 1,
		transitionDuration: {
			"@media (prefers-reduced-motion: reduce)": "0ms",
			default: "320ms",
		},
		transitionProperty: "grid-template-rows, margin-block-start, opacity",
		transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
	},
	progressSlotDone: {
		gridTemplateRows: "0fr",
		marginBlockStart: `calc(-1 * ${space["2"]})`,
		opacity: 0,
	},
	rejectIcon: { color: colors.destructive, flexShrink: 0 },
	root: {
		inlineSize: "100%",
		marginInline: "auto",
		maxInlineSize: "32rem",
		minInlineSize: 0,
	},
	title: {
		color: colors.content,
		fontSize: fontSize["14"],
		fontWeight: fontWeight.medium,
		lineHeight: lineHeight["20"],
		margin: 0,
	},
	upload: {
		alignItems: "center",
		display: "flex",
		flexDirection: "column",
		gap: space["2"],
		inlineSize: "100%",
		minInlineSize: 0,
	},
});
