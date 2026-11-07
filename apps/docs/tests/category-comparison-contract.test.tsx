// @vitest-environment happy-dom

import type { ComponentProps, ComponentType } from "react";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
	CategoryComparison,
	type CategoryComparisonProps,
} from "../../../packages/ui/src/components/category-comparison/category-comparison";

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
type CategoryComparisonContract = [
	"categories" extends keyof CategoryComparisonProps ? true : false,
	"aria-label" extends keyof CategoryComparisonProps ? true : false,
	"seriesLabel" extends keyof CategoryComparisonProps ? true : false,
	Rejects<
		CategoryComparisonProps,
		"ariaLabel" | "children" | "className" | "data-slot" | "role" | "style"
	>,
	"ref" extends keyof ComponentProps<typeof CategoryComparison> ? true : false,
];
const contract: CategoryComparisonContract = [true, true, true, true, true];
const RuntimeCategoryComparison = CategoryComparison as ComponentType<
	Record<string, unknown>
>;
const BAR_PATHS =
	/<path\b[^>]*data-ts-key="category-comparison-bars:[^"]*"[^>]*d="([^"]+)"[^>]*\/>/g;
const BAR_START_Y = /^M[\d.-]+,([\d.-]+)/;
const BAR_START_X = /^M([\d.-]+),/;
const BAR_END_X = /H([\d.-]+)/;
const BAR_ARC_Y = /A[\d.-]+,[\d.-]+ \d+ \d+ \d+ [\d.-]+,([\d.-]+)/g;
const SHARED_LABELS = />Shared<\/text>/g;
const NORTH_BAR = /data-ts-key="category-comparison-bars:[^"]*north"/;
const SOUTH_BAR = /data-ts-key="category-comparison-bars:[^"]*south"/;
const JAN_BAR = /data-ts-key="category-comparison-bars:[^"]*jan"/;
const JAN_COMPARISON_BAR =
	/data-ts-key="category-comparison-bars:[^"]*jan:comparison"/;
const ZERO_BAR = /data-ts-key="category-comparison-bars:[^"]*none"/;

function barGeometry(path: string) {
	const yPositions = [
		Number(path.match(BAR_START_Y)?.[1]),
		...Array.from(path.matchAll(BAR_ARC_Y), ([, y]) => Number(y)),
	];
	return {
		endX: Number(path.match(BAR_END_X)?.[1]),
		height: Math.max(...yPositions) - Math.min(...yPositions),
		startX: Number(path.match(BAR_START_X)?.[1]),
		startY: yPositions[0],
	};
}

const commonProps = {
	"aria-label": "Department change",
	seriesLabel: "Change",
};

function render(
	categories: readonly { id: string; label: string; value: number }[]
) {
	return renderToStaticMarkup(
		h(RuntimeCategoryComparison, { ...commonProps, categories })
	);
}

