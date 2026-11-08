// @vitest-environment happy-dom

import { act, createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import {
	Tree,
	type TreeItemData,
	type TreeProps,
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
			{ disabled: true, id: "archive", label: "Archive" },
		],
		id: "design",
		label: "Design",
	},
	{ id: "reports", label: "Reports" },
];
const UNIQUE_ID_ERROR = /unique and non-empty/u;
const EMPTY_LABEL_ERROR = /labels must not be empty/u;
type Rejects<T, K extends PropertyKey> = [Extract<keyof T, K>] extends [never]
	? true
	: false;
const protectedTreeProps: Rejects<
	TreeProps,
	| "aria-activedescendant"
	| "aria-multiselectable"
	| "aria-selected"
	| "className"
	| "dangerouslySetInnerHTML"
	| "data-slot"
	| "role"
	| "style"
	| "tabIndex"
> = true;

function mount(treeProps: React.ComponentProps<typeof Tree>) {
	const container = document.body.appendChild(document.createElement("div"));
	const root = createRoot(container);
	act(() => root.render(h(Tree, treeProps)));
	return {
		container,
		node: (id: string) =>
			container.querySelector<HTMLElement>(`[data-tree-item-id="${id}"]`),
		rerender: (nextProps: React.ComponentProps<typeof Tree>) =>
			act(() => root.render(h(Tree, nextProps))),
		root: () => container.querySelector<HTMLElement>('[data-slot="tree"]'),
		unmount: () => {
			act(() => root.unmount());
			container.remove();
		},
	};
}

