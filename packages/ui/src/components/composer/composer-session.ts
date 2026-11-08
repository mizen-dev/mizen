import type { ClipboardEvent, DragEvent, KeyboardEvent } from "react";
import { flushSync } from "react-dom";
import {
	COMPOSER_CLIPBOARD_TYPE,
	parseComposerClipboard,
} from "./composer-clipboard";
import {
	type ActiveQuery,
	type ComposerSelection,
	currentQuery,
	editorRange,
	equalValue,
	getComposerText,
	insertItem,
	insertPlainText,
	queryRange,
	readSelection,
	readValue,
	replaceRange,
	restoreSelection,
	writeValue,
} from "./composer-document";
import { ComposerHistory } from "./composer-history";
import type {
	ComposerChangeDetails,
	UseComposerEditorOptions,
} from "./composer-options";
import type { ComposerItemValue, ComposerValue } from "./composer-value";

export interface View {
	composing: boolean;
	hosts: readonly HTMLSpanElement[];
	query: ActiveQuery | null;
	textarea: boolean;
}
const SPACE = /\s/u;
const INITIAL: View = {
	composing: false,
	hosts: [],
	query: null,
	textarea: false,
};
function plain(value: ComposerValue): ComposerValue {
	const text = getComposerText(value);
	return text ? [{ text, type: "text" }] : [];
}
function sameHosts(
	a: readonly HTMLSpanElement[],
	b: readonly HTMLSpanElement[]
): boolean {
	return a.length === b.length && a.every((host, i) => host === b[i]);
}
function ignoreKey(event: KeyboardEvent, composing: boolean): boolean {
	return (
		event.defaultPrevented ||
		composing ||
		event.nativeEvent.isComposing ||
		event.nativeEvent.keyCode === 229
	);
}
function undoDirection(event: KeyboardEvent): number {
	if (event.altKey || !(event.metaKey || event.ctrlKey)) {
		return 0;
	}
	if (event.key.toLowerCase() === "z") {
		return event.shiftKey ? 1 : -1;
	}
	return event.ctrlKey && event.key.toLowerCase() === "y" ? 1 : 0;
}

const getServerSnapshot = (): View => INITIAL;

/** Transient editing state belongs to the mounted input; values belong to React. */
export class ComposerSession {
	private options: UseComposerEditorOptions;
	private input: HTMLDivElement | null = null;
	private view: View = INITIAL;
	private readonly observers = new Set<() => void>();
	private readonly history = new ComposerHistory();
	private before: ComposerSelection | null = null;
	private inputType = "";
	private savedSelection: ComposerSelection | null = null;
	private dismissed: string | null = null;
	private compositionOwner: ComposerValue = [];
	private compositionInput: HTMLDivElement | null = null;
	private finishingComposition = false;
	private resetValue: ComposerValue = [];
	readonly rootRef = { current: null as HTMLFormElement | null };

