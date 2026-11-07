import { colors } from "@mizen/ui/colors.stylex";
import { conditions } from "@mizen/ui/conditions.stylex";
import { shape } from "@mizen/ui/shape.stylex";
import { space } from "@mizen/ui/spacing.stylex";
import { create } from "@stylexjs/stylex";

export const pageStyles = create({
	darkFieldPanel: {
		backgroundColor: colors.surface,
		borderRadius: shape.controlRadius,
		color: colors.content,
		padding: 16,
	},
	fieldGrid: {
		display: "grid",
		gap: "1.5rem",
		gridTemplateColumns: "minmax(0, 1fr)",
		inlineSize: "100%",
		maxWidth: 480,
		minWidth: 0,
	},
	page: {
		backgroundColor: colors.surface,
		color: colors.content,
		maxWidth: 960,
		minHeight: "100vh",
		padding: { default: space["3"], [conditions.sm]: space["6"] },
	},
	row: {
		alignItems: "center",
		display: "flex",
		flexWrap: "wrap",
		gap: "0.75rem",
	},
	themePanel: {
		backgroundColor: colors.surface,
		borderRadius: shape.controlRadius,
		color: colors.content,
		padding: 16,
	},
	typographySpecimen: {
		display: "flex",
		flexDirection: "column",
		gap: space["3"],
		inlineSize: "100%",
		maxInlineSize: "65ch",
	},
});
