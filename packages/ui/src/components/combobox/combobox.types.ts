import type { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import type { ComponentPropsWithRef, ReactNode } from "react";
import type { Closed } from "../../closed";

export type ComboboxSize = "default" | "lg" | "sm";

export type ComboboxProps<
	Value,
	Multiple extends boolean | undefined = false,
	Item = Value,
> = ComboboxPrimitive.Root.Props<Value, Multiple, Item>;

export type ComboboxInputProps = Closed<
	Omit<ComboboxPrimitive.Input.Props, "size"> & {
		clearProps?: ComboboxPrimitive.Clear.Props;
		ref?: ComponentPropsWithRef<"input">["ref"];
		showClear?: boolean;
		showTrigger?: boolean;
		size?: ComboboxSize | number;
		startAddon?: ReactNode;
		triggerProps?: ComboboxPrimitive.Trigger.Props;
	}
>;

export type ComboboxChipsInputProps = Closed<
	Omit<ComboboxPrimitive.Input.Props, "size"> & {
		ref?: ComponentPropsWithRef<"input">["ref"];
		size?: ComboboxSize | number;
	}
>;

export type ComboboxTriggerProps = Closed<ComboboxPrimitive.Trigger.Props>;

export type ComboboxClearProps = Closed<ComboboxPrimitive.Clear.Props>;

export type ComboboxPopupProps = Closed<
	ComboboxPrimitive.Popup.Props & {
		align?: ComboboxPrimitive.Positioner.Props["align"];
		alignOffset?: ComboboxPrimitive.Positioner.Props["alignOffset"];
		anchor?: ComboboxPrimitive.Positioner.Props["anchor"];
		portalProps?: Closed<ComboboxPrimitive.Portal.Props>;
		side?: ComboboxPrimitive.Positioner.Props["side"];
		sideOffset?: ComboboxPrimitive.Positioner.Props["sideOffset"];
	}
>;

export type ComboboxItemProps = Closed<ComboboxPrimitive.Item.Props>;

export type ComboboxSeparatorProps = Closed<ComboboxPrimitive.Separator.Props>;

export type ComboboxGroupProps = Closed<ComboboxPrimitive.Group.Props>;

export type ComboboxGroupLabelProps =
	Closed<ComboboxPrimitive.GroupLabel.Props>;

export type ComboboxEmptyProps = Closed<ComboboxPrimitive.Empty.Props>;

export type ComboboxRowProps = Closed<ComboboxPrimitive.Row.Props>;

export type ComboboxListProps = Closed<ComboboxPrimitive.List.Props>;

export type ComboboxStatusProps = Closed<ComboboxPrimitive.Status.Props>;

export type ComboboxChipsProps = Closed<
	ComboboxPrimitive.Chips.Props & {
		startAddon?: ReactNode;
	}
>;

export type ComboboxChipProps = Closed<
	ComboboxPrimitive.Chip.Props & {
		removeProps?: ComboboxPrimitive.ChipRemove.Props;
	}
>;

export type ComboboxChipRemoveProps =
	Closed<ComboboxPrimitive.ChipRemove.Props>;
