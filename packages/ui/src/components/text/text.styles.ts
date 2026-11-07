import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";

export const textStyles = create({
	base: { marginBlock: 0 },
	default: { color: colors.content },
	muted: { color: colors.mutedContent },
});
