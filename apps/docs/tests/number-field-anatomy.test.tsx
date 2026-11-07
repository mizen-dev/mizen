// @vitest-environment happy-dom
import { act, createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import {
	NumberField,
	NumberFieldDecrement,
	NumberFieldGroup,
	NumberFieldIncrement,
	NumberFieldInput,
	NumberFieldScrubArea,
} from "../../../packages/ui/src/components/number-field/number-field";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(s: T): T => s,
	defineConsts: <T extends object>(c: T): T => c,
	defineMarker: () => ({}),
	defineVars: <T extends object>(v: T): T => v,
	keyframes: <T extends object>(k: T): T => k,
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);

function mount(
	element: Parameters<ReturnType<typeof createRoot>["render"]>[0]
) {
	const container = document.body.appendChild(document.createElement("div"));
	const root = createRoot(container);
	act(() => root.render(element));
	return {
		container,
		unmount: () => {
			act(() => root.unmount());
			container.remove();
		},
	};
}

const ALL_SLOTS = [
	"number-field",
	"number-field-scrub-area",
	"number-field-group",
	"number-field-decrement",
	"number-field-input",
	"number-field-increment",
] as const;

describe("NumberField anatomy and canonical structure", () => {
	it("renders canonical slots, roles, and scrub area with label", () => {
		const { container, unmount } = mount(
			h(
				NumberField,
				{ defaultValue: 10 },
				h(NumberFieldScrubArea, null, "Quantity"),
				h(
					NumberFieldGroup,
					null,
					h(NumberFieldDecrement, null),
					h(NumberFieldInput, null),
					h(NumberFieldIncrement, null)
				)
			)
		);

		for (const slot of ALL_SLOTS) {
			expect(container.querySelector(`[data-slot="${slot}"]`)).not.toBeNull();
		}

		const scrubLabel = container.querySelector(
			'[data-slot="number-field-scrub-area-label"]'
		);
		const group = container.querySelector('[data-slot="number-field-group"]');
		const input = container.querySelector<HTMLInputElement>(
			'[data-slot="number-field-input"]'
		);

		expect(scrubLabel?.textContent).toBe("Quantity");
		expect(group?.getAttribute("role")).toBe("group");
		expect(scrubLabel?.getAttribute("for")).toBe(input?.id);

		unmount();
	});

	it("configures input semantics and stepper defaults canonically", () => {
		const { container, unmount } = mount(
			h(
				NumberField,
				{ defaultValue: 10 },
				h(
					NumberFieldGroup,
					null,
					h(NumberFieldDecrement, null),
					h(NumberFieldInput, null),
					h(NumberFieldIncrement, null)
				)
			)
		);

		const input = container.querySelector<HTMLInputElement>(
			'[data-slot="number-field-input"]'
		);
		const decBtn = container.querySelector(
			'[data-slot="number-field-decrement"]'
		);
		const incBtn = container.querySelector(
			'[data-slot="number-field-increment"]'
		);

		expect(input?.tagName.toLowerCase()).toBe("input");
		expect(input?.getAttribute("aria-roledescription")).toBe("Number field");
		expect(input?.value).toBe("10");

		expect(decBtn?.getAttribute("tabindex")).toBe("-1");
		expect(incBtn?.getAttribute("tabindex")).toBe("-1");
		expect(decBtn?.getAttribute("aria-label")).toBe("Decrease");
		expect(incBtn?.getAttribute("aria-label")).toBe("Increase");
		expect(decBtn?.querySelector("svg")).not.toBeNull();
		expect(incBtn?.querySelector("svg")).not.toBeNull();

		unmount();
	});

	it("forwards refs to all underlying DOM elements", () => {
		const refs = {
			dec: { current: null as HTMLButtonElement | null },
			group: { current: null as HTMLDivElement | null },
			inc: { current: null as HTMLButtonElement | null },
			input: { current: null as HTMLInputElement | null },
			root: { current: null as HTMLDivElement | null },
			scrub: { current: null as HTMLSpanElement | null },
		};

		const { container, unmount } = mount(
			h(
				NumberField,
				{ ref: refs.root },
				h(NumberFieldScrubArea, { ref: refs.scrub }, "Weight"),
				h(
					NumberFieldGroup,
					{ ref: refs.group },
					h(NumberFieldDecrement, { ref: refs.dec }),
					h(NumberFieldInput, { ref: refs.input }),
					h(NumberFieldIncrement, { ref: refs.inc })
				)
			)
		);

		expect(refs.root.current).toBe(
			container.querySelector('[data-slot="number-field"]')
		);
		expect(refs.scrub.current).toBe(
			container.querySelector('[data-slot="number-field-scrub-area"]')
		);
		expect(refs.group.current).toBe(
			container.querySelector('[data-slot="number-field-group"]')
		);
		expect(refs.input.current).toBe(
			container.querySelector('[data-slot="number-field-input"]')
		);
		expect(refs.dec.current).toBe(
			container.querySelector('[data-slot="number-field-decrement"]')
		);
		expect(refs.inc.current).toBe(
			container.querySelector('[data-slot="number-field-increment"]')
		);

		unmount();
	});

	it("protects data-slot and rejects direct malicious props across all components", () => {
		const bad = {
			className: "evil-class",
			"data-slot": "evil-slot",
			style: { color: "red" },
		};

		function BadScrub() {
			return Reflect.apply(NumberFieldScrubArea, undefined, [
				{ ...bad, children: "Label" },
			]);
		}
		function BadDec() {
			return Reflect.apply(NumberFieldDecrement, undefined, [bad]);
		}
		function BadInput() {
			return Reflect.apply(NumberFieldInput, undefined, [bad]);
		}
		function BadInc() {
			return Reflect.apply(NumberFieldIncrement, undefined, [bad]);
		}
		function BadGroup() {
			return Reflect.apply(NumberFieldGroup, undefined, [
				{
					...bad,
					children: [
						h(BadDec, { key: "d" }),
						h(BadInput, { key: "i" }),
						h(BadInc, { key: "c" }),
					],
				},
			]);
		}
		function BadField() {
			return Reflect.apply(NumberField, undefined, [
				{
					...bad,
					children: [h(BadScrub, { key: "s" }), h(BadGroup, { key: "g" })],
				},
			]);
		}

		const { container, unmount } = mount(h(BadField));

		expect(container.querySelector('[data-slot="evil-slot"]')).toBeNull();
		expect(container.querySelector(".evil-class")).toBeNull();
		for (const slot of ALL_SLOTS) {
			expect(container.querySelector(`[data-slot="${slot}"]`)).not.toBeNull();
		}

		unmount();
	});

	it("protects data-slot against polymorphic render prop overrides", () => {
		const renderBad = (tag: string, slot: string) => (p: object) =>
			h(tag, { ...p, "data-slot": slot });

		const { container, unmount } = mount(
			h(
				NumberField,
				{ render: renderBad("div", "evil-root") },
				h(NumberFieldScrubArea, { render: renderBad("span", "evil-scrub") }),
				h(
					NumberFieldGroup,
					{ render: renderBad("div", "evil-group") },
					h(NumberFieldDecrement, { render: renderBad("button", "evil-dec") }),
					h(NumberFieldInput, { render: renderBad("input", "evil-inp") }),
					h(NumberFieldIncrement, { render: renderBad("button", "evil-inc") })
				)
			)
		);

		for (const evil of [
			"evil-root",
			"evil-scrub",
			"evil-group",
			"evil-dec",
			"evil-inp",
			"evil-inc",
		]) {
			expect(container.querySelector(`[data-slot="${evil}"]`)).toBeNull();
		}

		for (const slot of ALL_SLOTS) {
			expect(container.querySelector(`[data-slot="${slot}"]`)).not.toBeNull();
		}

		unmount();
	});

	it("enforces tabIndex=-1 when stepper render prop is a direct element", () => {
		const { container, unmount } = mount(
			h(
				NumberField,
				{ defaultValue: 10 },
				h(
					NumberFieldGroup,
					null,
					h(NumberFieldDecrement, {
						render: h("button", { tabIndex: 0, type: "button" }),
					}),
					h(NumberFieldInput, null),
					h(NumberFieldIncrement, {
						render: h("button", { tabIndex: 0, type: "button" }),
					})
				)
			)
		);

		const decBtn = container.querySelector(
			'[data-slot="number-field-decrement"]'
		);
		const incBtn = container.querySelector(
			'[data-slot="number-field-increment"]'
		);

		expect(decBtn?.getAttribute("tabindex")).toBe("-1");
		expect(incBtn?.getAttribute("tabindex")).toBe("-1");

		unmount();
	});

	it("enforces tabIndex=-1 when stepper render prop is a callback", () => {
		const { container, unmount } = mount(
			h(
				NumberField,
				{ defaultValue: 10 },
				h(
					NumberFieldGroup,
					null,
					h(NumberFieldDecrement, {
						render: (p: object) =>
							h("button", { ...p, tabIndex: 0, type: "button" }),
					}),
					h(NumberFieldInput, null),
					h(NumberFieldIncrement, {
						render: (p: object) =>
							h("button", { ...p, tabIndex: 0, type: "button" }),
					})
				)
			)
		);

		const decBtn = container.querySelector(
			'[data-slot="number-field-decrement"]'
		);
		const incBtn = container.querySelector(
			'[data-slot="number-field-increment"]'
		);

		expect(decBtn?.getAttribute("tabindex")).toBe("-1");
		expect(incBtn?.getAttribute("tabindex")).toBe("-1");

		unmount();
	});

	it("propagates root size to input data-size", () => {
		const { container, unmount } = mount(
			h(
				NumberField,
				{ size: "sm" },
				h(NumberFieldGroup, null, h(NumberFieldInput, null))
			)
		);
		const input = container.querySelector<HTMLInputElement>(
			'[data-slot="number-field-input"]'
		);
		expect(input?.getAttribute("data-size")).toBe("sm");
		unmount();
	});
});
