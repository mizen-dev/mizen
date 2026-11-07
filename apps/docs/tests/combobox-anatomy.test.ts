// @vitest-environment happy-dom
import { act, createRef, createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import {
	Combobox,
	ComboboxChip,
	ComboboxChips,
	ComboboxChipsInput,
	ComboboxEmpty,
	ComboboxGroup,
	ComboboxGroupLabel,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
	ComboboxPopup,
	ComboboxRow,
	ComboboxSeparator,
	ComboboxStatus,
} from "../../../packages/ui/src/components/combobox/combobox";

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

describe("Combobox anatomy rendering", () => {
	it("renders single-select anatomy with protected data-slot values and Empty outside List", () => {
		const items = ["Apple", "Banana"];
		const { container, unmount } = mount(
			h(
				Combobox,
				{ defaultValue: "Apple", items, open: true },
				Reflect.apply(ComboboxInput, undefined, [
					{
						"data-slot": "override-slot",
						placeholder: "Select a fruit",
						showClear: true,
						showTrigger: true,
						startAddon: h("span", null, "Search:"),
					},
				]),
				h(
					ComboboxPopup,
					null,
					h(ComboboxEmpty, null, "No fruits"),
					h(
						ComboboxList,
						null,
						items.map((fruit) =>
							h(ComboboxItem, { key: fruit, value: fruit }, fruit)
						)
					)
				)
			)
		);

		expect(container.querySelector('[data-slot="override-slot"]')).toBeNull();
		const slots = [
			"combobox-input-group",
			"combobox-start-addon",
			"combobox-input",
			"combobox-trigger",
			"combobox-clear",
		];
		for (const slot of slots) {
			expect(container.querySelector(`[data-slot="${slot}"]`)).not.toBeNull();
		}
		for (const slot of [
			"combobox-popup",
			"combobox-empty",
			"combobox-list",
			"combobox-item",
			"combobox-item-indicator",
		]) {
			expect(document.querySelector(`[data-slot="${slot}"]`)).not.toBeNull();
		}

		const popup = document.querySelector('[data-slot="combobox-popup"]');
		const list = document.querySelector('[data-slot="combobox-list"]');
		const empty = document.querySelector('[data-slot="combobox-empty"]');
		expect(empty?.parentElement).toBe(popup);
		expect(list?.contains(empty)).toBe(false);

		unmount();
	});

	it("renders multiple chips anatomy with automatic chip remove button", () => {
		const items = ["One", "Two"];
		const { container, unmount } = mount(
			h(
				Combobox,
				{ defaultValue: ["One"], items, multiple: true },
				h(
					ComboboxChips,
					{ startAddon: h("span", null, "Tags:") },
					h(ComboboxChip, { key: "One" }, "One"),
					h(ComboboxChipsInput, { placeholder: "Add tag" })
				),
				h(
					ComboboxPopup,
					null,
					h(
						ComboboxList,
						null,
						items.map((tag) => h(ComboboxItem, { key: tag, value: tag }, tag))
					)
				)
			)
		);

		const chips = container.querySelector('[data-slot="combobox-chips"]');
		expect(chips).not.toBeNull();
		expect(
			chips?.querySelector('[data-slot="combobox-start-addon"]')?.textContent
		).toBe("Tags:");
		const removeBtn = chips?.querySelector(
			'[data-slot="combobox-chip"] [data-slot="combobox-chip-remove"]'
		);
		expect(removeBtn?.getAttribute("aria-label")).toBe("Remove");
		expect(
			chips?.querySelector('[data-slot="combobox-chips-input"]')
		).not.toBeNull();

		unmount();
	});

	it("renders groups, group labels, rows, and status outside List", () => {
		const { unmount } = mount(
			h(
				Combobox,
				{ items: ["A1", "B1"], open: true },
				h(ComboboxInput, null),
				h(
					ComboboxPopup,
					null,
					h(ComboboxStatus, null, "2 items available"),
					h(
						ComboboxList,
						null,
						h(
							ComboboxGroup,
							null,
							h(ComboboxGroupLabel, null, "Group A"),
							h(ComboboxRow, null, h(ComboboxItem, { value: "A1" }, "A1"))
						),
						h(ComboboxSeparator, null),
						h(
							ComboboxGroup,
							null,
							h(ComboboxGroupLabel, null, "Group B"),
							h(ComboboxItem, { value: "B1" }, "B1")
						)
					)
				)
			)
		);

		const popup = document.querySelector('[data-slot="combobox-popup"]');
		const list = document.querySelector('[data-slot="combobox-list"]');
		const status = document.querySelector('[data-slot="combobox-status"]');
		expect(status?.textContent).toContain("2 items available");
		expect(status?.parentElement).toBe(popup);
		expect(list?.contains(status)).toBe(false);

		const groupLabel = document.querySelector(
			'[data-slot="combobox-group"] [data-slot="combobox-group-label"]'
		);
		expect(groupLabel?.textContent).toBe("Group A");
		expect(document.querySelector('[data-slot="combobox-row"]')).not.toBeNull();
		expect(
			document.querySelector('[data-slot="combobox-separator"]')
		).not.toBeNull();

		unmount();
	});

	it("renders popup in single mode and multiple mode without positioning errors", () => {
		const customAnchor = createRef<HTMLDivElement>();
		const { unmount: unmountSingle } = mount(
			h(
				Combobox,
				{ defaultValue: "Apple", items: ["Apple"], open: true },
				h(ComboboxInput, null),
				h(
					ComboboxPopup,
					{ anchor: customAnchor },
					h(ComboboxItem, { value: "Apple" }, "Apple")
				)
			)
		);
		expect(
			document.querySelector('[data-slot="combobox-positioner"]')
		).not.toBeNull();
		unmountSingle();

		const { unmount: unmountMultiple } = mount(
			h(
				Combobox,
				{
					defaultValue: ["Apple"],
					items: ["Apple"],
					multiple: true,
					open: true,
				},
				h(ComboboxChips, null, h(ComboboxChipsInput, null)),
				h(ComboboxPopup, null, h(ComboboxItem, { value: "Apple" }, "Apple"))
			)
		);
		expect(
			document.querySelector('[data-slot="combobox-positioner"]')
		).not.toBeNull();
		unmountMultiple();
	});
});
