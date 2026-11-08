// @vitest-environment happy-dom

import type { HTMLAttributes } from "react";
import { act, createRef, createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";
import { Button } from "../../../packages/ui/src/components/button/button";
import {
	Collapsible,
	CollapsiblePanel,
	type CollapsiblePanelProps,
	type CollapsibleProps,
	CollapsibleTrigger,
	type CollapsibleTriggerProps,
} from "../../../packages/ui/src/components/collapsible/collapsible";
import { collapsibleStyles } from "../../../packages/ui/src/components/collapsible/collapsible.styles";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
const propsSpy = vi.fn((_style?: object) => ({}));
vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(c: T): T => c,
	defineMarker: () => ({}),
	defineVars: <T extends object>(v: T): T => v,
	keyframes: <T extends object>(k: T): T => k,
	props: (style?: object) => propsSpy(style),
	when: { ancestor: () => ":where(*)" },
}));

const COLLAPSIBLE_SLOT_REGEX = /^<div[^>]*data-slot="collapsible"/u;
const ANCHOR_HREF_REGEX = /<a[^>]*href="\/docs"/u;

type Accepts<T, K extends PropertyKey> = K extends keyof T ? true : false;
type RejectsAll<T, K extends PropertyKey> = [Extract<keyof T, K>] extends [
	never,
]
	? true
	: false;

type Omitted = "className" | "data-slot" | "style";
type ClosedContract = [
	RejectsAll<CollapsibleProps, Omitted>,
	Accepts<CollapsibleProps, "disabled" | "open" | "render">,
	RejectsAll<CollapsibleTriggerProps, Omitted>,
	Accepts<CollapsibleTriggerProps, "nativeButton" | "render">,
	RejectsAll<CollapsiblePanelProps, Omitted>,
	Accepts<CollapsiblePanelProps, "hiddenUntilFound" | "keepMounted" | "render">,
];
const contractChecks: ClosedContract = [true, true, true, true, true, true];

function mount(
	element: Parameters<ReturnType<typeof createRoot>["render"]>[0]
) {
	const container = document.body.appendChild(document.createElement("div"));
	const root = createRoot(container);
	act(() => root.render(element));
	return {
		panel: () =>
			container.querySelector<HTMLDivElement>(
				'[data-slot="collapsible-panel"]'
			),
		rerender: (el: typeof element) => act(() => root.render(el)),
		rootEl: () =>
			container.querySelector<HTMLDivElement>('[data-slot="collapsible"]'),
		trigger: () => container.querySelector<HTMLButtonElement>("button"),
		unmount: () => {
			act(() => root.unmount());
			container.remove();
		},
	};
}

