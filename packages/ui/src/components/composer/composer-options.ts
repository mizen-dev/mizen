import type { ComponentProps, RefObject } from "react";
import type {
	ComposerItemValue,
	ComposerQuery,
	ComposerTrigger,
	ComposerValue,
} from "./composer-value";
export interface ComposerChangeDetails {
	reason: "input" | "selection" | "history" | "reset";
}
export interface UseComposerEditorOptions {
	allowEmpty?: boolean;
	disabled?: boolean;
	onAction?: (item: ComposerItemValue, query: ComposerQuery) => void;
	onQueryChange?: (query: ComposerQuery | null) => void;
	onSubmit?: (value: ComposerValue) => void;
	onValueChange: (value: ComposerValue, details: ComposerChangeDetails) => void;
	readOnly?: boolean;
	submitDisabled?: boolean;
	submitOnEmptySuggestions?: boolean;
	submitOnEnter?: "desktop" | "always" | "never";
	triggers?: readonly ComposerTrigger[];
	value: ComposerValue;
}

export interface ComposerEditorController {
	canSubmit: boolean;
	disabled: boolean;
	formProps: Pick<ComponentProps<"form">, "onSubmit">;
	inputProps: ComponentProps<"div">;
	insertTrigger: (character: string) => void;
	isComposing: boolean;
	isEmpty: boolean;
	isTextarea: boolean;
	readOnly: boolean;
	reset: (value?: ComposerValue) => void;
	rootRef: RefObject<HTMLFormElement | null>;
	status: "ready" | "loading" | "error";
	submit: () => void;
	suggestions: {
		enabled: boolean;
		submitOnEmptySuggestions: boolean;
		items: readonly ComposerItemValue[];
		open: boolean;
		onOpenChange: (open: boolean) => void;
		onItemSelect: (item: ComposerItemValue) => void;
	};
	syncRootRef: (root: HTMLFormElement | null) => void;
	tokenHosts: readonly HTMLSpanElement[];
	value: ComposerValue;
}
