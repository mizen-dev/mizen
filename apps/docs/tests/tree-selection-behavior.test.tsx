// @vitest-environment happy-dom

import { act, createElement as h } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	Tree,
	type TreeItemData,
} from "../../../packages/ui/src/components/tree/tree";

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

const items: readonly TreeItemData[] = [
	{
		children: [
			{ id: "tokens", label: "Tokens" },
			{ id: "components", label: "Components" },
			{ disabled: true, id: "archive", label: "Archive" },
		],
		id: "design",
		label: "Design",
	},
	{ id: "reports", label: "Reports" },
];

function mount(props: React.ComponentProps<typeof Tree>) {
	const container = document.body.appendChild(document.createElement("div"));
	const root: Root = createRoot(container);
	const render = (nextProps: React.ComponentProps<typeof Tree>) =>
		act(() => root.render(h(Tree, nextProps)));
	render(props);
	return {
		container,
		item: (id: string) =>
			container.querySelector<HTMLElement>(`[data-tree-item-id="${id}"]`),
		render,
		root: () => container.querySelector<HTMLElement>('[data-slot="tree"]'),
		unmount: () => {
			act(() => root.unmount());
			container.remove();
		},
	};
}

function press(root: HTMLElement, key: string) {
	const event = new KeyboardEvent("keydown", {
		bubbles: true,
		cancelable: true,
		key,
	});
	act(() => root.dispatchEvent(event));
	return event;
}

function click(element: Element | null) {
	if (!element) {
		throw new Error("Expected Tree target was not rendered.");
	}
	act(() => element.dispatchEvent(new MouseEvent("click", { bubbles: true })));
}

function expectTreeItemAttribute(
	view: ReturnType<typeof mount>,
	id: string,
	attribute: string,
	expected: string
) {
	expect(view.item(id)?.getAttribute(attribute)).toBe(expected);
}

function expectActiveTreeItem(
	root: HTMLElement,
	view: ReturnType<typeof mount>,
	id: string
) {
	expect(root.getAttribute("aria-activedescendant")).toBe(view.item(id)?.id);
}

afterEach(() => document.body.replaceChildren());

