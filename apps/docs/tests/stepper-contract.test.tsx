// @vitest-environment happy-dom
import { act, createRef, createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";
import {
	Stepper,
	StepperDescription,
	StepperIndicator,
	StepperItem,
	type StepperItemProps,
	type StepperProps,
	type StepperState,
	StepperTitle,
	StepperTrigger,
} from "../../../packages/ui/src/components/stepper/stepper";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(constants: T): T => constants,
	defineMarker: () => ({}),
	defineVars: <T extends object>(vars: T): T => vars,
	keyframes: () => "keyframes",
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);

type Accepts<Props, Key extends PropertyKey> = Key extends keyof Props
	? true
	: false;

const typeChecks = [
	false satisfies Accepts<
		StepperProps,
		"className" | "style" | "data-slot" | "role"
	>,
	true satisfies Accepts<StepperProps, "aria-label" | "ref">,
	true satisfies Accepts<StepperProps, "aria-labelledby">,
	false satisfies Accepts<
		StepperItemProps,
		"className" | "style" | "data-slot" | "role"
	>,
	false satisfies Accepts<StepperItemProps, "aria-current">,
	true satisfies Accepts<StepperItemProps, "status" | "ref">,
] as const;

const expectedTypeChecks = [false, true, true, false, false, true] as const;

describe("Stepper contract and SSR semantics", () => {
	it("keeps an ordered-list progress structure and exposes only the current step", () => {
		const markup = renderToStaticMarkup(
			h(
				Stepper,
				{ "aria-label": "Checkout progress" },
				h(
					StepperItem,
					{ status: "complete" },
					h(StepperIndicator, null, "1"),
					h(StepperTitle, null, "Shipping"),
					h(StepperDescription, null, "Choose a delivery address")
				),
				h(
					StepperItem,
					{ status: "current" },
					h(StepperIndicator, null, "2"),
					h(StepperTitle, null, "Payment")
				),
				h(
					StepperItem,
					{ status: "upcoming" },
					h(StepperIndicator, null, "3"),
					h(StepperTitle, null, "Review")
				)
			)
		);

		expect(markup).toContain('<ol aria-label="Checkout progress"');
		expect(markup).toContain('role="list"');
		expect(markup.split("<li").length - 1).toBe(3);
		expect(markup).toContain('aria-current="step"');
		expect(markup.split('aria-current="step"').length - 1).toBe(1);
		expect(markup).toContain('data-status="complete"');
		expect(markup).toContain('data-status="current"');
		expect(markup).toContain('data-status="upcoming"');
		expect(markup).toContain("Completed:");
		expect(markup).toContain('aria-hidden="true"');
		expect(markup).toContain('data-slot="stepper-description"');
		expect(typeChecks).toEqual(expectedTypeChecks);
	});

	it("protects required semantics, slots, styles, and status at runtime", () => {
		const badRoot = {
			"aria-label": "Progress",
			className: "consumer-class",
			"data-slot": "spoofed-root",
			role: "tablist",
			style: { color: "red" },
		};
		const rootMarkup = renderToStaticMarkup(h(Stepper, badRoot));
		const badItem = {
			"aria-current": "page",
			className: "consumer-class",
			"data-slot": "spoofed-item",
			role: "tab",
			status: "invalid" as StepperState,
			style: { color: "red" },
		};
		const itemMarkup = renderToStaticMarkup(h(StepperItem, badItem));

		expect(rootMarkup).toContain('data-slot="stepper"');
		expect(rootMarkup).not.toContain("spoofed-root");
		expect(rootMarkup).not.toContain("consumer-class");
		expect(rootMarkup).not.toContain('role="tablist"');
		expect(itemMarkup).toContain('data-slot="stepper-item"');
		expect(itemMarkup).toContain('data-status="upcoming"');
		expect(itemMarkup).not.toContain("aria-current=");
		expect(itemMarkup).not.toContain("spoofed-item");
		expect(itemMarkup).not.toContain('role="tab"');
	});

	it("forwards refs to native list and text elements", () => {
		const rootRef = createRef<HTMLOListElement>();
		const itemRef = createRef<HTMLLIElement>();
		const titleRef = createRef<HTMLSpanElement>();
		const container = document.createElement("div");
		const root = createRoot(container);
		act(() => {
			root.render(
				h(
					Stepper,
					{ "aria-label": "Progress", ref: rootRef },
					h(
						StepperItem,
						{ ref: itemRef, status: "current" },
						h(StepperTitle, { ref: titleRef }, "Current")
					)
				)
			);
		});

		expect(rootRef.current).toBe(container.querySelector("ol"));
		expect(itemRef.current).toBe(container.querySelector("li"));
		expect(titleRef.current).toBe(
			container.querySelector("span[data-slot='stepper-title']")
		);
		act(() => root.unmount());
	});
	it("derives progress from the controlled active step", () => {
		const markup = renderToStaticMarkup(
			h(
				Stepper,
				{ activeStep: 1, "aria-label": "Progress" },
				[0, 1, 2].map((step) =>
					h(
						StepperItem,
						{ key: step, step },
						h(StepperTitle, null, `Step ${step + 1}`)
					)
				)
			)
		);
		expect(markup.match(/data-status="complete"/gu)).toHaveLength(1);
		expect(markup.match(/aria-current="step"/gu)).toHaveLength(1);
		expect(markup.match(/data-status="upcoming"/gu)).toHaveLength(1);
	});

	it("lets native click cancellation veto step selection", () => {
		const onStepClick = vi.fn();
		const onClick = vi.fn((event: { preventDefault: () => void }) =>
			event.preventDefault()
		);
		const ref = createRef<HTMLButtonElement>();
		const container = document.createElement("div");
		const root = createRoot(container);
		act(() =>
			root.render(
				h(
					Stepper,
					{ activeStep: 1, "aria-label": "Progress", onStepClick },
					h(
						StepperItem,
						{ step: 0 },
						h(StepperTrigger, { onClick, ref }, "Previous step")
					)
				)
			)
		);
		const button = container.querySelector("button");
		expect(ref.current).toBe(button);
		act(() => button?.click());
		expect(onClick).toHaveBeenCalledTimes(1);
		expect(onStepClick).not.toHaveBeenCalled();
		act(() => root.unmount());
	});
});
