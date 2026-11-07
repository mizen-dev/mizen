"use client";

import { props } from "@stylexjs/stylex";
import type {
	ComponentPropsWithRef,
	KeyboardEvent as ReactKeyboardEvent,
	MouseEvent as ReactMouseEvent,
	ReactNode,
} from "react";
import { useCallback, useId, useMemo, useRef, useState } from "react";
import type { Closed } from "../../closed";
import { IconChevronRight } from "../../icons";
import { omitProps } from "../../render-utils";
import { typeRoles, typographyStyles } from "../../styles/typography.styles";
import { treeStyles } from "./tree.styles";

export interface TreeItemData {
	readonly children?: readonly TreeItemData[];
	readonly disabled?: boolean;
	/** Shown in place of `icon` while the item is expanded, such as an open folder. */
	readonly expandedIcon?: ReactNode;
	/** A 16px glyph before the label, such as a file type. */
	readonly icon?: ReactNode;
	readonly id: string;
	readonly label: string;
}

type TreeAccessibleName =
	| { "aria-label": string; "aria-labelledby"?: never }
	| { "aria-label"?: never; "aria-labelledby": string };

export type TreeProps = Omit<
	Closed<ComponentPropsWithRef<"ul">>,
	| "aria-label"
	| "aria-labelledby"
	| "aria-activedescendant"
	| "children"
	| "dangerouslySetInnerHTML"
	| "aria-selected"
	| "aria-multiselectable"
	| "data-slot"
	| "role"
	| "tabIndex"
> &
	TreeAccessibleName & {
		defaultExpandedItems?: readonly string[];
		defaultSelectedItemId?: string | null;
		expandedItems?: readonly string[];
		items: readonly TreeItemData[];
		onExpandedItemsChange?: (expandedItems: readonly string[]) => void;
		onItemActivate?: (item: TreeItemData) => void;
		onSelectedItemIdChange?: (selectedItemId: string | null) => void;
		selectedItemId?: string | null;
	};

interface TreeNodeData {
	readonly disabled: boolean;
	readonly hasChildren: boolean;
	readonly id: string;
	readonly label: string;
	readonly level: number;
	readonly parentId?: string;
	readonly position: number;
	readonly setSize: number;
	readonly source: TreeItemData;
}

interface TreeContextValue {
	readonly activeId?: string;
	readonly expandedItems: ReadonlySet<string>;
	readonly focused: boolean;
	readonly getDomId: (id: string) => string;
	readonly selectedItemId?: string;
	readonly selectionEnabled: boolean;
}

type KeyAction =
	| "activate"
	| "collapse"
	| "expand"
	| "first"
	| "last"
	| "next"
	| "previous";

const TYPEAHEAD_RESET_MS = 600;

function flattenItems(
	items: readonly TreeItemData[],
	level = 1,
	parentId?: string
): TreeNodeData[] {
	const nodes: TreeNodeData[] = [];
	items.forEach((source, index) => {
		nodes.push(createNode(source, level, index + 1, items.length, parentId));
		if (source.children?.length) {
			nodes.push(...flattenItems(source.children, level + 1, source.id));
		}
	});
	return nodes;
}

// Tree owns these attributes; callers can't override them.
const PROTECTED_PROPS = [
	"aria-activedescendant",
	"aria-selected",
	"aria-multiselectable",
	"dangerouslySetInnerHTML",
	"className",
	"data-slot",
	"role",
	"style",
	"tabIndex",
];

function validateSelectedItemId(id: string | null | undefined) {
	if (
		id !== null &&
		id !== undefined &&
		(typeof id !== "string" || !id.trim())
	) {
		throw new TypeError(
			"Tree selected item IDs must be non-empty strings or null."
		);
	}
}

