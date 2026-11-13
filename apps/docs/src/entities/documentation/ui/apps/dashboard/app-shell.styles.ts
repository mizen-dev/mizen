import { colors } from "@mizen-labs/ui/colors.stylex";
import { conditions } from "@mizen-labs/ui/conditions.stylex";
import { controlSize } from "@mizen-labs/ui/dimensions.stylex";
import { borderWidth, focus } from "@mizen-labs/ui/interaction.stylex";
import { shadows } from "@mizen-labs/ui/shadows.stylex";
import { shape } from "@mizen-labs/ui/shape.stylex";
import { space } from "@mizen-labs/ui/spacing.stylex";
import {
	fontSize,
	fontWeight,
	lineHeight,
} from "@mizen-labs/ui/typography.stylex";
import { create } from "@stylexjs/stylex";

// The application shell: navigation beside one inset pane. These are the only
// layout styles in the app. Every screen inside the pane is a Mizen Page, and
// every value here is a Mizen token. From Mizen's md breakpoint the navigation
// is a sidebar.
export const shellStyles = create({
	account: {
		alignItems: "center",
		display: "flex",
		gap: space["2"],
		padding: space["1"],
	},
	bar: {
		alignItems: "center",
		display: { default: "flex", [conditions.md]: "none" },
		justifyContent: "space-between",
		paddingBlock: space["2"],
		paddingInline: space["4"],
	},
	brand: {
		alignItems: "center",
		display: "flex",
		fontWeight: fontWeight.medium,
		gap: space["2"],
		padding: space["1"],
	},
	// The sidebar and the drawer hold the same column of navigation.
	column: {
		flexDirection: "column",
		gap: space["3"],
		minBlockSize: 0,
	},
	count: {
		backgroundColor: "color-mix(in oklab, currentcolor 16%, transparent)",
		borderRadius: shape.controlRadius,
		fontSize: fontSize["12"],
		fontVariantNumeric: "tabular-nums",
		paddingInline: space["1.5"],
	},
	drawer: { display: "flex" },
	group: {
		display: "flex",
		flexDirection: "column",
		gap: space.px,
		listStyleType: "none",
		margin: space["0"],
		padding: space["0"],
	},
	groupLabel: {
		color: colors.mutedContent,
		fontSize: fontSize["12"],
		fontWeight: fontWeight.medium,
		lineHeight: lineHeight["16"],
		paddingBlock: space["1"],
		paddingInline: space["2"],
	},
	link: {
		alignItems: "center",
		backgroundColor: {
			":hover": { [conditions.canHover]: colors.controlSurfaceHover },
			default: "transparent",
		},
		borderRadius: shape.controlRadius,
		color: {
			":hover": { [conditions.canHover]: colors.content },
			default: colors.mutedContent,
		},
		display: "flex",
		gap: space["2"],
		minBlockSize: controlSize.md,
		outlineColor: colors.focusRing,
		outlineOffset: focus.offset,
		outlineStyle: { ":focus-visible": "solid", default: "none" },
		outlineWidth: borderWidth.focus,
		paddingInline: space["2"],
		textDecoration: "none",
	},
	// The current screen follows the theme's primary action.
	linkCurrent: {
		backgroundColor: colors.primary,
		boxShadow: shadows.filledRest,
		color: colors.primaryContent,
		fontWeight: fontWeight.medium,
	},
	linkLabel: { flexGrow: 1 },
	nav: {
		display: "flex",
		flexDirection: "column",
		flexGrow: 1,
		gap: space["4"],
		minBlockSize: 0,
		overflow: "auto",
	},
	pane: {
		backgroundColor: colors.surface,
		borderRadius: { default: space["0"], [conditions.md]: shape.surfaceRadius },
		boxShadow: {
			default: "none",
			[conditions.md]: `0 0 0 ${borderWidth.thin} ${colors.border}, ${shadows.surface}`,
		},
		minInlineSize: 0,
		overflow: "auto",
	},
	shell: {
		backgroundColor: colors.workarea,
		blockSize: "100dvh",
		boxSizing: "border-box",
		color: colors.content,
		display: "grid",
		gap: { default: space["0"], [conditions.md]: space["2"] },
		gridTemplateColumns: {
			default: "minmax(0, 1fr)",
			[conditions.md]: `calc(${space["12"]} * 5) minmax(0, 1fr)`,
		},
		gridTemplateRows: {
			default: "auto minmax(0, 1fr)",
			[conditions.md]: "minmax(0, 1fr)",
		},
		padding: { default: space["0"], [conditions.md]: space["2"] },
	},
	sidebar: {
		display: { default: "none", [conditions.md]: "flex" },
		padding: space["2"],
	},
	// The drawer renders outside the shell, so each region sets its own text.
	text: {
		fontSize: fontSize["14"],
		lineHeight: lineHeight["20"],
	},
});
