// @vitest-environment happy-dom

import type { ComponentType } from "react";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";
import { AreaChart } from "../../../packages/ui/src/components/area-chart/area-chart";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(values: T): T => values,
	defineMarker: () => ({}),
	defineVars: <T extends object>(values: T): T => values,
	keyframes: <T extends object>(frames: T): T => frames,
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

const RuntimeAreaChart = AreaChart as ComponentType<Record<string, unknown>>;
const DAY = 86_400_000;
const series = [
	{
		id: "organic",
		label: "Organic",
		points: [
			{ time: 0, value: 30 },
			{ time: DAY, value: 40 },
		],
	},
	{
		id: "paid",
		label: "Paid",
		points: [
			{ time: 0, value: 10 },
			{ time: DAY, value: 20 },
		],
	},
];
const render = (overrides: Record<string, unknown> = {}) =>
	renderToStaticMarkup(
		h(RuntimeAreaChart, {
			"aria-label": "Visitors by source",
			series,
			timeZone: "UTC",
			...overrides,
		})
	);

describe("AreaChart contract", () => {
	it("renders one area and one line per series with a legend in palette order", () => {
		const markup = render();

		expect(markup).toContain('data-slot="area-chart"');
		expect(markup).toContain('aria-label="Visitors by source"');
		expect(markup).toContain("area-chart-line-organic");
		expect(markup).toContain("area-chart-line-paid");
		expect(markup).toContain("area-chart-area-organic");
		expect(markup.indexOf(">Organic<")).toBeLessThan(markup.indexOf(">Paid<"));
	});

	it("stacks to the summed total and normalizes percent to 100%", () => {
		expect(render()).toContain(">60</text>");
		expect(render({ layout: "percent" })).toContain(">100%</text>");
		expect(render({ layout: "overlap" })).toContain(">40</text>");
	});

	it("hides the legend on request and shows an empty status without values", () => {
		expect(render({ legend: false })).not.toContain('data-slot="chart-legend"');
		const empty = render({
			series: [{ id: "a", label: "A", points: [{ time: 0, value: null }] }],
		});
		expect(empty).toContain("No observations available.");
		expect(empty).not.toContain("<svg");
	});

	it("rejects invalid series, layouts, and stacks that cannot add up", () => {
		expect(() => render({ "aria-label": " " })).toThrow(TypeError);
		expect(() => render({ layout: "wiggle" })).toThrow(RangeError);
		expect(() => render({ series: [series[0], series[0]] })).toThrow(
			RangeError
		);
		expect(() =>
			render({
				series: Array.from({ length: 7 }, (_, index) => ({
					...series[0],
					id: `s${index}`,
				})),
			})
		).toThrow(RangeError);
		const gap = {
			...series[1],
			points: [
				{ time: 0, value: null },
				{ time: DAY, value: 1 },
			],
		};
		expect(() => render({ series: [series[0], gap] })).toThrow(RangeError);
		expect(() =>
			render({ layout: "overlap", series: [series[0], gap] })
		).not.toThrow();
	});
});