function findCurrentActiveId(
	activeId: string | undefined,
	visibleIds: ReadonlySet<string>,
	nodesById: ReadonlyMap<string, TreeNodeData>,
	visibleItems: readonly TreeNodeData[]
) {
	let currentId = activeId;
	while (currentId && !visibleIds.has(currentId)) {
		currentId = nodesById.get(currentId)?.parentId;
	}
	return currentId ?? visibleItems[0]?.id;
}

function getSelectedItemId(
	enabled: boolean,
	requestedId: string | null | undefined,
	nodesById: ReadonlyMap<string, TreeNodeData>
) {
	return enabled && requestedId && nodesById.has(requestedId)
		? requestedId
		: undefined;
}

function getAriaSelected(context: TreeContextValue, node: TreeNodeData) {
	return context.selectionEnabled
		? context.selectedItemId === node.id
		: undefined;
}

function assertTreeName(label?: string, labelledBy?: string) {
	if (!(label?.trim() || labelledBy?.trim())) {
		throw new TypeError(
			"Tree requires a non-empty aria-label or aria-labelledby."
		);
	}
}

function validateItems(nodes: readonly TreeNodeData[]) {
	const ids = new Set<string>();
	for (const node of nodes) {
		if (!node.id.trim() || ids.has(node.id)) {
			throw new Error(
				`Tree item IDs must be unique and non-empty: "${node.id}".`
			);
		}
		if (!node.label.trim()) {
			throw new Error(`Tree item labels must not be empty: "${node.id}".`);
		}
		ids.add(node.id);
	}
}

function getVisibleItems(
	items: readonly TreeItemData[],
	expanded: ReadonlySet<string>,
	level = 1,
	parentId?: string
): TreeNodeData[] {
	const nodes: TreeNodeData[] = [];
	items.forEach((source, index) => {
		const hasChildren = (source.children?.length ?? 0) > 0;
		nodes.push(createNode(source, level, index + 1, items.length, parentId));
		if (hasChildren && expanded.has(source.id)) {
			nodes.push(
				...getVisibleItems(
					source.children ?? [],
					expanded,
					level + 1,
					source.id
				)
			);
		}
	});
	return nodes;
}

function getKeyAction(key: string, isRtl: boolean): KeyAction | null {
	const actions: Record<string, KeyAction> = {
		" ": "activate",
		ArrowDown: "next",
		ArrowUp: "previous",
		End: "last",
		Enter: "activate",
		Home: "first",
	};
	if (key === "ArrowLeft" || key === "ArrowRight") {
		return key === (isRtl ? "ArrowLeft" : "ArrowRight") ? "expand" : "collapse";
	}
	return actions[key] ?? null;
}

function getTypeaheadMatch(
	nodes: readonly TreeNodeData[],
	activeId: string | undefined,
	query: string
): TreeNodeData | undefined {
	const activeIndex = nodes.findIndex((node) => node.id === activeId);
	const start = activeIndex < 0 ? 0 : activeIndex + 1;
	const ordered = [...nodes.slice(start), ...nodes.slice(0, start)];
	const normalizedQuery = query.toLocaleLowerCase();
	return ordered.find((node) =>
		node.label.toLocaleLowerCase().startsWith(normalizedQuery)
	);
}

function createNode(
	source: TreeItemData,
	level: number,
	position: number,
	setSize: number,
	parentId?: string
): TreeNodeData {
	return {
		disabled: source.disabled ?? false,
		hasChildren: (source.children?.length ?? 0) > 0,
		id: source.id,
		label: source.label,
		level,
		parentId,
		position,
		setSize,
		source,
	};
}

function renderExpandedChildren(
	node: TreeNodeData,
	context: TreeContextValue,
	isExpanded: boolean
) {
	return node.hasChildren && isExpanded
		? renderTreeGroup(node.source.children ?? [], node, context)
		: null;
}

