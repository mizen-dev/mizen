"use client";

import { Autocomplete as BaseAutocomplete } from "@base-ui/react/autocomplete";
import { props } from "@stylexjs/stylex";
import type { ComponentType, ReactElement } from "react";
import { controlLabel } from "../../control-label";
import { protectRenderSlot as protectSlot } from "../../render-utils";
import { ScrollArea } from "../scroll-area/scroll-area";
import type {
	CommandItemProps,
	CommandListProps,
	CommandProps,
} from "./command.types";
import { commandItemsStyles } from "./command-items.styles";

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
	const {
		autoHighlight = "always",
		keepHighlight = true,
		...rest
	} = commandProps;
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "style");

	const AutocompleteRoot: ComponentType<CommandProps> = BaseAutocomplete.Root;

	return (
		<AutocompleteRoot
			autoHighlight={autoHighlight}
			inline
			keepHighlight={keepHighlight}
			open
			{...rest}
		/>
	);
}

export function CommandList({
	children,
	ref: forwardedRef = undefined,
	render,
	...rest
}: CommandListProps): ReactElement {
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "style");

	return (
		<ScrollArea overscrollContain scrollbarGutter scrollFade>
			<BaseAutocomplete.List
				{...rest}
				data-slot="command-list"
				ref={forwardedRef}
				render={protectSlot("command-list", render)}
				{...props(commandItemsStyles.list)}
			>
				{children}
			</BaseAutocomplete.List>
		</ScrollArea>
	);
}

export const CommandCollection = BaseAutocomplete.Collection;

export function CommandItem({
	children,
	ref: forwardedRef = undefined,
	render,
	...rest
}: CommandItemProps): ReactElement {
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "style");

	return (
		<BaseAutocomplete.Item
			{...rest}
			data-slot="command-item"
			ref={forwardedRef}
			render={protectSlot("command-item", render)}
			{...props(commandItemsStyles.item)}
		>
			{controlLabel(children)}
		</BaseAutocomplete.Item>
	);
}
