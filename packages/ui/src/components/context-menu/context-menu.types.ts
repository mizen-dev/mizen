import type {
	ContextMenu as BaseContextMenu,
	ContextMenuRootProps as BaseContextMenuRootProps,
	ContextMenuSubmenuRootProps,
} from "@base-ui/react/context-menu";
import type { MenuRadioGroupChangeEventDetails as ContextMenuRadioGroupChangeEventDetails } from "@base-ui/react/menu";
import type { ComponentPropsWithRef } from "react";
import type { Closed } from "../../closed";

type ContextMenuPositionerProps = ComponentPropsWithRef<
	typeof BaseContextMenu.Positioner
>;
type ContextMenuBasePopupProps = ComponentPropsWithRef<
	typeof BaseContextMenu.Popup
>;

export type ContextMenuProps<_Payload = unknown> =
	Closed<BaseContextMenuRootProps>;
export type ContextMenuPortalProps = Closed<
	ComponentPropsWithRef<typeof BaseContextMenu.Portal>
>;
export type ContextMenuTriggerProps = Closed<
	ComponentPropsWithRef<typeof BaseContextMenu.Trigger>
>;
export type ContextMenuPopupProps = Closed<
	Omit<ContextMenuBasePopupProps, "ref"> & {
		align?: ContextMenuPositionerProps["align"];
		alignOffset?: ContextMenuPositionerProps["alignOffset"];
		anchor?: ContextMenuPositionerProps["anchor"];
		portalProps?: Omit<ContextMenuPortalProps, "children" | "ref">;
		ref?: ContextMenuBasePopupProps["ref"];
		side?: ContextMenuPositionerProps["side"];
		sideOffset?: ContextMenuPositionerProps["sideOffset"];
	}
>;
export type ContextMenuItemVariant = "default" | "destructive";
export type ContextMenuItemProps = Closed<
	Omit<ComponentPropsWithRef<typeof BaseContextMenu.Item>, "ref"> & {
		closeOnClick?: boolean;
		inset?: boolean;
		ref?: ComponentPropsWithRef<typeof BaseContextMenu.Item>["ref"];
		variant?: ContextMenuItemVariant;
	}
>;
export type ContextMenuLinkItemProps = Closed<
	ComponentPropsWithRef<typeof BaseContextMenu.LinkItem> & {
		inset?: boolean;
		variant?: ContextMenuItemVariant;
	}
>;
export type ContextMenuGroupProps = Closed<
	ComponentPropsWithRef<typeof BaseContextMenu.Group>
>;
export type ContextMenuGroupLabelProps = Closed<
	ComponentPropsWithRef<typeof BaseContextMenu.GroupLabel> & { inset?: boolean }
>;
export type ContextMenuSeparatorProps = Closed<
	ComponentPropsWithRef<typeof BaseContextMenu.Separator>
>;
export type ContextMenuShortcutProps = Closed<ComponentPropsWithRef<"kbd">>;
export type ContextMenuCheckboxItemVariant = "default" | "switch";
export type ContextMenuCheckboxItemProps = Closed<
	Omit<ComponentPropsWithRef<typeof BaseContextMenu.CheckboxItem>, "ref"> & {
		ref?: ComponentPropsWithRef<typeof BaseContextMenu.CheckboxItem>["ref"];
		variant?: ContextMenuCheckboxItemVariant;
	}
>;
type BaseContextMenuRadioGroupProps = ComponentPropsWithRef<
	typeof BaseContextMenu.RadioGroup
>;
export type ContextMenuRadioGroupProps<Value = unknown> = Closed<
	Omit<
		BaseContextMenuRadioGroupProps,
		"defaultValue" | "onValueChange" | "value"
	> & {
		defaultValue?: Value;
		onValueChange?: (
			value: Value,
			eventDetails: ContextMenuRadioGroupChangeEventDetails
		) => void;
		value?: Value;
	}
>;
type BaseContextMenuRadioItemProps = ComponentPropsWithRef<
	typeof BaseContextMenu.RadioItem
>;
export type ContextMenuRadioItemProps<Value = unknown> = Closed<
	Omit<BaseContextMenuRadioItemProps, "value"> & { value: Value }
>;
export type ContextMenuSubProps = Closed<ContextMenuSubmenuRootProps>;
export type ContextMenuSubTriggerProps = Closed<
	Omit<ComponentPropsWithRef<typeof BaseContextMenu.SubmenuTrigger>, "ref"> & {
		inset?: boolean;
		ref?: ComponentPropsWithRef<typeof BaseContextMenu.SubmenuTrigger>["ref"];
	}
>;
export type ContextMenuSubPopupProps = Closed<ContextMenuPopupProps>;
