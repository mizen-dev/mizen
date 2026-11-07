import { create } from "@stylexjs/stylex";
import { conditions } from "../../styles/conditions.stylex";
import { space } from "../../styles/spacing.stylex";

export const commandDialogStyles = create({
	backdrop: { zIndex: 50 },
	popup: {
		maxHeight: "min(26.25rem, calc(100dvh - 2rem))",
		maxWidth: "36rem",
		minHeight: 0,
		minWidth: 0,
		opacity: {
			"[data-ending-style]": 0,
			"[data-starting-style]": 0,
			default: "calc(1 - 0.1 * var(--nested-dialogs, 0))",
		},
		transform: {
			"[data-ending-style]": "translateY(0.25rem) scale(0.98)",
			"[data-starting-style]": "translateY(0.5rem) scale(0.96)",
			default:
				"translateY(calc(-1.25rem * var(--nested-dialogs, 0))) scale(calc(1 - 0.1 * var(--nested-dialogs, 0)))",
		},
	},
	viewport: {
		alignItems: "center",
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "column",
		inset: 0,
		overflowY: "auto",
		overscrollBehavior: "contain",
		paddingBlock: {
			[conditions.sm]: "10vh",
			default: "max(1rem, 4vh)",
		},
		paddingInline: {
			[conditions.sm]: space["4"],
			default: space["2"],
		},
		position: "fixed",
		zIndex: 50,
	},
});