function TreeNode({
	context,
	domId,
	node,
}: {
	context: TreeContextValue;
	domId: string;
	node: TreeNodeData;
}) {
	const isExpanded = context.expandedItems.has(node.id);
	const isActive = context.focused && context.activeId === node.id;
	const ariaSelected = getAriaSelected(context, node);
	return (
		// biome-ignore lint/a11y/useFocusableInteractive: The tree root owns DOM focus through aria-activedescendant.
		<li
			aria-disabled={node.disabled || undefined}
			aria-expanded={node.hasChildren ? isExpanded : undefined}
			aria-labelledby={`${domId}-label`}
			aria-level={node.level}
			aria-posinset={node.position}
			aria-selected={ariaSelected}
			aria-setsize={node.setSize}
			data-slot="tree-item"
			data-tree-item-id={node.id}
			id={domId}
			role="treeitem"
			{...props(treeStyles.item)}
		>
			<div
				data-active={isActive || undefined}
				data-disabled={node.disabled || undefined}
				data-selected={ariaSelected || undefined}
				data-slot="tree-item-row"
				{...props(treeStyles.row)}
			>
				{node.hasChildren ? (
					<span
						aria-hidden="true"
						data-expanded={isExpanded || undefined}
						data-slot="tree-item-indicator"
						{...props(treeStyles.indicator)}
					>
						<IconChevronRight
							aria-hidden="true"
							size="1em"
							{...props(treeStyles.chevronIcon)}
						/>
					</span>
				) : null}
				<ItemIcon expanded={isExpanded} source={node.source} />
				<span
					data-slot="tree-item-label"
					id={`${domId}-label`}
					{...props(treeStyles.label, typographyStyles.controlLabel)}
				>
					{node.label}
				</span>
			</div>
			{renderExpandedChildren(node, context, isExpanded)}
		</li>
	);
}

function renderTreeGroup(
	children: readonly TreeItemData[],
	parent: TreeNodeData,
	context: TreeContextValue
) {
	return (
		// biome-ignore lint/a11y/useSemanticElements: Tree groups require role=group for the ARIA tree pattern.
		<ul data-slot="tree-group" role="group" {...props(treeStyles.group)}>
			{children.map((child, index) => (
				<TreeNode
					context={context}
					domId={context.getDomId(child.id)}
					key={child.id}
					node={createNode(
						child,
						parent.level + 1,
						index + 1,
						children.length,
						parent.id
					)}
				/>
			))}
		</ul>
	);
}

function ItemIcon({
	expanded,
	source,
}: {
	expanded: boolean;
	source: TreeItemData;
}) {
	const icon = (expanded && source.expandedIcon) || source.icon;
	return icon ? (
		<span
			aria-hidden="true"
			data-slot="tree-item-icon"
			{...props(treeStyles.icon)}
		>
			{icon}
		</span>
	) : null;
}

function renderRootNodes(
	items: readonly TreeItemData[],
	getDomId: (id: string) => string,
	context: TreeContextValue
) {
	return items.map((item, index) => (
		<TreeNode
			context={context}
			domId={getDomId(item.id)}
			key={item.id}
			node={createNode(item, 1, index + 1, items.length)}
		/>
	));
}

function moveActive(
	nodes: readonly TreeNodeData[],
	activeNode: TreeNodeData,
	amount: number,
	setActive: (id: string) => void
) {
	const index = nodes.indexOf(activeNode);
	const next = nodes[index + amount];
	if (next) {
		setActive(next.id);
	}
}

function expandActive(
	node: TreeNodeData,
	nodes: readonly TreeNodeData[],
	expanded: ReadonlySet<string>,
	toggle: (id: string) => void,
	setActive: (id: string) => void
) {
	if (!node.hasChildren || node.disabled) {
		return;
	}
	if (!expanded.has(node.id)) {
		toggle(node.id);
		return;
	}
	const child = nodes.find((candidate) => candidate.parentId === node.id);
	if (child) {
		setActive(child.id);
	}
}

