// @vitest-environment happy-dom

import type { ReactNode } from "react";
import { act, createRef, createElement as h, isValidElement } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import {
	Accordion,
	AccordionItem,
	AccordionPanel,
	AccordionTrigger,
} from "../../../packages/ui/src/components/accordion/accordion";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(constants: T): T => constants,
	defineMarker: () => ({}),
	defineVars: <T extends object>(variables: T): T => variables,
	keyframes: <T extends object>(frames: T): T => frames,
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

function row(value: string, trigger: ReactNode, panelContent: ReactNode) {
	const panel = isValidElement(panelContent)
		? panelContent
		: h(AccordionPanel, null, panelContent);
	return h(AccordionItem, { value }, h(AccordionTrigger, null, trigger), panel);
}

function mount(
	element: Parameters<ReturnType<typeof createRoot>["render"]>[0]
) {
	const container = document.body.appendChild(document.createElement("div"));
	const root = createRoot(container);
	act(() => root.render(element));
	return {
		panel: () =>
			container.querySelector<HTMLDivElement>('[data-slot="accordion-panel"]'),
		rerender: (next: typeof element) => act(() => root.render(next)),
		rootEl: () =>
			container.querySelector<HTMLDivElement>('[data-slot="accordion"]'),
		trigger: (index = 0) =>
			container.querySelectorAll<HTMLButtonElement>("button")[index],
		unmount: () => {
			act(() => root.unmount());
			container.remove();
		},
	};
}

describe("Accordion behavior", () => {
	it("manages open state, refs, and ARIA attributes", () => {
		const rootRef = createRef<HTMLDivElement>();
		const itemRef = createRef<HTMLDivElement>();
		const triggerRef = createRef<HTMLButtonElement>();
		const panelRef = createRef<HTMLDivElement>();
		const item = h(
			AccordionItem,
			{ ref: itemRef, value: "1" },
			h(AccordionTrigger, { ref: triggerRef }, "T1"),
			h(AccordionPanel, { ref: panelRef }, "P1")
		);
		const { panel, rootEl, trigger, unmount } = mount(
			h(Accordion, { ref: rootRef }, item)
		);

		expect(rootRef.current).toBe(rootEl());
		expect(itemRef.current?.getAttribute("data-slot")).toBe("accordion-item");
		expect(triggerRef.current).toBe(trigger());
		expect(trigger()?.getAttribute("aria-expanded")).toBe("false");
		expect(panel()).toBeNull();

		act(() => trigger()?.click());
		expect(panelRef.current).toBe(panel());
		expect(trigger()?.getAttribute("aria-expanded")).toBe("true");
		expect(trigger()?.hasAttribute("data-panel-open")).toBe(true);
		expect(trigger()?.getAttribute("aria-controls")).toBe(
			panel()?.getAttribute("id")
		);
		unmount();
	});

	it("supports single and controlled multiple value modes", () => {
		const single = mount(
			h(Accordion, null, row("1", "T1", "P1"), row("2", "T2", "P2"))
		);
		act(() => single.trigger(0)?.click());
		act(() => single.trigger(1)?.click());
		expect(single.trigger(0)?.getAttribute("aria-expanded")).toBe("false");
		expect(single.trigger(1)?.getAttribute("aria-expanded")).toBe("true");
		single.unmount();

		const onValueChange = vi.fn();
		const multi = mount(
			h(
				Accordion,
				{ multiple: true, onValueChange, value: ["1"] },
				row("1", "T1", "P1"),
				row("2", "T2", "P2")
			)
		);
		act(() => multi.trigger(1)?.click());
		expect(onValueChange).toHaveBeenCalledWith(["1", "2"], expect.anything());
		multi.unmount();
	});

	it("suppresses disabled activation and supports panel mounting modes", () => {
		const hiddenPanel = h(AccordionPanel, { keepMounted: true }, "Hidden");
		const searchPanel = h(
			AccordionPanel,
			{ hiddenUntilFound: true },
			"Searchable"
		);
		const { panel, rerender, trigger, unmount } = mount(
			h(Accordion, { disabled: true }, row("1", "Disabled", hiddenPanel))
		);

		expect(trigger()?.hasAttribute("disabled")).toBe(true);
		expect(panel()?.hasAttribute("hidden")).toBe(true);
		expect(panel()?.hasAttribute("data-closed")).toBe(true);
		act(() => trigger()?.click());
		expect(trigger()?.getAttribute("aria-expanded")).toBe("false");

		rerender(h(Accordion, null, row("1", "Toggle", searchPanel)));
		expect(panel()?.getAttribute("hidden")).toBe("until-found");
		expect(panel()?.hasAttribute("data-closed")).toBe(true);
		unmount();
	});
});
