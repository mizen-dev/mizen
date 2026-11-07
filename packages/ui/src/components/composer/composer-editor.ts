"use client";
import { Popover } from "@base-ui/react/popover";
import { props as stylexProps } from "@stylexjs/stylex";
import {
	type ComponentProps,
	createContext,
	createElement,
	type KeyboardEvent,
	type MouseEvent,
	type ReactElement,
	type ReactNode,
	useCallback,
	useContext,
	useId,
	useState,
} from "react";
import { visuallyHiddenStyles } from "../visually-hidden/visually-hidden.styles";
import {
	type ComposerEditorController,
	type ComposerItemValue,
	type ComposerValue,
	type UseComposerEditorOptions,
	useComposerEditor,
} from "./use-composer-editor";

type ComposerEditorOptions = Omit<
	UseComposerEditorOptions,
	"value" | "onValueChange"
> & {
	value?: ComposerValue;
	defaultValue?: ComposerValue;
	onValueChange?: UseComposerEditorOptions["onValueChange"];
	name?: string;
	getSuggestionsAnnouncement?: (count: number) => string;
};
type ComposerContextValue = Omit<ComposerEditorController, "reset"> & {
	reset: () => void;
};
const EditorContext = createContext<ComposerContextValue | null>(null);
function useComposerEditorContext() {
	return useContext(EditorContext);
}
function useComposerContext(): Pick<
	ComposerContextValue,
	| "value"
	| "isEmpty"
	| "canSubmit"
	| "disabled"
	| "readOnly"
	| "status"
	| "submit"
	| "insertTrigger"
	| "reset"
