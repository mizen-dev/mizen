// @vitest-environment happy-dom
import type { HTMLAttributes } from "react";
import { act, createRef, createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";
import {
	Fieldset,
	FieldsetLegend,
} from "../../../packages/ui/src/components/fieldset/fieldset";
import { fieldsetStyles } from "../../../packages/ui/src/components/fieldset/fieldset.styles";
import { colors } from "../../../packages/ui/src/styles/colors.stylex";
import { fonts } from "../../../packages/ui/src/styles/fonts.stylex";
import { space } from "../../../packages/ui/src/styles/spacing.stylex";
import {
	fontSize,
	fontWeight,
	letterSpacing,
	lineHeight,
} from "../../../packages/ui/src/styles/typography.stylex";

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

describe("Fieldset DOM semantics, slot protection, and StyleX integration", () => {
	it("renders native fieldset element with canonical slot and accessible legend association", () => {
		const markup = renderToStaticMarkup(
			h(
				Fieldset,
				null,
				h(FieldsetLegend, null, "Account Details"),
				h("input", { type: "text" })
			)
		);
		expect(markup).toContain('data-slot="fieldset"');
		expect(markup).toContain('data-slot="fieldset-legend"');
		expect(markup).toContain("<fieldset");
		expect(markup).toContain("Account Details");

		const { container, unmount } = mount(
			h(
				Fieldset,
				null,
				h(FieldsetLegend, null, "Account Details"),
				h("input", { type: "text" })
			)
		);
		const fieldsetEl = container.querySelector("fieldset");
		const legendEl = container.querySelector('[data-slot="fieldset-legend"]');
		expect(fieldsetEl).not.toBeNull();
		expect(legendEl).not.toBeNull();
		const labelledBy = fieldsetEl?.getAttribute("aria-labelledby");
		const legendId = legendEl?.getAttribute("id");
		expect(labelledBy).toBeDefined();
		expect(labelledBy).toBe(legendId);
		unmount();
	});

	it("propagates disabled attribute to native fieldset and nested fieldset context", () => {
		const childFieldsetRef = createRef<HTMLFieldSetElement>();
		const { container, unmount } = mount(
			h(
				Fieldset,
				{ disabled: true },
				h(FieldsetLegend, null, "Personal Info"),
				h(
					Fieldset,
					{ ref: childFieldsetRef },
					h(FieldsetLegend, null, "Nested")
				)
			)
		);
		const fieldsetEl = container.querySelector("fieldset");
		if (!fieldsetEl) {
			throw new Error("fieldset not found");
		}
		expect(fieldsetEl.disabled).toBe(true);
		expect(fieldsetEl.hasAttribute("disabled")).toBe(true);
		expect(childFieldsetRef.current?.disabled).toBe(true);
		unmount();
	});

	it("forwards refs to underlying elements", () => {
		const fieldsetRef = createRef<HTMLFieldSetElement>();
		const legendRef = createRef<HTMLDivElement>();
		const { container, unmount } = mount(
			h(
				Fieldset,
				{ ref: fieldsetRef },
				h(FieldsetLegend, { ref: legendRef }, "Legend")
			)
		);
		expect(fieldsetRef.current).toBe(container.querySelector("fieldset"));
		expect(legendRef.current).toBe(
			container.querySelector('[data-slot="fieldset-legend"]')
		);
		unmount();
	});

	it("protects data-slot against direct prop and polymorphic render overrides", () => {
		const bad = {
			className: "bad-class",
			"data-slot": "bad-slot",
			style: { color: "red" },
		};
		const rootWithBad = renderToStaticMarkup(
			Reflect.apply(Fieldset, undefined, [bad])
		);
		expect(rootWithBad).toContain('data-slot="fieldset"');
		expect(rootWithBad).not.toContain("bad-class");
		expect(rootWithBad).not.toContain("bad-slot");

		const rootWithElementRender = renderToStaticMarkup(
			h(Fieldset, { render: h("div", { "data-slot": "override-root" }) })
		);
		expect(rootWithElementRender).toContain('data-slot="fieldset"');
		expect(rootWithElementRender).not.toContain("override-root");

		const rootWithFnRender = renderToStaticMarkup(
			h(Fieldset, {
				render: (p: HTMLAttributes<HTMLElement>) =>
					h("section", { ...p, "data-slot": "override-root-fn" }),
			})
		);
		expect(rootWithFnRender).toContain('data-slot="fieldset"');
		expect(rootWithFnRender).not.toContain("override-root-fn");

		const legendWithBad = renderToStaticMarkup(
			h(
				Fieldset,
				null,
				Reflect.apply(FieldsetLegend, undefined, [
					{ ...bad, children: "Bad Legend" },
				])
			)
		);
		expect(legendWithBad).toContain('data-slot="fieldset-legend"');
		expect(legendWithBad).not.toContain("bad-class");
		expect(legendWithBad).not.toContain("bad-slot");

		const legendWithElementRender = renderToStaticMarkup(
			h(
				Fieldset,
				null,
				h(FieldsetLegend, {
					render: h(
						"legend",
						{ "data-slot": "override-legend" },
						"Elem Legend"
					),
				})
			)
		);
		expect(legendWithElementRender).toContain('data-slot="fieldset-legend"');
		expect(legendWithElementRender).not.toContain("override-legend");

		const legendWithFnRender = renderToStaticMarkup(
			h(
				Fieldset,
				null,
				h(FieldsetLegend, {
					render: (p: HTMLAttributes<HTMLElement>) =>
						h(
							"legend",
							{ ...p, "data-slot": "override-legend-fn" },
							"Fn Legend"
						),
				})
			)
		);
		expect(legendWithFnRender).toContain('data-slot="fieldset-legend"');
		expect(legendWithFnRender).not.toContain("override-legend-fn");
	});

	it("applies exact StyleX root reset and legend styles", () => {
		propsSpy.mockClear();
		renderToStaticMarkup(
			h(Fieldset, null, h(FieldsetLegend, null, "Legend Title"))
		);
		expect(propsSpy).toHaveBeenCalledTimes(2);
		expect(propsSpy).toHaveBeenNthCalledWith(1, fieldsetStyles.root);
		expect(propsSpy).toHaveBeenNthCalledWith(2, fieldsetStyles.legend);
		expect(fieldsetStyles.root).toEqual({
			borderStyle: "none",
			borderWidth: 0,
			margin: 0,
			minWidth: 0,
			padding: 0,
		});
		expect(fieldsetStyles.legend).toEqual({
			color: colors.content,
			fontSize: fontSize["14"],
			fontSizeAdjust: fonts.sizeAdjust,
			fontWeight: fontWeight.semibold,
			letterSpacing: letterSpacing.ui,
			lineHeight: lineHeight["20"],
			marginBlockEnd: {
				":is([role='group'] > *, [role='radiogroup'] > *)": space["1"],
				default: 0,
			},
		});
	});
});
