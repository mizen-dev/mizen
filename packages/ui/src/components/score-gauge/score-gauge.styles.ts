import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import { fontWeight } from "../../styles/typography.stylex";

export const scoreGaugeStyles = create({
	detail: { color: colors.mutedContent },
	figure: {
		alignSelf: "center",
		display: "grid",
		placeItems: "center",
		position: "relative",
	},
	label: {
		alignItems: "center",
		display: "flex",
		gap: space["2"],
		minWidth: 0,
	},
	list: {
		alignSelf: "stretch",
		backgroundColor: colors.surface,
		borderRadius: shape.controlRadius,
		listStyle: "none",
		margin: 0,
		paddingBlock: space["1"],
		paddingInline: space["3"],
	},
	// A figure, so the browser margin is reset.
	root: {
		display: "flex",
		flexDirection: "column",
		gap: space["4"],
		margin: 0,
		minWidth: 0,
	},
	row: {
		alignItems: "center",
		borderBlockStartColor: {
			":first-child": "transparent",
			default: colors.border,
		},
		borderBlockStartStyle: "solid",
		borderBlockStartWidth: 1,
		display: "flex",
		gap: space["3"],
		justifyContent: "space-between",
		minBlockSize: "2.5rem",
	},
	score: {
		alignItems: "center",
		color: colors.content,
		display: "flex",
		flexDirection: "column",
		fontVariantNumeric: "tabular-nums",
		inset: 0,
		justifyContent: "center",
		// The score sits over the ring; pointers pass through to the segments.
		pointerEvents: "none",
		position: "absolute",
	},
	svg: { display: "block" },
	swatch: (backgroundColor: string) => ({
		backgroundColor,
		blockSize: "0.625rem",
		borderRadius: 3,
		flexShrink: 0,
		inlineSize: "0.625rem",
	}),
	value: {
		color: colors.content,
		flexShrink: 0,
		fontVariantNumeric: "tabular-nums",
		fontWeight: fontWeight.medium,
	},
});
