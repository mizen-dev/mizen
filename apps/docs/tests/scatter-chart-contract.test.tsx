// @vitest-environment happy-dom

import type { ComponentProps, ComponentType } from "react";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";
import {
	ScatterChart,
	type ScatterChartProps,
} from "../../../packages/ui/src/components/scatter-chart/scatter-chart";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(values: T): T => values,
	defineMarker: () => ({}),
	defineVars: <T extends object>(values: T): T => values,
	keyframes: () => "keyframes",
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

type Rejects<T, K extends PropertyKey> = [Extract<keyof T, K>] extends [never]
	? true
	: false;
type ScatterChartContract = [
	"points" extends keyof ScatterChartProps ? true : false,
	"xAxisLabel" extends keyof ScatterChartProps ? true : false,
	"yAxisLabel" extends keyof ScatterChartProps ? true : false,
	Rejects<
		ScatterChartProps,
		"ariaLabel" | "children" | "className" | "data-slot" | "role" | "style"
	>,
	"ref" extends keyof ComponentProps<typeof ScatterChart> ? true : false,
];
const contract: ScatterChartContract = [true, true, true, true, true];
const UnsafeScatterChart = ScatterChart as ComponentType<
	Record<string, unknown>
>;

const baseProps = {
	"aria-label": "Study results",
	points: [
		{ id: "north", label: "North", x: -2, y: 18 },
		{ id: "zero", label: "Zero", x: 0, y: 0 },
	],
	xAxisLabel: "Hours",
	yAxisLabel: "Score",
};

function render(overrides: Record<string, unknown> = {}) {
	return renderToStaticMarkup(
		h(UnsafeScatterChart, { ...baseProps, ...overrides })
	);
}

describe("ScatterChart contract", () => {
	it("shows numeric axes, keyboard chart, and exact accessible table values", () => {
		const markup = render();

		expect(markup).toContain('data-slot="scatter-chart"');
		expect(markup).toContain('data-slot="chart-frame"');
		expect(markup).toContain('data-slot="chart-data"');
		expect(markup).toContain("Hours");
		expect(markup).toContain("Score");
		expect(markup).toContain('<data value="-2">-2</data>');
		expect(markup).toContain('<data value="0">0</data>');
		expect(markup).toContain('<data value="18">18</data>');
		expect(contract.every(Boolean)).toBe(true);
	});

	it("renders a single zero point and empty status", () => {
		const single = render({
			points: [{ id: "only", label: "Only", x: 0, y: 0 }],
		});
		expect(single).toContain('data value="0"');
		expect(render({ points: [] })).toContain("No data available.");
	});

	it("rejects duplicate ids, invalid coordinates, and incomplete labels", () => {
		expect(() =>
			render({
				points: [
					{ id: "same", label: "One", x: 1, y: 1 },
					{ id: "same", label: "Two", x: 2, y: 2 },
				],
			})
		).toThrow(RangeError);
		expect(() =>
			render({ points: [{ id: "bad", label: "Bad", x: Number.NaN, y: 1 }] })
		).toThrow(RangeError);
		expect(() => render({ xAxisLabel: " " })).toThrow(TypeError);
		expect(() =>
			render({
				points: [
					{ id: "bad", label: "Bad", x: 1, y: Number.POSITIVE_INFINITY },
				],
			})
		).toThrow(RangeError);
		expect(() => render({ formatX: () => null })).toThrow(TypeError);
	});
});
