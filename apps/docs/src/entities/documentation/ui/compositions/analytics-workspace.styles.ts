import { colors } from "@mizen-labs/ui/colors.stylex";
import { conditions } from "@mizen-labs/ui/conditions.stylex";
import { space } from "@mizen-labs/ui/spacing.stylex";
import { create } from "@stylexjs/stylex";

export const analyticsWorkspaceStyles = create({
	controls: {
		alignItems: "end",
		display: "grid",
		gap: space["4"],
		gridTemplateColumns: {
			default: "minmax(0, 1fr)",
			[conditions.md]: "minmax(9rem, 1fr) minmax(10rem, 1fr) minmax(0, 1.4fr)",
		},
	},
	metricRow: {
		borderBlockColor: colors.border,
		borderBlockStyle: "solid",
		borderBlockWidth: "1px",
		display: "grid",
		gap: space["4"],
		gridTemplateColumns: {
			default: "repeat(auto-fit, minmax(min(100%, 8rem), 1fr))",
			[conditions.sm]: "repeat(4, minmax(0, 1fr))",
		},
		paddingBlock: space["6"],
	},
	searchRow: {
		alignItems: "end",
		display: "grid",
		gap: space["4"],
		gridTemplateColumns: {
			default: "minmax(0, 1fr)",
			[conditions.sm]: "minmax(0, 1fr) auto",
		},
	},
	workareas: {
		alignItems: "start",
		display: "grid",
		gap: space["4"],
		gridTemplateColumns: {
			default: "minmax(0, 1fr)",
			[conditions.sm]: "minmax(0, 2.4fr) minmax(15rem, 1fr)",
		},
	},
});
