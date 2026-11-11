import { colors } from "@mizen-labs/ui/colors.stylex";
import { conditions } from "@mizen-labs/ui/conditions.stylex";
import {
	borderWidth,
	focus,
	focusMotion,
	focusOutline,
} from "@mizen-labs/ui/interaction.stylex";
import { shadows } from "@mizen-labs/ui/shadows.stylex";
import { shape } from "@mizen-labs/ui/shape.stylex";
import { space } from "@mizen-labs/ui/spacing.stylex";
import { fontWeight } from "@mizen-labs/ui/typography.stylex";
import { create } from "@stylexjs/stylex";

// The hero uses a fluid display scale; the live dashboard uses product type roles.
export const landingStyles = create({
	accent: { color: colors.brandForeground },
	account: { alignItems: "center", display: "flex", gap: space["3"] },
	actions: {
		alignItems: "center",
		display: "flex",
		flexWrap: "wrap",
		gap: space["3"],
		justifyContent: "center",
		marginBlockStart: space["2"],
	},
	charts: {
		display: "grid",
		gap: space["4"],
		gridTemplateColumns: {
			"@media (min-width: 64rem)": "repeat(3, minmax(0, 1fr))",
			default: "minmax(0, 1fr)",
		},
	},
	// Charts keep their own height, so cards stack in two columns and the last
	// card of the shorter column takes the spare height.
	column: {
		display: "flex",
		flexDirection: "column",
		gap: space["4"],
		minInlineSize: 0,
	},
	container: {
		marginInline: "auto",
		maxInlineSize: "88rem",
		paddingInline: { default: space["4"], [conditions.sm]: space["8"] },
	},
	dashboard: {
		backgroundColor: colors.surface,
		borderColor: colors.border,
		borderRadius: shape.surfaceRadius,
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxShadow: shadows.surface,
		minInlineSize: 0,
	},
	dashboardBar: {
		alignItems: "center",
		borderBlockEndColor: colors.border,
		borderBlockEndStyle: "solid",
		borderBlockEndWidth: borderWidth.thin,
		display: "flex",
		flexWrap: "wrap",
		gap: space["3"],
		justifyContent: "space-between",
		paddingBlock: space["4"],
		paddingInline: { default: space["4"], [conditions.sm]: space["6"] },
	},
	dashboardBody: {
		display: "grid",
		gap: space["6"],
		minInlineSize: 0,
		padding: { default: space["2"], [conditions.sm]: space["6"] },
	},
	dashboardHeading: {
		alignItems: "center",
		display: "flex",
		flexWrap: "wrap",
		gap: space["4"],
		justifyContent: "space-between",
		paddingBlock: space["2"],
		paddingInline: { default: space["2"], [conditions.sm]: 0 },
	},
	footer: {
		alignItems: "center",
		borderBlockStartColor: colors.border,
		borderBlockStartStyle: "solid",
		borderBlockStartWidth: "1px",
		display: "flex",
		flexWrap: "wrap",
		gap: space["4"],
		justifyContent: "space-between",
		marginBlockStart: space["12"],
		paddingBlock: space["8"],
	},
	footerLinks: { display: "flex", flexWrap: "wrap", gap: space["6"] },
	grow: { display: "grid", flexGrow: 1 },
	hero: {
		alignItems: "center",
		display: "flex",
		flexDirection: "column",
		gap: space["6"],
		paddingBlock: { default: space["12"], [conditions.md]: space["16"] },
		textAlign: "center",
	},
	lede: {
		color: colors.mutedContent,
		fontSize: "1.125rem",
		lineHeight: 1.5,
		maxInlineSize: "34rem",
		textWrap: "pretty",
	},
	metrics: {
		display: "grid",
		gap: space["4"],
		gridTemplateColumns: {
			"@media (min-width: 40rem)": "repeat(2, minmax(0, 1fr))",
			"@media (min-width: 64rem)": "repeat(4, minmax(0, 1fr))",
			default: "minmax(0, 1fr)",
		},
	},
	muted: { color: colors.mutedContent },
	page: {
		backgroundColor: colors.surface,
		color: colors.content,
		minInlineSize: 0,
		width: "100%",
	},
	period: {
		alignItems: "center",
		display: "flex",
		flexWrap: "wrap",
		gap: space["3"],
	},
	previewNote: {
		color: colors.mutedContent,
		marginBlockStart: space["6"],
		textAlign: "center",
	},
	supporting: { color: colors.mutedContent, marginBlockStart: space["2"] },
	textLink: {
		animationDuration: { ":focus-visible": focusMotion.duration },
		animationName: { ":focus-visible": focusMotion.ring },
		color: { ":hover": colors.content, default: colors.mutedContent },
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: focus.offset,
		outlineStyle: focusOutline.restingOutlineStyle,
		outlineWidth: borderWidth.focus,
		textDecoration: "none",
	},
	title: {
		fontSize: "clamp(2.75rem, 6vw, 5.25rem)",
		fontWeight: fontWeight.medium,
		letterSpacing: "-0.04em",
		lineHeight: 1.05,
		maxInlineSize: "100%",
		overflowWrap: "anywhere",
		textWrap: "balance",
	},
	wide: {
		gridColumn: { "@media (min-width: 64rem)": "span 2", default: "auto" },
	},
	workspace: {
		alignItems: "center",
		display: "flex",
		flexWrap: "wrap",
		gap: space["2"],
	},
	workspaceMark: {
		alignItems: "center",
		backgroundColor: colors.brandBackground,
		borderRadius: shape.inlineRadius,
		color: colors.brandForeground,
		display: "flex",
		padding: space["2"],
	},
});
