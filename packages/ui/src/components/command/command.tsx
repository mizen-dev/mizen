"use client";

import type { Dialog as BaseDialog } from "@base-ui/react/dialog";
import type { ReactElement } from "react";
import type {
	CommandDialogBackdropProps,
	CommandDialogPopupProps,
	CommandDialogTriggerProps,
	CommandDialogViewportProps,
	CommandEmptyProps,
	CommandFooterProps,
	CommandGroupLabelProps,
	CommandGroupProps,
	CommandInputProps,
	CommandItemProps,
	CommandListProps,
	CommandPanelProps,
	CommandProps,
	CommandSeparatorProps,
	CommandShortcutProps,
} from "./command.types";
import {
	CommandCreateHandle as BaseCommandCreateHandle,
	CommandDialog as BaseCommandDialog,
	CommandDialogBackdrop as BaseCommandDialogBackdrop,
	CommandDialogPopup as BaseCommandDialogPopup,
	CommandDialogPortal as BaseCommandDialogPortal,
	CommandDialogPrimitive as BaseCommandDialogPrimitive,
	CommandDialogTrigger as BaseCommandDialogTrigger,
	CommandDialogViewport as BaseCommandDialogViewport,
} from "./command-dialog";
import { CommandInput as BaseCommandInput } from "./command-input";
import {
	Command as BaseCommand,
	CommandCollection as BaseCommandCollection,
	CommandItem as BaseCommandItem,
	CommandList as BaseCommandList,
} from "./command-items";
import {
	CommandEmpty as BaseCommandEmpty,
	CommandFooter as BaseCommandFooter,
	CommandGroup as BaseCommandGroup,
	CommandGroupLabel as BaseCommandGroupLabel,
	CommandPanel as BaseCommandPanel,
	CommandSeparator as BaseCommandSeparator,
	CommandShortcut as BaseCommandShortcut,
} from "./command-structure";

// Annotated so published declarations name Base UI's public Dialog type.
export const CommandDialogPrimitive: typeof BaseDialog =
	BaseCommandDialogPrimitive;
export const CommandDialog = BaseCommandDialog;
export const CommandDialogPortal = BaseCommandDialogPortal;
export const CommandCreateHandle: typeof BaseDialog.createHandle =
	BaseCommandCreateHandle;
export const CommandCollection = BaseCommandCollection;

export function CommandDialogTrigger<Payload = unknown>(
	props: CommandDialogTriggerProps<Payload>
): ReactElement {
	return <BaseCommandDialogTrigger {...props} />;
}

export function CommandDialogBackdrop(
	props: CommandDialogBackdropProps
): ReactElement {
	return <BaseCommandDialogBackdrop {...props} />;
}

export function CommandDialogViewport(
	props: CommandDialogViewportProps
): ReactElement {
	return <BaseCommandDialogViewport {...props} />;
}

export function CommandDialogPopup(
	props: CommandDialogPopupProps
): ReactElement {
	return <BaseCommandDialogPopup {...props} />;
}

export function Command<
	Items extends readonly {
		items: readonly unknown[];
	}[],
>(
	commandProps: Omit<CommandProps<Items[number]["items"][number]>, "items"> & {
		items: Items;
	}
): ReactElement;
export function Command<ItemValue = unknown>(
	commandProps: CommandProps<ItemValue>
): ReactElement;
export function Command(commandProps: CommandProps): ReactElement {
	return <BaseCommand {...commandProps} />;
}

export function CommandInput(props: CommandInputProps): ReactElement {
	return <BaseCommandInput {...props} />;
}

export function CommandList(props: CommandListProps): ReactElement {
	return <BaseCommandList {...props} />;
}

export function CommandEmpty(props: CommandEmptyProps): ReactElement {
	return <BaseCommandEmpty {...props} />;
}

export function CommandPanel(props: CommandPanelProps): ReactElement {
	return <BaseCommandPanel {...props} />;
}

export function CommandGroup(props: CommandGroupProps): ReactElement {
	return <BaseCommandGroup {...props} />;
}

export function CommandGroupLabel(props: CommandGroupLabelProps): ReactElement {
	return <BaseCommandGroupLabel {...props} />;
}

export function CommandItem(props: CommandItemProps): ReactElement {
	return <BaseCommandItem {...props} />;
}

export function CommandSeparator(props: CommandSeparatorProps): ReactElement {
	return <BaseCommandSeparator {...props} />;
}

export function CommandShortcut(props: CommandShortcutProps): ReactElement {
	return <BaseCommandShortcut {...props} />;
}

export function CommandFooter(props: CommandFooterProps): ReactElement {
	return <BaseCommandFooter {...props} />;
}

export type {
	CommandCollectionProps,
	CommandDialogBackdropProps,
	CommandDialogPopupProps,
	CommandDialogPortalProps,
	CommandDialogProps,
	CommandDialogTriggerProps,
	CommandDialogViewportProps,
	CommandEmptyProps,
	CommandFooterProps,
	CommandGroupLabelProps,
	CommandGroupProps,
	CommandInputProps,
	CommandItemProps,
	CommandListProps,
	CommandPanelProps,
	CommandProps,
	CommandSeparatorProps,
	CommandShortcutProps,
} from "./command.types";
