// @vitest-environment happy-dom
import type { ComponentType, HTMLAttributes } from "react";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";
import {
	Accordion,
	AccordionItem,
	type AccordionItemProps,
	AccordionPanel,
	type AccordionPanelProps,
	type AccordionProps,
	AccordionTrigger,
	type AccordionTriggerProps,
} from "../../../packages/ui/src/components/accordion/accordion";
import { accordionStyles } from "../../../packages/ui/src/components/accordion/accordion.styles";
import { Button } from "../../../packages/ui/src/components/button/button";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
const propsSpy = vi.fn((..._styles: object[]) => ({}));
vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(c: T): T => c,
	defineMarker: () => ({}),
	defineVars: <T extends object>(v: T): T => v,
	keyframes: <T extends object>(k: T): T => k,
	props: (...styles: object[]) => propsSpy(...styles),
	when: { ancestor: () => ":where(*)" },
}));
const ROOT_SLOT_REGEX = /^<div[^>]*data-slot="accordion"/u;
const TRIGGER_H3_REGEX = /<h3[^>]*><button[^>]*data-slot="accordion-trigger"/u;
const BUTTON_TYPE_REGEX = /<button[^>]*type="button"/u;
const INDICATOR_REGEX = /T1.*<svg[^>]*data-slot="accordion-indicator"/u;
const PANEL_REGEX =
	/<div[^>]*data-slot="accordion-panel"[^>]*><div[^>]*>P1<\/div><\/div>/u;
const ANCHOR_TYPE_REGEX = /<a[^>]*type="button"/u;
type Accepts<T, K extends PropertyKey> = K extends keyof T ? true : false;
type RejectsAll<T, K extends PropertyKey> = [Extract<keyof T, K>] extends [
	never,
]
	? true
	: false;
type Omitted = "className" | "data-slot" | "style";
type ClosedContract = [
	RejectsAll<AccordionProps, Omitted>,
	Accepts<AccordionProps, "defaultValue" | "value">,
	RejectsAll<AccordionItemProps, Omitted>,
	Accepts<AccordionItemProps, "disabled">,
	RejectsAll<AccordionTriggerProps, Omitted>,
	Accepts<AccordionTriggerProps, "nativeButton">,
	RejectsAll<AccordionPanelProps, Omitted>,
	Accepts<AccordionPanelProps, "hiddenUntilFound">,
];
const contractChecks: ClosedContract = [
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
];
describe("Accordion contract and runtime semantics", () => {
	it("exports exact runtime members and matches identity aliases", async () => {
		const mod = await import(
			"../../../packages/ui/src/components/accordion/accordion"
		);
		expect(Object.keys(mod).sort()).toEqual([
			"Accordion",
			"AccordionItem",
			"AccordionPanel",
			"AccordionPrimitive",
			"AccordionTrigger",
		]);
		expect(mod).not.toHaveProperty("AccordionContent");
		for (const part of ["Root", "Item", "Header", "Trigger", "Panel"]) {
			expect(mod.AccordionPrimitive).toHaveProperty(part);
		}
		expect(contractChecks.every((c) => c === true)).toBe(true);
	});
	it("renders DOM with slots, semantic h3 header, and chevron indicator", () => {
		const markup = renderToStaticMarkup(
			h(
				Accordion,
				{ defaultValue: ["1"] },
				h(
					AccordionItem,
					{ value: "1" },
					h(AccordionTrigger, null, "T1"),
					h(AccordionPanel, null, "P1")
				)
			)
		);
		expect(markup).toMatch(ROOT_SLOT_REGEX);
		expect(markup).toContain('data-slot="accordion-item"');
		expect(markup).toContain("<h3");
		expect(markup).toMatch(TRIGGER_H3_REGEX);
		expect(markup).toMatch(BUTTON_TYPE_REGEX);
		expect(markup).toContain('data-slot="accordion-indicator"');
		expect(markup).toContain('data-slot="accordion-panel"');
		expect(markup).toMatch(INDICATOR_REGEX);
		expect(markup).toMatch(PANEL_REGEX);
	});
	it("protects data-slot against direct prop and render overrides across wrappers", () => {
		const bad = {
			className: "bad",
			"data-slot": "bad",
			style: { color: "red" },
		};
		const root = renderToStaticMarkup(
			Reflect.apply(Accordion, undefined, [bad])
		);
		const elem = renderToStaticMarkup(
			h(Accordion, {
				render: (p: HTMLAttributes<HTMLElement>) =>
					h("section", { ...p, "data-slot": "bad" }),
			})
		);
		expect(`${root}${elem}`).not.toContain("bad");
		expect(root).toContain('data-slot="accordion"');
		expect(elem).toContain('data-slot="accordion"');
		const ovBtn = h("button", { "data-slot": "ov", type: "button" });
		const ovDiv = (p: HTMLAttributes<HTMLElement>) =>
			h("div", { ...p, "data-slot": "ov" });
		const bTr = h(
			AccordionTrigger as ComponentType<Record<string, unknown>>,
			{ ...bad, render: ovBtn },
			"T"
		);
		const bPan = h(
			AccordionPanel as ComponentType<Record<string, unknown>>,
			{ ...bad, render: ovDiv },
			"P"
		);
		const bItem = h(
			AccordionItem as ComponentType<Record<string, unknown>>,
			{ ...bad, render: ovBtn, value: "1" },
			bTr,
			bPan
		);
		const parts = renderToStaticMarkup(
			h(Accordion, { defaultValue: ["1"] }, bItem)
		);
		expect(parts).toContain('data-slot="accordion-item"');
		expect(parts).toContain('data-slot="accordion-trigger"');
		expect(parts).toContain('data-slot="accordion-panel"');
		expect(parts).not.toContain("bad");
		expect(parts).not.toContain("ov");
		const anchor = renderToStaticMarkup(
			h(
				Accordion,
				null,
				h(
					AccordionItem,
					{ value: "a" },
					h(AccordionTrigger, {
						nativeButton: false,
						render: h("a", { href: "/docs" }),
					})
				)
			)
		);
		expect(anchor).toContain('href="/docs"');
		expect(anchor).toContain('data-slot="accordion-trigger"');
		expect(anchor).not.toMatch(ANCHOR_TYPE_REGEX);
		const composed = renderToStaticMarkup(
			h(
				Accordion,
				{ defaultValue: ["b"] },
				h(
					AccordionItem,
					{ value: "b" },
					h(AccordionTrigger, { render: h(Button, { variant: "outline" }) })
				)
			)
		);
		expect(composed).toContain('data-slot="accordion-trigger"');
	});
	it("applies typography and separated layout styles to rich accordion headers", () => {
		propsSpy.mockClear();
		renderToStaticMarkup(
			h(
				Accordion,
				{ defaultValue: ["1"], variant: "separated" },
				h(
					AccordionItem,
					{ value: "1" },
					h(
						AccordionTrigger,
						{ description: "Details", icon: h("span", null, "Icon") },
						"Trigger"
					),
					h(AccordionPanel, null, "Panel")
				)
			)
		);
		for (const s of Object.values(accordionStyles)) {
			expect(propsSpy.mock.calls.some((call) => call.includes(s))).toBe(true);
		}
	});
});
