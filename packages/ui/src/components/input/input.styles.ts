import { create } from "@stylexjs/stylex";
import { iconMasks } from "../../icon-masks.stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { controlSize } from "../../styles/dimensions.stylex";
import { fonts } from "../../styles/fonts.stylex";
import { borderWidth } from "../../styles/interaction.stylex";
import { space } from "../../styles/spacing.stylex";
import {
	fontSize,
	fontWeight,
	letterSpacing,
	lineHeight,
} from "../../styles/typography.stylex";
import { fieldStyles } from "../field/field.styles";

const inputUnstyledStyles = create({
	// The native search clear button, drawn with the system X in muted ink.
	nativeFeatures: {
		"::-webkit-search-cancel-button": {
			appearance: "none",
			backgroundColor: {
				":hover": { [conditions.canHover]: colors.content },
				default: colors.mutedContent,
			},
			cursor: "pointer",
			height: 16,
			marginInlineStart: space["2"],
			maskImage: iconMasks.x,
			maskRepeat: "no-repeat",
			maskSize: "100%",
			width: 16,
		},
		fontVariantNumeric: {
			":is([type=number], [type=date], [type=time], [type=datetime-local], [type=month], [type=week])":
				"tabular-nums",
			default: "inherit",
		},
	},
	unstyled: {
		"::placeholder": { color: colors.mutedContent, opacity: 1 },
		appearance: "none",
		backgroundColor: "transparent",
		borderColor: "transparent",
		borderStyle: "none",
		borderWidth: 0,
		boxShadow: "none",
		boxSizing: "border-box",
		color: { ":disabled": colors.mutedContent, default: colors.content },
		cursor: { ":disabled": "not-allowed", default: "text" },
		display: "block",
		flexBasis: "0%",
		flexGrow: 1,
		flexShrink: 1,
		fontFamily: "inherit",
		fontSize: { [conditions.sm]: fontSize["14"], default: fontSize["16"] },
		fontSizeAdjust: fonts.sizeAdjust,
		fontWeight: fontWeight.regular,
		letterSpacing: letterSpacing.ui,
		lineHeight: {
			[conditions.sm]: lineHeight["20"],
			default: lineHeight["24"],
		},
		minWidth: 0,
		opacity: 1,
		outlineColor: "transparent",
		outlineStyle: "none",
		outlineWidth: 0,
		paddingBlock: space["0"],
		paddingInlineEnd: {
			":is([data-slot='input-group']:has(> [data-align='inline-end']) > *)": 0,
			default: space["3"],
		},
		paddingInlineStart: {
			":is([data-slot='input-group']:has(> [data-align='inline-start']) > *)": 0,
			default: space["3"],
		},
		width: "auto",
	},
	unstyledDefault: {
		height: `calc(${controlSize.md} - ${borderWidth.thin} * 2)`,
	},
	unstyledLg: {
		fontSize: fontSize["16"],
		height: `calc(${controlSize.lg} - ${borderWidth.thin} * 2)`,
	},
	unstyledSm: {
		fontSize: { [conditions.sm]: fontSize["13"], default: fontSize["16"] },
		height: `calc(${controlSize.sm} - ${borderWidth.thin} * 2)`,
	},
});

export const inputStyles = {
	...fieldStyles,
	nativeFeatures: inputUnstyledStyles.nativeFeatures,
	unstyled: inputUnstyledStyles.unstyled,
	unstyledDefault: inputUnstyledStyles.unstyledDefault,
	unstyledLg: inputUnstyledStyles.unstyledLg,
	unstyledSm: inputUnstyledStyles.unstyledSm,
};
