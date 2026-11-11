import { create } from "@stylexjs/stylex";
import { glyphSize } from "../../styles/dimensions.stylex";
import { borderWidth } from "../../styles/interaction.stylex";
import { space } from "../../styles/spacing.stylex";

const ring = borderWidth.focus;
// The strip under the pills: a 4px thumb, 2px clear of the pills, in a bar
// with 1px around it. The focus ring's 3px fits inside it too.
const bar = `calc(${space["1"]} + 2px)`;
const strip = `calc(${bar} + 1px)`;

export const suggestionStyles = create({
	// One row tall: a scroll area fills its parent by default, but a row of
	// pills sizes to its content.
	fit: { height: "auto" },
	// A 14px glyph beside 13px text, whatever size the icon asks for.
	glyph: {
		display: "inline-flex",
		flexShrink: 0,
		height: { ":is(*) > svg": glyphSize.xs, default: glyphSize.xs },
		width: { ":is(*) > svg": glyphSize.xs, default: glyphSize.xs },
	},
	// The press surface on ::before inherits this radius, so it is a pill too.
	pill: {
		borderEndEndRadius: 9999,
		borderEndStartRadius: 9999,
		borderStartEndRadius: 9999,
		borderStartStartRadius: 9999,
		flexShrink: 0,
		whiteSpace: "nowrap",
	},
	// The focus-ring room above and below, and the scrollbar's strip, taken
	// back outside the scroll area, so the row lines up with what sits above
	// and below it. Inside, a negative block margin would overflow and scroll.
	// The row takes the width it is given and never asks for more, so a
	// long row scrolls instead of widening the layout around it.
	root: {
		contain: "inline-size",
		marginBlockEnd: `calc(-1 * ${strip})`,
		marginBlockStart: `-${ring}`,
	},
	// One line of pills. The inset leaves room for the focus ring inside the
	// scroll area; the inline margin takes it back, so the row lines up with
	// what sits beside it.
	row: {
		display: "flex",
		gap: space["2"],
		// Centered under an empty state's words while it fits; otherwise it
		// starts at the edge and scrolls.
		marginInline: {
			":is([data-slot='conversation-empty-state'] *)": "auto",
			default: `-${ring}`,
		},
		padding: ring,
		paddingBlockEnd: strip,
		width: "max-content",
	},
	// Thinner than a list's scrollbar, in its own strip under the pills.
	scrollbar: { height: bar, margin: 0, padding: "1px" },
	// Focus scrolls a pill clear of the 1.5rem fade, not just to the edge.
	viewport: { scrollPaddingInline: "1.5rem" },
});
