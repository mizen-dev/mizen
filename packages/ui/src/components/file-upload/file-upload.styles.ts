import { create, keyframes } from "@stylexjs/stylex";
import { colors, fieldColors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { controlSize } from "../../styles/dimensions.stylex";
import {
	borderWidth,
	focus,
	focusMotion,
	focusOutline,
	opacity,
} from "../../styles/interaction.stylex";
import { duration, easing } from "../../styles/motion.stylex";
import { shadows } from "../../styles/shadows.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";
import {
	fontSize,
	fontWeight,
	lineHeight,
} from "../../styles/typography.stylex";

const draw = keyframes({
	from: { strokeDashoffset: 1 },
	to: { strokeDashoffset: 0 },
});

// One dash period is 11px; two periods per loop keeps the march seamless.
const march = keyframes({
	from: { strokeDashoffset: 0 },
	to: { strokeDashoffset: -22 },
});

export const fileUploadStyles = create({
	dropzone: {
		alignItems: "center",
		animationDuration: {
			":focus-visible": focusMotion.duration,
		},
		animationName: {
			":focus-visible": focusMotion.ring,
		},
		backgroundColor: {
			":is(:disabled, [data-disabled])": fieldColors.disabled,
			"[data-dragging]": colors.brandBackground,
			default: "transparent",
		},
		borderColor: {
			":is(:disabled, [data-disabled])": colors.border,
			":is([aria-invalid='true'], [data-invalid]):not(:disabled):not([data-disabled])": `color-mix(in oklch, ${colors.destructive} 62%, ${fieldColors.surface})`,
			// The marching dashes draw the edge while files hover.
			"[data-dragging]": "transparent",
			"[data-slot='file-upload-dropzone']:hover:not([data-disabled], [data-dragging], [data-invalid], [aria-invalid='true'])":
				{
					[conditions.canHover]: colors.controlBorderStrong,
				},
			default: `color-mix(in oklch, ${colors.content} 22%, transparent)`,
		},
		borderRadius: shape.controlRadiusLarge,
		borderStyle: "dashed",
		borderWidth: borderWidth.thin,
		boxSizing: "border-box",
		color: colors.content,
		cursor: {
			":is(:disabled, [data-disabled])": "not-allowed",
			default: "default",
		},
		// A slim drop row: the prompt reads left to right and the trigger ends it.
		display: "flex",
		flexDirection: "row",
		flexWrap: "wrap",
		gap: space["3"],
		justifyContent: "flex-start",
		opacity: {
			":is(:disabled, [data-disabled])": opacity.disabled,
			default: 1,
		},
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: focus.offset,
		outlineStyle: {
			default: focusOutline.restingOutlineStyle,
		},
		outlineWidth: borderWidth.focus,
		paddingBlock: space["3"],
		paddingInline: space["4"],
		position: "relative",
		textAlign: "start",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty:
			"background-color, border-color, box-shadow, outline-color, opacity",
		transitionTimingFunction: easing.expoOut,
		width: "100%",
	},
	// Line styles inherit to the rect, which only sets its geometry.
	dropzoneEdge: {
		animationDuration: "1.2s",
		animationIterationCount: "infinite",
		animationName: {
			[conditions.reducedMotion]: "none",
			default: march,
		},
		animationTimingFunction: "linear",
		// The edge covers the border box; the svg would default to 300 by 150.
		blockSize: `calc(100% + ${borderWidth.thin}px * 2)`,
		fill: "none",
		inlineSize: `calc(100% + ${borderWidth.thin}px * 2)`,
		insetBlockStart: `-${borderWidth.thin}px`,
		insetInlineStart: `-${borderWidth.thin}px`,
		opacity: {
			":is([data-dragging] > *)": 1,
			default: 0,
		},
		pointerEvents: "none",
		position: "absolute",
		stroke: colors.brandForeground,
		strokeDasharray: "6 5",
		strokeWidth: borderWidth.thin,
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "opacity",
	},
	hiddenInput: { display: "none" },
	item: {
		alignItems: "center",
		backgroundColor: {
			":hover": { [conditions.canHover]: colors.controlSurfaceHover },
			"[data-disabled]": fieldColors.disabled,
			default: colors.surface,
		},
		borderColor: {
			":has([data-slot='file-upload-item-status'][data-status='error'])":
				colors.destructive,
			default: colors.border,
		},
		borderRadius: shape.controlRadiusLarge,
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxShadow: shadows.outlineRest,
		boxSizing: "border-box",
		display: "flex",
		gap: space["2"],
		paddingBlock: space["3"],
		paddingInline: space["3"],
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "background-color, border-color, box-shadow",
		width: "100%",
	},
	itemContent: {
		display: "flex",
		flexDirection: "column",
		flexGrow: 1,
		gap: space["1"],
		minWidth: 0,
	},
	list: {
		display: "flex",
		flexDirection: "column",
		gap: space["2"],
		listStyle: "none",
		margin: space["0"],
		padding: space["0"],
		width: "100%",
	},
	liveRegion: {
		clip: "rect(0 0 0 0)",
		height: "1px",
		margin: "-1px",
		overflow: "hidden",
		padding: space["0"],
		position: "absolute",
		whiteSpace: "nowrap",
		width: "1px",
	},
	name: {
		color: colors.content,
		fontSize: fontSize["14"],
		fontWeight: fontWeight.medium,
		lineHeight: lineHeight["20"],
		minWidth: 0,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	preview: {
		alignItems: "flex-start",
		borderRadius: "inherit",
		boxSizing: "border-box",
		color: colors.brandForeground,
		display: "flex",
		height: "calc(100% - 1.5rem)",
		justifyContent: "flex-start",
		overflow: "hidden",
		padding: space["2"],
		width: "100%",
	},
	previewFull: { height: "100%", padding: 0 },
	previewImage: { height: "100%", objectFit: "cover", width: "100%" },
	previewRow: {
		alignItems: "center",
		backgroundColor: colors.brandBackground,
		borderRadius: shape.controlRadius,
		flexShrink: 0,
		height: "2.5rem",
		justifyContent: "center",
		padding: 0,
		width: "2.5rem",
	},
	previewUpload: {
		alignItems: "center",
		backgroundColor: colors.brandBackground,
		borderRadius: shape.controlRadius,
		flexShrink: 0,
		height: "2.5rem",
		justifyContent: "center",
		padding: 0,
		width: "2.5rem",
	},
	progress: { width: "100%" },
	remove: {
		alignItems: "center",
		animationDuration: {
			":focus-visible": focusMotion.duration,
		},
		animationName: {
			":focus-visible": focusMotion.ring,
		},
		backgroundColor: {
			":active": colors.secondary,
			":disabled": "transparent",
			":hover": { [conditions.canHover]: colors.controlSurfaceHover },
			default: "transparent",
		},
		borderColor: "transparent",
		borderRadius: shape.controlRadius,
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		color: {
			":disabled": colors.content,
			":hover": { [conditions.canHover]: colors.destructive },
			default: colors.secondaryContent,
		},
		cursor: { ":disabled": "not-allowed", default: "pointer" },
		display: "inline-flex",
		flexShrink: 0,
		height: { [conditions.sm]: controlSize["2xs"], default: controlSize.xs },
		justifyContent: "center",
		lineHeight: lineHeight.none,
		opacity: { ":disabled": opacity.disabled, default: 1 },
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: focus.offset,
		outlineStyle: {
			default: focusOutline.restingOutlineStyle,
		},
		outlineWidth: borderWidth.focus,
		padding: space["0"],
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "background-color, border-color, color, outline-color",
		userSelect: "none",
		width: { [conditions.sm]: controlSize["2xs"], default: controlSize.xs },
	},
	root: {
		display: "flex",
		flexDirection: "column",
		gap: space["3"],
		width: "100%",
	},
	rowItem: {
		backgroundColor: {
			":has([data-slot='file-upload-item-status'][data-status='error'])":
				colors.destructiveSubtle,
		},
		borderBlockEndWidth: { ":last-child": 0, default: borderWidth.thin },
		borderColor: colors.border,
		borderRadius: 0,
		// The list draws the outer edge; rows only draw the dividers.
		borderWidth: 0,
		boxShadow: "none",
	},
	// Rows share one surface with hairline dividers instead of separate cards.
	rows: {
		borderColor: colors.border,
		borderRadius: shape.controlRadiusLarge,
		borderStyle: "solid",
		// No files, no surface.
		borderWidth: { ":empty": 0, default: borderWidth.thin },
		gap: 0,
		overflow: "hidden",
	},
	size: {
		color: colors.secondaryContent,
		fontSize: fontSize["12"],
		fontVariantNumeric: "tabular-nums",
		fontWeight: fontWeight.regular,
		lineHeight: lineHeight["16"],
		whiteSpace: "nowrap",
	},
	status: {
		alignItems: "center",
		color: {
			"[data-status='error']": colors.destructive,
			"[data-status='success']": colors.successContent,
			"[data-status='uploading']": colors.brandForeground,
			default: colors.secondaryContent,
		},
		display: "inline-flex",
		fontSize: fontSize["12"],
		fontWeight: fontWeight.medium,
		gap: space["1"],
		lineHeight: lineHeight["16"],
		whiteSpace: "nowrap",
	},
	statusCheck: {
		flexShrink: 0,
		height: "1.125em",
		overflow: "visible",
		width: "1.125em",
	},
	statusCheckDraw: {
		animationDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: "320ms",
		},
		animationFillMode: "both",
		animationName: draw,
		animationTimingFunction: easing.easeOut,
	},
	statusCheckMark: {
		strokeDasharray: 1,
		strokeWidth: 2,
	},
	tile: {
		borderRadius: shape.controlRadiusLarge,
		boxShadow: "none",
		flexShrink: 0,
		height: "4.5rem",
		paddingBlock: 0,
		paddingInline: 0,
		position: "relative",
		width: "4.5rem",
	},
	tileContent: {
		borderRadius: `calc(${shape.controlRadiusLarge} - ${borderWidth.thin}px)`,
		gap: 0,
		height: "100%",
		position: "relative",
	},
	tileName: {
		bottom: space["1"],
		clipPath: {
			":is([data-slot='file-upload-item']:has([data-slot='file-upload-item-preview'] > img) *)":
				"inset(50%)",
			default: "none",
		},
		color: colors.secondaryContent,
		fontSize: fontSize["12"],
		insetInline: space["2"],
		position: "absolute",
	},
	tileRemove: {
		backgroundColor: {
			":is([data-slot='file-upload-item']:has([data-slot='file-upload-item-preview'] > img) *)":
				colors.surface,
			default: colors.controlSurfaceHover,
		},
		borderRadius: "9999px",
		boxShadow: "none",
		fontSize: fontSize["14"],
		insetBlockStart: space["1"],
		insetInlineEnd: space["1"],
		position: "absolute",
		zIndex: 1,
	},
	tiles: {
		flexDirection: "row",
		gap: space["2"],
		overflowX: "auto",
		paddingBlock: space["1"],
		paddingInline: space["1"],
	},
	upload: {
		backgroundColor: {
			"[data-disabled]": fieldColors.disabled,
			default: colors.surface,
		},
		borderRadius: shape.controlRadiusLarge,
		boxShadow: "none",
		cursor: { "[data-disabled]": "not-allowed", default: "auto" },
		paddingBlock: space["3"],
		paddingInline: space["3"],
		position: "relative",
	},
	uploadContent: {
		alignItems: "center",
		gap: space["3"],
		textAlign: "start",
	},
	uploadName: {
		maxWidth: "100%",
		overflowWrap: "anywhere",
		whiteSpace: "normal",
	},
	visuallyHidden: {
		clipPath: "inset(50%)",
		height: 1,
		overflow: "hidden",
		position: "absolute",
		whiteSpace: "nowrap",
		width: 1,
	},
});
