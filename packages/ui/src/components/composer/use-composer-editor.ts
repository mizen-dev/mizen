"use client";
import { Autocomplete } from "@base-ui/react/autocomplete";
import { useCallback, useState, useSyncExternalStore } from "react";
import {
	getComposerText,
	getFilteredItems,
	hasVisibleItems,
} from "./composer-document";
import type {
	ComposerEditorController,
	UseComposerEditorOptions,
} from "./composer-options";
import { ComposerSession, type View } from "./composer-session";
import type { ComposerValue } from "./composer-value";

const EMPTY: ComposerValue = [];
function editorState(options: UseComposerEditorOptions, view: View) {
	const disabled = options.disabled ?? false;
	const readOnly = options.readOnly ?? false;
	const editable = !(disabled || readOnly || view.composing);
	return {
		canSubmit:
			editable &&
			!options.submitDisabled &&
			(!!options.allowEmpty || !!getComposerText(options.value).trim()),
		disabled,
		editable,
		isComposing: view.composing,
		isEmpty: !getComposerText(options.value),
		isTextarea: view.textarea,
		readOnly,
		value: options.value,
	};
}
function inputProps(
	session: ComposerSession,
	state: ReturnType<typeof editorState>
): ComposerEditorController["inputProps"] {
	return {
		"aria-disabled": state.disabled || undefined,
		"aria-multiline": true,
		"aria-readonly": state.readOnly || undefined,
		contentEditable: state.isTextarea
			? undefined
			: !(state.disabled || state.readOnly),
		onBlur: session.blur,
		onClick: session.refreshQuery,
		onCompositionEnd: session.endComposition,
		onCompositionStart: session.startComposition,
		onCopy: session.copy,
		onCut: session.cut,
		onDrop: session.drop,
		onInput: session.inputChanged,
		onKeyDown: session.keyDown,
		onKeyUp(event) {
			if (!(event.defaultPrevented || state.isComposing)) {
				session.refreshQuery();
			}
		},
		onPaste: session.paste,
		ref: session.bind,
		role: "textbox",
		suppressContentEditableWarning: true,
		tabIndex: state.disabled ? -1 : 0,
	};
}
export function useComposerEditor(
	options: UseComposerEditorOptions,
	resetValue: ComposerValue = EMPTY
): ComposerEditorController {
	const [session] = useState(() => new ComposerSession(options));
	const view = useSyncExternalStore(
		session.subscribe,
		session.getSnapshot,
		session.getServerSnapshot
	);
	const { contains } = useComposerFilter();
	const trigger = options.triggers?.find(
		({ character }) => character === view.query?.character
	);
	const items = getFilteredItems(trigger, view.query, contains);
	const state = editorState(options, view);
	const enabled = suggestionsEnabled(state.editable, view, options);
	const syncRootRef = useCallback(
		(root: HTMLFormElement | null) => {
			if (!root) {
				return;
			}
			session.commit(options, resetValue);
			return session.bindRoot(root);
		},
		[session, options, resetValue]
	);

	return {
		...state,
		formProps: {
			onSubmit(event) {
				if (event.defaultPrevented || event.target !== event.currentTarget) {
					return;
				}
				event.preventDefault();
				session.performSubmit();
			},
		},
		inputProps: inputProps(session, state),
		insertTrigger: session.insertTrigger,
		reset: session.reset,
		rootRef: session.rootRef,
		status: trigger?.status ?? "ready",
		submit: session.submit,
		suggestions: {
			enabled,
			items,
			onItemSelect: session.select,
			onOpenChange(open) {
				if (!open) {
					session.dismiss();
				}
			},
			open: enabled && !!view.query && hasVisibleItems(trigger, items),
			submitOnEmptySuggestions: options.submitOnEmptySuggestions ?? false,
		},
		syncRootRef,
		tokenHosts: view.hosts,
	};
}
export const useComposerFilter: typeof Autocomplete.useFilter =
	Autocomplete.useFilter;
// biome-ignore lint/performance/noBarrelFile: Preserve public Composer exports.
export { getComposerText } from "./composer-document";
export type {
	ComposerChangeDetails,
	ComposerEditorController,
	UseComposerEditorOptions,
} from "./composer-options";
export type {
	ComposerItemValue,
	ComposerPart,
	ComposerQuery,
	ComposerTokenPart,
	ComposerTrigger,
	ComposerTriggerState,
	ComposerValue,
} from "./composer-value";

function suggestionsEnabled(
	editable: boolean,
	view: View,
	options: UseComposerEditorOptions
): boolean {
	return editable && !view.textarea && !!options.triggers?.length;
}
