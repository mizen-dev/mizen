"use client";

import { Autocomplete as BaseAutocomplete } from "@base-ui/react/autocomplete";
import { props } from "@stylexjs/stylex";
import type { ReactElement } from "react";
import { protectRenderSlot as protectSlot } from "../../render-utils";
import { Kbd } from "../kbd/kbd";
import { kbdStyles } from "../kbd/kbd.styles";
import type {
	CommandEmptyProps,
	CommandFooterProps,
	CommandGroupLabelProps,
	CommandGroupProps,
	CommandPanelProps,
	CommandSeparatorProps,
	CommandShortcutProps,
} from "./command.types";
import { commandItemsStyles } from "./command-items.styles";

export function CommandEmpty({
	children,
	ref: forwardedRef = undefined,
	render,
	...rest
}: CommandEmptyProps): ReactElement {
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "style");

	return (
		<BaseAutocomplete.Empty
			{...rest}
			data-slot="command-empty"
			ref={forwardedRef}
			render={protectSlot("command-empty", render)}
			{...props(commandItemsStyles.empty)}
		>
			{children}
		</BaseAutocomplete.Empty>
	);
}

export function CommandPanel({
	children,
	ref: forwardedRef = undefined,
	...rest
}: CommandPanelProps): ReactElement {
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "style");

	return (
		<div
			{...rest}
			data-slot="command-panel"
			ref={forwardedRef}
			{...props(commandItemsStyles.panel)}
		>
			{children}
		</div>
	);
}

export function CommandGroup({
	children,
	ref: forwardedRef = undefined,
	render,
	...rest
}: CommandGroupProps): ReactElement {
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "style");

	return (
		<BaseAutocomplete.Group
			{...rest}
			data-slot="command-group"
			ref={forwardedRef}
			render={protectSlot("command-group", render)}
			{...props(commandItemsStyles.group)}
		>
			{children}
		</BaseAutocomplete.Group>
	);
}

export function CommandGroupLabel({
	children,
	ref: forwardedRef = undefined,
	render,
	...rest
}: CommandGroupLabelProps): ReactElement {
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "style");

	return (
		<BaseAutocomplete.GroupLabel
			{...rest}
			data-slot="command-group-label"
			ref={forwardedRef}
			render={protectSlot("command-group-label", render)}
			{...props(commandItemsStyles.groupLabel)}
		>
			{children}
		</BaseAutocomplete.GroupLabel>
	);
}

export function CommandSeparator({
	ref: forwardedRef = undefined,
	render,
	...rest
}: CommandSeparatorProps): ReactElement {
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "style");

	return (
		<BaseAutocomplete.Separator
			{...rest}
			data-slot="command-separator"
			ref={forwardedRef}
			render={protectSlot("command-separator", render)}
			{...props(commandItemsStyles.separator)}
		/>
	);
}

export function CommandShortcut({
	children,
	ref: forwardedRef = undefined,
	...rest
}: CommandShortcutProps): ReactElement {
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "style");

	const shortcut =
		typeof children === "string" ? <Kbd>{children}</Kbd> : children;
	return (
		<kbd
			{...rest}
			data-slot="command-shortcut"
			ref={forwardedRef}
			{...props(kbdStyles.group, commandItemsStyles.shortcut)}
		>
			{shortcut}
		</kbd>
	);
}

export function CommandFooter({
	children,
	ref: forwardedRef = undefined,
	...rest
}: CommandFooterProps): ReactElement {
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "style");

	return (
		<div
			{...rest}
			data-slot="command-footer"
			ref={forwardedRef}
			{...props(commandItemsStyles.footer)}
		>
			{children}
		</div>
	);
}
