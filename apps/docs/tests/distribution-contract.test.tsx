// @vitest-environment happy-dom

import type { ComponentProps, ComponentType } from "react";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";
import {
	Distribution,
	type DistributionProps,
} from "../../../packages/ui/src/components/distribution/distribution";

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
type DistributionContract = [
	"values" extends keyof DistributionProps ? true : false,
	"domain" extends keyof DistributionProps ? true : false,
	"binCount" extends keyof DistributionProps ? true : false,
	"aria-label" extends keyof DistributionProps ? true : false,
	"seriesLabel" extends keyof DistributionProps ? true : false,
	Rejects<
		DistributionProps,
		"ariaLabel" | "children" | "className" | "data-slot" | "role" | "style"
	>,
	"ref" extends keyof ComponentProps<typeof Distribution> ? true : false,
];
const contract: DistributionContract = [
	true,
	true,
	true,
	true,
	true,
	true,
	true,
];
const RuntimeDistribution = Distribution as ComponentType<
	Record<string, unknown>
>;
const BAR_TAGS = /<rect\b[^>]*data-ts-key="distribution-bars:[^"]*"[^>]*>/gu;
const BAR_KEY = /data-ts-key="(?<key>[^"]+)"/u;
const BAR_X = /\bx="(?<x>[^"]+)"/u;
const BAR_Y = /\by="(?<y>[^"]+)"/u;
const BAR_WIDTH = /\bwidth="(?<width>[^"]+)"/u;
const BAR_HEIGHT = /\bheight="(?<height>[^"]+)"/u;
const INVALID_GEOMETRY = /NaN|Infinity/u;

const commonProps = {
	"aria-label": "Response time distribution",
	domain: [0, 8] as const,
	seriesLabel: "Requests",
};

function render(
	values: readonly number[],
	overrides: Record<string, unknown> = {}
) {
	return renderToStaticMarkup(
		h(RuntimeDistribution, { ...commonProps, values, ...overrides })
	);
}

