// @vitest-environment happy-dom
import { act, createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
// biome-ignore lint/performance/noNamespaceImport: Verify the complete public export contract.
import * as Tooltip from "../../../packages/ui/src/components/tooltip/tooltip";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(c: T): T => c,
	defineMarker: () => ({}),
	defineVars: <T extends object>(v: T): T => v,
	keyframes: () => "keyframes",
	props: () => ({ className: "mizen-default" }),
	when: { ancestor: () => ":where(*)" },
}));

describe("Tooltip native contract", () => {
	it("exports parts and native aliases", () => {
		expect(Object.keys(Tooltip).sort()).toEqual([
			"Tooltip",
			"TooltipCreateHandle",
			"TooltipPopup",
			"TooltipPrimitive",
			"TooltipProvider",
			"TooltipTrigger",
		]);
		expect(Tooltip.Tooltip).toBe(Tooltip.TooltipPrimitive.Root);
		expect(Tooltip.TooltipProvider).toBe(Tooltip.TooltipPrimitive.Provider);
		expect(Tooltip.TooltipCreateHandle).toBe(
			Tooltip.TooltipPrimitive.createHandle
		);
		expect(Tooltip).not.toHaveProperty("TooltipContent");
	});

	it("protects rendered trigger slots", () => {
		const html = renderToStaticMarkup(
			h(
				Tooltip.Tooltip,
				{},
				h(
					Tooltip.TooltipTrigger,
					{
						render: h("button", { "data-slot": "wrong", type: "button" }),
					},
					"Action"
				)
			)
		);
		expect(html).toContain('data-slot="tooltip-trigger"');
		expect(html).toContain('type="button"');
	});
	it("keeps Mizen popup styling with render targets and portal props", () => {
		const container = document.body.appendChild(document.createElement("div"));
		const root = createRoot(container);
		act(() =>
			root.render(
				h(
					Tooltip.Tooltip,
					{ defaultOpen: true },
					h(Tooltip.TooltipTrigger, {}, "Target"),
					h(
						Tooltip.TooltipPopup,
						{
							portalProps: { container },
							render: h("section", { "data-slot": "wrong" }),
						},
						"Helpful hint"
					)
				)
			)
		);
		const popup = container.querySelector('[data-slot="tooltip-popup"]');
		expect(popup?.tagName).toBe("SECTION");
		expect(popup?.className).toContain("mizen-default");
		expect(
			popup?.querySelector('[data-slot="tooltip-viewport"]')
		).not.toBeNull();
		act(() => root.unmount());
		container.remove();
	});
});