function expectTreeItemOwnLabel(item: HTMLElement | null) {
	if (!item) {
		throw new Error("Tree item was not rendered.");
	}
	const label = item.querySelector<HTMLElement>(
		'[data-slot="tree-item-label"]'
	);
	expect(item.getAttribute("aria-labelledby")).toBe(label?.id);
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

afterEach(() => document.body.replaceChildren());

describe("Tree contract", () => {
	it("renders an accessible tree hierarchy and uses one tab stop", () => {
		const view = mount({
			"aria-label": "Workspace files",
			defaultExpandedItems: ["design"],
			items,
		});
		const root = view.root();
		const design = view.node("design");
		const tokens = view.node("tokens");
		expect(root?.getAttribute("role")).toBe("tree");
		expect(root?.getAttribute("aria-label")).toBe("Workspace files");
		expect(root?.getAttribute("tabindex")).toBe("0");
		expect(root?.getAttribute("aria-activedescendant")).toBe(
			view.node("design")?.id
		);
		expect(design?.getAttribute("aria-expanded")).toBe("true");
		expect(tokens?.getAttribute("role")).toBe("treeitem");
		expect(tokens?.getAttribute("aria-level")).toBe("2");
		expect(tokens?.closest('[role="group"]')).not.toBeNull();
		view.unmount();
	});

	it("names each tree item from its visible label", () => {
		const view = mount({
			"aria-label": "Workspace files",
			defaultExpandedItems: ["design"],
			items,
		});
		expectTreeItemOwnLabel(view.node("design"));
		expectTreeItemOwnLabel(view.node("tokens"));
		view.unmount();
	});

	it("supports roving active descendant, typeahead, and Home/End", () => {
		const view = mount({ "aria-label": "Workspace files", items });
		const root = view.root();
		if (!root) {
			throw new Error("Tree root was not rendered.");
		}
		act(() => root.focus());
		press(root, "ArrowDown");
		expect(root.getAttribute("aria-activedescendant")).toBe(
			view.node("reports")?.id
		);
		press(root, "Home");
		expect(root.getAttribute("aria-activedescendant")).toBe(
			view.node("design")?.id
		);
		press(root, "r");
		expect(root.getAttribute("aria-activedescendant")).toBe(
			view.node("reports")?.id
		);
		press(root, "End");
		expect(root.getAttribute("aria-activedescendant")).toBe(
			view.node("reports")?.id
		);
		view.unmount();
	});

	it("expands and collapses with direction-aware arrows and ignores disabled activation", () => {
		const onExpandedItemsChange = vi.fn();
		const onItemActivate = vi.fn();
		const view = mount({
			"aria-label": "Workspace files",
			items,
			onExpandedItemsChange,
			onItemActivate,
		});
		const root = view.root();
		if (!root) {
			throw new Error("Tree root was not rendered.");
		}
		act(() => root.focus());
		press(root, "ArrowRight");
		expect(onExpandedItemsChange).toHaveBeenLastCalledWith(["design"]);
		view.unmount();

		const expandedView = mount({
			"aria-label": "Workspace files",
			defaultExpandedItems: ["design"],
			items,
			onItemActivate,
		});
		const expandedRoot = expandedView.root();
		if (!expandedRoot) {
			throw new Error("Tree root was not rendered.");
		}
		act(() => expandedRoot.focus());
		press(expandedRoot, "ArrowRight");
		expect(expandedRoot.getAttribute("aria-activedescendant")).toBe(
			expandedView.node("tokens")?.id
		);
		press(expandedRoot, "ArrowLeft");
		expect(expandedRoot.getAttribute("aria-activedescendant")).toBe(
			expandedView.node("design")?.id
		);
		act(() => expandedView.node("archive")?.click());
		expect(onItemActivate).not.toHaveBeenCalled();
		act(() => expandedView.node("reports")?.click());
		expect(onItemActivate).toHaveBeenCalledExactlyOnceWith(items[1]);
		expect(expandedView.node("archive")?.getAttribute("aria-disabled")).toBe(
			"true"
		);
		expandedView.unmount();
	});

	it("opts into independent single selection without changing legacy activation", () => {
		const onSelectedItemIdChange = vi.fn();
		const onItemActivate = vi.fn();
		const view = mount({
			"aria-label": "Workspace files",
			defaultExpandedItems: ["design"],
			defaultSelectedItemId: null,
			items,
			onItemActivate,
			onSelectedItemIdChange,
		});
		const design = view.node("design");
		expect(design?.getAttribute("aria-selected")).toBe("false");
		expect(view.node("tokens")?.getAttribute("aria-selected")).toBe("false");
		expect(view.node("archive")?.getAttribute("aria-selected")).toBe("false");

		// Selecting a folder also opens or closes it.
		act(() => design?.click());
		expect(design?.getAttribute("aria-selected")).toBe("true");
		expect(design?.getAttribute("aria-expanded")).toBe("false");
		expect(onSelectedItemIdChange).toHaveBeenCalledExactlyOnceWith("design");
		expect(onItemActivate).not.toHaveBeenCalled();
		act(() => design?.click());
		expect(design?.getAttribute("aria-expanded")).toBe("true");
		expect(onSelectedItemIdChange).toHaveBeenCalledExactlyOnceWith("design");

		const indicator = design?.querySelector<HTMLElement>(
			'[data-slot="tree-item-indicator"]'
		);
		act(() => indicator?.click());
		expect(design?.getAttribute("aria-expanded")).toBe("false");
		expect(design?.getAttribute("aria-selected")).toBe("true");

		view.unmount();
	});

	it("selects on Enter and Space but never on navigation arrows", () => {
		const onSelectedItemIdChange = vi.fn();
		const onItemActivate = vi.fn();
		const view = mount({
			"aria-label": "Workspace files",
			defaultExpandedItems: ["design"],
			defaultSelectedItemId: null,
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
		expect(view.node("tokens")?.getAttribute("aria-selected")).toBe("false");
		press(root, "Enter");
		expect(view.node("tokens")?.getAttribute("aria-selected")).toBe("true");
		expect(onItemActivate).toHaveBeenCalledExactlyOnceWith(
			items[0].children?.[0]
		);
		press(root, "ArrowDown");
		expect(view.node("archive")?.getAttribute("aria-selected")).toBe("false");
		press(root, "ArrowDown");
		press(root, " ");
		expect(onSelectedItemIdChange).toHaveBeenLastCalledWith("reports");
		expect(onItemActivate).toHaveBeenCalledTimes(2);
		view.unmount();
	});

	it("keeps controlled selection across disabled changes and omits removed IDs", () => {
		const view = mount({
			"aria-label": "Workspace files",
			defaultExpandedItems: ["design"],
			items,
			selectedItemId: "archive",
		});
		expect(view.node("archive")?.getAttribute("aria-selected")).toBe("true");
		view.rerender({
			"aria-label": "Workspace files",
			items: [
				{
					...items[0],
					children: items[0].children?.map((item) => ({
						...item,
						disabled: false,
					})),
				},
				items[1],
			],
			selectedItemId: "archive",
		});
		expect(view.node("archive")?.getAttribute("aria-selected")).toBe("true");
		view.rerender({
			"aria-label": "Workspace files",
			items: [{ ...items[0], children: [] }, items[1]],
			selectedItemId: "archive",
		});
		expect(view.node("design")?.getAttribute("aria-selected")).toBe("false");
		expect(view.node("reports")?.getAttribute("aria-selected")).toBe("false");
		view.unmount();
	});

	it("keeps selection opt-in when selection props are explicitly undefined", () => {
		const view = mount({
			"aria-label": "Workspace files",
			defaultSelectedItemId: undefined,
			items,
			selectedItemId: undefined,
		});
		expect(view.node("design")?.getAttribute("aria-selected")).toBeNull();
		view.unmount();
	});

	it("protects tree-owned semantics and content from runtime prop overrides", () => {
		const hostileProps = {
			"aria-label": "Workspace files",
			"aria-multiselectable": true,
			"aria-selected": true,
			className: "unsafe",
			dangerouslySetInnerHTML: { __html: "<script>unsafe()</script>" },
			"data-slot": "unsafe",
			items,
			role: "list",
			style: { color: "red" },
			tabIndex: -1,
		} as unknown as TreeProps;
		const view = mount(hostileProps);
		const root = view.root();
		expect(root?.getAttribute("role")).toBe("tree");
		expect(root?.getAttribute("aria-selected")).toBeNull();
		expect(root?.getAttribute("aria-multiselectable")).toBeNull();
		expect(root?.getAttribute("data-slot")).toBe("tree");
		expect(root?.getAttribute("tabindex")).toBe("0");
		expect(root?.getAttribute("style")).toBeNull();
		expect(view.container.querySelector("script")).toBeNull();
		expect(protectedTreeProps).toBe(true);
		view.unmount();
	});

	it("requires unique non-empty IDs and labels", () => {
		expect(() =>
			mount({
				"aria-label": "Invalid",
				items: [
					{ id: "same", label: "First" },
					{ id: "same", label: "Second" },
				],
			})
		).toThrow(UNIQUE_ID_ERROR);
		expect(() =>
			mount({ "aria-label": "Invalid", items: [{ id: "empty", label: " " }] })
		).toThrow(EMPTY_LABEL_ERROR);
	});

	it("requires a non-empty name", () => {
		expect(() =>
			mount({ "aria-label": " ", items: [{ id: "one", label: "One" }] })
		).toThrow(TypeError);
	});
});