function collapseActive(
	node: TreeNodeData,
	expanded: ReadonlySet<string>,
	toggle: (id: string) => void,
	setActive: (id: string) => void
) {
	if (node.hasChildren && expanded.has(node.id) && !node.disabled) {
		toggle(node.id);
		return;
	}
	if (node.parentId) {
		setActive(node.parentId);
	}
}

function selectTreeItem(
	item: TreeItemData,
	selectedItemId: string | undefined,
	isControlled: boolean,
	setInternalSelected: (id: string | null) => void,
	onSelectedItemIdChange?: (id: string | null) => void
) {
	if (selectedItemId === item.id) {
		return;
	}
	if (!isControlled) {
		setInternalSelected(item.id);
	}
	onSelectedItemIdChange?.(item.id);
}

interface TreeSelection {
	isControlled: boolean;
	onSelectedItemIdChange?: (id: string | null) => void;
	selectedItemId?: string;
	setInternalSelected: (id: string | null) => void;
}

function activateTreeItem(
	node: TreeNodeData,
	toggle: (id: string) => void,
	onActivate?: (item: TreeItemData) => void,
	selection?: TreeSelection
) {
	if (node.disabled) {
		return;
	}
	if (selection) {
		selectTreeItem(
			node.source,
			selection.selectedItemId,
			selection.isControlled,
			selection.setInternalSelected,
			selection.onSelectedItemIdChange
		);
		// A folder opens or closes as it is selected, like a file explorer.
		if (node.hasChildren) {
			toggle(node.id);
		} else {
			onActivate?.(node.source);
		}
		return;
	}
	if (node.hasChildren) {
		toggle(node.id);
	} else {
		onActivate?.(node.source);
	}
}

function performAction(
	action: KeyAction,
	nodes: readonly TreeNodeData[],
	activeNode: TreeNodeData,
	expanded: ReadonlySet<string>,
	setActive: (id: string) => void,
	toggle: (id: string) => void,
	onActivate?: (item: TreeItemData) => void,
	selection?: TreeSelection
) {
	switch (action) {
		case "next":
			moveActive(nodes, activeNode, 1, setActive);
			break;
		case "previous":
			moveActive(nodes, activeNode, -1, setActive);
			break;
		case "first":
			setActive(nodes[0].id);
			break;
		case "last":
			setActive(nodes.at(-1)?.id ?? activeNode.id);
			break;
		case "expand":
			expandActive(activeNode, nodes, expanded, toggle, setActive);
			break;
		case "collapse":
			collapseActive(activeNode, expanded, toggle, setActive);
			break;
		case "activate":
			activateTreeItem(activeNode, toggle, onActivate, selection);
			break;
		default:
			return;
	}
}

function activateClickedItem(
	event: ReactMouseEvent<HTMLUListElement>,
	nodesById: ReadonlyMap<string, TreeNodeData>,
	setActive: (id: string) => void,
	toggle: (id: string) => void,
	onActivate?: (item: TreeItemData) => void,
	selection?: TreeSelection
) {
	if (event.defaultPrevented || !(event.target instanceof Element)) {
		return;
	}
	const element = event.target.closest<HTMLElement>("[data-tree-item-id]");
	if (!(element && event.currentTarget.contains(element))) {
		return;
	}
	const node = nodesById.get(element.dataset.treeItemId ?? "");
	if (!node) {
		return;
	}
	setActive(node.id);
	event.currentTarget.focus();
	const indicator = event.target.closest('[data-slot="tree-item-indicator"]');
	if (indicator && node.hasChildren && !node.disabled) {
		toggle(node.id);
		return;
	}
	activateTreeItem(node, toggle, onActivate, selection);
}

function isTypeaheadKey(event: ReactKeyboardEvent<HTMLUListElement>) {
	return (
		Array.from(event.key).length === 1 &&
		!event.altKey &&
		!event.ctrlKey &&
		!event.metaKey
	);
}

