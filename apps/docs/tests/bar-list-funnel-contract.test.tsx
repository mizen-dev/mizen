// @vitest-environment happy-dom

import type { ComponentType } from "react";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { BarList } from "../../../packages/ui/src/components/bar-list/bar-list";
import { Funnel } from "../../../packages/ui/src/components/funnel/funnel";

const propsSpy = vi.hoisted(() => vi.fn((..._styles: unknown[]) => ({})));

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(values: T): T => values,
	defineMarker: () => ({}),
	defineVars: <T extends object>(values: T): T => values,
	keyframes: <T extends object>(frames: T): T => frames,
	props: propsSpy,
	when: { ancestor: () => ":where(*)" },
}));

const RuntimeBarList = BarList as ComponentType<Record<string, unknown>>;
const RuntimeFunnel = Funnel as ComponentType<Record<string, unknown>>;
// Dynamic StyleX styles reach props() as plain objects; read the inline size.
const sizes = () =>
	propsSpy.mock.calls
		.flat()
		.flatMap((style) =>
			style && typeof style === "object" && "inlineSize" in style
				? [(style as { inlineSize: string }).inlineSize]
				: []
		);

describe("BarList contract", () => {
	it("ranks items largest first and sizes bars against the largest", () => {
		propsSpy.mockClear();
		const markup = renderToStaticMarkup(
			h(RuntimeBarList, {
				"aria-label": "Visitors by device",
				items: [
					{ id: "mobile", label: "Mobile", value: 30 },
					{ id: "desktop", label: "Desktop", value: 60 },
				],
				valueLabel: "Visitors",
			})
		);

		expect(markup).toContain('<ul aria-label="Visitors by device"');
		expect(markup.indexOf("Desktop")).toBeLessThan(markup.indexOf("Mobile"));
		expect(markup).toContain(">Visitors<");
		expect(sizes()).toEqual(["100%", "50%"]);
	});

	it("rejects missing labels, duplicate ids, and negative values", () => {
		const render = (items: unknown) =>
			renderToStaticMarkup(h(RuntimeBarList, { "aria-label": "List", items }));
		expect(() =>
			renderToStaticMarkup(h(RuntimeBarList, { "aria-label": " ", items: [] }))
		).toThrow(TypeError);
		expect(() =>
			render([
				{ id: "a", label: "A", value: 1 },
				{ id: "a", label: "B", value: 2 },
			])
		).toThrow(RangeError);
		expect(() => render([{ id: "a", label: "A", value: -1 }])).toThrow(
			RangeError
		);
	});
});

describe("Funnel contract", () => {
	it("keeps stage order and shows each stage's share of the first", () => {
		propsSpy.mockClear();
		const markup = renderToStaticMarkup(
			h(RuntimeFunnel, {
				"aria-label": "Signup pipeline",
				stages: [
					{ id: "visits", label: "Visits", value: 200 },
					{ id: "signup", label: "Sign-up", value: 50 },
				],
			})
		);

		expect(markup).toContain('<ol aria-label="Signup pipeline"');
		expect(markup.indexOf("Visits")).toBeLessThan(markup.indexOf("Sign-up"));
		expect(markup).toContain(">100%<");
		expect(markup).toContain(">25%<");
		expect(sizes()).toEqual(["100%", "25%"]);
	});

	it("rejects invalid stages and tones", () => {
		const render = (overrides: Record<string, unknown>) =>
			renderToStaticMarkup(
				h(RuntimeFunnel, {
					"aria-label": "Funnel",
					stages: [{ id: "a", label: "A", value: 1 }],
					...overrides,
				})
			);
		expect(() => render({ stages: null })).toThrow(TypeError);
		expect(() => render({ tone: "toString" })).toThrow(RangeError);
		expect(() =>
			render({ stages: [{ id: "a", label: "A", value: Number.NaN }] })
		).toThrow(RangeError);
	});

	it("colors stages in palette order, caps colored stages at six, and accepts one tone", () => {
		const stages = Array.from({ length: 7 }, (_, index) => ({
			id: `s${index}`,
			label: `Stage ${index}`,
			value: 70 - index,
		}));
		expect(() =>
			renderToStaticMarkup(h(RuntimeFunnel, { "aria-label": "Funnel", stages }))
		).toThrow(RangeError);
		expect(() =>
			renderToStaticMarkup(
				h(RuntimeFunnel, { "aria-label": "Funnel", stages, tone: "series2" })
			)
		).not.toThrow();
	});
});

describe("BarList colors", () => {
	it("gives each item its palette color by input order and folds the seventh into gray", () => {
		propsSpy.mockClear();
		renderToStaticMarkup(
			h(RuntimeBarList, {
				"aria-label": "Sources",
				items: Array.from({ length: 7 }, (_, index) => ({
					id: `i${index}`,
					label: `Item ${index}`,
					value: 10 - index,
				})),
			})
		);
		const tints = propsSpy.mock.calls
			.flat()
			.flatMap((style) =>
				style && typeof style === "object" && "backgroundColor" in style
					? [String((style as { backgroundColor: string }).backgroundColor)]
					: []
			)
			.filter((color) => color.startsWith("color-mix"));
		expect(tints).toHaveLength(7);
		expect(new Set(tints.slice(0, 6)).size).toBe(6);
		expect(tints[6]).not.toBe(tints[0]);
	});
});
