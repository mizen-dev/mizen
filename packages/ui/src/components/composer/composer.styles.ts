import { create, props } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { borderWidth } from "../../styles/interaction.stylex";
import { duration, easing } from "../../styles/motion.stylex";
import { shadows } from "../../styles/shadows.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import {
	fontSize,
	fontWeight,
	lineHeight,
} from "../../styles/typography.stylex";

// Recipes share visual rules; layout decisions belong to the frame's CSS variables.
const shared = create({
	motion: {
		transitionDuration: {
			default: duration.fast,
			[conditions.reducedMotion]: duration.instant,
		},
		transitionTimingFunction: easing.expoOut,
	},
	row: { alignItems: "center", display: "flex", minWidth: 0 },
	smallText: { fontSize: fontSize["14"], lineHeight: lineHeight["20"] },
	surface: {
		backgroundColor: colors.surface,
		borderColor: colors.border,
		borderRadius: shape.floatingRadius,
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		color: colors.content,
	},
});
const slots = create({
	actions: {
		display: {
			":is([data-layout=adaptive]:not([data-multiline]) > *)": "contents",
			default: "flex",
		},
		flexShrink: 0,
		flexWrap: "wrap",
		gap: space["2"],
		gridColumn: "var(--composer-actions-column, auto)",
		gridRow: "var(--composer-actions-row, auto)",
		justifyContent: "space-between",
		marginInline: space["2"],
	},
	chip: {
		backgroundColor: colors.brandBackground,
		borderRadius: shape.controlRadius,
		padding: space["1"],
	},
	end: {
		gridColumn: "var(--composer-end-column, auto)",
		justifyContent: "end",
		marginInlineStart: "var(--composer-group-gap, auto)",
	},
	frame: {
		"--composer-max-rows": { default: "4", [conditions.sm]: "8" },
		"--composer-min-rows": {
			default: "var(--composer-preferred-rows, 1)",
			[conditions.sm]: "var(--composer-preferred-rows, 2)",
		},
		"--composer-padding": space["2"],
		alignItems: { "[data-layout=adaptive]": "center", default: "normal" },
		borderColor: {
			":has([aria-invalid='true'])": colors.destructive,
			default: colors.border,
		},
		boxShadow: shadows.surface,
		boxSizing: "border-box",
		cursor: "text",
		display: { "[data-layout=adaptive]": "grid", default: "flex" },
		flexDirection: "column",
		gridTemplateColumns: "var(--composer-columns, none)",
		gridTemplateRows: "var(--composer-rows, none)",
		minHeight: 0,
		minWidth: 0,
		opacity: { "[data-disabled]": 0.55, default: 1 },
		paddingBottom: space["2"],
		paddingInlineEnd: "var(--composer-frame-inset, 0px)",
		paddingInlineStart: "var(--composer-frame-inset, 0px)",
		paddingTop: "var(--composer-frame-inset, 0px)",
		position: "relative",
		transitionProperty: "border-color, box-shadow",
		width: "100%",
	},
	group: {
		flexWrap: "wrap",
		gap: space["1"],
		gridRow: "var(--composer-group-row, auto)",
	},
	icon: { display: "inline", whiteSpace: "nowrap" },
	input: {
		"::before": {
			color: colors.mutedContent,
			content: { "[data-empty]": "attr(data-placeholder)", default: "none" },
			pointerEvents: "none",
			position: "absolute",
		},
		"::placeholder": { color: colors.mutedContent },
		appearance: "none",
		backgroundColor: "transparent",
		borderWidth: 0,
		boxSizing: "border-box",
		color: "inherit",
		display: "block",
		fontFamily: "inherit",
		fontSize: fontSize["16"],
		fontWeight: fontWeight.regular,
		lineHeight: lineHeight["24"],
		minWidth: 0,
		outline: "none",
		overflowWrap: "anywhere",
		paddingBlock: space["1"],
		paddingInlineEnd: "var(--composer-text-inset, 0.75rem)",
		paddingInlineStart: "var(--composer-text-inset, 0.75rem)",
		position: "relative",
		resize: "none",
		whiteSpace: "pre-wrap",
		width: "100%",
	},
	item: {
		alignItems: "center",
		backgroundColor: {
			"[data-highlighted]": colors.brandBackground,
			default: "transparent",
		},
		borderRadius: shape.controlRadius,
		borderWidth: 0,
		color: {
			"[data-highlighted]": colors.brandForeground,
			default: colors.content,
		},
		cursor: "default",
		display: "flex",
		fontFamily: "inherit",
		gap: space["2"],
		minHeight: "2rem",
		opacity: { "[data-disabled]": 0.55, default: 1 },
		outline: "none",
		paddingBlock: space["1"],
		paddingInline: space["2"],
		textAlign: "start",
		userSelect: "none",
		width: "100%",
	},
	list: {
		overflowWrap: "anywhere",
		padding: space["2"],
		scrollPaddingBlock: space["2"],
	},
	listScroll: {
		maxHeight: "min(var(--available-height), 16rem)",
		minHeight: 0,
	},
	popup: {
		backgroundColor: colors.floatingSurface,
		boxShadow: shadows.floating,
		maxWidth: "var(--available-width)",
		opacity: {
			"[data-ending-style]": 0,
			"[data-starting-style]": 0,
			default: 1,
		},
		outline: "none",
		transform: {
			"[data-ending-style]": "translateY(2px)",
			"[data-starting-style]": "translateY(4px)",
			default: "none",
		},
		transitionProperty: "opacity, transform",
		width: "var(--anchor-width)",
	},
	positioner: { width: "var(--anchor-width)", zIndex: 50 },
	scroll: {
		borderStartEndRadius: "inherit",
		borderStartStartRadius: "inherit",
		gridColumn: "var(--composer-editor-column, auto)",
		gridRow: "var(--composer-editor-row, auto)",
		minHeight: 0,
		minWidth: 0,
		paddingTop: "var(--composer-scroll-inset, var(--composer-padding))",
	},
	scrollbar: { paddingInline: "1px", width: "0.375rem" },
	start: {
		gridColumn: "var(--composer-start-column, auto)",
		marginInlineEnd: "var(--composer-group-gap, 0px)",
	},
	status: {
		alignItems: "center",
		color: colors.mutedContent,
		display: "flex",
		fontSize: fontSize["14"],
		gap: space["2"],
		justifyContent: "space-between",
		paddingBlock: space["2"],
		paddingInline: space["3"],
	},
	thumb: {
		backgroundColor: colors.controlBorderStrong,
		borderRadius: "9999px",
	},
	token: {
		boxDecorationBreak: "clone",
		color: colors.brandForeground,
		cursor: "default",
		fontWeight: fontWeight.medium,
		overflowWrap: "anywhere",
		verticalAlign: "baseline",
	},
});
const recipes = {
	actions: [shared.row, slots.actions],
	chip: [slots.chip],
	end: [slots.end],
	frame: [shared.surface, shared.motion, slots.frame],
	group: [shared.row, slots.group],
	icon: [slots.icon],
	input: [slots.input],
	item: [shared.smallText, slots.item],
	list: [slots.list],
	listScroll: [slots.listScroll],
	popup: [shared.surface, shared.motion, slots.popup],
	positioner: [slots.positioner],
	scroll: [slots.scroll],
	scrollbar: [slots.scrollbar],
	start: [slots.start],
	status: [slots.status],
	thumb: [slots.thumb],
	token: [slots.token],
};
export function presentation(...names: (keyof typeof recipes)[]) {
	return props(names.map((name) => recipes[name]));
}
