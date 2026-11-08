// @vitest-environment happy-dom

import type { ComponentPropsWithRef } from "react";
import { act, createRef, createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import {
	Metric,
	MetricDescription,
	type MetricDescriptionProps,
	MetricLabel,
	type MetricLabelProps,
	type MetricProps,
	MetricValue,
	type MetricValueProps,
} from "../../../packages/ui/src/components/metric/metric";
import { metricStyles } from "../../../packages/ui/src/components/metric/metric.styles";
import { colors } from "../../../packages/ui/src/styles/colors.stylex";
import { typeRoles } from "../../../packages/ui/src/styles/typography.styles";
import { fontSize } from "../../../packages/ui/src/styles/typography.stylex";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);

const metricSlotRegex = /^<div[^>]*data-slot="metric"/u;
const metricHierarchyRegex =
	/<div[^>]*><div[^>]*>Revenue<\/div><div[^>]*>\$48,200<\/div><div[^>]*>\+12%<\/div><\/div>/u;

const propsSpy = vi.fn((..._args: unknown[]) => ({}));

vi.mock("@stylexjs/stylex", () => ({
	create: (styles: unknown) => styles,
	defineConsts: (constants: unknown) => constants,
	defineMarker: () => ({}),
	defineVars: (vars: unknown) => vars,
	keyframes: () => "keyframes",
	props: (...args: unknown[]) => propsSpy(...args),
	when: { ancestor: () => ":where(*)" },
}));

type Exact<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
type Accepts<T, K extends PropertyKey> = K extends keyof T ? true : false;
type Rejects<T, K extends PropertyKey> = [Extract<keyof T, K>] extends [never]
	? true
	: false;
type Closed<P> = Exact<
	Exclude<keyof ComponentPropsWithRef<"div">, keyof P>,
	"className" | "style"
>;
type Invented =
	| "delta"
	| "format"
	| "max"
	| "min"
	| "orientation"
	| "render"
	| "size"
	| "trend"
	| "value"
	| "variant";
type Checked<P> = [
	Closed<P>,
	Rejects<P, "className" | "data-slot" | "style" | Invented>,
	Accepts<P, "ref">,
	Accepts<P, "children">,
];

type Valid = [true, true, true, true];

const contractChecks = [
	true satisfies Exact<Checked<MetricProps>, Valid>,
	true satisfies Exact<Checked<MetricLabelProps>, Valid>,
	true satisfies Exact<Checked<MetricValueProps>, Valid>,
	true satisfies Exact<Checked<MetricDescriptionProps>, Valid>,
] as const;

describe("Metric contract and semantics", () => {
	beforeEach(() => {
		propsSpy.mockClear();
	});

	it("enforces closed prop contracts and rejects invented props", () => {
		expect(contractChecks.every((check) => check === true)).toBe(true);
	});

	it("renders exact native tags, hierarchy, slots, and attributes without implicit roles", () => {
		const markup = renderToStaticMarkup(
			h(
				Metric,
				{ "aria-label": "Revenue metric", id: "rev-metric" },
				h(MetricLabel, { id: "metric-lbl" }, "Revenue"),
				h(MetricValue, { "aria-labelledby": "metric-lbl" }, "$48,200"),
				h(MetricDescription, { id: "metric-desc" }, "+12%")
			)
		);
		expect(markup).toMatch(metricSlotRegex);
		expect(markup).toMatch(metricHierarchyRegex);
		expect(markup).not.toContain('role="');
		expect(markup).not.toContain("tabindex");
		expect(markup).not.toContain("aria-valuenow");
		expect(markup).not.toContain("aria-valuemin");
		expect(markup).not.toContain("aria-valuemax");
		expect(markup).not.toContain("aria-valuetext");
		expect(markup).toContain('data-slot="metric"');
		expect(markup).toContain('data-slot="metric-label"');
		expect(markup).toContain('data-slot="metric-value"');
		expect(markup).toContain('data-slot="metric-description"');
		expect(markup).toContain('aria-label="Revenue metric"');
		expect(markup).toContain('aria-labelledby="metric-lbl"');
		expect(markup).toContain('id="rev-metric"');
		expect(markup).toContain('id="metric-lbl"');
		expect(markup).toContain('id="metric-desc"');
	});

	it("protects data-slot against direct prop overrides across all components", () => {
		const components = [
			[Metric, "metric"],
			[MetricLabel, "metric-label"],
			[MetricValue, "metric-value"],
			[MetricDescription, "metric-description"],
		] as const;

		for (const [Comp, slot] of components) {
			const maliciousProps = {
				children: "Content",
				"data-slot": `malicious-${slot}`,
			};
			const m = renderToStaticMarkup(h(Comp, maliciousProps));
			expect(m).toContain(`data-slot="${slot}"`);
			expect(m).not.toContain(`malicious-${slot}`);
		}
	});

	it("forwards refs attached to all four host div elements", async () => {
		const root = createRoot(document.createElement("div"));
		const [rootRef, labelRef, valueRef, descRef] = [
			createRef<HTMLDivElement>(),
			createRef<HTMLDivElement>(),
			createRef<HTMLDivElement>(),
			createRef<HTMLDivElement>(),
		];

		await act(() =>
			root.render(
				h(
					Metric,
					{ ref: rootRef },
					h(MetricLabel, { ref: labelRef }, "Label"),
					h(MetricValue, { ref: valueRef }, "100"),
					h(MetricDescription, { ref: descRef }, "Desc")
				)
			)
		);

		const tagSlot = (el: HTMLElement | null) =>
			`${el?.tagName}:${el?.dataset.slot}`;
		expect(tagSlot(rootRef.current)).toBe("DIV:metric");
		expect(tagSlot(labelRef.current)).toBe("DIV:metric-label");
		expect(tagSlot(valueRef.current)).toBe("DIV:metric-value");
		expect(tagSlot(descRef.current)).toBe("DIV:metric-description");
		await act(() => root.unmount());
	});

	it("renders rich children across metric sections without breakage", () => {
		const markup = renderToStaticMarkup(
			h(
				Metric,
				null,
				h(MetricLabel, null, h("span", { "data-badge": "kpi" }, "KPI")),
				h(
					MetricValue,
					null,
					h("span", { "data-currency": "usd" }, "$"),
					"48,200"
				),
				h(
					MetricDescription,
					null,
					h("span", { "data-trend": "positive" }, "+12%"),
					h("a", { href: "/analytics" }, "Details")
				)
			)
		);
		expect(markup).toContain('data-badge="kpi"');
		expect(markup).toContain('data-currency="usd"');
		expect(markup).toContain('data-trend="positive"');
		expect(markup).toContain('href="/analytics"');
	});

	it("validates StyleX call contract including MetricValue numeric composition", () => {
		renderToStaticMarkup(
			h(
				Metric,
				null,
				h(MetricLabel, null, "Label"),
				h(MetricValue, null, "Value"),
				h(MetricDescription, null, "Desc")
			)
		);

		expect(propsSpy).toHaveBeenCalledWith(metricStyles.root);
		expect(propsSpy).toHaveBeenCalledWith(metricStyles.label);
		expect(propsSpy).toHaveBeenCalledWith(
			metricStyles.value,
			typeRoles.numeric
		);
		expect(propsSpy).toHaveBeenCalledWith(metricStyles.description);
	});

	it("keeps label and supporting context readable beneath the value", () => {
		expect(metricStyles.label.fontSize).toBe(fontSize["14"]);
		expect(metricStyles.description.fontSize).toBe(fontSize["14"]);
		expect(metricStyles.description.color).toBe(colors.mutedContent);
	});
});
