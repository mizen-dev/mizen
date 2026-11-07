import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { space } from "../../styles/spacing.stylex";
import {
	fontSize,
	fontWeight,
	lineHeight,
} from "../../styles/typography.stylex";

export const propertyListStyles = create({
	item: {
		alignItems: "baseline",
		display: "grid",
		gap: space["3"],
		gridColumnEnd: "-1",
		gridColumnStart: "1",
		gridTemplateColumns: "subgrid",
		minWidth: 0,
	},
	label: {
		color: colors.mutedContent,
		fontSize: fontSize["14"],
		fontWeight: fontWeight.regular,
		lineHeight: lineHeight["20"],
		margin: 0,
		minWidth: 0,
		overflowWrap: "break-word",
	},
	root: {
		display: "grid",
		gap: space["2"],
		gridTemplateColumns: {
			[conditions.sm]: "fit-content(8rem) minmax(0, 1fr)",
			default: "minmax(0, 1fr)",
		},
		margin: 0,
	},
	value: {
		color: colors.content,
		fontSize: fontSize["16"],
		fontWeight: fontWeight.regular,
		lineHeight: lineHeight["24"],
		margin: 0,
		minWidth: 0,
		overflowWrap: "anywhere",
		textAlign: "start",
	},
});
