import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { space } from "../../styles/spacing.stylex";
import { fontWeight, lineHeight } from "../../styles/typography.stylex";

export const terminalStyles = create({
	bold: { fontWeight: fontWeight.semibold },
	command: { color: colors.content },
	muted: { color: colors.mutedContent },
	// Sixteen lines of output, then it scrolls; long lines scroll sideways.
	output: {
		maxBlockSize: `calc(${lineHeight["20"]} * 16 + ${space["3"]} * 2)`,
		overflowY: "auto",
		overscrollBehaviorBlock: "contain",
	},
	// A line with nothing to open: no hover fill, no pointer.
	plainRow: { backgroundColor: "transparent", cursor: "default" },
	red: { color: colors.destructiveText },
	verb: { color: colors.content },
});
