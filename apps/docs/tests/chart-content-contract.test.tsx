// @vitest-environment happy-dom

import type { ComponentPropsWithRef, ComponentType } from "react";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";
import {
	ChartLegend,
	type ChartLegendItem,
	type ChartLegendProps,
} from "../../../packages/ui/src/components/chart-legend/chart-legend";
import {
	ChartTooltip,
	type ChartTooltipItem,
	type ChartTooltipProps,
} from "../../../packages/ui/src/components/chart-tooltip/chart-tooltip";

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
	Rejects<
		ChartTooltipProps,
		"children" | "className" | "data-slot" | "role" | "style"
	>,
	RequiredProp<ChartTooltipProps, "items">,
	"ref" extends keyof ChartTooltipProps ? true : false,
	Rejects<
		ChartLegendProps,
		"children" | "className" | "data-slot" | "role" | "style"
	>,
	RequiredProp<ChartLegendProps, "aria-label">,
	RequiredProp<ChartLegendProps, "items">,
	"ref" extends keyof ChartLegendProps ? true : false,
	"ref" extends keyof ComponentPropsWithRef<"ul"> ? true : false,
	readonly ChartTooltipItem[] extends ChartTooltipProps["items"] ? true : false,
	readonly ChartLegendItem[] extends ChartLegendProps["items"] ? true : false,
];
const contract: Contract = [
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
];
const UnsafeLegend = ChartLegend as ComponentType<Record<string, unknown>>;
const UnsafeTooltip = ChartTooltip as ComponentType<Record<string, unknown>>;

describe("Chart content contracts", () => {
	it("renders labelled values without owning tooltip roles or positioning", () => {
		const markup = renderToStaticMarkup(
			<ChartTooltip
				items={[
					{
						id: "series-a",
						label: "North",
						tone: "series1",
						value: "$1,250",
					},
					{
						id: "series-b",
						label: "South",
						tone: "series2",
						value: "$980",
					},
				]}
				label="April"
			/>
		);

		expect(markup).toContain('data-slot="chart-tooltip"');
		expect(markup).toContain('data-slot="chart-tooltip-label"');
		expect(markup).toContain('data-slot="chart-tooltip-rows"');
		expect(markup).toContain('data-slot="chart-tooltip-swatch"');
		expect(markup).toContain("<dt");
		expect(markup).toContain("<dd");
		expect(markup).toContain("April");
		expect(markup).toContain("North");
		expect(markup).toContain("$1,250");
		expect(markup).not.toContain('role="tooltip"');
		expect(markup).not.toContain("style=");
		expect(contract.every(Boolean)).toBe(true);
	});

	it("omits empty tooltip content and protects system-owned props", () => {
		expect(renderToStaticMarkup(<ChartTooltip items={[]} />)).toBe("");

		const markup = renderToStaticMarkup(
			h(
				UnsafeTooltip,
				{
					"data-slot": "unsafe",
					items: [{ id: "one", label: "One", tone: "series3", value: "3" }],
					role: "tooltip",
					style: { display: "none" },
				},
				"unsafe child"
			)
		);

		expect(markup).toContain('data-slot="chart-tooltip"');
		expect(markup).not.toContain('data-slot="unsafe"');
		expect(markup).not.toContain('role="tooltip"');
		expect(markup).not.toContain("style=");
		expect(markup).not.toContain("unsafe child");
		expect(() =>
			renderToStaticMarkup(
				<ChartTooltip
					items={[
						{ id: "one", label: "One", tone: "series1", value: "1" },
						{ id: "one", label: "Again", tone: "series2", value: "2" },
					]}
				/>
			)
		).toThrow(TypeError);
	});

	it("renders a named static legend with visible labels and decorative swatches", () => {
		const markup = renderToStaticMarkup(
			<ChartLegend
				aria-label="Revenue by region"
				items={[
					{ id: "north", label: "North", tone: "series1" },
					{ id: "south", label: "South", tone: "series2" },
				]}
			/>
		);

		expect(markup).toContain('<ul aria-label="Revenue by region"');
		expect(markup).toContain('data-slot="chart-legend-item"');
		expect(markup).toContain('aria-hidden="true"');
		expect(markup).toContain("North");
		expect(markup).toContain("South");
		expect(markup).not.toContain("<button");
		expect(markup).not.toContain("role=");
		expect(markup).not.toContain('data-slot="chart-legend-value"');
	});

	it("shows an optional value after a legend label", () => {
		const markup = renderToStaticMarkup(
			<ChartLegend
				aria-label="Visitors by source"
				items={[
					{ id: "organic", label: "Organic", tone: "series1", value: "50,500" },
				]}
			/>
		);

		expect(markup).toContain('data-slot="chart-legend-value"');
		expect(markup.indexOf("Organic")).toBeLessThan(markup.indexOf("50,500"));
	});

	it("rejects empty accessible names and duplicate legend ids", () => {
		expect(() =>
			renderToStaticMarkup(<ChartLegend aria-label="  " items={[]} />)
		).toThrow(TypeError);

		expect(() =>
			renderToStaticMarkup(
				<UnsafeLegend
					aria-label="Series"
					items={[
						{ id: "same", label: "One", tone: "series1" },
						{ id: "same", label: "Two", tone: "series2" },
					]}
				/>
			)
		).toThrow(TypeError);
	});
});
