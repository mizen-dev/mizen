import type { Context, ReactElement, RefObject } from "react";
import { createContext } from "react";
import { IconCheck, IconSelector, IconX } from "../../icons";

export interface ComboboxContextValue {
	chipsRef: RefObject<Element | null> | null;
	multiple: boolean;
}

export const ComboboxContext: Context<ComboboxContextValue> =
	createContext<ComboboxContextValue>({
		chipsRef: null,
		multiple: false,
	});

export function ChevronsUpDownIcon(): ReactElement {
	return <IconSelector aria-hidden="true" focusable="false" size="16" />;
}

export function CheckIcon(): ReactElement {
	return <IconCheck aria-hidden="true" focusable="false" size="16" />;
}

export function XIcon(): ReactElement {
	return <IconX aria-hidden="true" focusable="false" size="16" />;
}
