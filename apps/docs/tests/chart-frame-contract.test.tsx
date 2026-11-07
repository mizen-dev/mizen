// @vitest-environment happy-dom

import { barY, defineChart } from "@tanstack/charts";
import { scaleBand } from "@tanstack/charts/scales/band";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import type { ComponentProps, ComponentType } from "react";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
	ChartFrame,
	type ChartFrameProps,
} from "../../../packages/ui/src/components/chart-frame/chart-frame";
import { colors } from "../../../packages/ui/src/styles/colors.stylex";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(values: T): T => values,
	defineMarker: () => ({}),
	defineVars: <T extends object>(values: T): T => values,
	keyframes: () => "keyframes",
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

const rows = [{ label: "A", value: 2 }];
const definition = defineChart({
	marks: [barY(rows, { x: "label", y: "value" })],
	scales: {
		x: { axis: { label: "Category" }, scale: scaleBand },
		y: { axis: { label: { text: "Value" } }, grid: true, scale: scaleLinear },
	},
});
const themedDefinition = defineChart({
	marks: [barY(rows, { x: "label", y: "value" })],
	scales: {
		x: { scale: scaleBand },
		y: {
			axis: {
				label: { fontSize: 20, fontWeight: 500, text: "Value" },
				tickLabels: { fontSize: 18, fontWeight: 400 },
			},
			grid: true,
			scale: scaleLinear,
		},
	},
	theme: {
		foreground: "#123456",
		grid: "#234567",
		muted: "#345678",
	},
});
const responsiveDefinition = defineChart({
	chart: () => ({
		marks: [barY(rows, { x: "label", y: "value" })],
		scales: {
			x: { axis: { label: "Category" }, scale: scaleBand },
			y: { axis: { label: "Value" }, grid: true, scale: scaleLinear },
		},
		theme: {
			foreground: "#456789",
			grid: "#56789a",
			muted: "#6789ab",
		},
	}),
});
type Contracts = [
	"definition" extends keyof ChartFrameProps<
		(typeof rows)[number],
		string,
		number
	>
		? true
		: false,
	"aria-label" extends keyof ChartFrameProps<
		(typeof rows)[number],
		string,
		number
	>
		? true
		: false,
	"className" extends keyof ComponentProps<typeof ChartFrame> ? false : true,
	"style" extends keyof ComponentProps<typeof ChartFrame> ? false : true,
	"renderSvg" extends keyof ChartFrameProps<
		(typeof rows)[number],
		string,
		number
	>
		? false
		: true,
	{
		definition: typeof definition;
		"aria-label": string;
		height: number;
		aspectRatio: number;
	} extends ChartFrameProps<(typeof rows)[number], string, number>
		? false
		: true,
];
const contracts: Contracts = [true, true, true, true, true, true];
const chartProps: ChartFrameProps<(typeof rows)[number], string, number> = {
	"aria-label": "Example values",
	definition,
};
const runtimeChartProps: Record<string, unknown> = { ...chartProps };

const RuntimeChartFrame = ChartFrame as unknown as ComponentType<
	Record<string, unknown>
>;

function renderRuntimeProps(props: Record<string, unknown>) {
	return renderToStaticMarkup(
		h(RuntimeChartFrame, { ...chartProps, ...props })
	);
}

describe("ChartFrame contract", () => {
	it("server-renders the accessible TanStack SVG chart inside its styled surface", () => {
		const markup = renderToStaticMarkup(
			h(RuntimeChartFrame, runtimeChartProps)
		);

		expect(markup).toContain('data-slot="chart-frame"');
		expect(markup).toContain('aria-label="Example values"');
		expect(markup).toContain("<svg");
		expect(markup).toContain(colors.content);
		expect(markup).toContain(colors.mutedContent);
		expect(markup).toContain(colors.border);
		expect(markup).toContain('font-size="12"');
		expect(contracts.every(Boolean)).toBe(true);
	});

	it("keeps authored Mizen theme colors on static and responsive definitions", () => {
		const staticMarkup = renderRuntimeProps({ definition: themedDefinition });
		const responsiveMarkup = renderRuntimeProps({
			definition: responsiveDefinition,
		});

		for (const color of ["#123456", "#234567", "#345678"]) {
			expect(staticMarkup).toContain(color);
		}
		expect(staticMarkup).toContain('font-size="18"');
		expect(staticMarkup).toContain('font-size="20"');
		for (const color of ["#456789", "#56789a", "#6789ab"]) {
			expect(responsiveMarkup).toContain(color);
		}
		expect(responsiveMarkup).toContain('font-size="12"');
	});

	it("rejects empty accessible names and invalid dimensions", () => {
		expect(() => renderRuntimeProps({ "aria-label": "  " })).toThrow(
			"ChartFrame requires a non-empty aria-label."
		);
		expect(() => renderRuntimeProps({ height: Number.NaN })).toThrow(
			"height must be a finite number greater than zero."
		);
		expect(() => renderRuntimeProps({ aspectRatio: 0 })).toThrow(
			"aspectRatio must be a finite number greater than zero."
		);
		expect(() => renderRuntimeProps({ aspectRatio: 2, height: 300 })).toThrow(
			"ChartFrame accepts either height or aspectRatio, not both."
		);
	});
});
