import { create } from "@stylexjs/stylex";
import { space } from "../../styles/spacing.stylex";

export const stackStyles = create({
	base: {
		display: "flex",
		flexDirection: "column",
		gap: space["3"],
		minWidth: 0,
	},
	gap0: { gap: 0 },
	gap1: { gap: space["1"] },
	gap2: { gap: space["2"] },
	gap3: { gap: space["3"] },
	gap4: { gap: space["4"] },
	gap5: { gap: space["5"] },
	gap6: { gap: space["6"] },
	gap8: { gap: space["8"] },
	gap10: { gap: space["10"] },
	gap12: { gap: space["12"] },
	gap16: { gap: space["16"] },
});

// Gap steps mirror the 4px spacing scale: step × 4 = px.
export const stackGapStyles = {
	"0": stackStyles.gap0,
	"1": stackStyles.gap1,
	"2": stackStyles.gap2,
	"3": stackStyles.gap3,
	"4": stackStyles.gap4,
	"5": stackStyles.gap5,
	"6": stackStyles.gap6,
	"8": stackStyles.gap8,
	"10": stackStyles.gap10,
	"12": stackStyles.gap12,
	"16": stackStyles.gap16,
};
