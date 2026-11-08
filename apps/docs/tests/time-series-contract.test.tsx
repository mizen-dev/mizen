// @vitest-environment happy-dom

import type { ComponentProps, ComponentType } from "react";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";
import {
	TimeSeries,
	type TimeSeriesProps,
} from "../../../packages/ui/src/components/time-series/time-series";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(values: T): T => values,
	defineMarker: () => ({}),
	defineVars: <T extends object>(values: T): T => values,
	keyframes: <T extends object>(frames: T): T => frames,
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

const LINE_PATH =
	/class="ts-chart__line"[\s\S]*?<path[^>]* d="(?<path>[^"]+)"/u;
// Line vertices: the M point and each L or cubic C endpoint (C carries two
// control points first).
const LINE_VERTEX =
	/[MLC](?:[\d.e-]+,[\d.e-]+,){0,2}(?<x>[\d.]+),(?<y>[\d.]+)/gu;
type Rejects<T, K extends PropertyKey> = [Extract<keyof T, K>] extends [never]
	? true
	: false;
type TimeSeriesContract = [
	"points" extends keyof TimeSeriesProps ? true : false,
	"aria-label" extends keyof TimeSeriesProps ? true : false,
	"timeZone" extends keyof TimeSeriesProps ? true : false,
	Rejects<TimeSeriesProps, "className" | "data-slot" | "role" | "style">,
	"ref" extends keyof ComponentProps<typeof TimeSeries> ? true : false,
];
const contract: TimeSeriesContract = [true, true, true, true, true];
const RuntimeTimeSeries = TimeSeries as ComponentType<Record<string, unknown>>;

const commonProps = {
	"aria-label": "Daily observations",
	seriesLabel: "Response time",
	timeZone: "America/Los_Angeles",
};
const intradayTickPattern = /Dec 31, \d+:\d{2} [AP]M PST/u;
const secondTickPattern = /Dec 31, 4:00:\d{2} PM PST/gu;

describe("TimeSeries contract", () => {
	it("renders temporal spacing and an accessible chart surface", () => {
		const points = [
			{ time: Date.UTC(2026, 0, 1, 0), value: 12 },
			{ time: Date.UTC(2026, 0, 1, 1), value: 18 },
			{ time: Date.UTC(2026, 0, 1, 10), value: 9 },
		] as const;
		const markup = renderToStaticMarkup(
			h(RuntimeTimeSeries, {
				...commonProps,
				formatValue: (value: number) => `${value} ms`,
				points,
			})
		);

		expect(markup).toContain('data-slot="time-series"');
		expect(markup).toContain('aria-label="Daily observations"');
		expect(markup).toContain('aria-label="Response time series"');
		expect(markup).toContain("Dec 31, 4:00 PM PST");
		expect(markup).toMatch(intradayTickPattern);
		// The area fill keeps a zero baseline, so ticks step 0, 5, 10, 15, 20.
		expect(markup).toContain(">10 ms</text>");
		expect(markup).toContain("<svg");
		// Resting points are hidden; read x positions from the line's vertices.
		const linePath = markup.match(LINE_PATH)?.[1] ?? "";
		const positions = Array.from(linePath.matchAll(LINE_VERTEX), (match) =>
			Number(match[1])
		);
		expect(positions).toHaveLength(3);
		expect(
			(positions[2] - positions[1]) / (positions[1] - positions[0])
		).toBeCloseTo(9);
		expect(contract.every(Boolean)).toBe(true);
	});

	it("uses formatAxisValue for axis labels when both formatters are supplied", () => {
		const start = Date.UTC(2026, 0, 1);
		const markup = renderToStaticMarkup(
			h(RuntimeTimeSeries, {
				...commonProps,
				formatAxisValue: (value: number) => `${value} req/s`,
				formatValue: (value: number) => `${value} ms`,
				points: [
					{ time: start, value: 12 },
					{ time: start + 60_000, value: 18 },
				],
			})
		);

		expect(markup).toContain(">10 req/s</text>");
		expect(markup).not.toContain(">10 ms</text>");
	});

	it("shows distinct seconds on a sub-minute time axis", () => {
		const start = Date.UTC(2026, 0, 1);
		const markup = renderToStaticMarkup(
			h(RuntimeTimeSeries, {
				...commonProps,
				points: [
					{ time: start, value: 1 },
					{ time: start + 15_000, value: 2 },
					{ time: start + 30_000, value: 3 },
				],
			})
		);
		const seconds = Array.from(
			markup.matchAll(secondTickPattern),
			([label]) => label
		);

		expect(new Set(seconds).size).toBeGreaterThan(1);
	});

	it("sorts a copy and keeps null values as a visible line gap", () => {
		const points = [
			{ time: 4000, value: 8 },
			{ time: 0, value: 2 },
			{ time: 2000, value: null },
			{ time: 6000, value: 7 },
		] as const;
		const markup = renderToStaticMarkup(
			h(RuntimeTimeSeries, { ...commonProps, points })
		);

		expect(points.map(({ time }) => time)).toEqual([4000, 0, 2000, 6000]);
		expect(
			markup.match(/data-ts-key="time-series-line:[^"]+:segment:/gu)?.length
		).toBe(2);
	});

	it("renders an honest empty state and a compact sparkline without guides", () => {
		const empty = renderToStaticMarkup(
			h(RuntimeTimeSeries, { ...commonProps, points: [] })
		);
		const sparkline = renderToStaticMarkup(
			h(RuntimeTimeSeries, {
				...commonProps,
				points: [
					{ time: 0, value: 1 },
					{ time: 60_000, value: 2 },
				],
				presentation: "sparkline",
			})
		);

		expect(empty).toContain("No observations available.");
		expect(empty).not.toContain("<svg");
		expect(sparkline).toContain('data-slot="chart-frame"');
		expect(sparkline).toContain('tabindex="0"');
		expect(sparkline).not.toContain('data-slot="chart-axis"');
		expect(sparkline).not.toContain('data-slot="chart-legend"');
	});

	it("rejects invalid labels, timestamps, values, duplicates, and time zones", () => {
		const render = (overrides: Record<string, unknown>) =>
			renderToStaticMarkup(
				h(RuntimeTimeSeries, {
					...commonProps,
					points: [{ time: 0, value: 1 }],
					...overrides,
				})
			);

		expect(() => render({ "aria-label": " " })).toThrow(TypeError);
		expect(() => render({ timeZone: " " })).toThrow(TypeError);
		expect(() => render({ timeZone: "Unknown/Zone" })).toThrow(RangeError);
		expect(() => render({ tone: "toString" })).toThrow(RangeError);
		expect(() => render({ points: [{ time: 0.5, value: 1 }] })).toThrow(
			RangeError
		);
		expect(() => render({ points: [{ time: 0, value: Number.NaN }] })).toThrow(
			RangeError
		);
		expect(() =>
			render({
				points: [
					{ time: 0, value: 1 },
					{ time: 0, value: 2 },
				],
			})
		).toThrow(RangeError);
	});

	it("rejects non-string formatter results on the shared chart value path", () => {
		expect(() =>
			renderToStaticMarkup(
				h(RuntimeTimeSeries, {
					...commonProps,
					formatValue: () => 12,
					points: [{ time: 0, value: 1 }],
				})
			)
		).toThrow("TimeSeries formatValue must return a string.");
	});
});
