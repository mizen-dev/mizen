import { colors } from "@mizen-labs/ui/colors.stylex";
import { conditions } from "@mizen-labs/ui/conditions.stylex";
import { duration, easing } from "@mizen-labs/ui/motion.stylex";
import { shape } from "@mizen-labs/ui/shape.stylex";
import { space } from "@mizen-labs/ui/spacing.stylex";
import {
	fontSize,
	fontWeight,
	lineHeight,
} from "@mizen-labs/ui/typography.stylex";
import { create } from "@stylexjs/stylex";

export const collapsibleExampleStyles = create({
	body: {
		backgroundColor: colors.workarea,
		borderRadius: shape.controlRadiusLarge,
		padding: space["4"],
	},
	details: {
		display: "grid",
		fontSize: fontSize["14"],
		gap: space["2"],
		gridTemplateColumns: "1fr auto",
		lineHeight: lineHeight["20"],
		margin: 0,
	},
	indicator: {
		flexShrink: 0,
		transform: {
			":is([data-panel-open] *)": "rotate(180deg)",
			"[data-panel-open]": "rotate(180deg)",
			default: "none",
		},
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.disclosure,
		},
		transitionProperty: "transform",
		transitionTimingFunction: easing.expoOut,
	},
	label: { color: colors.mutedContent },
	// A dt and dd pair; display: contents keeps both cells in the dl grid.
	row: { display: "contents" },
	value: { color: colors.content, fontWeight: fontWeight.medium, margin: 0 },
});
