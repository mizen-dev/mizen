// @vitest-environment happy-dom
import { act, createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vite-plus/test";
import {
	NumberField,
	NumberFieldDecrement,
	NumberFieldGroup,
	NumberFieldIncrement,
	NumberFieldInput,
	NumberFieldScrubArea,
} from "../../../packages/ui/src/components/number-field/number-field";
import { numberFieldStyles } from "../../../packages/ui/src/components/number-field/number-field.styles";
import { conditions } from "../../../packages/ui/src/styles/conditions.stylex";
import { fontSize } from "../../../packages/ui/src/styles/typography.stylex";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(s: T): T => s,
	defineConsts: <T extends object>(c: T): T => c,
	defineMarker: () => ({}),
	defineVars: <T extends object>(v: T): T => v,
	keyframes: <T extends object>(k: T): T => k,
	props: (...args: unknown[]) => ({
		className: JSON.stringify(args),
	}),
	when: {
		ancestor: () => ":where(*)",
	},
}));
Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
function BadScrubDirect({ bad }: { bad: Record<string, unknown> }) {
	return Reflect.apply(NumberFieldScrubArea, undefined, [
		{
			...bad,
			children: "Width",
		},
	]);
}
function mount(
	element: Parameters<ReturnType<typeof createRoot>["render"]>[0]
) {
	const container = document.body.appendChild(document.createElement("div"));
	const root = createRoot(container);
	act(() => {
		root.render(element);
	});
	return {
		container,
		unmount: () => {
			act(() => {
				root.unmount();
			});
			container.remove();
		},
	};
}
describe("NumberField affordances, directions, and typography", () => {
	it("renders direction-aware visible scrub state and area cursor treatment", () => {
		const { container: hContainer, unmount: hUnmount } = mount(
			h(
				NumberField,
				null,
				h(NumberFieldScrubArea, {
					direction: "horizontal",
					label: "Width",
				})
			)
		);
		const hScrub = hContainer.querySelector(
			'[data-slot="number-field-scrub-area"]'
		);
		expect(hScrub?.getAttribute("data-direction")).toBe("horizontal");
		expect(hScrub?.querySelector("label")?.textContent).toBe("Width");
		expect(hScrub?.className).toContain(
			JSON.stringify(numberFieldStyles.scrubArea)
		);
		hUnmount();
		const { container: vContainer, unmount: vUnmount } = mount(
			h(
				NumberField,
				null,
				h(
					NumberFieldScrubArea,
					{
						direction: "vertical",
					},
					"Height"
				)
			)
		);
		const vScrub = vContainer.querySelector(
			'[data-slot="number-field-scrub-area"]'
		);
		expect(vScrub?.getAttribute("data-direction")).toBe("vertical");
		expect(vScrub?.className).toContain(
			JSON.stringify(numberFieldStyles.scrubAreaVertical)
		);
		vUnmount();
	});
	it("protects data-direction against direct and polymorphic render overrides", () => {
		const bad = {
			"data-direction": "evil",
		};
		const { container: directContainer, unmount: directUnmount } = mount(
			h(
				NumberField,
				null,
				h(BadScrubDirect, {
					bad,
				})
			)
		);
		const directScrub = directContainer.querySelector(
			'[data-slot="number-field-scrub-area"]'
		);
		expect(directScrub?.getAttribute("data-direction")).toBe("horizontal");
		directUnmount();
		const renderBad = (p: object) =>
			h("span", {
				...p,
				"data-direction": "evil-render",
			});
		const { container: renderContainer, unmount: renderUnmount } = mount(
			h(
				NumberField,
				null,
				h(NumberFieldScrubArea, {
					render: renderBad,
				})
			)
		);
		const renderScrub = renderContainer.querySelector(
			'[data-slot="number-field-scrub-area"]'
		);
		expect(renderScrub?.getAttribute("data-direction")).toBe("horizontal");
		renderUnmount();
	});
	it("applies size typography contract to input preserving mobile 16px floor", () => {
		expect(numberFieldStyles.inputSm).toMatchObject({
			fontSize: {
				[conditions.sm]: fontSize["13"],
				default: fontSize["16"],
			},
		});
		const { container, unmount } = mount(
			h(
				NumberField,
				{
					size: "sm",
				},
				h(NumberFieldGroup, null, h(NumberFieldInput, null))
			)
		);
		const input = container.querySelector<HTMLInputElement>(
			'[data-slot="number-field-input"]'
		);
		expect(input?.className).toContain(
			JSON.stringify(numberFieldStyles.inputSm)
		);
		unmount();
	});
	it("configures non-interactive cursor affordances on read-only and disabled states", () => {
		expect(numberFieldStyles.scrubArea).toMatchObject({
			cursor: {
				":is([data-disabled], [data-readonly])": "not-allowed",
				default: "ew-resize",
			},
		});
		expect(numberFieldStyles.scrubAreaVertical).toMatchObject({
			cursor: {
				":is([data-disabled], [data-readonly])": "not-allowed",
				default: "ns-resize",
			},
		});
		expect(numberFieldStyles.stepper).toMatchObject({
			cursor: {
				":is([data-disabled], [data-readonly])": "not-allowed",
				default: "pointer",
			},
		});
		const { container: roContainer, unmount: roUnmount } = mount(
			h(
				NumberField,
				{
					readOnly: true,
				},
				h(NumberFieldScrubArea, null, "Fixed"),
				h(
					NumberFieldGroup,
					null,
					h(NumberFieldDecrement, null),
					h(NumberFieldInput, null),
					h(NumberFieldIncrement, null)
				)
			)
		);
		const roDec = roContainer.querySelector(
			'[data-slot="number-field-decrement"]'
		);
		const roInc = roContainer.querySelector(
			'[data-slot="number-field-increment"]'
		);
		expect(roDec?.getAttribute("aria-disabled")).toBe("true");
		expect(roInc?.getAttribute("aria-disabled")).toBe("true");
		roUnmount();
		const { container: disContainer, unmount: disUnmount } = mount(
			h(
				NumberField,
				{
					disabled: true,
				},
				h(NumberFieldScrubArea, null, "Fixed"),
				h(
					NumberFieldGroup,
					null,
					h(NumberFieldDecrement, null),
					h(NumberFieldInput, null),
					h(NumberFieldIncrement, null)
				)
			)
		);
		const disDec = disContainer.querySelector(
			'[data-slot="number-field-decrement"]'
		);
		const disInc = disContainer.querySelector(
			'[data-slot="number-field-increment"]'
		);
		expect(disDec?.getAttribute("aria-disabled")).toBe("true");
		expect(disInc?.getAttribute("aria-disabled")).toBe("true");
		disUnmount();
	});
});
