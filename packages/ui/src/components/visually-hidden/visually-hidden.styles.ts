import { create } from "@stylexjs/stylex";

export const visuallyHiddenStyles = create({
	root: {
		borderWidth: 0,
		clipPath: "inset(50%)",
		height: 1,
		margin: "-1px",
		overflow: "hidden",
		padding: 0,
		position: "absolute",
		whiteSpace: "nowrap",
		width: 1,
	},
});
