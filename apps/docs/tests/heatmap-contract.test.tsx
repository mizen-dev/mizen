// @vitest-environment happy-dom

import type { ComponentProps, ComponentType } from "react";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";
import {
	Heatmap,
	type HeatmapProps,
} from "../../../packages/ui/src/components/heatmap/heatmap";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(values: T): T => values,
	defineMarker: () => ({}),
	defineVars: <T extends object>(values: T): T => values,
	keyframes: <T extends object>(frames: T): T => frames,
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

type Rejects<T, K extends PropertyKey> = [Extract<keyof T, K>] extends [never]
	? true
	: false;
type HeatmapContract = [
	"columns" extends keyof HeatmapProps ? true : false,
	"rows" extends keyof HeatmapProps ? true : false,
	"aria-label" extends keyof HeatmapProps ? true : false,
	Rejects<
		HeatmapProps,
		"ariaLabel" | "className" | "data-slot" | "role" | "style"
	>,
	"ref" extends keyof ComponentProps<typeof Heatmap> ? true : false,
];
const contract: HeatmapContract = [true, true, true, true, true];
const RuntimeHeatmap = Heatmap as ComponentType<Record<string, unknown>>;

const commonProps = {
	"aria-label": "Requests by weekday",
	columns: ["Mon", "Tue"],
	rows: [
		{ label: "Morning", values: [0, null] },
		{ label: "Evening", values: [4, 8] },
	],
};

function render(overrides: Record<string, unknown> = {}) {
	return renderToStaticMarkup(
		h(RuntimeHeatmap, { ...commonProps, ...overrides })
	);
}

const EMPTY_STATUS_REGEX = /<p role="status"[^>]*>No data available\.<\/p>/u;

describe("Heatmap contract", () => {
	it("keeps zero and missing values distinct and exposes an exact data table", () => {
		const markup = render({ max: 10 });

		expect(markup).toContain('data-slot="heatmap"');
		expect(markup).toContain('data-slot="chart-frame"');
		expect(markup).toContain('aria-label="Requests by weekday"');
		expect(markup).toContain('data-slot="chart-data"');
		expect(markup).toContain('<data value="0">0</data>');
		expect(markup).toContain("No data");
		expect(markup).toContain("High 10");
		expect(contract.every(Boolean)).toBe(true);
	});

	it("renders an empty status and accepts an all-zero range", () => {
		const empty = render({ rows: [] });
		const zero = render({ max: 0, rows: [{ label: "None", values: [0, 0] }] });

		// The group carries the chart name; the status keeps its own text.
		expect(empty).toContain('role="group"');
		expect(empty).toMatch(EMPTY_STATUS_REGEX);
		expect(empty).not.toContain("<svg");
		expect(zero).toContain("High 0");
		expect(zero).toContain('<data value="0">0</data>');
	});

	it("rejects invalid labels, matrix shapes, values, maximums, and tones", () => {
		expect(() => render({ "aria-label": " " })).toThrow(TypeError);
		expect(() => render({ columns: ["Mon", "Mon"] })).toThrow(RangeError);
		expect(() =>
			render({
				rows: [
					{ label: "Same", values: [0, 1] },
					{
						label: "Same",
						values: [1, 2],
					},
				],
			})
		).toThrow(RangeError);
		expect(() => render({ rows: [{ label: "Morning", values: [0] }] })).toThrow(
			RangeError
		);
		expect(() =>
			render({ rows: [{ label: "Morning", values: [-1, null] }] })
		).toThrow(RangeError);
		expect(() =>
			render({ rows: [{ label: "Morning", values: [Number.NaN, null] }] })
		).toThrow(RangeError);
		expect(() => render({ max: Number.POSITIVE_INFINITY })).toThrow(RangeError);
		expect(() => render({ tone: "toString" })).toThrow(RangeError);
	});
});
