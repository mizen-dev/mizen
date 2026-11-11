import { create } from "@stylexjs/stylex";
import { space } from "../../styles/spacing.stylex";

export const inlineStyles = create({
	alignBaseline: { alignItems: "baseline" },
	alignCenter: { alignItems: "center" },
	alignEnd: { alignItems: "flex-end" },
	alignStart: { alignItems: "flex-start" },
	base: {
		display: "flex",
		flexDirection: "row",
		gap: space["3"],
		minWidth: 0,
	},
	justifyBetween: { justifyContent: "space-between" },
	justifyCenter: { justifyContent: "center" },
	justifyEnd: { justifyContent: "flex-end" },
	justifyStart: { justifyContent: "flex-start" },
	nowrap: { flexWrap: "nowrap" },
	wrap: { flexWrap: "wrap" },
});

export const inlineAlignStyles = {
	baseline: inlineStyles.alignBaseline,
	center: inlineStyles.alignCenter,
	end: inlineStyles.alignEnd,
	start: inlineStyles.alignStart,
};

export const inlineJustifyStyles = {
	between: inlineStyles.justifyBetween,
	center: inlineStyles.justifyCenter,
	end: inlineStyles.justifyEnd,
	start: inlineStyles.justifyStart,
};
