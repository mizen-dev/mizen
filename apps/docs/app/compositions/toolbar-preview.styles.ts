import { colors } from "@mizen-labs/ui/colors.stylex";
import { shape } from "@mizen-labs/ui/shape.stylex";
import { space } from "@mizen-labs/ui/spacing.stylex";
import { fontWeight } from "@mizen-labs/ui/typography.stylex";
import { create } from "@stylexjs/stylex";

export const toolbarPreviewStyles = create({
	artboard: {
		backgroundColor: colors.surface,
		borderColor: colors.border,
		borderRadius: shape.controlRadiusLarge,
		borderStyle: "solid",
		borderWidth: 1,
		flex: "1",
		minInlineSize: 0,
		overflowWrap: "break-word",
		padding: space["6"],
	},
	canvas: {
		backgroundColor: colors.surface,
		borderColor: colors.border,
		borderRadius: shape.controlRadiusLarge,
		borderStyle: "solid",
		borderWidth: 1,
		minInlineSize: 0,
		padding: space["6"],
	},
	document: {
		display: "grid",
		gap: space["4"],
		marginInline: "auto",
		maxInlineSize: "48ch",
		minBlockSize: "12rem",
		overflowWrap: "anywhere",
		paddingBlock: space["6"],
	},
	drawing: { alignItems: "flex-start", display: "flex", gap: space["4"] },
	formatBold: { fontWeight: fontWeight.semibold },
	formatItalic: { fontStyle: "italic" },
	header: {
		alignItems: "center",
		display: "flex",
		flexWrap: "wrap",
		gap: space["3"],
		justifyContent: "space-between",
	},
	surface: {
		backgroundColor: colors.workarea,
		borderRadius: shape.controlRadiusLarge,
		display: "grid",
		gap: space["4"],
		minInlineSize: 0,
		padding: space["6"],
	},
	text: { color: colors.secondaryContent, marginBlock: 0 },
	titleRow: {
		alignItems: "center",
		display: "flex",
		flexWrap: "wrap",
		gap: space["3"],
	},
});
