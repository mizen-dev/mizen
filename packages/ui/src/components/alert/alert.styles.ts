import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { glyphSize } from "../../styles/dimensions.stylex";
import { borderWidth } from "../../styles/interaction.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import {
	fontSize,
	fontWeight,
	letterSpacing,
	lineHeight,
} from "../../styles/typography.stylex";
import { alertVars } from "./alert.stylex";

export const alertStyles = create({
	action: {
		alignItems: "center",
		alignSelf: {
			default: "start",
			[conditions.sm]: "center",
		},
		display: "flex",
		flexShrink: 0,
		flexWrap: "wrap",
		gap: space["2"],
		gridColumnEnd: "action",
		gridColumnStart: "action",
		gridRowEnd: "action",
		gridRowStart: "action",
		marginBlockStart: {
			default: space["2"],
			[conditions.sm]: space["0"],
		},
		marginInlineStart: {
			default: space["0"],
			[conditions.sm]: space["3"],
		},
		minWidth: 0,
	},
	default: { [alertVars.iconColor]: colors.mutedContent },
	description: {
		boxSizing: "border-box",
		color: colors.mutedContent,
		fontSize: fontSize["13"],
		fontWeight: fontWeight.regular,
		gridColumnEnd: "description",
		gridColumnStart: "description",
		gridRowEnd: "description",
		gridRowStart: "description",
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
		marginBlockStart: space.px,
		minWidth: 0,
		textWrap: "pretty",
	},
	// Every alert sits on the surface behind a hairline; the icon alone
	// carries the status color.
	error: { [alertVars.iconColor]: colors.destructive },
	icon: {
		alignItems: "center",
		alignSelf: "start",
		color: alertVars.iconColor,
		display: "inline-flex",
		flexShrink: 0,
		gridColumnEnd: "icon",
		gridColumnStart: "icon",
		gridRowEnd: "icon",
		gridRowStart: "icon",
		height: glyphSize.sm,
		justifyContent: "center",
		// Centers the glyph on the 20px title line.
		marginBlockStart: `calc((${lineHeight["20"]} - ${glyphSize.sm}) / 2)`,
		marginInlineEnd: space["2"],
		width: glyphSize.sm,
	},
	info: { [alertVars.iconColor]: colors.infoSolid },
	root: {
		alignItems: "start",
		backgroundColor: colors.surface,
		borderColor: colors.border,
		borderRadius: shape.controlRadiusLarge,
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxSizing: "border-box",
		color: colors.content,
		display: "grid",
		gridTemplateAreas: {
			default: '"icon title" "icon description" "action action"',
			[conditions.sm]: '"icon title action" "icon description action"',
		},
		gridTemplateColumns: {
			default: "max-content 1fr",
			[conditions.sm]: "max-content 1fr auto",
		},
		minWidth: 0,
		paddingBlock: space["3"],
		paddingInline: space["3"],
		position: "relative",
		width: "100%",
	},
	success: { [alertVars.iconColor]: colors.successSolid },
	title: {
		boxSizing: "border-box",
		color: "inherit",
		fontSize: fontSize["14"],
		fontWeight: fontWeight.medium,
		gridColumnEnd: "title",
		gridColumnStart: "title",
		gridRowEnd: "title",
		gridRowStart: "title",
		letterSpacing: letterSpacing.ui,
		lineHeight: lineHeight["20"],
		minWidth: 0,
		textWrap: "balance",
	},
	warning: { [alertVars.iconColor]: colors.warningSolid },
});