describe("CategoryComparison contract", () => {
	it("keeps category order and labels while drawing from a shared zero baseline", () => {
		const markup = render([
			{ id: "support", label: "Support", value: 8 },
			{ id: "research", label: "Research", value: -4 },
			{ id: "design", label: "Design", value: 0 },
		]);
		const support = markup.indexOf(">Support</text>");
		const research = markup.indexOf(">Research</text>");
		const design = markup.indexOf(">Design</text>");
		const bars = Array.from(markup.matchAll(BAR_PATHS), ([, path]) =>
			barGeometry(path)
		);
		const zero = bars[2].startX;

		expect(markup).toContain('data-slot="category-comparison"');
		expect(markup).toContain('data-slot="chart-frame"');
		expect(markup).toContain('aria-label="Department change"');
		expect(support).toBeGreaterThan(-1);
		expect(research).toBeGreaterThan(support);
		expect(design).toBeGreaterThan(research);
		expect(bars).toHaveLength(3);
		expect(bars[0].startX).toBeCloseTo(zero);
		expect(bars[0].endX).toBeGreaterThan(zero);
		expect(bars[1].endX).toBeCloseTo(zero);
		expect(bars[1].startX).toBeLessThan(zero);
		expect((bars[0].endX - zero) / (zero - bars[1].startX)).toBeCloseTo(2, 1);
		expect(bars[2].endX).toBeCloseTo(zero);
		expect(bars[0].height).toBeCloseTo(20);
		expect(bars[1].height).toBeCloseTo(20);
		expect(bars[0].startY).toBeLessThan(bars[1].startY);
		expect(bars[1].startY).toBeLessThan(bars[2].startY);
		expect(contract.every(Boolean)).toBe(true);
	});

	it("formats signed axis ticks and keeps duplicate display labels distinct by id", () => {
		const markup = renderToStaticMarkup(
			h(RuntimeCategoryComparison, {
				...commonProps,
				categories: [
					{ id: "north", label: "Shared", value: 10 },
					{ id: "south", label: "Shared", value: -5 },
				],
				formatValue: (value: number) => `${value} people`,
			})
		);

		expect(markup.match(SHARED_LABELS)).toHaveLength(2);
		// The value axis nices to its tick count: -5, 0, 5, 10.
		expect(markup).toContain(">-5 people</text>");
		expect(markup).toContain(">10 people</text>");
		expect(markup).toMatch(NORTH_BAR);
		expect(markup).toMatch(SOUTH_BAR);
	});

	it("renders a named empty status and keeps all-zero data non-empty", () => {
		const empty = render([]);
		const zero = render([{ id: "none", label: "None", value: 0 }]);

		expect(empty).toContain('role="status"');
		expect(empty).toContain('aria-label="Department change"');
		expect(empty).toContain("No categories available.");
		expect(empty).not.toContain("<svg");
		expect(zero).toMatch(ZERO_BAR);
	});

	it("rejects invalid names, categories, values, locales, and tones", () => {
		const propsFor = (overrides: Record<string, unknown>) => ({
			...commonProps,
			categories: [{ id: "one", label: "One", value: 1 }],
			...overrides,
		});
		const renderInvalid = (overrides: Record<string, unknown>) =>
			renderToStaticMarkup(h(RuntimeCategoryComparison, propsFor(overrides)));

		expect(() => renderInvalid({ "aria-label": " " })).toThrow(TypeError);
		expect(() => renderInvalid({ seriesLabel: " " })).toThrow(TypeError);
		expect(() => renderInvalid({ locale: " " })).toThrow(TypeError);
		expect(() => renderInvalid({ locale: "bad_locale" })).toThrow(RangeError);
		expect(() => renderInvalid({ tone: "toString" })).toThrow(RangeError);
		expect(() =>
			renderInvalid({ categories: [{ id: " ", label: "One", value: 1 }] })
		).toThrow(TypeError);
		expect(() =>
			renderInvalid({ categories: [{ id: "one", label: " ", value: 1 }] })
		).toThrow(TypeError);
		expect(() =>
			renderInvalid({
				categories: [
					{ id: "same", label: "North", value: 1 },
					{ id: "same", label: "South", value: 2 },
				],
			})
		).toThrow(RangeError);
		expect(() =>
			renderInvalid({
				categories: [{ id: "one", label: "One", value: Number.NaN }],
			})
		).toThrow(RangeError);
		expect(() =>
			renderInvalid({
				categories: [
					{ id: "one", label: "One", value: Number.POSITIVE_INFINITY },
				],
			})
		).toThrow(RangeError);
		expect(() => renderInvalid({ categories: null })).toThrow(TypeError);
		expect(() =>
			renderInvalid({
				categories: [
					{ id: "large-negative", label: "Negative", value: -1e308 },
					{ id: "large-positive", label: "Positive", value: 1e308 },
				],
			})
		).toThrow(RangeError);
	});

	it("protects its root slot and native styling props at runtime", () => {
		const markup = renderToStaticMarkup(
			h(RuntimeCategoryComparison, {
				...commonProps,
				categories: [],
				className: "caller-class",
				"data-slot": "forged",
				role: "img",
				style: { color: "red" },
			})
		);

		expect(markup).toContain('data-slot="category-comparison"');
		expect(markup).not.toContain("caller-class");
		expect(markup).not.toContain('data-slot="forged"');
		expect(markup).toContain('role="status"');
		expect(markup).not.toContain('style="color:red"');
	});

	it("draws comparison bars beside values, vertically, with a full-scale track", () => {
		const markup = renderToStaticMarkup(
			h(RuntimeCategoryComparison, {
				...commonProps,
				categories: [
					{ comparison: 4, id: "jan", label: "Jan", value: 6 },
					{ comparison: 5, id: "feb", label: "Feb", value: 8 },
				],
				comparisonLabel: "Last year",
				orientation: "vertical",
				track: true,
			})
		);

		expect(markup).toMatch(JAN_BAR);
		expect(markup).toMatch(JAN_COMPARISON_BAR);
		expect(markup).toContain("category-comparison-track");
		expect(markup).toContain("Last year");
	});

	it("requires a comparison label and a known orientation", () => {
		const renderWith = (overrides: Record<string, unknown>) =>
			renderToStaticMarkup(
				h(RuntimeCategoryComparison, {
					...commonProps,
					categories: [{ comparison: 1, id: "a", label: "A", value: 2 }],
					...overrides,
				})
			);
		expect(() => renderWith({})).toThrow(TypeError);
		expect(() =>
			renderWith({ comparisonLabel: "Last year", orientation: "diagonal" })
		).toThrow(RangeError);
		expect(() =>
			renderWith({
				categories: [{ comparison: Number.NaN, id: "a", label: "A", value: 2 }],
				comparisonLabel: "Last year",
			})
		).toThrow(RangeError);
	});
});
