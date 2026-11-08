// @vitest-environment happy-dom

import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";
import {
	Meter,
	MeterIndicator,
	type MeterIndicatorProps,
	MeterLabel,
	type MeterLabelProps,
	type MeterProps,
	MeterTrack,
	type MeterTrackProps,
	MeterValue,
	type MeterValueProps,
} from "../../../packages/ui/src/components/meter/meter";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(constants: T): T => constants,
	defineMarker: () => ({}),
	defineVars: <T extends object>(variables: T): T => variables,
	keyframes: () => "keyframes",
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

type Rejects<P, K extends PropertyKey> =
	Extract<keyof P, K> extends never ? true : false;
type Closed<P> = Rejects<P, "className" | "data-slot" | "role" | "style">;
type RequiredProps<P, K extends keyof P> =
	Record<string, never> extends Pick<P, K> ? false : true;
type MeterContract = [
	Closed<MeterProps>,
	Closed<MeterTrackProps>,
	Closed<MeterIndicatorProps>,
	Closed<MeterLabelProps>,
	Closed<MeterValueProps>,
	Rejects<MeterProps, "aria-valuemax" | "aria-valuemin" | "aria-valuenow">,
	RequiredProps<MeterProps, "value">,
];
const meterContract: MeterContract = [true, true, true, true, true, true, true];

function requiredElement(root: ParentNode, selector: string): Element {
	const element = root.querySelector(selector);
	if (!element) {
		throw new Error(`Expected ${selector} in rendered Meter`);
	}
	return element;
}

describe("Meter contract and semantics", () => {
	it("keeps fixed styling props closed and requires a numeric value", () => {
		expect(meterContract.every(Boolean)).toBe(true);
	});

	it("renders Base UI meter semantics with protected slots and composed parts", () => {
		const markup = renderToStaticMarkup(
			h(
				Meter,
				{
					"aria-label": "Storage usage",
					"aria-valuemax": 2,
					"aria-valuemin": 1,
					"aria-valuenow": 2,
					className: "injected-class",
					"data-slot": "injected-meter",
					max: 200,
					role: "progressbar",
					style: { color: "red" },
					value: 150,
				} as unknown as MeterProps,
				h(MeterLabel, null, "Storage usage"),
				h(MeterValue),
				h(
					MeterTrack,
					{
						"data-slot": "injected-track",
						role: "presentation",
						style: { color: "red" },
					} as unknown as MeterTrackProps,
					h(MeterIndicator, {
						"data-slot": "injected-indicator",
						role: "presentation",
					} as unknown as MeterIndicatorProps)
				)
			)
		);
		const container = document.createElement("div");
		container.innerHTML = markup;
		const meter = requiredElement(container, "[data-slot='meter']");
		const label = requiredElement(meter, "[data-slot='meter-label']");
		const value = requiredElement(meter, "[data-slot='meter-value']");
		const track = requiredElement(meter, "[data-slot='meter-track']");
		const indicator = requiredElement(track, "[data-slot='meter-indicator']");

		expect(meter.getAttribute("role")).toBe("meter");
		expect(meter.getAttribute("aria-label")).toBe("Storage usage");
		expect(meter.getAttribute("aria-valuemin")).toBe("0");
		expect(meter.getAttribute("aria-valuemax")).toBe("200");
		expect(meter.getAttribute("aria-valuenow")).toBe("150");
		expect(meter.className).toBe("");
		expect(meter.hasAttribute("style")).toBe(false);
		expect(label.textContent).toBe("Storage usage");
		expect(label.getAttribute("role")).toBe("presentation");
		expect(value.textContent).toBe("75%");
		expect(track.hasAttribute("role")).toBe(false);
		expect(indicator.hasAttribute("role")).toBe(false);
		expect(track.getAttribute("data-slot")).toBe("meter-track");
		expect(indicator.getAttribute("data-slot")).toBe("meter-indicator");
	});

	it("protects the meter role when a render callback supplies another role", () => {
		const markup = renderToStaticMarkup(
			h(Meter, {
				"aria-label": "Storage usage",
				render: (renderProps) =>
					h("section", { ...renderProps, role: "progressbar" }),
				value: 40,
			})
		);
		const container = document.createElement("div");
		container.innerHTML = markup;

		expect(container.querySelector("[data-slot='meter']")?.tagName).toBe(
			"SECTION"
		);
		expect(
			container.querySelector("[data-slot='meter']")?.getAttribute("role")
		).toBe("meter");
	});

	it("renders a track and indicator when no parts are provided", () => {
		const markup = renderToStaticMarkup(
			h(Meter, { "aria-label": "Storage usage", value: 40 })
		);
		const container = document.createElement("div");
		container.innerHTML = markup;

		expect(container.querySelector("[data-slot='meter-track']")).not.toBeNull();
		expect(
			container.querySelector("[data-slot='meter-indicator']")
		).not.toBeNull();
	});

	it("rejects non-finite values and invalid ranges", () => {
		for (const props of [
			{ value: Number.NaN },
			{ value: Number.POSITIVE_INFINITY },
			{ max: Number.POSITIVE_INFINITY, value: 10 },
			{ max: 0, value: 10 },
		]) {
			expect(() =>
				renderToStaticMarkup(h(Meter, { "aria-label": "Usage", ...props }))
			).toThrow();
		}
	});

	it("requires a name when no MeterLabel can supply one", () => {
		for (const name of [{}, { "aria-label": " " }]) {
			expect(() =>
				renderToStaticMarkup(h(Meter, { ...name, value: 40 }))
			).toThrow(TypeError);
		}
		expect(() =>
			renderToStaticMarkup(h(Meter, { "aria-labelledby": "usage", value: 40 }))
		).not.toThrow();
	});
});