describe("Distribution contract", () => {
	it("uses equal-width half-open bins and includes the final domain endpoint", () => {
		const values = Object.freeze([0, 1.999, 2, 3.999, 4, 5.999, 6, 8]);
		const markup = render(values, { binCount: 4 });
		const bars = Array.from(markup.matchAll(BAR_TAGS), ([bar]) => ({
			height: Number(bar.match(BAR_HEIGHT)?.[1]),
			key: bar.match(BAR_KEY)?.[1],
			width: Number(bar.match(BAR_WIDTH)?.[1]),
			x: Number(bar.match(BAR_X)?.[1]),
			y: Number(bar.match(BAR_Y)?.[1]),
		}));

		expect(markup).toContain('data-slot="distribution"');
		expect(markup).toContain('data-slot="chart-frame"');
		expect(markup).toContain('aria-label="Response time distribution"');
		expect(bars).toHaveLength(4);
		expect(new Set(bars.map(({ key }) => key)).size).toBe(4);
		expect(bars.map(({ x }) => x)).toEqual(
			[...bars.map(({ x }) => x)].sort((left, right) => left - right)
		);
		const gaps = bars
			.slice(1)
			.map((bar, index) => bar.x - (bars[index].x + bars[index].width));
		expect(bars.slice(1).every((bar) => bar.width === bars[0].width)).toBe(
			true
		);
		expect(gaps[0]).toBeGreaterThan(0);
		expect(gaps.every((gap) => Math.abs(gap - gaps[0]) < 0.01)).toBe(true);
		expect(bars.every((bar) => bar.height === bars[0].height)).toBe(true);
		expect(contract.every(Boolean)).toBe(true);
	});

	it("renders empty states and preserves zero-count and constant-value bins", () => {
		const empty = render([]);
		const sparse = render([0, 8], { binCount: 4 });
		const constant = render([3, 3, 3], { binCount: 4 });
		const sparseBars = Array.from(sparse.matchAll(BAR_TAGS), ([bar]) => bar);
		const sparseHeights = sparseBars.map((bar) =>
			Number(bar.match(BAR_HEIGHT)?.[1])
		);
		const constantBars = Array.from(
			constant.matchAll(BAR_TAGS),
			([bar]) => bar
		);

		expect(empty).toContain('role="status"');
		expect(empty).toContain('aria-label="Response time distribution"');
		expect(empty).toContain("No observations available.");
		expect(empty).not.toContain("<svg");
		expect(sparseBars).toHaveLength(4);
		expect(sparseHeights[0]).toBeGreaterThan(0);
		expect(sparseHeights.at(-1)).toBeCloseTo(sparseHeights[0]);
		expect(Number(sparseBars[1].match(BAR_HEIGHT)?.[1])).toBe(0);
		expect(Number(sparseBars[2].match(BAR_HEIGHT)?.[1])).toBe(0);
		expect(constantBars).toHaveLength(4);
		expect(Number(constantBars[1].match(BAR_HEIGHT)?.[1])).toBeGreaterThan(0);
		expect(constant).toContain(">0</text>");
	});

	it("formats value-axis labels separately from integer frequency counts", () => {
		const markup = render([0, 1, 4, 8], {
			binCount: 2,
			formatValue: (value: number) => `${value} ms`,
		});

		expect(markup).toContain(">0 ms</text>");
		expect(markup).toContain(">8 ms</text>");
		expect(markup).toContain(">2</text>");
		expect(markup).not.toContain(">1.5</text>");
	});

	it("keeps finite wide domains in valid chart geometry", () => {
		const markup = render([0, 1e307, 5e307, 1e308], {
			binCount: 2,
			domain: [0, 1e308],
		});
		const bars = Array.from(markup.matchAll(BAR_TAGS), ([bar]) => bar);
		const heights = bars.map((bar) => Number(bar.match(BAR_HEIGHT)?.[1]));

		expect(bars).toHaveLength(2);
		expect(markup).not.toMatch(INVALID_GEOMETRY);
		expect(heights[0]).toBeGreaterThan(0);
		expect(heights[0]).toBeCloseTo(heights[1]);
	});

	it("keeps small interval labels distinct with the default formatter", () => {
		const markup = render([0, 0.000_04, 0.000_08], {
			binCount: 4,
			domain: [0, 0.000_08],
		});

		expect(markup).toContain(">0.00002</text>");
		expect(markup).toContain(">0.00006</text>");
	});

	it("rejects invalid names, domains, values, bin counts, and formatting options", () => {
		const renderInvalid = (overrides: Record<string, unknown>) =>
			render([1, 2], overrides);

		expect(() => renderInvalid({ "aria-label": " " })).toThrow(TypeError);
		expect(() => renderInvalid({ seriesLabel: " " })).toThrow(TypeError);
		expect(() => renderInvalid({ locale: " " })).toThrow(TypeError);
		expect(() => renderInvalid({ locale: "bad_locale" })).toThrow(RangeError);
		expect(() => renderInvalid({ tone: "toString" })).toThrow(RangeError);
		expect(() => renderInvalid({ binCount: 0 })).toThrow(RangeError);
		expect(() => renderInvalid({ binCount: 1.5 })).toThrow(RangeError);
		expect(() => renderInvalid({ binCount: Number.MAX_SAFE_INTEGER })).toThrow(
			RangeError
		);
		expect(() => renderInvalid({ domain: [2, 2] })).toThrow(RangeError);
		expect(() => renderInvalid({ domain: [0, Number.NaN] })).toThrow(
			RangeError
		);
		expect(() => renderInvalid({ domain: [-1e308, 1e308] })).toThrow(
			RangeError
		);
		expect(() => renderInvalid({ values: [Number.NaN] })).toThrow(RangeError);
		expect(() => renderInvalid({ values: [Number.POSITIVE_INFINITY] })).toThrow(
			RangeError
		);
		expect(() => renderInvalid({ values: [-1] })).toThrow(RangeError);
		expect(() =>
			renderInvalid({ binCount: 4, domain: [1, 1 + Number.EPSILON] })
		).toThrow(RangeError);
		expect(() => renderInvalid({ formatValue: 3 })).toThrow(TypeError);
	});

	it("protects the root slot, status role, and native styling props at runtime", () => {
		const markup = renderToStaticMarkup(
			h(RuntimeDistribution, {
				...commonProps,
				className: "caller-class",
				"data-slot": "forged",
				role: "img",
				style: { color: "red" },
				values: [],
			})
		);

		expect(markup).toContain('data-slot="distribution"');
		expect(markup).not.toContain("caller-class");
		expect(markup).not.toContain('data-slot="forged"');
		expect(markup).toContain('role="status"');
		expect(markup).not.toContain('style="color:red"');
	});
});
