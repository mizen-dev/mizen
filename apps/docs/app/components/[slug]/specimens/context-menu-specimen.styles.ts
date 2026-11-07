import { colors } from "@mizen-labs/ui/colors.stylex";
import {
	borderWidth,
	focus,
	focusMotion,
} from "@mizen-labs/ui/interaction.stylex";
import { shape } from "@mizen-labs/ui/shape.stylex";
import { space } from "@mizen-labs/ui/spacing.stylex";
import {
	fontSize,
	fontWeight,
	lineHeight,
} from "@mizen-labs/ui/typography.stylex";
import { create } from "@stylexjs/stylex";

export const specimenStyles = create({
	container: {
		display: "flex",
		flexDirection: "column",
		gap: space["5"],
		inlineSize: "100%",
		marginInline: "auto",
		maxInlineSize: "44rem",
	},
	darkSurface: {
		backgroundColor: colors.surface,
		borderRadius: shape.controlRadiusLarge,
		boxSizing: "border-box",
		color: colors.content,
		padding: space["4"],
	},
	fileCard: {
		alignItems: "center",
		backgroundColor: colors.surface,
		borderColor: colors.border,
		borderRadius: shape.controlRadius,
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxSizing: "border-box",
		display: "flex",
		flexWrap: "wrap",
		gap: space["3"],
		inlineSize: "100%",
		justifyContent: "space-between",
		maxInlineSize: "28rem",
		paddingBlock: space["3"],
		paddingInline: space["4"],
	},
	fileDetails: {
		color: colors.secondaryContent,
		fontSize: fontSize["12"],
		overflowWrap: "anywhere",
	},
	fileHeader: {
		alignItems: "center",
		display: "flex",
		gap: space["3"],
		minInlineSize: 0,
	},
	fileIcon: {
		alignItems: "center",
		color: colors.brandForeground,
		display: "flex",
		flexShrink: 0,
		justifyContent: "center",
	},
	fileMeta: {
		alignItems: "flex-start",
		display: "flex",
		flexDirection: "column",
		gap: space["1"],
		minInlineSize: 0,
		textAlign: "start",
	},
	fileName: {
		color: colors.content,
		fontSize: fontSize["14"],
		fontWeight: fontWeight.semibold,
		overflowWrap: "anywhere",
	},
	instructionPrimary: {
		color: colors.content,
		fontSize: fontSize["14"],
		fontWeight: fontWeight.medium,
		lineHeight: lineHeight["20"],
	},
	instructions: {
		alignItems: "center",
		display: "flex",
		flexDirection: "column",
		gap: space["1"],
		maxInlineSize: "28rem",
	},
	targetRegion: {
		alignItems: "center",
		animationDuration: {
			":focus-visible": focusMotion.duration,
		},
		animationName: {
			":focus-visible": focusMotion.ring,
		},
		backgroundColor: {
			":hover": colors.controlSurfaceHover,
			default: colors.controlSurface,
		},
		borderColor: colors.controlBorderStrong,
		borderRadius: shape.controlRadiusLarge,
		borderStyle: "dashed",
		borderWidth: borderWidth.thin,
		boxSizing: "border-box",
		cursor: "context-menu",
		display: "flex",
		flexDirection: "column",
		gap: space["4"],
		inlineSize: "100%",
		justifyContent: "center",
		minBlockSize: "14rem",
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
			default: "solid",
		},
		outlineWidth: {
			":focus-visible": borderWidth.focus,
			default: borderWidth.focus,
		},
		paddingBlock: space["6"],
		paddingInline: space["4"],
		textAlign: "center",
		userSelect: "none",
	},
});
