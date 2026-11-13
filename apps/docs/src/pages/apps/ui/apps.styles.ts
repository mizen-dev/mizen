import { colors } from "@mizen-labs/ui/colors.stylex";
import { conditions } from "@mizen-labs/ui/conditions.stylex";
import { shape } from "@mizen-labs/ui/shape.stylex";
import { space } from "@mizen-labs/ui/spacing.stylex";
import { create } from "@stylexjs/stylex";

export const appsStyles = create({
	// The app runs in its own document, so it has its own theme and follows
	// the width of this frame, not of the window.
	frame: {
		backgroundColor: colors.workarea,
		blockSize: `calc(${space["16"]} * 12)`,
		borderColor: colors.border,
		borderRadius: shape.surfaceRadius,
		borderStyle: "solid",
		borderWidth: "1px",
		boxSizing: "border-box",
		display: "block",
		inlineSize: "100%",
	},
	// The site's centered column, wide enough to frame an app at desktop width.
	page: {
		boxSizing: "border-box",
		display: "grid",
		gap: space["8"],
		gridTemplateColumns: "minmax(0, 1fr)",
		marginInline: "auto",
		maxInlineSize: "88rem",
		paddingBlock: { default: space["6"], [conditions.sm]: space["8"] },
		paddingInline: { default: space["4"], [conditions.sm]: space["8"] },
		width: "100%",
	},
	// Text and code keep a readable measure inside the wide column.
	section: { maxInlineSize: "56rem" },
});
