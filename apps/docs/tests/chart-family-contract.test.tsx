// @vitest-environment happy-dom

import type { ComponentType } from "react";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { CalendarHeatmap } from "../../../packages/ui/src/components/calendar-heatmap/calendar-heatmap";
import { Funnel } from "../../../packages/ui/src/components/funnel/funnel";
import { MetricTrend } from "../../../packages/ui/src/components/metric-trend/metric-trend";
import { PartToWhole } from "../../../packages/ui/src/components/part-to-whole/part-to-whole";
import { ProgressRings } from "../../../packages/ui/src/components/progress-rings/progress-rings";
import { RadarChart } from "../../../packages/ui/src/components/radar-chart/radar-chart";
import { RadialBars } from "../../../packages/ui/src/components/radial-bars/radial-bars";
import { SankeyChart } from "../../../packages/ui/src/components/sankey-chart/sankey-chart";
import { layoutSankey } from "../../../packages/ui/src/components/sankey-chart/sankey-layout";
import { ScatterChart } from "../../../packages/ui/src/components/scatter-chart/scatter-chart";
import { ScoreGauge } from "../../../packages/ui/src/components/score-gauge/score-gauge";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(values: T): T => values,
	defineMarker: () => ({}),
	defineVars: <T extends object>(values: T): T => values,
	keyframes: <T extends object>(frames: T): T => frames,
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

type Loose = ComponentType<Record<string, unknown>>;
const render = (component: unknown, props: Record<string, unknown>) =>
	renderToStaticMarkup(h(component as Loose, props));
const ARC = /<path d="M[^"]+A/g;

describe("ProgressRings", () => {
	const rings = [
		{
			display: "1,592 kcal",
			goal: 2000,
			id: "move",
			label: "Move",
			value: 1592,
		},
		{ goal: 120, id: "exercise", label: "Exercise", value: 150 },
	];

	it("lists each ring's value and true share, and caps the arc at the goal", () => {
		const markup = render(ProgressRings, { "aria-label": "Activity", rings });
		expect(markup).toContain('<figure aria-label="Activity"');
		expect(markup).toContain("1,592 kcal");
		expect(markup).toContain(">125%<");
		expect(markup.match(ARC)?.length).toBeGreaterThanOrEqual(4);
	});

	it("rejects more than three rings and goals that are not positive", () => {
		const four = Array.from({ length: 4 }, (_, index) => ({
			...rings[1],
			id: `r${index}`,
		}));
		expect(() =>
			render(ProgressRings, { "aria-label": "A", rings: four })
		).toThrow(RangeError);
		expect(() =>
			render(ProgressRings, {
				"aria-label": "A",
				rings: [{ ...rings[1], goal: 0 }],
			})
		).toThrow(RangeError);
	});
});

describe("ScoreGauge", () => {
	it("sums the score and lists each part's points", () => {
		const markup = render(ScoreGauge, {
			"aria-label": "Sleep score",
			parts: [
				{ id: "a", label: "Duration", max: 50, value: 49 },
				{
					detail: "20m earlier",
					id: "b",
					label: "Bedtime",
					max: 30,
					value: 29,
				},
			],
		});
		expect(markup).toContain(">78<");
		expect(markup).toContain("of 80");
		expect(markup).toContain("49/50");
		expect(markup).toContain("20m earlier");
	});

	it("rejects a value above its max", () => {
		expect(() =>
			render(ScoreGauge, {
				"aria-label": "Score",
				parts: [{ id: "a", label: "A", max: 5, value: 6 }],
			})
		).toThrow(RangeError);
	});
});

describe("RadialBars", () => {
	it("keeps tiles in input order and caps items at six", () => {
		const items = [
			{ id: "b", label: "Beta", value: 10 },
			{ id: "a", label: "Alpha", value: 30 },
		];
		const markup = render(RadialBars, { "aria-label": "Browsers", items });
		expect(markup.indexOf("Beta")).toBeLessThan(markup.indexOf("Alpha"));
		const seven = Array.from({ length: 7 }, (_, index) => ({
			...items[0],
			id: `i${index}`,
		}));
		expect(() =>
			render(RadialBars, { "aria-label": "B", items: seven })
		).toThrow(RangeError);
	});
});

