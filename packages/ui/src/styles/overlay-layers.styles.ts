import { create } from "@stylexjs/stylex";
import { colors } from "./colors.stylex";
import { conditions } from "./conditions.stylex";

export const overlayLayerStyles = create({
	backdrop: {
		backdropFilter: {
			[conditions.forcedColors]: "none",
			"@media (prefers-reduced-transparency: reduce)": "none",
			default: "blur(4px)",
		},
		backgroundColor: `color-mix(in srgb, ${colors.backdrop} 42%, transparent)`,
		zIndex: 0,
	},
	modalPortal: {
		height: 0,
		insetBlockStart: 0,
		insetInlineStart: 0,
		isolation: "isolate",
		overflow: "visible",
		position: "fixed",
		width: 0,
		zIndex: 50,
	},
	modalViewport: { zIndex: 1 },
});