describe("Tree selection behavior", () => {
	it("keeps selection separate from focus and supports parent and leaf selection", () => {
		const onSelectedItemIdChange = vi.fn();
		const onItemActivate = vi.fn();
		const view = mount({
			"aria-label": "Workspace files",
			defaultExpandedItems: ["design"],
			defaultSelectedItemId: "tokens",
			items,
			onItemActivate,
			onSelectedItemIdChange,
		});
		const root = view.root();
		if (!root) {
			throw new Error("Tree root was not rendered.");
		}
		act(() => root.focus());
		press(root, "ArrowDown");
		expectActiveTreeItem(root, view, "tokens");
		expectTreeItemAttribute(view, "tokens", "aria-selected", "true");
		expectTreeItemAttribute(view, "reports", "aria-selected", "false");
		press(root, "ArrowDown");
		expectActiveTreeItem(root, view, "components");
		expectTreeItemAttribute(view, "tokens", "aria-selected", "true");
		press(root, "Enter");
		expectTreeItemAttribute(view, "components", "aria-selected", "true");
		expect(onSelectedItemIdChange).toHaveBeenLastCalledWith("components");
		expect(onItemActivate).toHaveBeenCalledWith(items[0]?.children?.[1]);

		press(root, "ArrowUp");
		expectActiveTreeItem(root, view, "tokens");
		expectTreeItemAttribute(view, "components", "aria-selected", "true");
		expectTreeItemAttribute(view, "tokens", "aria-selected", "false");
		press(root, " ");
		expect(onSelectedItemIdChange).toHaveBeenLastCalledWith("tokens");
		expectTreeItemAttribute(view, "tokens", "aria-selected", "true");
		press(root, "ArrowUp");
		press(root, "Enter");
		expect(onSelectedItemIdChange).toHaveBeenLastCalledWith("design");
		expectTreeItemAttribute(view, "design", "aria-selected", "true");
		// Selecting a folder also opens or closes it.
		expectTreeItemAttribute(view, "design", "aria-expanded", "false");
		view.unmount();
	});

	it("toggles a parent row as it selects it, and the disclosure target only toggles", () => {
		const onSelectedItemIdChange = vi.fn();
		const onItemActivate = vi.fn();
		const view = mount({
			"aria-label": "Workspace files",
			defaultExpandedItems: ["design"],
			items,
			onItemActivate,
			onSelectedItemIdChange,
		});
		const design = view.item("design");
		click(design?.querySelector('[data-slot="tree-item-row"]') ?? null);
		expect(design?.getAttribute("aria-selected")).toBe("true");
		expect(design?.getAttribute("aria-expanded")).toBe("false");
		expect(view.item("tokens")).toBeNull();
		expect(onItemActivate).not.toHaveBeenCalled();

		click(design?.querySelector('[data-slot="tree-item-indicator"]') ?? null);
		expect(design?.getAttribute("aria-expanded")).toBe("true");
		expect(view.item("tokens")).not.toBeNull();
		expect(onSelectedItemIdChange).toHaveBeenCalledExactlyOnceWith("design");
		view.unmount();
	});

	it("keeps uncontrolled selection through collapse and blocks disabled selection", () => {
		const onSelectedItemIdChange = vi.fn();
		const view = mount({
			"aria-label": "Workspace files",
			defaultExpandedItems: ["design"],
			defaultSelectedItemId: "tokens",
			items,
			onSelectedItemIdChange,
		});
		const root = view.root();
		if (!root) {
			throw new Error("Tree root was not rendered.");
		}
		act(() => root.focus());
		press(root, "ArrowRight");
		expect(root.getAttribute("aria-activedescendant")).toBe(
			view.item("tokens")?.id
		);
		press(root, "ArrowLeft");
		press(root, "ArrowLeft");
		expect(view.item("design")?.getAttribute("aria-expanded")).toBe("false");
		press(root, "ArrowRight");
		expect(view.item("tokens")?.getAttribute("aria-selected")).toBe("true");

		press(root, "a");
		expect(root.getAttribute("aria-activedescendant")).toBe(
			view.item("archive")?.id
		);
		press(root, " ");
		expect(view.item("archive")?.getAttribute("aria-selected")).toBe("false");
		expect(onSelectedItemIdChange).not.toHaveBeenCalled();
		view.unmount();
	});

	it("keeps controlled state caller-owned and safely ignores a removed selected ID", () => {
		const onSelectedItemIdChange = vi.fn();
		const view = mount({
			"aria-label": "Workspace files",
			defaultExpandedItems: ["design"],
			expandedItems: ["design"],
			items,
			onSelectedItemIdChange,
			selectedItemId: "tokens",
		});
		const root = view.root();
		if (!root) {
			throw new Error("Tree root was not rendered.");
		}
		click(
			view.item("reports")?.querySelector('[data-slot="tree-item-row"]') ?? null
		);
		expect(onSelectedItemIdChange).toHaveBeenLastCalledWith("reports");
		expect(view.item("tokens")?.getAttribute("aria-selected")).toBe("true");
		expect(view.item("reports")?.getAttribute("aria-selected")).toBe("false");

		view.render({
			"aria-label": "Workspace files",
			expandedItems: ["design"],
			items: items.filter((item) => item.id === "reports"),
			onSelectedItemIdChange,
			selectedItemId: "tokens",
		});
		expect(view.item("reports")?.getAttribute("aria-selected")).toBe("false");
		view.render({
			"aria-label": "Workspace files",
			expandedItems: ["design"],
			items,
			onSelectedItemIdChange,
			selectedItemId: "tokens",
		});
		expect(view.item("tokens")?.getAttribute("aria-selected")).toBe("true");
		view.unmount();
	});

	it("preserves a controlled selection when the selected item becomes disabled", () => {
		const onSelectedItemIdChange = vi.fn();
		const view = mount({
			"aria-label": "Workspace files",
			items,
			onSelectedItemIdChange,
			selectedItemId: "reports",
		});
		const root = view.root();
		if (!root) {
			throw new Error("Tree root was not rendered.");
		}
		view.render({
			"aria-label": "Workspace files",
			items: [{ disabled: true, id: "reports", label: "Reports" }],
			onSelectedItemIdChange,
			selectedItemId: "reports",
		});
		expect(view.item("reports")?.getAttribute("aria-disabled")).toBe("true");
		expect(view.item("reports")?.getAttribute("aria-selected")).toBe("true");
		click(
			view.item("reports")?.querySelector('[data-slot="tree-item-row"]') ?? null
		);
		press(root, " ");
		expect(view.item("reports")?.getAttribute("aria-selected")).toBe("true");
		expect(onSelectedItemIdChange).not.toHaveBeenCalled();
		view.unmount();
	});

	it("keeps legacy behavior when selection props are explicitly undefined", () => {
		const onItemActivate = vi.fn();
		const view = mount({
			"aria-label": "Workspace files",
			defaultExpandedItems: [],
			defaultSelectedItemId: undefined,
			items,
			onItemActivate,
			onSelectedItemIdChange: undefined,
			selectedItemId: undefined,
		});
		const root = view.root();
		if (!root) {
			throw new Error("Tree root was not rendered.");
		}
		act(() => root.focus());
		expect(view.item("design")?.hasAttribute("aria-selected")).toBe(false);
		press(root, "Enter");
		expect(view.item("design")?.getAttribute("aria-expanded")).toBe("true");
		press(root, "ArrowRight");
		press(root, "ArrowRight");
		press(root, "Enter");
		expect(onItemActivate).toHaveBeenCalledWith(items[0]?.children?.[0]);
		view.unmount();
	});
});
