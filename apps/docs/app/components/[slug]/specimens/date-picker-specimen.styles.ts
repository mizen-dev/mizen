import { colors } from "@mizen/ui/colors.stylex";
import { shape } from "@mizen/ui/shape.stylex";
import { space } from "@mizen/ui/spacing.stylex";
import { create } from "@stylexjs/stylex";

export const specimenStyles = create({
	grid: {
		display: "grid",
		gap: space["6"],
		gridTemplateColumns: {
			"@media (min-width: 768px)": "repeat(2, minmax(0, 1fr))",
			default: "minmax(0, 1fr)",
		},
		width: "100%",
	},
	header: {
		borderBottomColor: colors.border,
		borderBottomStyle: "solid",
		borderBottomWidth: "1px",
		display: "flex",
		flexDirection: "column",
		flexGrow: 1,
		padding: space["6"],
	},
	nowrap: {
		whiteSpace: "nowrap",
	},
	panel: {
		backgroundColor: colors.surface,
		borderColor: colors.border,
		borderRadius: shape.controlRadiusLarge,
		borderStyle: "solid",
		borderWidth: "1px",
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "column",
		minWidth: 0,
	},
	preview: {
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "column",
		gap: space["3"],
		maxWidth: "20rem",
		padding: space["6"],
		width: "100%",
	},
	root: {
		display: "flex",
		flexDirection: "column",
		gap: space["8"],
		width: "100%",
	},
});
