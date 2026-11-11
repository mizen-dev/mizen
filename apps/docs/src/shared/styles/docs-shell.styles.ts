import { colors } from "@mizen-labs/ui/colors.stylex";
import { conditions } from "@mizen-labs/ui/conditions.stylex";
import {
	borderWidth,
	focus,
	focusMotion,
	focusOutline,
} from "@mizen-labs/ui/interaction.stylex";
import { duration, easing } from "@mizen-labs/ui/motion.stylex";
import { shadows } from "@mizen-labs/ui/shadows.stylex";
import { shape } from "@mizen-labs/ui/shape.stylex";
import { space } from "@mizen-labs/ui/spacing.stylex";
import {
	fontSize,
	fontWeight,
	letterSpacing,
	lineHeight,
} from "@mizen-labs/ui/typography.stylex";
import { create } from "@stylexjs/stylex";
import { header } from "./header.stylex";

export const shellStyles = create({
	body: {
		display: {
			"@container docs-shell (min-width: 64rem)": "grid",
			default: "block",
		},
		gridTemplateColumns: {
			"@container docs-shell (min-width: 64rem)": "15rem minmax(0, 1fr)",
			default: null,
		},
		marginInline: "auto",
		maxWidth: "90rem",
		minHeight: `calc(100svh - ${header.offset})`,
	},
	brand: {
		alignItems: "center",
		columnGap: space["2"],
		display: "inline-flex",
		fontSize: fontSize["16"],
		fontWeight: fontWeight.semibold,
		letterSpacing: letterSpacing.subheading,
		textDecoration: "none",
	},
	brandMark: {
		color: colors.brandForeground,
		flexShrink: 0,
		height: "1.75rem",
		width: "1.75rem",
	},
	// The page canvas, scrollbar gutter included, matches the docs workspace;
	// other pages keep the plain surface.
	canvas: {
		backgroundColor: {
			":has([data-slot='docs-shell'])": colors.workarea,
			default: colors.surface,
		},
		// Text without a role of its own inherits the interface tracking.
		letterSpacing: letterSpacing.ui,
	},
	// Flat on the workspace, like Linear: the content card carries the frame,
	// so the aside needs no surface or border of its own.
	desktopSidebar: {
		alignSelf: "start",
		display: {
			"@container docs-shell (min-width: 64rem)": "flex",
			default: "none",
		},
		flexDirection: "column",
		height: `calc(100svh - ${header.offset})`,
		insetBlockStart: header.offset,
		position: "sticky",
	},
	// A transparent sticky strip; the card inside floats with an even inset.
	header: {
		insetBlockStart: header.inset,
		marginBlock: header.inset,
		paddingInline: header.inset,
		position: "sticky",
		zIndex: 20,
	},
	headerControls: {
		alignItems: "center",
		display: "flex",
		flexWrap: "wrap",
		gap: space["2"],
		justifyContent: "flex-end",
		minWidth: 0,
	},
	// Translucent so content scrolling underneath shows through, softened.
	headerInner: {
		alignItems: "center",
		backdropFilter: "blur(16px) saturate(1.5)",
		backgroundColor: `color-mix(in oklab, ${colors.surface} 72%, transparent)`,
		borderColor: colors.border,
		borderRadius: shape.surfaceRadius,
		borderStyle: "solid",
		borderWidth: borderWidth.thin,
		boxShadow: shadows.surface,
		boxSizing: "border-box",
		display: "flex",
		gap: space["2"],
		justifyContent: "space-between",
		marginInline: "auto",
		maxWidth: "90rem",
		minHeight: header.height,
		paddingInline: { default: space["3"], [conditions.sm]: space["4"] },
	},
	headerLink: {
		alignItems: "center",
		animationDuration: {
			":focus-visible": focusMotion.duration,
		},
		animationName: {
			":focus-visible": focusMotion.ring,
		},
		backgroundColor: {
			":hover": {
				[conditions.canHover]: colors.controlSurfaceHover,
			},
			default: "transparent",
		},
		borderRadius: shape.controlRadius,
		color: {
			":hover": {
				[conditions.canHover]: colors.content,
			},
			default: colors.secondaryContent,
		},
		display: "inline-flex",
		fontSize: fontSize["14"],
		lineHeight: lineHeight.none,
		minHeight: "2rem",
		// Rows sit on the workspace; the ring stays inside the narrow aside.
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: focus.offset,
		outlineStyle: {
			":focus-visible": "solid",
			default: focusOutline.restingOutlineStyle,
		},
		outlineWidth: borderWidth.focus,
		paddingBlock: space["2"],
		paddingInline: space["2"],
		textDecoration: "none",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "background-color, color",
		transitionTimingFunction: easing.easeOut,
	},
	headerLinks: {
		alignItems: "center",
		display: {
			default: "none",
			[conditions.sm]: "flex",
		},
		gap: space["1"],
	},
	main: {
		minWidth: 0,
	},
	mobileNav: {
		display: {
			"@container docs-shell (min-width: 64rem)": "none",
			default: "block",
		},
	},
	mobileSiteLinks: {
		display: "flex",
		flexWrap: "wrap",
		gap: space["1"],
		marginBlock: space["2"],
	},
	nav: {
		display: "grid",
	},
	navGroup: {
		display: "grid",
	},
	// Items hang off a guide line under the group icon; their text lines up
	// with the group title.
	navGroupList: {
		borderInlineStartColor: colors.border,
		borderInlineStartStyle: "solid",
		borderInlineStartWidth: borderWidth.thin,
		display: "grid",
		gap: "0.125rem",
		marginInlineStart: space["4"],
		paddingInlineStart: space["2"],
	},
	navGroups: {
		display: "grid",
		gap: space["5"],
	},
	navLink: {
		alignItems: "center",
		animationDuration: {
			":focus-visible": focusMotion.duration,
		},
		animationName: {
			":focus-visible": focusMotion.ring,
		},
		backgroundColor: {
			":hover": {
				[conditions.canHover]: colors.workareaControlSurface,
			},
			default: "transparent",
		},
		borderRadius: shape.controlRadius,
		color: {
			":hover": { [conditions.canHover]: colors.content },
			default: colors.mutedContent,
		},
		display: "flex",
		fontSize: fontSize["14"],
		fontWeight: fontWeight.regular,
		gap: space["2"],
		justifyContent: "space-between",
		lineHeight: lineHeight["20"],
		minHeight: "2rem",
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		// Drawn inset: the folding panel clips anything outside the row.
		outlineOffset: `-${borderWidth.focus}`,
		outlineStyle: {
			":focus-visible": "solid",
			default: focusOutline.restingOutlineStyle,
		},
		outlineWidth: borderWidth.focus,
		paddingInline: space["2"],
		textDecoration: "none",
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "background-color, color",
		transitionTimingFunction: easing.easeOut,
	},
	// The current page holds the neutral selection fill, like the page outline.
	navLinkCurrent: {
		backgroundColor: colors.selected,
		color: colors.content,
		fontWeight: fontWeight.medium,
	},
	navTreeChevron: {
		color: colors.mutedContent,
		flexShrink: 0,
		marginInlineStart: "auto",
		transform: {
			":is([data-panel-open] *)": "rotate(90deg)",
			default: "none",
		},
		transitionDuration: {
			[conditions.reducedMotion]: duration.instant,
			default: duration.fast,
		},
		transitionProperty: "transform",
		transitionTimingFunction: easing.easeOut,
	},
	navTreeHeading: {
		fontSize: "inherit",
		fontWeight: "inherit",
		margin: 0,
	},
	navTreeIcon: {
		color: colors.mutedContent,
		flexShrink: 0,
	},
	// A group header: icon, title in full ink, and a chevron that turns open.
	navTreeTrigger: {
		alignItems: "center",
		backgroundColor: {
			":hover": { [conditions.canHover]: colors.workareaControlSurface },
			default: "transparent",
		},
		borderRadius: shape.controlRadius,
		borderStyle: "none",
		color: colors.content,
		cursor: "pointer",
		display: "flex",
		fontFamily: "inherit",
		fontSize: fontSize["14"],
		fontWeight: fontWeight.medium,
		gap: space["2"],
		lineHeight: lineHeight["20"],
		minHeight: "2rem",
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: `-${borderWidth.focus}`,
		outlineStyle: {
			":focus-visible": "solid",
			default: focusOutline.restingOutlineStyle,
		},
		outlineWidth: borderWidth.focus,
		paddingInline: space["2"],
		textAlign: "start",
		width: "100%",
	},
	// The workspace runs edge to edge, so wide screens never show a seam.
	shell: {
		backgroundColor: colors.workarea,
		color: colors.content,
		containerName: "docs-shell",
		containerType: "inline-size",
		minHeight: "100svh",
	},
	sidebarList: {
		display: "grid",
		gap: space["5"],
		paddingBlock: space["3"],
		paddingInline: space["4"],
	},
	sidebarSearch: {
		flexShrink: 0,
		paddingBlockEnd: space["2"],
		paddingBlockStart: space["5"],
		paddingInline: space["4"],
	},
	// Matches the placeholder ink, so the icon reads as part of the hint.
	sidebarSearchIcon: {
		color: colors.mutedContent,
	},
	// The landing page runs white to the top edge, under the header.
	siteShell: { backgroundColor: colors.surface },
	skipLink: {
		animationDuration: {
			":focus-visible": focusMotion.duration,
		},
		animationName: {
			":focus-visible": focusMotion.ring,
		},
		backgroundColor: colors.primary,
		borderRadius: shape.controlRadius,
		color: colors.primaryContent,
		fontSize: fontSize["14"],
		insetBlockStart: space["2"],
		insetInlineStart: space["2"],
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: focus.offset,
		outlineStyle: {
			":focus-visible": "solid",
			default: focusOutline.restingOutlineStyle,
		},
		outlineWidth: borderWidth.focus,
		paddingBlock: space["2"],
		paddingInline: space["3"],
		position: "fixed",
		transform: {
			":focus-visible": "translateY(0)",
			default: "translateY(-200%)",
		},
		zIndex: 100,
	},
});