> {
	const editor = useComposerEditorContext();
	if (!editor) {
		throw new Error("useComposerContext must be used within Composer.");
	}
	return {
		canSubmit: editor.canSubmit,
		disabled: editor.disabled,
		insertTrigger: editor.insertTrigger,
		isEmpty: editor.isEmpty,
		readOnly: editor.readOnly,
		reset: editor.reset,
		status: editor.status,
		submit: editor.submit,
		value: editor.value,
	};
}
const EMPTY: ComposerValue = [];
function ComposerEditorProvider({
	children,
	value,
	defaultValue = EMPTY,
	onValueChange,
	getSuggestionsAnnouncement,
	...options
}: ComposerEditorOptions & { children: ReactNode }): ReactElement {
	const [local, setLocal] = useState(defaultValue);
	const editor = useComposerEditor(
		{
			...options,
			onValueChange(next, details) {
				if (value === undefined) {
					setLocal(next);
				}
				onValueChange?.(next, details);
			},
			value: value ?? local,
		},
		defaultValue
	);
	return createElement(
		EditorContext,
		{ value: { ...editor, reset: () => editor.reset(defaultValue) } },
		createElement(
			Suggestions,
			{ ...editor.suggestions, getSuggestionsAnnouncement },
			children
		)
	);
}
interface MountedOption {
	disabled: boolean;
	element: HTMLElement;
}
interface SuggestionContext {
	highlightedId: string | undefined;
	highlightItem: (item: ComposerItemValue) => void;
	inputProps: ComponentProps<"div">;
	items: readonly ComposerItemValue[];
	listId: string;
	registerItem: (id: string, option: MountedOption | null) => void;
	registerList: (element: HTMLElement | null) => void;
	selectItem: (item: ComposerItemValue) => void;
}
const OptionsContext = createContext<SuggestionContext | null>(null);
function useComposerSuggestionsContext() {
	return useContext(OptionsContext);
}
function announcement(count: number): string {
	return `${count} suggestion${count === 1 ? "" : "s"} available. Use the up and down arrow keys to navigate.`;
}
function keyboardAllowed(event: KeyboardEvent, open: boolean): boolean {
	return (
		open &&
		!event.defaultPrevented &&
		!event.nativeEvent.isComposing &&
		event.nativeEvent.keyCode !== 229
	);
}
function Suggestions({
	children,
	enabled,
	items,
	open,
	onOpenChange,
	onItemSelect,
	submitOnEmptySuggestions,
	getSuggestionsAnnouncement = announcement,
}: ComposerEditorController["suggestions"] & {
	children?: ReactNode;
	getSuggestionsAnnouncement?: (count: number) => string;
}): ReactElement {
	const listId = useId();
	const [list, registerList] = useState<HTMLElement | null>(null);
	const [mounted, setMounted] = useState<ReadonlyMap<string, MountedOption>>(
		() => new Map()
	);
	const [chosen, choose] = useState<string>();
	const registerItem = useCallback(
		(id: string, option: MountedOption | null) => {
			setMounted((old) => {
				const next = new Map(old);
				if (option) {
					next.set(id, option);
				} else {
					next.delete(id);
				}
				return next;
			});
		},
		[]
	);
	const available = items.filter(
		(item) =>
			!item.disabled && mounted.has(item.id) && !mounted.get(item.id)?.disabled
	);
	const active = available.find((item) => item.id === chosen) ?? available[0];
	function close(): void {
		choose(undefined);
		onOpenChange(false);
	}
	function select(item: ComposerItemValue): void {
		const current = available.find((candidate) => candidate.id === item.id);
		if (!(open && current)) {
			return;
		}
		onItemSelect(current);
		close();
	}
	function step(event: KeyboardEvent, delta: number): void {
		event.preventDefault();
		const index = available.indexOf(active);
		const next =
			available[(index + delta + available.length) % available.length];
		if (!next) {
			return;
		}
		choose(next.id);
		mounted.get(next.id)?.element.scrollIntoView({ block: "nearest" });
	}
	function enter(event: KeyboardEvent): void {
		if (event.shiftKey) {
			close();
			return;
		}
		if (!available.length && submitOnEmptySuggestions) {
			return;
		}
		event.preventDefault();
		if (active) {
			select(active);
		}
	}
	const commands: Record<string, (event: KeyboardEvent) => void> = {
		arrowdown: (event) => step(event, 1),
		arrowup: (event) => step(event, -1),
		enter,
		escape(event) {
			event.preventDefault();
			event.stopPropagation();
			close();
		},
		tab: close,
	};
	const inputProps = listInputProps(
		enabled,
		open,
		list,
		active ? mounted.get(active.id)?.element : undefined
	);
	return createElement(
		OptionsContext,
		{
			value: {
				highlightedId: active?.id,
				highlightItem: (item) => choose(item.id),
				inputProps: {
					...inputProps,
					onKeyDown(event) {
						if (keyboardAllowed(event, open)) {
							commands[event.key.toLowerCase()]?.(event);
						}
					},
				},
				items,
				listId,
				registerItem,
				registerList,
				selectItem: select,
			},
		},
		createElement(
			Popover.Root,
			{
				onOpenChange(next) {
					if (!next) {
						choose(undefined);
					}
					onOpenChange(next);
				},
				open,
			},
			children,
			createElement(
				"span",
				{
					"aria-atomic": true,
					role: "status",
					...stylexProps(visuallyHiddenStyles.root),
				},
				open && list && available.length > 0
					? getSuggestionsAnnouncement(available.length)
					: ""
			)
		)
	);
}
function listInputProps(
	enabled: boolean,
	open: boolean,
	list: HTMLElement | null,
	active: HTMLElement | undefined
): ComponentProps<"div"> {
	return {
		"aria-activedescendant": open && list ? active?.id || undefined : undefined,
		"aria-autocomplete": enabled ? "list" : undefined,
		"aria-controls": open && list ? list.id : undefined,
		"aria-haspopup": enabled ? "listbox" : undefined,
	};
}
function useComposerItem(
	value: ComposerItemValue | undefined,
	disabled: boolean
) {
	const context = useComposerSuggestionsContext();
	const register = context?.registerItem;
	const id = value?.id;
	const ref = useCallback(
		(element: HTMLElement | null) => {
			if (id !== undefined) {
				register?.(id, element ? { disabled, element } : null);
			}
		},
		[id, register, disabled]
	);
	const highlighted = id !== undefined && context?.highlightedId === id;
	return {
		highlighted,
		props: {
			...optionAttributes(context, id, disabled, highlighted),
			onClick() {
				if (value && !disabled) {
					context?.selectItem(value);
				}
			},
			onMouseDown(event: MouseEvent<HTMLButtonElement>) {
				if (context) {
					event.preventDefault();
				}
			},
			onPointerMove() {
				if (value && !disabled) {
					context?.highlightItem(value);
				}
			},
		},
		ref,
	};
}
function optionAttributes(
	context: SuggestionContext | null,
	id: string | undefined,
	disabled: boolean,
	highlighted: boolean
) {
	return {
		"aria-disabled": disabled || undefined,
		"aria-selected": context ? highlighted : undefined,
		"data-disabled": disabled ? "" : undefined,
		"data-highlighted": highlighted ? "" : undefined,
		id:
			context && id !== undefined
				? `${context.listId}-${encodeURIComponent(id)}`
				: undefined,
		role: context ? ("option" as const) : undefined,
		tabIndex: context ? -1 : undefined,
	};
}
// A press belongs to the draft only when no descendant owns that interaction.
const POINTER_OWNERS = [
	"a",
	"button",
	"input",
	"select",
	"textarea",
	"label",
	"summary",
	"[contenteditable]",
	"[data-slot='composer-input']",
	"[role='button']",
	"[role='combobox']",
	"[role='menuitem']",
	"[tabindex]:not([tabindex='-1'])",
].join(",");
function isFrameSurface(frame: HTMLElement, target: EventTarget): boolean {
	if (!(target instanceof Element)) {
		return false;
	}
	// React also bubbles presses from portalled Composer content to the frame.
	if (!frame.contains(target)) {
		return true;
	}
	let node: Element | null = target;
	while (node && node !== frame) {
		if (node.matches(POINTER_OWNERS)) {
			return false;
		}
		node = node.parentElement;
	}
	return node === frame;
}
function focusComposerInput(
	event: MouseEvent<HTMLFormElement>,
	preventDefault: boolean
): void {
	if (
		event.defaultPrevented ||
		!isFrameSurface(event.currentTarget, event.target)
	) {
		return;
	}
	const draft = event.currentTarget.querySelector<HTMLElement>(
		'[data-slot="composer-input"]'
	);
	if (draft?.matches(":not(:disabled):not([aria-disabled='true'])")) {
		if (preventDefault) {
			event.preventDefault();
		}
		draft.focus();
	}
}
interface InputLayout {
	frame: HTMLElement | null;
	input: HTMLElement;
	scroll: HTMLElement;
}
function measureLayout({ input, scroll, frame }: InputLayout): void {
	const computed = getComputedStyle(input);
	const line =
		Number.parseFloat(computed.lineHeight) ||
		Number.parseFloat(computed.fontSize) * 1.2;
	const padding =
		Number.parseFloat(computed.paddingTop) +
		Number.parseFloat(computed.paddingBottom);
	for (const [property, value] of [
		["--composer-line-height", `${line}px`],
		["--composer-input-padding", `${padding}px`],
	]) {
		if (scroll.style.getPropertyValue(property) !== value) {
			scroll.style.setProperty(property, value);
		}
	}
	if (!frame) {
		return;
	}
	frame.removeAttribute("data-multiline");
	if (
		frame.dataset.layout !== "adaptive" ||
		!frame.querySelector('[data-slot="composer-action-group"]')
	) {
		return;
	}
	const rows = Number.parseFloat(
		computed.getPropertyValue("--composer-min-rows")
	);
	frame.toggleAttribute(
		"data-multiline",
		rows > 1 || intrinsicHeight(input) > line * 1.5 + padding
	);
}
function intrinsicHeight(input: HTMLElement): number {
	const value = input.style.getPropertyValue("min-height");
	const priority = input.style.getPropertyPriority("min-height");
	input.style.setProperty("min-height", "0px", "important");
	const height = input.scrollHeight;
	if (value) {
		input.style.setProperty("min-height", value, priority);
	} else {
		input.style.removeProperty("min-height");
	}
	return height;
}
function bindInputLayout(input: HTMLElement | null): (() => void) | undefined {
	const scroll = input?.closest<HTMLElement>(
		'[data-slot="composer-scroll-area"]'
	);
	if (!(input && scroll)) {
		return;
	}
	const frame = scroll.closest<HTMLElement>('[data-slot="composer"]');
	const layout = { frame, input, scroll };
	const doc = input.ownerDocument;
	let pending: number | undefined;
	let watched: Element[] = [];
	function schedule(): void {
		if (pending !== undefined) {
			return;
		}
		pending = requestAnimationFrame(() => {
			pending = undefined;
			measure();
		});
	}
	const resize = new ResizeObserver(schedule);
	const mutations = new MutationObserver(schedule);
	function measure(): void {
		const groups = Array.from(
			frame?.querySelectorAll(
				':scope > [data-slot="composer-actions"] > [data-slot="composer-action-group"]'
			) ?? []
		);
		const targets = [input as HTMLElement, ...groups];
		if (frame) {
			targets.push(frame);
		}
		if (!sameElements(watched, targets)) {
			resize.disconnect();
			for (const target of targets) {
				resize.observe(target);
			}
			watched = targets;
		}
		measureLayout(layout);
		mutations.takeRecords();
	}
	measure();
	if (frame) {
		mutations.observe(frame, {
			attributes: true,
			characterData: true,
			childList: true,
			subtree: true,
		});
	}
	input.addEventListener("input", schedule);
	window.addEventListener("resize", schedule);
	doc.fonts.addEventListener("loadingdone", schedule);
	return () => {
		if (pending !== undefined) {
			cancelAnimationFrame(pending);
		}
		resize.disconnect();
		mutations.disconnect();
		input.removeEventListener("input", schedule);
		window.removeEventListener("resize", schedule);
		doc.fonts.removeEventListener("loadingdone", schedule);
	};
}
function sameElements(a: Element[], b: Element[]): boolean {
	return (
		a.length === b.length && a.every((element, index) => element === b[index])
	);
}
function useComposerInputLayout() {
	return { inputRef: bindInputLayout };
}

// biome-ignore lint/performance/noBarrelFile: This module assembles the editor controller and its draft helpers.
export { readToken as readComposerToken } from "./composer-document";
export {
	type ComposerChangeDetails,
	type ComposerItemValue,
	type ComposerPart,
	type ComposerQuery,
	type ComposerTokenPart,
	type ComposerTrigger,
	type ComposerTriggerState,
	type ComposerValue,
	getComposerText,
	useComposerFilter,
} from "./use-composer-editor";
export type { ComposerEditorOptions };
export {
	ComposerEditorProvider,
	focusComposerInput,
	useComposerContext,
	useComposerEditorContext,
	useComposerInputLayout,
	useComposerItem,
	useComposerSuggestionsContext,
};
