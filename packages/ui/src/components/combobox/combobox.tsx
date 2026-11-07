"use client";

import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import type { ReactElement } from "react";
import { useRef } from "react";
import type {
	ComboboxChipProps,
	ComboboxChipRemoveProps,
	ComboboxChipsInputProps,
	ComboboxChipsProps,
	ComboboxClearProps,
	ComboboxEmptyProps,
	ComboboxGroupLabelProps,
	ComboboxGroupProps,
	ComboboxInputProps,
	ComboboxItemProps,
	ComboboxListProps,
	ComboboxPopupProps,
	ComboboxProps,
	ComboboxRowProps,
	ComboboxSeparatorProps,
	ComboboxStatusProps,
	ComboboxTriggerProps,
} from "./combobox.types";
import {
	ComboboxChip as BaseComboboxChip,
	ComboboxChipRemove as BaseComboboxChipRemove,
	ComboboxChips as BaseComboboxChips,
	ComboboxChipsInput as BaseComboboxChipsInput,
} from "./combobox-chips";
import { ComboboxContext as BaseComboboxContext } from "./combobox-context";
import {
	ComboboxClear as BaseComboboxClear,
	ComboboxInput as BaseComboboxInput,
	ComboboxTrigger as BaseComboboxTrigger,
} from "./combobox-input";
import {
	ComboboxItem as BaseComboboxItem,
	ComboboxList as BaseComboboxList,
	ComboboxPopup as BaseComboboxPopup,
} from "./combobox-popup";
import {
	ComboboxEmpty as BaseComboboxEmpty,
	ComboboxGroup as BaseComboboxGroup,
	ComboboxGroupLabel as BaseComboboxGroupLabel,
	ComboboxRow as BaseComboboxRow,
	ComboboxSeparator as BaseComboboxSeparator,
	ComboboxStatus as BaseComboboxStatus,
} from "./combobox-structure";

export function Combobox<
	Value,
	Multiple extends boolean | undefined = false,
	Item = Value,
>(props: ComboboxProps<Value, Multiple, Item>): ReactElement {
	const chipsRef = useRef<Element | null>(null);
	return (
		<BaseComboboxContext.Provider
			value={{ chipsRef, multiple: Boolean(props.multiple) }}
		>
			<BaseCombobox.Root {...props} />
		</BaseComboboxContext.Provider>
	);
}

export const ComboboxContext = BaseComboboxContext;
export const ComboboxPrimitive = BaseCombobox;
export const ComboboxValue = BaseCombobox.Value;
export const ComboboxCollection = BaseCombobox.Collection;
export const createComboboxItems = BaseCombobox.createItems;
export const useComboboxFilter = BaseCombobox.useFilter;

export function ComboboxChips(props: ComboboxChipsProps): ReactElement {
	return <BaseComboboxChips {...props} />;
}

export function ComboboxChip(props: ComboboxChipProps): ReactElement {
	return <BaseComboboxChip {...props} />;
}

export function ComboboxChipRemove(
	props: ComboboxChipRemoveProps
): ReactElement {
	return <BaseComboboxChipRemove {...props} />;
}

export function ComboboxChipsInput(
	props: ComboboxChipsInputProps
): ReactElement {
	return <BaseComboboxChipsInput {...props} />;
}

export function ComboboxInput(props: ComboboxInputProps): ReactElement {
	return <BaseComboboxInput {...props} />;
}

export function ComboboxTrigger(props: ComboboxTriggerProps): ReactElement {
	return <BaseComboboxTrigger {...props} />;
}

export function ComboboxClear(props: ComboboxClearProps): ReactElement {
	return <BaseComboboxClear {...props} />;
}

export function ComboboxPopup(props: ComboboxPopupProps): ReactElement {
	return <BaseComboboxPopup {...props} />;
}

export function ComboboxItem(props: ComboboxItemProps): ReactElement {
	return <BaseComboboxItem {...props} />;
}

export function ComboboxList(props: ComboboxListProps): ReactElement {
	return <BaseComboboxList {...props} />;
}

export function ComboboxGroup(props: ComboboxGroupProps): ReactElement {
	return <BaseComboboxGroup {...props} />;
}

export function ComboboxGroupLabel(
	props: ComboboxGroupLabelProps
): ReactElement {
	return <BaseComboboxGroupLabel {...props} />;
}

export function ComboboxSeparator(props: ComboboxSeparatorProps): ReactElement {
	return <BaseComboboxSeparator {...props} />;
}

export function ComboboxEmpty(props: ComboboxEmptyProps): ReactElement {
	return <BaseComboboxEmpty {...props} />;
}

export function ComboboxRow(props: ComboboxRowProps): ReactElement {
	return <BaseComboboxRow {...props} />;
}

export function ComboboxStatus(props: ComboboxStatusProps): ReactElement {
	return <BaseComboboxStatus {...props} />;
}

export type {
	ComboboxChipProps,
	ComboboxChipRemoveProps,
	ComboboxChipsInputProps,
	ComboboxChipsProps,
	ComboboxClearProps,
	ComboboxEmptyProps,
	ComboboxGroupLabelProps,
	ComboboxGroupProps,
	ComboboxInputProps,
	ComboboxItemProps,
	ComboboxListProps,
	ComboboxPopupProps,
	ComboboxProps,
	ComboboxRowProps,
	ComboboxSeparatorProps,
	ComboboxSize,
	ComboboxStatusProps,
	ComboboxTriggerProps,
} from "./combobox.types";
