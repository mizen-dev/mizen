import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { controlSize } from "../../styles/dimensions.stylex";
import {
	borderWidth,
	focus,
	focusMotion,
	focusOutline,
} from "../../styles/interaction.stylex";
import { duration, easing } from "../../styles/motion.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import { fontSize } from "../../styles/typography.stylex";

// The 28px action centres its 16px glyph 12px inside the field border, where
// Select puts its chevron.
const actionInset = `calc(${space["3"]} + ${borderWidth.thin} - 0.375rem)`;
// A leading glyph sits 8px inside the field border, as in InputGroup.
const addonInset = `calc(${space["2"]} + ${borderWidth.thin})`;

export const comboboxFieldStyles = create({
	clear: {
		alignItems: "center",
		animationDuration: {
			":focus-visible": focusMotion.duration,
		},
		animationName: {
			":focus-visible": focusMotion.ring,
		},
		appearance: "none",
		backgroundColor: "transparent",
		borderRadius: shape.controlRadius,
		borderWidth: 0,
		color: colors.content,
		cursor: "pointer",
		display: "inline-flex",
		height: "1.75rem",
		insetBlockStart: "50%",
		insetInlineEnd: actionInset,
		justifyContent: "center",
		opacity: {
			":hover": { [conditions.canHover]: 1 },
			default: 0.8,
		},
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: focus.offset,
		outlineStyle: {
			":focus-visible": "solid",
			default: focusOutline.restingOutlineStyle,
		},
		outlineWidth: {
			":focus-visible": borderWidth.focus,
			default: 0,
		},
		padding: 0,
		position: "absolute",
		transform: "translateY(-50%)",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "opacity",
		transitionTimingFunction: easing.expoOut,
		width: "1.75rem",
	},
	icon: {
		alignItems: "center",
		display: "inline-flex",
		justifyContent: "center",
	},
	inputGroup: {
		boxSizing: "border-box",
		display: "flex",
		position: "relative",
		width: "100%",
	},
	inputWithEndAction: {
		paddingInlineEnd: "2.25rem",
	},
	inputWithStartAddon: {
		paddingInlineStart: "2rem",
	},
	sizeDefault: {
		borderRadius: shape.controlRadiusLarge,
		height: controlSize.md,
	},
	sizeLg: {
		borderRadius: shape.controlRadiusLarge,
		fontSize: fontSize["16"],
		height: controlSize.lg,
	},
	sizeSm: {
		borderRadius: shape.controlRadius,
		fontSize: { [conditions.sm]: fontSize["13"], default: fontSize["16"] },
		height: controlSize.sm,
	},
	startAddon: {
		alignItems: "center",
		color: colors.content,
		display: "flex",
		insetBlock: 0,
		insetInlineStart: addonInset,
		opacity: 0.8,
		pointerEvents: "none",
		position: "absolute",
		zIndex: 1,
	},
	trigger: {
		alignItems: "center",
		animationDuration: {
			":focus-visible": focusMotion.duration,
		},
		animationName: {
			":focus-visible": focusMotion.ring,
		},
		appearance: "none",
		backgroundColor: "transparent",
		borderRadius: shape.controlRadius,
		borderWidth: 0,
		color: colors.content,
		cursor: "pointer",
		display: {
			":has(+ [data-slot='combobox-clear'])": "none",
			default: "inline-flex",
		},
		height: "1.75rem",
		insetBlockStart: "50%",
		insetInlineEnd: actionInset,
		justifyContent: "center",
		opacity: {
			":hover": { [conditions.canHover]: 1 },
			default: 0.8,
		},
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: focus.offset,
		outlineStyle: {
			":focus-visible": "solid",
			default: focusOutline.restingOutlineStyle,
		},
		outlineWidth: {
			":focus-visible": borderWidth.focus,
			default: 0,
		},
		padding: 0,
		position: "absolute",
		transform: "translateY(-50%)",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "opacity",
		transitionTimingFunction: easing.expoOut,
		width: "1.75rem",
	},
});
