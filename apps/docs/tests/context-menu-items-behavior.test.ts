// @vitest-environment happy-dom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import {
	ContextMenu,
	ContextMenuCheckboxItem,
	ContextMenuLinkItem,
	ContextMenuPopup,
	ContextMenuRadioGroup,
	ContextMenuRadioItem,
	ContextMenuTrigger,
} from "../../../packages/ui/src/components/context-menu/context-menu";

const h = createElement;
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

function mount(
	element: Parameters<ReturnType<typeof createRoot>["render"]>[0]
) {
	const container = document.body.appendChild(document.createElement("div"));
	const root = createRoot(container);
	act(() => root.render(element));
	return {
		container,
		linkItem: () =>
			document.body.querySelector<HTMLAnchorElement>(
				'[data-slot="context-menu-link-item"]'
			),
		radioItems: () =>
			document.body.querySelectorAll<HTMLDivElement>(
				'[data-slot="context-menu-radio-item"]'
			),
		unmount: () => {
			act(() => root.unmount());
			container.remove();
		},
	};
}

describe("ContextMenu item and selection behavior", () => {
	it("closes menu by default when ContextMenuLinkItem is clicked", () => {
		const onOpenChange = vi.fn();
		const { linkItem, unmount } = mount(
			h(
				ContextMenu,
				{ onOpenChange, open: true },
				h(ContextMenuTrigger, null, "Surface"),
				h(
					ContextMenuPopup,
					null,
					h(ContextMenuLinkItem, { href: "/navigation" }, "Navigate")
				)
			)
		);

		act(() => {
			linkItem()?.click();
		});

		expect(onOpenChange).toHaveBeenCalledWith(
			false,
			expect.objectContaining({ reason: "item-press" })
		);
		unmount();
	});

	it("respects closeOnClick false override on ContextMenuLinkItem", () => {
		const onOpenChange = vi.fn();
		const { linkItem, unmount } = mount(
			h(
				ContextMenu,
				{ onOpenChange, open: true },
				h(ContextMenuTrigger, null, "Surface"),
				h(
					ContextMenuPopup,
					null,
					h(
						ContextMenuLinkItem,
						{ closeOnClick: false, href: "/persistent" },
						"Stay open"
					)
				)
			)
		);

		act(() => {
			linkItem()?.click();
		});

		expect(onOpenChange).not.toHaveBeenCalled();
		unmount();
	});

	it("renders checkbox item with check icon for default variant and switch structure", () => {
		const [onDefaultChange, onSwitchChange] = [vi.fn(), vi.fn()];
		const { unmount } = mount(
			h(
				ContextMenu,
				{ defaultOpen: true },
				h(ContextMenuTrigger, null, "Surface"),
				h(
					ContextMenuPopup,
					null,
					h(
						ContextMenuCheckboxItem,
						{
							checked: true,
							onCheckedChange: onDefaultChange,
							variant: "default",
						},
						"Check item"
					),
					h(
						ContextMenuCheckboxItem,
						{
							checked: true,
							onCheckedChange: onSwitchChange,
							variant: "switch",
						},
						"Switch item"
					)
				)
			)
		);

		const items = document.body.querySelectorAll(
			'[data-slot="context-menu-checkbox-item"]'
		);
		expect(items.length).toBe(2);
		const [defaultItem, switchItem] = items;

		expect(defaultItem?.querySelector("svg")).not.toBeNull();
		expect(switchItem?.querySelectorAll("span").length).toBeGreaterThanOrEqual(
			1
		);

		act(() => {
			defaultItem?.dispatchEvent(
				new MouseEvent("click", { bubbles: true, cancelable: true })
			);
		});
		expect(onDefaultChange).toHaveBeenCalledWith(false, expect.anything());
		unmount();
	});

	it("renders radio group and manages radio indicator selection", () => {
		const onValueChange = vi.fn();
		const { radioItems, unmount } = mount(
			h(
				ContextMenu,
				{ defaultOpen: true },
				h(ContextMenuTrigger, null, "Surface"),
				h(
					ContextMenuPopup,
					null,
					h(
						ContextMenuRadioGroup,
						{ onValueChange, value: "first" },
						h(ContextMenuRadioItem, { value: "first" }, "First option"),
						h(ContextMenuRadioItem, { value: "second" }, "Second option")
					)
				)
			)
		);

		const radios = radioItems();
		expect(radios.length).toBe(2);
		const [firstRadio, secondRadio] = radios;

		expect(firstRadio?.getAttribute("aria-checked")).toBe("true");
		expect(secondRadio?.getAttribute("aria-checked")).toBe("false");
		expect(firstRadio?.querySelector("span")).not.toBeNull();

		act(() => {
			secondRadio?.dispatchEvent(
				new MouseEvent("click", { bubbles: true, cancelable: true })
			);
		});
		expect(onValueChange).toHaveBeenCalledWith("second", expect.anything());
		unmount();
	});
});