function handleTypeahead(
	event: ReactKeyboardEvent<HTMLUListElement>,
	nodes: readonly TreeNodeData[],
	activeId: string,
	state: { current: { query: string; time: number } },
	setActive: (id: string) => void
) {
	if (!isTypeaheadKey(event)) {
		return;
	}
	const now = Date.now();
	const key = event.key.toLocaleLowerCase();
	const query =
		now - state.current.time < TYPEAHEAD_RESET_MS ? state.current.query : "";
	state.current.query = [...query].every((character) => character === key)
		? key
		: query + key;
	state.current.time = now;
	const match = getTypeaheadMatch(nodes, activeId, state.current.query);
	if (match) {
		event.preventDefault();
		setActive(match.id);
	}
}

function handleTreeKeyDown(
	event: ReactKeyboardEvent<HTMLUListElement>,
	params: {
		active: TreeNodeData;
		expanded: ReadonlySet<string>;
		nodes: readonly TreeNodeData[];
		setActive: (id: string) => void;
		state: { current: { query: string; time: number } };
		toggle: (id: string) => void;
		onActivate?: (item: TreeItemData) => void;
		selection?: TreeSelection;
	}
) {
	const action = getKeyAction(
		event.key,
		getComputedStyle(event.currentTarget).direction === "rtl"
	);
	if (action) {
		event.preventDefault();
		performAction(
			action,
			params.nodes,
			params.active,
			params.expanded,
			params.setActive,
			params.toggle,
			params.onActivate,
			params.selection
		);
		return;
	}
	handleTypeahead(
		event,
		params.nodes,
		params.active.id,
		params.state,
		params.setActive
	);
}

