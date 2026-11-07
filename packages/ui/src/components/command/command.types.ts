import type { Autocomplete as BaseAutocomplete } from "@base-ui/react/autocomplete";
import type { Dialog as BaseDialog } from "@base-ui/react/dialog";
import type { ComponentPropsWithRef, ReactNode } from "react";

type Closed<T> = Omit<T, "className" | "data-slot" | "style">;

export type CommandDialogProps<Payload = unknown> = Closed<
	BaseDialog.Root.Props<Payload>
>;

export type CommandDialogPortalProps = Closed<BaseDialog.Portal.Props>;

export type CommandDialogTriggerProps<Payload = unknown> = Closed<
	BaseDialog.Trigger.Props<Payload>
>;

export type CommandDialogBackdropProps = Closed<BaseDialog.Backdrop.Props>;

export type CommandDialogViewportProps = Closed<BaseDialog.Viewport.Props>;

export type CommandDialogPopupProps = Omit<
	Closed<BaseDialog.Popup.Props>,
	"children"
> & {
	readonly children?: ReactNode;
	readonly portalProps?: CommandDialogPortalProps;
};

export type CommandProps<ItemValue = unknown> = Closed<
	BaseAutocomplete.Root.Props<ItemValue>
>;

export type CommandInputProps = Omit<
	Closed<BaseAutocomplete.Input.Props>,
	"size"
> & {
	readonly startAddon?: ReactNode;
};

export type CommandListProps = Closed<BaseAutocomplete.List.Props>;

export type CommandEmptyProps = Closed<BaseAutocomplete.Empty.Props>;

export type CommandPanelProps = Closed<ComponentPropsWithRef<"div">>;

export type CommandGroupProps = Closed<BaseAutocomplete.Group.Props>;

export type CommandGroupLabelProps = Closed<BaseAutocomplete.GroupLabel.Props>;

export type CommandCollectionProps = BaseAutocomplete.Collection.Props;

export type CommandItemProps = Closed<BaseAutocomplete.Item.Props>;

export type CommandSeparatorProps = Closed<BaseAutocomplete.Separator.Props>;

export type CommandShortcutProps = Closed<ComponentPropsWithRef<"kbd">>;

export type CommandFooterProps = Closed<ComponentPropsWithRef<"div">>;
