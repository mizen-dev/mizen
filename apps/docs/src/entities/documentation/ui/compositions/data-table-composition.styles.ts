import { colors } from "@mizen-labs/ui/colors.stylex";
import { conditions } from "@mizen-labs/ui/conditions.stylex";
import { space } from "@mizen-labs/ui/spacing.stylex";
import { create } from "@stylexjs/stylex";

export const dataTableCompositionStyles = create({
	bulkActions: {
		justifyContent: { default: "flex-start", [conditions.md]: "flex-end" },
	},
	controlGroup: {
		alignItems: "center",
		display: "flex",
		flexWrap: "wrap",
		gap: space["2"],
		minInlineSize: 0,
		overflowWrap: "normal",
	},
	controls: {
		alignItems: "center",
		display: "flex",
		flexWrap: "wrap",
		gap: space["3"],
		justifyContent: "space-between",
	},
	count: {
		color: colors.mutedContent,
		fontVariantNumeric: "tabular-nums",
	},
	identifier: {
		fontVariantNumeric: "tabular-nums",
		whiteSpace: "nowrap",
	},
});
