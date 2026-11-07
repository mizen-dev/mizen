import { create } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";
import { conditions } from "../../styles/conditions.stylex";
import { borderWidth } from "../../styles/interaction.stylex";
import { shape } from "../../styles/shape.stylex";
import { space } from "../../styles/spacing.stylex";

export const inlineCitationStyles = create({
	// The preview: site, title, then one line on what it says.
	card: {
		display: "flex",
		flexDirection: "column",
		gap: space["1"],
		inlineSize: "18rem",
		maxInlineSize: "100%",
	},
	cardDescription: { color: colors.mutedContent, margin: 0 },
	// Text sits 16px from the sides, as in a menu, and 12px from the ends.
	cardPopup: { paddingBlock: space["3"], paddingInline: space["4"] },
	cardSite: {
		alignItems: "center",
		color: colors.mutedContent,
		display: "flex",
		gap: space["1"],
	},
	cardTitle: { color: colors.content, margin: 0 },
	// A quiet chip in the sentence: favicon and site, or the first site and
	// a count when several sources back the same point.
	//
	// The visible chip is 16px, painted on ::before; the element around it is
	// a 24px target. Negative margins take the extra 4px on each side back,
	// so the line keeps its height and the text its spacing.
	chip: {
		"::before": {
			backgroundColor: {
				[conditions.canHover]: {
					":hover": colors.controlSurfaceHover,
					default: colors.controlSurface,
				},
				default: colors.controlSurface,
			},
			borderRadius: shape.inlineRadius,
			content: '""',
			inset: space["1"],
			position: "absolute",
			zIndex: -1,
		},
		alignItems: "center",
		appearance: "none",
		backgroundColor: "transparent",
		borderRadius: `calc(${shape.inlineRadius} + ${space["1"]})`,
		borderWidth: 0,
		color: { ":hover": colors.content, default: colors.mutedContent },
		cursor: "pointer",
		display: "inline-flex",
		fontFamily: "inherit",
		gap: space["1"],
		isolation: "isolate",
		margin: `calc(-1 * ${space["1"]})`,
		// The text after a citation brings its own space; this one is the
		// 4px before it, net of the target's inset.
		marginInlineStart: 0,
		outlineColor: {
			":focus-visible": colors.focusRing,
			default: "transparent",
		},
		outlineOffset: -2,
		outlineStyle: { ":focus-visible": "solid", default: "none" },
		outlineWidth: borderWidth.focus,
		padding: space["1"],
		paddingInline: `calc(${space["1"]} * 2)`,
		position: "relative",
		textDecoration: "none",
		verticalAlign: "0.1em",
		whiteSpace: "nowrap",
	},
	// A document has nothing to open, so it does not invite a click.
	chipStatic: { cursor: "default" },
	count: { fontVariantNumeric: "tabular-nums" },
	favicon: {
		blockSize: 12,
		borderRadius: 3,
		display: "block",
		flexShrink: 0,
		inlineSize: 12,
		objectFit: "cover",
	},
	// A globe, or a file for a document, stands in without an icon.
	faviconFallback: { color: colors.mutedContent, flexShrink: 0 },
	// Several sources behind one chip, listed like Sources.
	group: { inlineSize: "22rem", maxInlineSize: "100%" },
	// The popup's 8px inset plus each row's padding puts text 16px in.
	listPopup: { padding: space["2"] },
});