	constructor(options: UseComposerEditorOptions) {
		this.options = options;
		this.history.reset(options.value);
	}
	getSnapshot = (): View => this.view;
	getServerSnapshot = getServerSnapshot;
	subscribe = (notify: () => void): (() => void) => {
		this.observers.add(notify);
		return () => {
			this.observers.delete(notify);
		};
	};
	private update(patch: Partial<View>): void {
		if (
			Object.entries(patch).every(
				([key, value]) => this.view[key as keyof View] === value
			)
		) {
			return;
		}
		this.view = { ...this.view, ...patch };
		for (const notify of this.observers) {
			notify();
		}
	}
	commit(options: UseComposerEditorOptions, resetValue: ComposerValue): void {
		this.options = options;
		this.resetValue = resetValue;
		this.reconcile();
	}
	bind = (input: HTMLDivElement | null): (() => void) | undefined => {
		if (!input) {
			return;
		}
		this.input = input;
		const composing = this.view.composing && this.compositionInput === input;
		if (!composing) {
			this.compositionInput = null;
		}
		this.update({ composing, textarea: input.tagName === "TEXTAREA" });
		this.reconcile();
		const doc = input.ownerDocument;
		doc.addEventListener("selectionchange", this.selectionChanged);
		doc.addEventListener("beforeinput", this.beforeInput);
		return () => {
			doc.removeEventListener("selectionchange", this.selectionChanged);
			doc.removeEventListener("beforeinput", this.beforeInput);
			this.input = null;
			queueMicrotask(() => {
				if (!this.input) {
					this.compositionInput = null;
					this.setQuery(null);
					this.update({ composing: false, hosts: [] });
				}
			});
		};
	};
	bindRoot(root: HTMLFormElement): () => void {
		this.rootRef.current = root;
		const form = root.tagName === "FORM" ? root : root.closest("form");
		const boundary = root.getRootNode();
		const reset = (event: Event) => {
			if (event.target !== form) {
				return;
			}
			queueMicrotask(() => {
				if (this.rootRef.current === root && !event.defaultPrevented) {
					this.reset(this.resetValue);
				}
			});
		};
		boundary.addEventListener("reset", reset);
		return () => {
			boundary.removeEventListener("reset", reset);
			if (this.rootRef.current === root) {
				this.rootRef.current = null;
			}
		};
	}
	private editable(): boolean {
		return !(
			this.options.disabled ||
			this.options.readOnly ||
			this.view.composing
		);
	}
	private rich(): HTMLDivElement | null {
		return this.view.textarea ? null : this.input;
	}
	private reconcile(): void {
		const { input } = this;
		if (!input || this.view.composing) {
			return;
		}
		const owned = this.view.textarea
			? plain(this.options.value)
			: this.options.value;
		if (!this.history.matches(owned)) {
			this.history.reset(owned);
			this.savedSelection = null;
		}
		if (!equalValue(readValue(input), owned)) {
			const selection = readSelection(input);
			writeValue(input, owned);
			restoreSelection(input, selection);
			this.setQuery(null);
			this.dismissed = null;
		}
		if (!this.queryEnabled()) {
			this.setQuery(null);
		}
		this.collectHosts(input);
	}
	private queryEnabled(): boolean {
		return (
			this.editable() &&
			!!this.options.triggers?.some(
				({ character }) => character === this.view.query?.character
			)
		);
	}
	private collectHosts(input: HTMLElement): void {
		const hosts = Array.from(
			input.querySelectorAll<HTMLSpanElement>(
				'[data-slot="composer-token-renderer"]'
			)
		);
		for (const host of hosts) {
			const fallback = host.previousElementSibling;
			if (fallback instanceof HTMLElement) {
				fallback.hidden = true;
			}
		}
		if (!sameHosts(hosts, this.view.hosts)) {
			this.update({ hosts });
		}
	}
	private setQuery(query: ActiveQuery | null): void {
		if (
			query?.key === this.view.query?.key &&
			query?.node === this.view.query?.node
		) {
			return;
		}
		this.update({ query });
		this.options.onQueryChange?.(
			query
				? { character: query.character, key: query.key, text: query.text }
				: null
		);
	}
	refreshQuery = (): void => {
		const input = this.rich();
		const active =
			input && this.editable() && input.ownerDocument.activeElement === input;
		const query = active
			? currentQuery(input, this.options.triggers ?? [])
			: null;
		if (query?.key !== this.dismissed) {
			this.dismissed = null;
		}
		this.setQuery(query?.key === this.dismissed ? null : query);
	};
	private readonly selectionChanged = (): void => {
		const { input } = this;
		if (
			!input ||
			input.ownerDocument.activeElement !== input ||
			this.view.composing
		) {
			return;
		}
		this.savedSelection = readSelection(input);
		this.refreshQuery();
	};
	dismiss = (): void => {
		this.dismissed = this.view.query?.key ?? null;
		this.setQuery(null);
	};
	blur = (): void => {
		if (this.input) {
			this.savedSelection = readSelection(this.input) ?? this.savedSelection;
		}
		this.dismiss();
	};
	private prepare(type: string): void {
		this.before = this.input ? readSelection(this.input) : null;
		this.inputType = type;
	}
	private readonly beforeInput = (event: Event): void => {
		const { input } = this;
		if (
			!(event instanceof InputEvent) ||
			event.defaultPrevented ||
			!eventInInput(input, event)
		) {
			return;
		}
		if (blockedInput(this.options, event)) {
			event.preventDefault();
			return;
		}
		if (this.view.textarea) {
			return;
		}
		const direction = { historyRedo: 1, historyUndo: -1 }[event.inputType];
		if (direction) {
			event.preventDefault();
			this.travel(direction);
		} else if (!this.view.composing) {
			this.prepare(event.inputType);
		}
	};
	private publish(reason: ComposerChangeDetails["reason"] = "input"): void {
		const { input } = this;
		if (!(input && this.editable())) {
			return;
		}
		const value = readValue(input);
		if (!this.view.textarea) {
			this.history.record(
				value,
				this.before,
				readSelection(input),
				this.inputType
			);
		}
		this.inputType = "";
		this.before = null;
		if (!equalValue(value, this.options.value)) {
			flushSync(() => this.options.onValueChange(value, { reason }));
		}
		this.reconcile();
		this.dismissed = null;
		this.refreshQuery();
	}
	inputChanged = (): void => {
		if (Boolean(this.finishingComposition) === false) {
			this.publish();
		}
	};
	startComposition = (): void => {
		this.prepare("composition");
		this.compositionOwner = this.options.value;
		this.compositionInput = this.input;
		this.update({ composing: true });
		this.setQuery(null);
	};
	endComposition = (): void => {
		this.compositionInput = null;
		this.update({ composing: false });
		this.finishingComposition = true;
		queueMicrotask(() => {
			this.finishingComposition = false;
		});
		if (equalValue(this.compositionOwner, this.options.value)) {
			this.publish();
		} else {
			this.reconcile();
		}
	};
	select = (item: ComposerItemValue): void => {
		const input = this.rich();
		const { query } = this.view;
		if (
			!(input && query && this.editable()) ||
			item.disabled ||
			!input.contains(query.node)
		) {
			return;
		}
		this.prepare("selection");
		if (item.type === "action" && this.options.onAction) {
			replaceRange(input, queryRange(query), []);
			this.publish("selection");
			this.setQuery(null);
			this.options.onAction(item, query);
		} else {
			insertItem(input, query, item);
			this.publish("selection");
			this.setQuery(null);
		}
	};
	insertTrigger = (character: string): void => {
		const input = this.rich();
		if (
			!(
				input &&
				this.editable() &&
				this.options.triggers?.some((source) => source.character === character)
			)
		) {
			return;
		}
		const text = getComposerText(readValue(input));
		const selection = readSelection(input) ??
			this.savedSelection ?? { anchor: text.length, focus: text.length };
		const start = Math.min(selection.anchor, selection.focus);
		const end = Math.max(selection.anchor, selection.focus);
		const prefix = separator(text.charAt(start - 1));
		const suffix = separator(text.charAt(end));
		input.focus({ preventScroll: true });
		restoreSelection(input, selection);
		this.prepare("trigger");
		insertPlainText(input, prefix + character + suffix);
		const caret = start + prefix.length + character.length;
		restoreSelection(input, { anchor: caret, focus: caret });
		this.publish();
		this.savedSelection = readSelection(input);
	};
	private travel(direction: number): void {
		const input = this.rich();
		if (!(input && this.editable())) {
			return;
		}
		const snapshot = this.history.move(direction, readSelection(input));
		if (!snapshot) {
			return;
		}
		writeValue(input, snapshot.value);
		restoreSelection(input, snapshot.selection);
		flushSync(() =>
			this.options.onValueChange(snapshot.value, { reason: "history" })
		);
		this.reconcile();
		this.dismiss();
	}
	reset = (value: ComposerValue = []): void => {
		this.savedSelection = null;
		this.history.reset(value);
		this.dismiss();
		flushSync(() => this.options.onValueChange(value, { reason: "reset" }));
		this.reconcile();
		// A reset triggered by a trusted click can run its native default action
		// after this microtask. Keep that action aligned with the owner's result.
		if (this.input instanceof HTMLTextAreaElement) {
			this.input.defaultValue = this.input.value;
		}
	};
	canSubmit(): boolean {
		return (
			this.editable() &&
			!this.options.submitDisabled &&
			(!!this.options.allowEmpty ||
				!!getComposerText(this.options.value).trim())
		);
	}
	performSubmit = (): void => {
		if (!this.canSubmit()) {
			return;
		}
		this.dismiss();
		this.options.onSubmit?.(this.options.value);
	};
	submit = (): void => {
		if (!this.canSubmit()) {
			return;
		}
		if (this.rootRef.current instanceof HTMLFormElement) {
			this.rootRef.current.requestSubmit();
		} else {
			this.performSubmit();
		}
	};
	keyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
		if (ignoreKey(event, this.view.composing)) {
			return;
		}
		const direction = this.view.textarea ? 0 : undoDirection(event);
		if (direction) {
			event.preventDefault();
			this.travel(direction);
			return;
		}
		if (event.key !== "Enter" || event.shiftKey) {
			return;
		}
		const policy = this.options.submitOnEnter ?? "always";
		const sends =
			policy === "always" ||
			(policy === "desktop" && matchMedia("(pointer: fine)").matches);
		if (sends) {
			event.preventDefault();
			this.submit();
		}
	};
	copy = (event: ClipboardEvent<HTMLDivElement>): Range | null => {
		if (event.defaultPrevented || this.view.textarea) {
			return null;
		}
		const range = editorRange(event.currentTarget);
		if (!range || range.collapsed) {
			return null;
		}
		const container = event.currentTarget.ownerDocument.createElement("div");
		container.append(range.cloneContents());
		const value = readValue(container, false);
		event.clipboardData.setData("text/plain", getComposerText(value));
		event.clipboardData.setData(COMPOSER_CLIPBOARD_TYPE, JSON.stringify(value));
		event.preventDefault();
		return range;
	};
	cut = (event: ClipboardEvent<HTMLDivElement>): void => {
		const range = this.copy(event);
		if (!(range && this.editable())) {
			return;
		}
		this.prepare("cut");
		range.deleteContents();
		this.publish();
	};
	paste = (event: ClipboardEvent<HTMLDivElement>): void => {
		if (event.defaultPrevented || this.view.textarea) {
			return;
		}
		event.preventDefault();
		if (!this.editable()) {
			return;
		}
		const range = editorRange(event.currentTarget);
		if (!range) {
			return;
		}
		this.prepare("paste");
		const value = parseComposerClipboard(
			event.clipboardData.getData(COMPOSER_CLIPBOARD_TYPE)
		);
		if (value) {
			replaceRange(event.currentTarget, range, value);
		} else {
			insertPlainText(
				event.currentTarget,
				event.clipboardData.getData("text/plain")
			);
		}
		this.publish();
	};
	drop = (event: DragEvent<HTMLDivElement>): void => {
		if (event.defaultPrevented || this.view.textarea) {
			return;
		}
		event.preventDefault();
		if (!this.editable()) {
			return;
		}
		const text = event.dataTransfer.getData("text/plain");
		if (
			!(
				text && dropSelection(event.currentTarget, event.clientX, event.clientY)
			)
		) {
			return;
		}
		event.currentTarget.focus({ preventScroll: true });
		this.prepare("drop");
		insertPlainText(event.currentTarget, text);
		this.publish();
	};
}
function separator(character: string): string {
	return character && !SPACE.test(character) ? " " : "";
}
function eventInInput(input: HTMLElement | null, event: Event): boolean {
	return event.target instanceof Node && !!input?.contains(event.target);
}
function blockedInput(
	options: UseComposerEditorOptions,
	event: InputEvent
): boolean {
	return (
		!!options.disabled ||
		!!options.readOnly ||
		event.inputType.startsWith("format")
	);
}
function dropPoint(doc: Document, x: number, y: number): [Node, number] | null {
	const position = doc.caretPositionFromPoint?.(x, y);
	if (position) {
		return [position.offsetNode, position.offset];
	}
	const range = doc.caretRangeFromPoint?.(x, y);
	return range ? [range.startContainer, range.startOffset] : null;
}
function dropSelection(input: HTMLElement, x: number, y: number): boolean {
	const doc = input.ownerDocument;
	const point = dropPoint(doc, x, y);
	if (!(point && input.contains(point[0]))) {
		return false;
	}
	const [node, offset] = point;
	const element = node instanceof Element ? node : node.parentElement;
	const token = element?.closest("[data-composer-token]");
	if (token?.parentNode) {
		doc
			.getSelection()
			?.collapse(
				token.parentNode,
				Array.from(token.parentNode.childNodes).indexOf(token) + 1
			);
	} else {
		doc.getSelection()?.collapse(node, offset);
	}
	return true;
}
