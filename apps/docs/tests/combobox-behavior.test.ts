// @vitest-environment happy-dom
import { act, createRef, createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import {
	Combobox,
	ComboboxChips,
	ComboboxChipsInput,
	ComboboxInput,
} from "../../../packages/ui/src/components/combobox/combobox";
import { comboboxChipsStyles } from "../../../packages/ui/src/components/combobox/combobox-chips.styles";
import { comboboxFieldStyles } from "../../../packages/ui/src/components/combobox/combobox-field.styles";
import { fieldStyles } from "../../../packages/ui/src/components/field/field.styles";
import { colors } from "../../../packages/ui/src/styles/colors.stylex";
import { conditions } from "../../../packages/ui/src/styles/conditions.stylex";
import { controlSize } from "../../../packages/ui/src/styles/dimensions.stylex";
import { borderWidth } from "../../../packages/ui/src/styles/interaction.stylex";
import { fontSize } from "../../../packages/ui/src/styles/typography.stylex";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	createTheme: <T extends object>(_v: T, overrides: object): object =>
		overrides,
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
		rerender: (next: typeof element) => act(() => root.render(next)),
		unmount: () => {
			act(() => root.unmount());
			container.remove();
		},
	};
}

describe("Combobox behavior - React 19 callback ref cleanup", () => {
	it("preserves and invokes consumer callback ref cleanup on unmount", () => {
		const cleanupSpy = vi.fn();
		const refCallback = vi.fn((node: HTMLDivElement | null) => {
			if (node) {
				return cleanupSpy;
			}
		});

		const { container, unmount } = mount(
			h(
				Combobox,
				{ defaultValue: ["A"], items: ["A", "B"], multiple: true },
				h(
					ComboboxChips,
					{ ref: refCallback },
					h(ComboboxChipsInput, { placeholder: "Tags" })
				)
			)
		);

		const chipsElement = container.querySelector(
			'[data-slot="combobox-chips"]'
		);
		expect(chipsElement).not.toBeNull();
		expect(refCallback).toHaveBeenCalledTimes(1);
		expect(refCallback).toHaveBeenCalledWith(chipsElement);
		expect(cleanupSpy).not.toHaveBeenCalled();

		unmount();

		expect(refCallback).toHaveBeenCalledTimes(1);
		expect(refCallback).not.toHaveBeenCalledWith(null);
		expect(cleanupSpy).toHaveBeenCalledTimes(1);
	});

	it("invokes consumer callback ref with null exactly once on unmount when no cleanup function is returned", () => {
		const refCallback = vi.fn();

		const { container, unmount } = mount(
			h(
				Combobox,
				{ defaultValue: ["A"], items: ["A", "B"], multiple: true },
				h(
					ComboboxChips,
					{ ref: refCallback },
					h(ComboboxChipsInput, { placeholder: "Tags" })
				)
			)
		);

		const element = container.querySelector('[data-slot="combobox-chips"]');
		expect(element).not.toBeNull();
		expect(refCallback).toHaveBeenCalledTimes(1);
		expect(refCallback).toHaveBeenCalledWith(element);

		unmount();

		expect(refCallback).toHaveBeenCalledTimes(2);
		expect(refCallback).toHaveBeenLastCalledWith(null);
	});

	it("clears object refs on unmount when provided to ComboboxChips", () => {
		const objectRef = createRef<HTMLDivElement>();

		const { unmount } = mount(
			h(
				Combobox,
				{ defaultValue: ["A"], items: ["A", "B"], multiple: true },
				h(
					ComboboxChips,
					{ ref: objectRef },
					h(ComboboxChipsInput, { placeholder: "Tags" })
				)
			)
		);

		expect(objectRef.current).not.toBeNull();

		unmount();

		expect(objectRef.current).toBeNull();
	});
});