export function Tree(treeProps: TreeProps) {
	const {
		"aria-label": ariaLabel,
		"aria-labelledby": ariaLabelledBy,
		defaultExpandedItems = [],
		defaultSelectedItemId,
		expandedItems,
		items,
		onExpandedItemsChange,
		onItemActivate,
		onSelectedItemIdChange,
		selectedItemId,
		onBlur,
		onClick,
		onFocus,
		onKeyDown,
		ref: forwardedRef,
		...rest
	} = treeProps;
	const nativeProps = omitProps(rest, PROTECTED_PROPS);
	const selectionEnabled =
		selectedItemId !== undefined ||
		defaultSelectedItemId !== undefined ||
		onSelectedItemIdChange !== undefined;
	assertTreeName(ariaLabel, ariaLabelledBy);

	const reactId = useId();
	const [internalExpanded, setInternalExpanded] = useState(
		() => new Set(defaultExpandedItems)
	);
	const [internalSelectedItemId, setInternalSelectedItemId] = useState(
		() => defaultSelectedItemId ?? null
	);
	const isSelectionControlled = selectedItemId !== undefined;
	const requestedSelectedItemId =
		selectedItemId === undefined ? internalSelectedItemId : selectedItemId;
	const [activeId, setActiveId] = useState(items[0]?.id);
	const [focused, setFocused] = useState(false);
	const typeahead = useRef({ query: "", time: 0 });
	const isControlled = expandedItems !== undefined;
	const expanded = useMemo(
		() => new Set(expandedItems ?? internalExpanded),
		[expandedItems, internalExpanded]
	);
	const visibleItems = useMemo(
		() => getVisibleItems(items, expanded),
		[expanded, items]
	);
	const allItems = useMemo(() => {
		const nodes = flattenItems(items);
		validateItems(nodes);
		return nodes;
	}, [items]);
	const nodesById = useMemo(
		() => new Map(allItems.map((node) => [node.id, node])),
		[allItems]
	);
	const visibleIds = useMemo(
		() => new Set(visibleItems.map((node) => node.id)),
		[visibleItems]
	);
	const currentActiveId = findCurrentActiveId(
		activeId,
		visibleIds,
		nodesById,
		visibleItems
	);
	validateSelectedItemId(requestedSelectedItemId);
	const currentSelectedItemId = getSelectedItemId(
		selectionEnabled,
		requestedSelectedItemId,
		nodesById
	);
	const selection = useMemo<TreeSelection | undefined>(
		() =>
			selectionEnabled
				? {
						isControlled: isSelectionControlled,
						onSelectedItemIdChange,
						selectedItemId: currentSelectedItemId,
						setInternalSelected: setInternalSelectedItemId,
					}
				: undefined,
		[
			currentSelectedItemId,
			isSelectionControlled,
			onSelectedItemIdChange,
			selectionEnabled,
		]
	);
	const domIdByItemId = useMemo(
		() =>
			new Map(
				allItems.map((node, index) => [node.id, `${reactId}-item-${index}`])
			),
		[allItems, reactId]
	);
	const getDomId = useCallback(
		(id: string) => domIdByItemId.get(id) ?? "",
		[domIdByItemId]
	);
	const setActiveAndScroll = useCallback(
		(id: string) => {
			setActiveId(id);
			document
				.getElementById(getDomId(id))
				?.querySelector('[data-slot="tree-item-row"]')
				?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
		},
		[getDomId]
	);

	const toggleExpanded = useCallback(
		(id: string) => {
			const next = new Set(expanded);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			if (!isControlled) {
				setInternalExpanded(next);
			}
			onExpandedItemsChange?.([...next]);
		},
		[expanded, isControlled, onExpandedItemsChange]
	);

	const handleKeyDown = useCallback(
		(event: ReactKeyboardEvent<HTMLUListElement>) => {
			onKeyDown?.(event);
			if (event.defaultPrevented) {
				return;
			}
			if (visibleItems.length === 0) {
				return;
			}
			const active =
				visibleItems.find((node) => node.id === currentActiveId) ??
				visibleItems[0];
			handleTreeKeyDown(event, {
				active,
				expanded,
				nodes: visibleItems,
				onActivate: onItemActivate,
				selection,
				setActive: setActiveAndScroll,
				state: typeahead,
				toggle: toggleExpanded,
			});
		},
		[
			currentActiveId,
			expanded,
			selection,
			visibleItems,
			setActiveAndScroll,
			onItemActivate,
			onKeyDown,
			toggleExpanded,
		]
	);

	const handleClick = useCallback(
		(event: ReactMouseEvent<HTMLUListElement>) => {
			onClick?.(event);
			activateClickedItem(
				event,
				nodesById,
				setActiveId,
				toggleExpanded,
				onItemActivate,
				selection
			);
		},
		[nodesById, onClick, onItemActivate, selection, toggleExpanded]
	);

	const handleFocus = useCallback(
		(event: React.FocusEvent<HTMLUListElement>) => {
			onFocus?.(event);
			setFocused(true);
		},
		[onFocus]
	);
	const handleBlur = useCallback(
		(event: React.FocusEvent<HTMLUListElement>) => {
			onBlur?.(event);
			setFocused(false);
		},
		[onBlur]
	);

	const treeContext = useMemo<TreeContextValue>(
		() => ({
			activeId: currentActiveId,
			expandedItems: expanded,
			focused,
			getDomId,
			selectedItemId: currentSelectedItemId,
			selectionEnabled,
		}),
		[
			currentActiveId,
			currentSelectedItemId,
			expanded,
			focused,
			getDomId,
			selectionEnabled,
		]
	);
	const rootProps = {
		...nativeProps,
		"aria-activedescendant": currentActiveId
			? getDomId(currentActiveId)
			: undefined,
		"aria-label": ariaLabel,
		"aria-labelledby": ariaLabelledBy,
		"data-slot": "tree",
		onBlur: handleBlur,
		onClick: handleClick,
		onFocus: handleFocus,
		onKeyDown: handleKeyDown,
		ref: forwardedRef,
		role: "tree",
		tabIndex: 0,
	};

	return (
		<ul {...rootProps} {...props(treeStyles.root, typeRoles.ui)}>
			{renderRootNodes(items, getDomId, treeContext)}
		</ul>
	);
}
