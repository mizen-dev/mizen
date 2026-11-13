// @vitest-environment happy-dom

import type { ComponentPropsWithRef, ComponentType } from "react";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";
import {
	MetricTrend,
	type MetricTrendProps,
} from "../../../packages/ui/src/components/metric-trend/metric-trend";

const propsSpy = vi.hoisted(() => vi.fn((..._styles: unknown[]) => ({})));

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
type RequiredProp<T, K extends PropertyKey> = K extends keyof T
	? Record<string, never> extends Pick<T, K>
		? false
		: true
	: false;

type Contract = [
	Rejects<MetricTrendProps, "className" | "data-slot" | "role" | "style">,
	RequiredProp<MetricTrendProps, "label">,
	// A card can lead with its chart, so the headline value is optional.
	RequiredProp<MetricTrendProps, "value"> extends false ? true : false,
	// Without children MetricTrend is a stat card.
	RequiredProp<MetricTrendProps, "children"> extends false ? true : false,
	"ref" extends keyof MetricTrendProps ? true : false,
	"ref" extends keyof ComponentPropsWithRef<"div"> ? true : false,
];
const contract: Contract = [true, true, true, true, true, true];
const UnsafeMetricTrend = MetricTrend as ComponentType<Record<string, unknown>>;

describe("MetricTrend contract", () => {
	it("composes a labelled metric, optional description, and caller-owned trend chart", () => {
		const markup = renderToStaticMarkup(
			<MetricTrend
				description="Compared with the prior month."
				label="Monthly revenue"
				value="$84,250"
			>
				<svg aria-label="Revenue over twelve months" role="img" />
			</MetricTrend>
		);

		expect(markup).toContain('data-slot="metric-trend"');
		expect(markup).toContain('data-slot="metric"');
		expect(markup).toContain('data-slot="metric-label"');
		expect(markup).toContain('data-slot="metric-value"');
		expect(markup).toContain('data-slot="metric-description"');
		expect(markup).toContain('aria-label="Revenue over twelve months"');
		expect(markup).toContain("Monthly revenue");
		expect(markup).toContain("$84,250");
		expect(markup).toContain("Compared with the prior month.");
		expect(contract.every(Boolean)).toBe(true);
	});

	it("omits optional description and protects its native wrapper props", () => {
		const markup = renderToStaticMarkup(
			h(
				UnsafeMetricTrend,
				{
					className: "unsafe",
					"data-slot": "unsafe",
					label: "Active users",
					role: "img",
					style: { display: "none" },
					value: "2,340",
				},
				<span aria-label="Active users by week" role="img">
					Weekly trend
				</span>
			)
		);

		expect(markup).toContain('data-slot="metric-trend"');
		expect(markup).toContain('data-slot="metric-label"');
		expect(markup).toContain('data-slot="metric-value"');
		expect(markup).not.toContain('data-slot="metric-description"');
		expect(markup).not.toContain("unsafe");
		expect(markup.startsWith('<div data-slot="metric-trend">')).toBe(true);
		expect(markup).not.toContain("style=");
		expect(markup).toContain("Weekly trend");
	});

	it("makes the whole card a link with render and keeps its slot", () => {
		const markup = renderToStaticMarkup(
			h(MetricTrend, {
				label: "Orders today",
				render: h("a", { "data-slot": "custom", href: "/orders" }),
				value: "25,162",
			})
		);
		const root = markup.slice(0, markup.indexOf(">"));
		expect(root.startsWith("<a ")).toBe(true);
		expect(root).toContain('href="/orders"');
		expect(root).toContain('data-slot="metric-trend"');
		expect(markup).not.toContain('data-slot="custom"');
		expect(markup).toContain("Orders today");
		expect(markup).toContain("25,162");
		expect(
			renderToStaticMarkup(
				h(MetricTrend, { label: "Orders today", value: "25,162" })
			).startsWith('<div data-slot="metric-trend"')
		).toBe(true);
	});

	it("holds its shape and reports busy while loading", () => {
		const markup = renderToStaticMarkup(
			<MetricTrend
				delta={<span data-delta="">+16%</span>}
				description="From last week"
				label="Income"
				loading
				value="$84,250"
				valuePrefix="$"
			/>
		);

		expect(markup).toContain('aria-busy="true"');
		expect(markup).toContain("Income");
		for (const slot of ["value", "description", "delta"]) {
			expect(markup).toContain(
				`aria-hidden="true" data-slot="metric-trend-${slot}-placeholder"`
			);
		}
		// The data is not shown, but each slot keeps its element.
		expect(markup).toContain('data-slot="metric-value"');
		expect(markup).toContain('data-slot="metric-description"');
		for (const hidden of ["84,250", "From last week", "data-delta"]) {
			expect(markup).not.toContain(hidden);
		}
		const bare = renderToStaticMarkup(<MetricTrend label="Income" loading />);
		expect(bare).toContain("metric-trend-value-placeholder");
		expect(bare).not.toContain("metric-trend-description-placeholder");
		expect(bare).not.toContain("metric-trend-delta-placeholder");
		expect(
			renderToStaticMarkup(<MetricTrend label="Income" value="1" />)
		).not.toContain("aria-busy");
	});

	it("renders a stat card with icon, delta, and actions but no chart", () => {
		const markup = renderToStaticMarkup(
			<MetricTrend
				actions={<button type="button">More</button>}
				delta={<span data-delta="">+16%</span>}
				icon={<svg aria-hidden="true" />}
				label="Total revenue"
				value="$152,314"
			/>
		);

		expect(markup).toContain("data-delta");
		expect(markup).toContain(">More</button>");
		expect(markup).toContain('aria-hidden="true"');
		expect(markup).not.toContain('data-slot="metric-description"');
	});
});
