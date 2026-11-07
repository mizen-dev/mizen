// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";

vi.mock("@stylexjs/stylex", () => ({
	create: (styles: unknown) => styles,
	defineConsts: (constants: unknown) => constants,
	defineMarker: () => ({}),
	defineVars: (vars: unknown) => vars,
	keyframes: (frames: unknown) => frames,
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

import { toastStyles } from "../../../packages/ui/src/components/toast/toast.styles";
import { anchoredToastStyles } from "../../../packages/ui/src/components/toast/toast-anchored.styles";
import { toastStackedStyles } from "../../../packages/ui/src/components/toast/toast-stacked.styles";
import { colors } from "../../../packages/ui/src/styles/colors.stylex";
import { conditions } from "../../../packages/ui/src/styles/conditions.stylex";
import {
	borderWidth,
	focus,
	focusOutline,
} from "../../../packages/ui/src/styles/interaction.stylex";

const outlineStyle = {
	":focus-visible": "solid",
	default: focusOutline.restingOutlineStyle,
};
const viewportOutlineColor = {
	[conditions.forcedColors]: "Highlight",
	default: "transparent",
};
const viewportOutline = {
	outlineColor: viewportOutlineColor,
	outlineOffset: focus.offset,
	outlineStyle,
	outlineWidth: borderWidth.focus,
};

describe("Toast keyboard focus and visible indicator contract", () => {
	it("configures stacked viewport focus propagation and root focus ring", () => {
		expect(toastStyles).toMatchObject({
			viewport: {
				"--toast-focus-ring": {
					":focus-visible": colors.focusRing,
					default: "transparent",
				},
				...viewportOutline,
			},
		});

		expect(toastStackedStyles).toMatchObject({
			root: {
				outlineColor: {
					":focus-visible": colors.focusRing,
					default: "var(--toast-focus-ring, transparent)",
				},
				outlineOffset: focus.offset,
				outlineStyle,
				outlineWidth: borderWidth.focus,
			},
		});
	});

	it("configures anchored viewport focus propagation and standard/tooltip root focus rings", () => {
		expect(anchoredToastStyles).toMatchObject({
			root: {
				outlineColor: {
					":focus-visible": colors.focusRing,
					default: "var(--toast-focus-ring, transparent)",
				},
				outlineOffset: focus.offset,
				outlineStyle,
				outlineWidth: borderWidth.focus,
			},
			tooltipRoot: {
				outlineColor: {
					":focus-visible": colors.focusRing,
					default: "var(--toast-focus-ring, transparent)",
				},
				outlineOffset: focus.offset,
				outlineStyle,
				outlineWidth: borderWidth.focus,
			},
			viewport: {
				"--toast-focus-ring": {
					":focus-visible": colors.focusRing,
					default: "transparent",
				},
				...viewportOutline,
			},
		});
	});
});