describe("Combobox behavior - Clear action and Trigger visibility", () => {
	it("renders ComboboxClear with default aria-label='Clear selection'", () => {
		const { container, unmount } = mount(
			h(
				Combobox,
				{ defaultValue: "Apple", items: ["Apple", "Banana"] },
				h(ComboboxInput, { showClear: true })
			)
		);

		const clearBtn = container.querySelector('[data-slot="combobox-clear"]');
		expect(clearBtn).not.toBeNull();
		expect(clearBtn?.getAttribute("aria-label")).toBe("Clear selection");

		unmount();
	});

	it("allows overriding aria-label on ComboboxClear", () => {
		const { container, unmount } = mount(
			h(
				Combobox,
				{ defaultValue: "Apple", items: ["Apple", "Banana"] },
				h(ComboboxInput, {
					clearProps: { "aria-label": "Reset selection" },
					showClear: true,
				})
			)
		);

		const clearBtn = container.querySelector('[data-slot="combobox-clear"]');
		expect(clearBtn).not.toBeNull();
		expect(clearBtn?.getAttribute("aria-label")).toBe("Reset selection");

		unmount();
	});

	it("hides trigger via adjacent sibling style when clear primitive is mounted", () => {
		expect(comboboxFieldStyles.trigger.display).toEqual({
			":has(+ [data-slot='combobox-clear'])": "none",
			default: "inline-flex",
		});
	});

	it("does not mount clear primitive when combobox is empty even if showClear is true", () => {
		const { container, unmount } = mount(
			h(
				Combobox,
				{ items: ["Apple", "Banana"], value: null },
				h(ComboboxInput, { showClear: true, showTrigger: true })
			)
		);

		const triggerBtn = container.querySelector(
			'[data-slot="combobox-trigger"]'
		);
		const clearBtn = container.querySelector('[data-slot="combobox-clear"]');

		expect(triggerBtn).not.toBeNull();
		expect(clearBtn).toBeNull();

		unmount();
	});
});

describe("Combobox behavior - Chips sizing and flow startAddon", () => {
	it("keeps chips startAddon in normal flex flow without absolute positioning", () => {
		expect(
			Reflect.get(comboboxChipsStyles.startAddon, "position")
		).toBeUndefined();
		expect(comboboxChipsStyles.startAddon.display).toBe("inline-flex");
		expect(comboboxChipsStyles.startAddon.flexShrink).toBe(0);
	});

	it("provides distinct container minHeight responses for sm, default, and lg sizes", () => {
		expect(comboboxChipsStyles.chips.minHeight).toEqual({
			":has([data-size='lg'])": controlSize.lg,
			":has([data-size='sm'])": controlSize.sm,
			default: controlSize.md,
		});
	});

	it("provides distinct chipsInput sizing styles for sm, default, and lg", () => {
		expect(comboboxChipsStyles.chipsInputSm).toBeDefined();
		expect(comboboxChipsStyles.chipsInputDefault).toBeDefined();
		expect(comboboxChipsStyles.chipsInputLg).toBeDefined();
		expect(comboboxChipsStyles.chipsInputSm.fontSize).toEqual({
			[conditions.sm]: fontSize["14"],
			default: fontSize["16"],
		});
		expect(comboboxChipsStyles.chipsInputSm.minHeight).toBe("1.5rem");
		expect(comboboxChipsStyles.chipsInputDefault.minHeight).toBe("1.75rem");
		expect(comboboxChipsStyles.chipsInputLg.minHeight).toBe("2rem");
	});
});

describe("Combobox behavior - Placeholder contrast and forced-colors outline", () => {
	it("uses semantic mutedContent for placeholders without opacity dilution", () => {
		expect(fieldStyles.input["::placeholder"]).toEqual({
			color: colors.mutedContent,
			opacity: 1,
		});

		expect(comboboxChipsStyles.chipsInput["::placeholder"]).toEqual({
			color: colors.mutedContent,
			opacity: 1,
		});
	});

	it("keeps shared input and chip focus geometry", () => {
		expect(fieldStyles.input.outlineWidth).toEqual({
			":focus-visible": borderWidth.focus,
			default: borderWidth.focus,
		});

		expect(comboboxChipsStyles.chips.outlineWidth).toEqual({
			":focus-within": borderWidth.focus,
			default: 0,
		});

		expect(comboboxChipsStyles.chip.outlineWidth).toEqual({
			":focus-visible": borderWidth.focus,
			default: 0,
		});
		expect(comboboxChipsStyles.chip.outlineColor).toEqual({
			":focus-visible": colors.focusRing,
			default: "transparent",
		});
	});
});
