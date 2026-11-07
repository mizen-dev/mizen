import { colors } from "@mizen/ui/colors.stylex";
import { conditions } from "@mizen/ui/conditions.stylex";
import { shadows } from "@mizen/ui/shadows.stylex";
import { shape } from "@mizen/ui/shape.stylex";
import { space } from "@mizen/ui/spacing.stylex";
import { create } from "@stylexjs/stylex";

export const previewWorkspaceStyles = create({
	alignCenter: { textAlign: "center" },
	alignEnd: { textAlign: "end" },
	canvas: {
		backgroundColor: colors.surface,
		borderColor: colors.border,
		borderRadius: shape.controlRadiusLarge,
		borderStyle: "solid",
		borderWidth: 1,
		boxShadow: shadows.surface,
		boxSizing: "border-box",
		display: "grid",
		gap: space["4"],
		gridTemplateColumns: "minmax(0, 1fr)",
		minInlineSize: 0,
		overflowWrap: "break-word",
		padding: { default: space["3"], [conditions.sm]: space["6"] },
	},
	copy: { margin: 0, overflowWrap: "anywhere" },
	underline: { textDecoration: "underline" },
	workarea: {
		backgroundColor: colors.workarea,
		borderRadius: shape.controlRadiusLarge,
		boxSizing: "border-box",
		display: "grid",
		gap: space["4"],
		gridTemplateColumns: "minmax(0, 1fr)",
		minInlineSize: 0,
		padding: { default: space["3"], [conditions.sm]: space["6"] },
	},
});
