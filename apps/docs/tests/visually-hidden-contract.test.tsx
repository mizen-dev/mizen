// @vitest-environment happy-dom

import type { ComponentPropsWithRef, ComponentType } from "react";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
	VisuallyHidden,
	type VisuallyHiddenProps,
} from "../../../packages/ui/src/components/visually-hidden/visually-hidden";

const propsSpy = vi.hoisted(() => vi.fn(() => ({})));

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(values: T): T => values,
	defineMarker: () => ({}),
	defineVars: <T extends object>(values: T): T => values,
	keyframes: () => "keyframes",
	props: propsSpy,
	when: { ancestor: () => ":where(*)" },
}));

type Rejects<T, K extends PropertyKey> = [Extract<keyof T, K>] extends [never]
	? true
	: false;
type RequiredProp<T, K extends keyof T> =
	Record<string, never> extends Pick<T, K> ? false : true;
type HasRef<T> = "ref" extends keyof T ? true : false;
type Contract = [
	Rejects<
		VisuallyHiddenProps,
		"aria-hidden" | "className" | "data-slot" | "role" | "style"
	>,
	RequiredProp<VisuallyHiddenProps, "children">,
	HasRef<VisuallyHiddenProps>,
	"aria-live" extends keyof VisuallyHiddenProps ? true : false,
	"aria-live" extends keyof ComponentPropsWithRef<"span"> ? true : false,
];
const contract: Contract = [true, true, true, true, true];
const UnsafeVisuallyHidden = VisuallyHidden as ComponentType<
	Record<string, unknown>
>;

describe("VisuallyHidden contract", () => {
	it("keeps its text in a native span and accessibility tree", () => {
		const markup = renderToStaticMarkup(
			<VisuallyHidden aria-live="polite" id="updates">
				Changes saved
			</VisuallyHidden>
		);

		expect(markup).toContain('<span aria-live="polite"');
		expect(markup).toContain('data-slot="visually-hidden"');
		expect(markup).toContain('id="updates"');
		expect(markup).toContain(">Changes saved</span>");
		expect(propsSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				clipPath: "inset(50%)",
				height: 1,
				overflow: "hidden",
				position: "absolute",
				width: 1,
			})
		);
		expect(contract.every(Boolean)).toBe(true);
	});

	it("protects accessibility visibility, role, slot, and styles at runtime", () => {
		const markup = renderToStaticMarkup(
			h(
				UnsafeVisuallyHidden,
				{
					"aria-hidden": true,
					className: "unsafe",
					"data-slot": "unsafe",
					role: "presentation",
					style: { display: "none" },
				},
				"Screen reader context"
			)
		);

		expect(markup).toContain('data-slot="visually-hidden"');
		expect(markup).not.toContain("aria-hidden");
		expect(markup).not.toContain("unsafe");
		expect(markup).not.toContain("role=");
		expect(markup).not.toContain("style=");
	});
});
