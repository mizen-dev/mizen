import { create } from "@stylexjs/stylex";

// Column steps follow the grid's own width, not the viewport, so a grid
// beside a sidebar or inside a card needs no tuning. The ranges do not
// overlap, so one always wins.
const TWO_UP = "@container (min-width: 30rem)";
const TWO_UP_ONLY = "@container (min-width: 30rem) and (max-width: 59.999rem)";
const THREE_UP = "@container (min-width: 45rem)";
const FOUR_UP = "@container (min-width: 60rem)";
const ONE = "minmax(0, 1fr)";

export const gridStyles = create({
	// The query container. A size container has no width of its own, so it
	// takes its parent's, as a block does. Where the parent takes its width
	// from its content, the grid is one 16rem column instead of nothing.
	base: {
		containerType: "inline-size",
		containIntrinsicInlineSize: "16rem",
		minWidth: 0,
		width: "100%",
	},
	columns1: { gridTemplateColumns: ONE },
	columns2: {
		gridTemplateColumns: {
			[TWO_UP]: "repeat(2, minmax(0, 1fr))",
			default: ONE,
		},
	},
	columns3: {
		gridTemplateColumns: {
			[THREE_UP]: "repeat(3, minmax(0, 1fr))",
			default: ONE,
		},
	},
	// Four peers never break three and one.
	columns4: {
		gridTemplateColumns: {
			[FOUR_UP]: "repeat(4, minmax(0, 1fr))",
			[TWO_UP_ONLY]: "repeat(2, minmax(0, 1fr))",
			default: ONE,
		},
	},
	columnsAsideMain: {
		gridTemplateColumns: {
			[THREE_UP]: "minmax(0, 1fr) minmax(0, 2fr)",
			default: ONE,
		},
	},
	// As many equal columns as fit, each at least 16rem wide.
	columnsAuto: {
		gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 16rem), 1fr))",
	},
	columnsMainAside: {
		gridTemplateColumns: {
			[THREE_UP]: "minmax(0, 2fr) minmax(0, 1fr)",
			default: ONE,
		},
	},
	track: { display: "grid", minWidth: 0 },
});

export const gridColumnStyles = {
	"1": gridStyles.columns1,
	"1:2": gridStyles.columnsAsideMain,
	"2": gridStyles.columns2,
	"2:1": gridStyles.columnsMainAside,
	"3": gridStyles.columns3,
	"4": gridStyles.columns4,
	auto: gridStyles.columnsAuto,
};
