// @vitest-environment happy-dom

import { act, createRef, createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";
import type {
	SegmentedControlItemProps,
	SegmentedControlProps,
} from "../../../packages/ui/src/components/segmented-control/segmented-control";
import {
	SegmentedControl,
	SegmentedControlItem,
} from "../../../packages/ui/src/components/segmented-control/segmented-control";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);

vi.mock("@stylexjs/stylex", () => ({
	create: (styles: unknown) => styles,
	defineConsts: (constants: unknown) => constants,
	defineMarker: () => ({}),
	defineVars: (vars: unknown) => vars,
	keyframes: () => ({}),
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

type Exact<Actual, Expected> = [Actual] extends [Expected]
	? [Expected] extends [Actual]
		? true
		: false
	: false;

type Rejects<Props, Keys extends PropertyKey> = [
	Extract<keyof Props, Keys>,
] extends [never]
	? true
	: false;

type GroupContract = [
	Exact<NonNullable<SegmentedControlProps["value"]>, readonly string[]>,
	Exact<NonNullable<SegmentedControlProps["defaultValue"]>, readonly string[]>,
	Rejects<
		SegmentedControlProps,
		"multiple" | "type" | "variant" | "className" | "style" | "render"
	>,
	Exact<SegmentedControlProps["size"], "default" | "sm" | "lg" | undefined>,
	Rejects<
		SegmentedControlItemProps,
		"type" | "variant" | "className" | "style" | "render"
	>,
];

const typeChecks = [
	true satisfies Exact<GroupContract[0], true>,
	true satisfies Exact<GroupContract[1], true>,
	true satisfies Exact<GroupContract[2], true>,
	true satisfies Exact<GroupContract[3], true>,
	true satisfies Exact<GroupContract[4], true>,
] as const;

describe("SegmentedControl contract", () => {
	it("keeps array selection and closes unsupported group and item props", () => {
		expect(typeChecks.every(Boolean)).toBe(true);
	});

	it("renders one selected value through ToggleGroup and preserves orientation", () => {
		const markup = renderToStaticMarkup(
			h(
				SegmentedControl,
				{
					"aria-label": "Time range",
					defaultValue: ["week"],
					orientation: "vertical",
				},
				h(SegmentedControlItem, { value: "day" }, "Day"),
				h(SegmentedControlItem, { value: "week" }, "Week")
			)
		);

		expect(markup).toContain('aria-label="Time range"');
		expect(markup).toContain('data-orientation="vertical"');
		expect(markup).toContain('aria-pressed="true"');
		expect(markup).toContain('aria-pressed="false"');
	});

	it("forwards refs and cancels selection through native change details", () => {
		const ref = createRef<HTMLButtonElement>();
		const groupRef = createRef<HTMLDivElement>();
		const onClick = vi.fn();
		const onValueChange = vi.fn(
			(_value: readonly string[], details: { cancel: () => void }) =>
				details.cancel()
		);
		const container = document.createElement("div");
		document.body.append(container);
		const root = createRoot(container);
		act(() =>
			root.render(
				h(
					SegmentedControl,
					{ defaultValue: ["week"], onValueChange, ref: groupRef },
					h(SegmentedControlItem, { onClick, ref, value: "week" }, "Week")
				)
			)
		);
		const button = container.querySelector("button");
		expect(ref.current).toBe(button);
		expect(groupRef.current).toBe(container.firstElementChild);
		act(() => button?.click());
		expect(onClick).toHaveBeenCalledTimes(1);
		expect(onValueChange).toHaveBeenCalledTimes(1);
		expect(button?.getAttribute("aria-pressed")).toBe("true");
		act(() => root.unmount());
		container.remove();
	});

	it("blocks runtime class, style, and render overrides", () => {
		const markup = renderToStaticMarkup(
			h(
				SegmentedControl,
				{
					className: "unsafe-group-class",
					render: h("aside", null, "Replace group"),
					style: { color: "red" },
				} as unknown as SegmentedControlProps,
				h(
					SegmentedControlItem,
					{
						className: "unsafe-item-class",
						render: h("aside", null, "Replace item"),
						style: { color: "red" },
						value: "week",
					} as unknown as SegmentedControlItemProps,
					"Week"
				)
			)
		);

		expect(markup).toContain("Week");
		expect(markup).not.toContain("Replace group");
		expect(markup).not.toContain("Replace item");
		expect(markup).not.toContain("unsafe-");
		expect(markup).not.toContain('style="color:red"');
	});
});
