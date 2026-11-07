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
import { toastStackedStyles } from "../../../packages/ui/src/components/toast/toast-stacked.styles";
import { space } from "../../../packages/ui/src/styles/spacing.stylex";

describe("Toast stacking spacing and motion", () => {
	it("removes pointer-events block from viewport and provides root hover bridge", () => {
		expect(toastStyles.viewport).not.toHaveProperty("pointerEvents");

		expect(toastStackedStyles).toMatchObject({
			root: {
				"--toast-calc-height":
					"var(--toast-frontmost-height, var(--toast-height))",
				"--toast-gap": space["3"],
				"--toast-inset": space["5"],
				"--toast-peek": space["3"],
				"--toast-scale": "calc(max(0, 1 - var(--toast-index, 0) * 0.1))",
				"--toast-shrink": "calc(1 - var(--toast-scale))",
				"::after": {
					content: '""',
					height: "calc(var(--toast-gap) + 1px)",
					left: 0,
					position: "absolute",
					width: "100%",
				},
			},
			rootBottom: {
				"::after": { bottom: "100%" },
			},
			rootTop: {
				"::after": { top: "100%" },
			},
		});
	});

	it("preserves card opacity while hiding behind content until expanded", () => {
		expect(toastStackedStyles).toMatchObject({
			content: {
				opacity: {
					"[data-behind]:not([data-expanded])": 0,
					"[data-expanded]": 1,
					default: 1,
				},
				pointerEvents: {
					"[data-behind]:not([data-expanded])": "none",
					default: "auto",
				},
				transitionDuration: {
					default: "250ms",
				},
			},
			root: {
				opacity: {
					"[data-ending-style]": 0,
					"[data-limited]": 0,
					default: 1,
				},
			},
		});
	});

	it("applies transition timing to root transform, opacity, and height", () => {
		expect(toastStackedStyles).toMatchObject({
			root: {
				transitionDuration: { default: "500ms, 500ms, 150ms" },
				transitionProperty: "transform, opacity, height",
				transitionTimingFunction: {
					default: expect.stringContaining("cubic-bezier(0.22, 1, 0.36, 1)"),
				},
			},
		});
	});

	it("implements top and bottom stack origins and motion geometry", () => {
		expect(toastStackedStyles).toMatchObject({
			rootBottom: {
				"--toast-calc-offset-y": expect.stringContaining("var(--toast-gap)"),
				bottom: 0,
				transform: {
					"[data-expanded]": expect.stringContaining(
						"var(--toast-calc-offset-y)"
					),
					"[data-starting-style]": expect.stringContaining(
						"translateY(calc(100% + var(--toast-inset"
					),
					default: expect.stringContaining("var(--toast-peek)"),
				},
				transformOrigin: "50% calc(50% + 50% * min(var(--toast-index, 0), 1))",
			},
			rootTop: {
				"--toast-calc-offset-y": expect.stringContaining("var(--toast-gap)"),
				top: 0,
				transform: {
					"[data-expanded]": expect.stringContaining(
						"var(--toast-calc-offset-y)"
					),
					"[data-starting-style]": expect.stringContaining(
						"translateY(calc(-100% - var(--toast-inset"
					),
					default: expect.stringContaining("var(--toast-peek)"),
				},
				transformOrigin: "50% calc(50% - 50% * min(var(--toast-index, 0), 1))",
			},
		});

		expect(toastStackedStyles).toMatchObject({
			rootBottom: {
				transform: {
					default: expect.stringContaining("var(--toast-calc-height)"),
				},
			},
			rootTop: {
				transform: {
					default: expect.stringContaining("var(--toast-calc-height)"),
				},
			},
		});
	});

	it("preserves orthogonal offset during directional swipe dismissal", () => {
		expect(toastStackedStyles).toMatchObject({
			rootBottom: {
				transform: {
					"[data-ending-style][data-swipe-direction='down']":
						expect.stringContaining("var(--toast-calc-offset-y)"),
					"[data-ending-style][data-swipe-direction='left']":
						expect.stringContaining("var(--toast-calc-offset-y)"),
					"[data-ending-style][data-swipe-direction='right']":
						expect.stringContaining("var(--toast-calc-offset-y)"),
					"[data-ending-style][data-swipe-direction='up']":
						expect.stringContaining("var(--toast-calc-offset-y)"),
				},
			},
			rootTop: {
				transform: {
					"[data-ending-style][data-swipe-direction='down']":
						expect.stringContaining("var(--toast-calc-offset-y)"),
					"[data-ending-style][data-swipe-direction='left']":
						expect.stringContaining("var(--toast-calc-offset-y)"),
					"[data-ending-style][data-swipe-direction='right']":
						expect.stringContaining("var(--toast-calc-offset-y)"),
					"[data-ending-style][data-swipe-direction='up']":
						expect.stringContaining("var(--toast-calc-offset-y)"),
				},
			},
		});
	});
});