describe("Collapsible contract and runtime semantics", () => {
	it("exports exact runtime members and matches identity aliases", async () => {
		const collapsibleModule = await import(
			"../../../packages/ui/src/components/collapsible/collapsible"
		);
		expect(Object.keys(collapsibleModule).sort()).toEqual([
			"Collapsible",
			"CollapsiblePanel",
			"CollapsiblePrimitive",
			"CollapsibleTrigger",
		]);
		expect(collapsibleModule).not.toHaveProperty("CollapsibleContent");
		expect(collapsibleModule.CollapsiblePrimitive).toHaveProperty("Root");
		expect(collapsibleModule.CollapsiblePrimitive).toHaveProperty("Trigger");
		expect(collapsibleModule.CollapsiblePrimitive).toHaveProperty("Panel");
		expect(contractChecks.every((c) => c === true)).toBe(true);
	});

	it("renders default host elements with canonical data-slot attributes", () => {
		const markup = renderToStaticMarkup(
			h(
				Collapsible,
				{ defaultOpen: true },
				h(CollapsibleTrigger, null, "Trigger"),
				h(CollapsiblePanel, null, "Panel")
			)
		);
		expect(markup).toMatch(COLLAPSIBLE_SLOT_REGEX);
		expect(markup).toContain('data-slot="collapsible-trigger"');
		expect(markup).toContain('data-slot="collapsible-panel"');
		expect(markup).toContain("Trigger");
		expect(markup).toContain("Panel");
	});

	it("protects data-slot against direct prop and render overrides across wrappers", () => {
		const bad = {
			className: "bad",
			"data-slot": "bad",
			style: { color: "red" },
		};
		const root = renderToStaticMarkup(
			Reflect.apply(Collapsible, undefined, [bad])
		);
		const elem = renderToStaticMarkup(
			h(Collapsible, {
				render: (p: HTMLAttributes<HTMLElement>) =>
					h("section", { ...p, "data-slot": "bad" }),
			})
		);
		expect(`${root}${elem}`).not.toContain("bad");
		expect(root).toContain('data-slot="collapsible"');
		expect(elem).toContain('data-slot="collapsible"');
		const badTrigger = Reflect.apply(CollapsibleTrigger, undefined, [
			{
				...bad,
				children: "T",
				render: h("button", { "data-slot": "ov", type: "button" }),
			},
		]);
		const badPanel = Reflect.apply(CollapsiblePanel, undefined, [
			{
				...bad,
				children: "P",
				render: (p: HTMLAttributes<HTMLElement>) =>
					h("div", { ...p, "data-slot": "ov" }),
			},
		]);
		const parts = renderToStaticMarkup(
			h(Collapsible, { defaultOpen: true }, badTrigger, badPanel)
		);
		expect(parts).toContain('data-slot="collapsible-trigger"');
		expect(parts).toContain('data-slot="collapsible-panel"');
		expect(parts).not.toContain("bad");
		expect(parts).not.toContain("ov");
		const anchor = renderToStaticMarkup(
			h(
				Collapsible,
				null,
				h(CollapsibleTrigger, { render: h("a", { href: "/docs" }) }, "Link")
			)
		);
		expect(anchor).toMatch(ANCHOR_HREF_REGEX);
		expect(anchor).toContain('data-slot="collapsible-trigger"');
		const composed = renderToStaticMarkup(
			h(
				Collapsible,
				{ defaultOpen: true },
				h(CollapsibleTrigger, { render: h(Button, { variant: "outline" }) })
			)
		);
		expect(composed).toContain('data-slot="collapsible-trigger"');
		expect(renderToStaticMarkup(h(Button, null, "Action"))).toContain(
			'data-slot="button"'
		);
	});

	it("manages uncontrolled open/close, aria wiring, and ref attachment", () => {
		const [rootRef, triggerRef, panelRef] = [
			createRef<HTMLDivElement>(),
			createRef<HTMLButtonElement>(),
			createRef<HTMLDivElement>(),
		];
		const { panel, rootEl, trigger, unmount } = mount(
			h(
				Collapsible,
				{ ref: rootRef },
				h(CollapsibleTrigger, { ref: triggerRef }, "Toggle"),
				h(CollapsiblePanel, { ref: panelRef }, "Panel text")
			)
		);
		expect(rootRef.current).toBe(rootEl());
		expect(triggerRef.current).toBe(trigger());
		expect(rootEl()?.hasAttribute("data-closed")).toBe(true);
		expect(trigger()?.getAttribute("aria-expanded")).toBe("false");
		expect(panel()).toBeNull();
		act(() => trigger()?.click());
		expect(panelRef.current).toBe(panel());
		expect(rootEl()?.hasAttribute("data-open")).toBe(true);
		expect(trigger()?.getAttribute("aria-expanded")).toBe("true");
		expect(trigger()?.hasAttribute("data-panel-open")).toBe(true);
		expect(panel()).toBeInstanceOf(HTMLDivElement);
		expect(trigger()?.getAttribute("aria-controls")).toBe(
			panel()?.getAttribute("id")
		);
		act(() => trigger()?.click());
		expect(rootEl()?.hasAttribute("data-closed")).toBe(true);
		expect(trigger()?.getAttribute("aria-expanded")).toBe("false");
		unmount();
	});

	it("delegates disabled suppression and supports panel mounting modes", () => {
		const { panel, rerender, rootEl, trigger, unmount } = mount(
			h(
				Collapsible,
				{ disabled: true },
				h(CollapsibleTrigger, null, "Disabled"),
				h(CollapsiblePanel, { keepMounted: true }, "Hidden")
			)
		);
		expect(rootEl()?.hasAttribute("data-disabled")).toBe(true);
		expect(trigger()?.disabled).toBe(true);
		expect(panel()?.hasAttribute("hidden")).toBe(true);
		expect(panel()?.hasAttribute("data-closed")).toBe(true);
		act(() => trigger()?.click());
		expect(trigger()?.getAttribute("aria-expanded")).toBe("false");

		rerender(
			h(
				Collapsible,
				null,
				h(CollapsibleTrigger, null, "Toggle"),
				h(CollapsiblePanel, { hiddenUntilFound: true }, "Searchable")
			)
		);
		expect(panel()?.getAttribute("hidden")).toBe("until-found");
		expect(panel()?.hasAttribute("data-closed")).toBe(true);
		unmount();
	});

	it("applies panel motion and inset content spacing", () => {
		propsSpy.mockClear();
		renderToStaticMarkup(
			h(
				Collapsible,
				{ defaultOpen: true },
				h(CollapsibleTrigger, null, "Toggle"),
				h(CollapsiblePanel, null, "Panel text")
			)
		);
		expect(propsSpy).toHaveBeenCalledWith(collapsibleStyles.content);
		expect(propsSpy).toHaveBeenCalledWith(collapsibleStyles.panel);
	});
});