describe("SankeyChart", () => {
	const sources = [
		{ id: "a", label: "A" },
		{ id: "b", label: "B" },
	];
	const targets = [
		{ id: "x", label: "X" },
		{ id: "y", label: "Y" },
	];
	const links = [
		{ source: "a", target: "x", value: 3 },
		{ source: "a", target: "y", value: 1 },
		{ source: "b", target: "y", value: 4 },
	];

	it("sizes nodes by their link totals and stacks ribbons without overlap", () => {
		const layout = layoutSankey(sources, targets, links, 100, 10);
		const [a, b] = layout.left;
		expect(a.value).toBe(4);
		expect(b.value).toBe(4);
		expect(a.height).toBeCloseTo(b.height);
		const fromA = layout.links.filter(({ source }) => source === "a");
		expect(fromA[1].sourceTop).toBeCloseTo(
			fromA[0].sourceTop + fromA[0].thickness
		);
	});

	it("renders labels, shares, and a flow table, and rejects unknown nodes", () => {
		const markup = render(SankeyChart, {
			"aria-label": "Flows",
			links,
			sources,
			targets,
		});
		expect(markup).toContain("· 63%");
		expect(markup).toContain("Flows flows");
		expect(() =>
			render(SankeyChart, {
				"aria-label": "Flows",
				links: [{ source: "z", target: "x", value: 1 }],
				sources,
				targets,
			})
		).toThrow(RangeError);
	});
});

describe("CalendarHeatmap", () => {
	it("renders a day table and rejects invalid or repeated dates", () => {
		const days = [
			{ date: "2026-01-01", value: 3 },
			{ date: "2026-01-02", value: null },
		];
		const markup = render(CalendarHeatmap, { "aria-label": "Activity", days });
		expect(markup).toContain('data-slot="calendar-heatmap"');
		expect(markup).toContain("Thu, Jan 1, 2026");
		expect(() =>
			render(CalendarHeatmap, {
				"aria-label": "A",
				days: [{ date: "2026-02-30", value: 1 }],
			})
		).toThrow(RangeError);
		expect(() =>
			render(CalendarHeatmap, { "aria-label": "A", days: [days[0], days[0]] })
		).toThrow(RangeError);
	});
});

describe("RadarChart", () => {
	it("needs three to eight axes and one value per axis", () => {
		const axes = [
			{ id: "a", label: "A" },
			{ id: "b", label: "B" },
			{ id: "c", label: "C" },
		];
		const series = [{ id: "s", label: "S", values: [1, 2, 3] }];
		expect(
			render(RadarChart, { "aria-label": "Profile", axes, series })
		).toContain('data-slot="radar-chart"');
		expect(() =>
			render(RadarChart, { "aria-label": "P", axes: axes.slice(0, 2), series })
		).toThrow(RangeError);
		expect(() =>
			render(RadarChart, {
				"aria-label": "P",
				axes,
				series: [{ ...series[0], values: [1] }],
			})
		).toThrow(RangeError);
	});
});

describe("chart family additions", () => {
	it("draws the funnel flow with value tiles in stage order", () => {
		const markup = render(Funnel, {
			"aria-label": "Sign-up",
			presentation: "flow",
			stages: [
				{ id: "a", label: "Opened", value: 200 },
				{ id: "b", label: "Converted", value: 50 },
			],
		});
		expect(markup).toContain('data-slot="funnel-flow"');
		expect(markup).toContain(">25%<");
		expect(markup.indexOf("Opened")).toBeLessThan(markup.indexOf("Converted"));
	});

	it("caps scatter groups at three and requires every point to name one", () => {
		const point = { group: "a", id: "p", label: "P", x: 1, y: 2 };
		const groups = ["a", "b", "c", "d"].map((id) => ({ id, label: id }));
		const props = { "aria-label": "S", xAxisLabel: "X", yAxisLabel: "Y" };
		expect(() =>
			render(ScatterChart, { ...props, groups, points: [point] })
		).toThrow(RangeError);
		expect(() =>
			render(ScatterChart, {
				...props,
				groups: groups.slice(0, 1),
				points: [{ ...point, group: "z" }],
			})
		).toThrow(RangeError);
		expect(
			render(ScatterChart, {
				...props,
				groups: groups.slice(0, 1),
				points: [point],
			})
		).toContain('data-slot="scatter-chart-legend"');
	});

	it("moves the stat card delta into a footer strip", () => {
		const markup = render(MetricTrend, {
			delta: h("span", null, "+16%"),
			deltaPlacement: "footer",
			description: "From last month",
			label: "Revenue",
			value: "$152k",
		});
		expect(markup).toContain('data-slot="metric-trend-footer"');
		expect(markup.indexOf("$152k")).toBeLessThan(markup.indexOf("+16%"));
	});

	it("caps part-to-whole at six parts and shows the total", () => {
		const parts = Array.from({ length: 7 }, (_, index) => ({
			id: `p${index}`,
			label: `Part ${index}`,
			value: 1,
		}));
		expect(() => render(PartToWhole, { "aria-label": "Mix", parts })).toThrow(
			RangeError
		);
		expect(
			render(PartToWhole, { "aria-label": "Mix", parts: parts.slice(0, 3) })
		).toContain('data-slot="part-to-whole-total"');
	});
});
