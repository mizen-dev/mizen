// @vitest-environment happy-dom

import type { ComponentProps, ComponentType } from "react";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
	PartToWhole,
	type PartToWholeProps,
} from "../../../packages/ui/src/components/part-to-whole/part-to-whole";

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
type PartToWholeContract = [
	"parts" extends keyof PartToWholeProps ? true : false,
	"aria-label" extends keyof PartToWholeProps ? true : false,
	Rejects<
		PartToWholeProps,
		"ariaLabel" | "children" | "className" | "data-slot" | "role" | "style"
	>,
	"ref" extends keyof ComponentProps<typeof PartToWhole> ? true : false,
];
const contract: PartToWholeContract = [true, true, true, true];
const RuntimePartToWhole = PartToWhole as ComponentType<
	Record<string, unknown>
>;

const ARC_TAGS = /<path\b[^>]*data-ts-key="part-to-whole-arcs:[^"]*"[^>]*>/g;
const ARC_PATH = /\bd="([^"]+)"/;
const ARC_KEY = /data-ts-key="part-to-whole-arcs:([^"]+)"/;
const INVALID_NUMBER = /(?:NaN|Infinity)/;

function render(
	parts: readonly { id: string; label: string; value: number }[],
	extra = {}
) {
	return renderToStaticMarkup(
		h(RuntimePartToWhole, {
			"aria-label": "Budget composition",
			parts,
			...extra,
		})
	);
}

function legendRows(markup: string) {
	const document = new DOMParser().parseFromString(markup, "text/html");
	return Array.from(
		document.querySelectorAll('[data-slot="chart-legend-item"]'),
		(item) => item.textContent?.trim()
	);
}

describe("PartToWhole contract", () => {
	it("keeps input order and proportions, with every part represented in the legend", () => {
		const markup = render([
			{ id: "housing", label: "Housing", value: 60 },
			{ id: "food", label: "Food", value: 30 },
			{ id: "travel", label: "Travel", value: 10 },
		]);
		const arcs = Array.from(markup.matchAll(ARC_TAGS), ([tag]) => ({
			key: tag.match(ARC_KEY)?.[1]?.split(":").at(-1),
			path: tag.match(ARC_PATH)?.[1],
		}));

		expect(markup).toContain('data-slot="part-to-whole"');
		expect(markup).toContain('data-slot="chart-frame"');
		expect(markup).toContain('aria-label="Budget composition"');
		expect(arcs.map(({ key }) => key)).toEqual(["housing", "food", "travel"]);
		expect(arcs).toHaveLength(3);
		expect(legendRows(markup)).toContain("Housing 60 60%");
		expect(legendRows(markup)).toContain("Food 30 30%");
		expect(legendRows(markup)).toContain("Travel 10 10%");
		expect(contract.every(Boolean)).toBe(true);
		// Arc paths remain actual SVG geometry for all three positive shares.
		expect(arcs.every(({ path }) => path && path.length > 20)).toBe(true);
	});

	it("keeps zero values readable without drawing a zero-sized arc", () => {
		const markup = render([
			{ id: "used", label: "Used", value: 4 },
			{ id: "unused", label: "Unused", value: 0 },
		]);

		expect(Array.from(markup.matchAll(ARC_TAGS))).toHaveLength(1);
		expect(legendRows(markup)).toContain("Unused 0 0%");
	});

	it("renders an honest status and complete legend for all-zero data", () => {
		const markup = render([
			{ id: "a", label: "First", value: 0 },
			{ id: "b", label: "Second", value: 0 },
		]);

		expect(markup).toContain('role="status"');
		expect(markup).toContain("All parts have a value of zero.");
		expect(legendRows(markup)).toContain("First 0 0%");
		expect(legendRows(markup)).toContain("Second 0 0%");
		expect(markup).not.toContain("<svg");
	});

	it("handles very large finite values without overflowing the proportions", () => {
		const markup = render([
			{ id: "a", label: "A", value: 1e308 },
			{ id: "b", label: "B", value: 1e308 },
			{ id: "c", label: "C", value: 5e307 },
		]);

		expect(legendRows(markup)).toEqual([
			`A ${new Intl.NumberFormat("en-US").format(1e308)} 40%`,
			`B ${new Intl.NumberFormat("en-US").format(1e308)} 40%`,
			`C ${new Intl.NumberFormat("en-US").format(5e307)} 20%`,
		]);
		expect(markup).not.toMatch(INVALID_NUMBER);
	});

	it("keeps caller data immutable and validates data and formatting inputs", () => {
		const parts = [{ id: "a", label: "A", value: 2 }];
		expect(() => render(parts)).not.toThrow();
		expect(parts).toEqual([{ id: "a", label: "A", value: 2 }]);
		expect(() => render([{ id: "a", label: "A", value: -1 }])).toThrow(
			RangeError
		);
		expect(() => render([{ id: "a", label: "A", value: Number.NaN }])).toThrow(
			RangeError
		);
		expect(() => render([{ id: "", label: "A", value: 1 }])).toThrow(TypeError);
		expect(() => render([{ id: "a", label: " ", value: 1 }])).toThrow(
			TypeError
		);
		expect(() =>
			render([
				{ id: "a", label: "A", value: 1 },
				{ id: "a", label: "B", value: 1 },
			])
		).toThrow(RangeError);
		expect(() =>
			render([{ id: "a", label: "A", value: 1 }], { locale: "bad_locale" })
		).toThrow();
		expect(() =>
			render([{ id: "a", label: "A", value: 1 }], { formatValue: () => 12 })
		).toThrow(TypeError);
	});

	it("protects root roles and styling escape hatches at runtime", () => {
		const markup = render([{ id: "a", label: "A", value: 1 }], {
			className: "untrusted",
			role: "application",
			style: { color: "red" },
		});

		expect(markup).toContain('data-slot="part-to-whole"');
		expect(markup).not.toContain('role="application"');
		expect(markup).not.toContain("untrusted");
		expect(markup).not.toContain("color:red");
	});
});
