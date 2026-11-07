"use client";

import { ContextMenu as BaseContextMenu } from "@base-ui/react/context-menu";
import { mergeProps } from "@base-ui/react/merge-props";
import { props } from "@stylexjs/stylex";
import { controlLabel } from "../../control-label";
import { protectRenderSlot as protectSlot } from "../../render-utils";
import { kbdStyles } from "../kbd/kbd.styles";
import { menuStyles } from "../menu/menu.styles";
import type {
	ContextMenuCheckboxItemProps,
	ContextMenuGroupLabelProps,
	ContextMenuGroupProps,
	ContextMenuItemProps,
	ContextMenuLinkItemProps,
	ContextMenuRadioGroupProps,
	ContextMenuRadioItemProps,
	ContextMenuSeparatorProps,
	ContextMenuShortcutProps,
} from "./context-menu.types";
import {
	CheckIcon,
	itemVariantStyles,
	renderSwitchIndicator,
} from "./context-menu-utils";

export function ContextMenuItem({
	render,
	children,
	inset = false,
	ref: forwardedRef,
	variant = "default",
	...rest
}: ContextMenuItemProps) {
	return (
		<BaseContextMenu.Item
			{...rest}
			data-inset={inset || undefined}
			data-slot="context-menu-item"
			data-variant={variant}
			ref={forwardedRef}
			render={protectSlot("context-menu-item", render)}
			{...props(
				menuStyles.item,
				itemVariantStyles[variant],
				inset && menuStyles.inset
			)}
		>
			{controlLabel(children)}
		</BaseContextMenu.Item>
	);
}

export function ContextMenuLinkItem({
	children,
	closeOnClick = true,
	inset = false,
	ref: forwardedRef,
	render,
	variant = "default",
	...rest
}: ContextMenuLinkItemProps) {
	return (
		<BaseContextMenu.LinkItem
			closeOnClick={closeOnClick}
			{...rest}
			data-inset={inset || undefined}
			data-slot="context-menu-link-item"
			data-variant={variant}
			ref={forwardedRef}
			render={protectSlot("context-menu-link-item", render)}
			{...props(
				menuStyles.item,
				itemVariantStyles[variant],
				inset && menuStyles.inset
			)}
		>
			{controlLabel(children)}
		</BaseContextMenu.LinkItem>
	);
}

export function ContextMenuGroup({
	render,
	children,
	ref: forwardedRef,
	...rest
}: ContextMenuGroupProps) {
	return (
		<BaseContextMenu.Group
			{...rest}
			data-slot="context-menu-group"
			ref={forwardedRef}
			render={protectSlot("context-menu-group", render)}
			{...props(menuStyles.group)}
		>
			{children}
		</BaseContextMenu.Group>
	);
}

export function ContextMenuGroupLabel({
	render,
	children,
	inset = false,
	ref: forwardedRef,
	...rest
}: ContextMenuGroupLabelProps) {
	return (
		<BaseContextMenu.GroupLabel
			{...rest}
			data-inset={inset || undefined}
			data-slot="context-menu-label"
			ref={forwardedRef}
			render={protectSlot("context-menu-label", render)}
			{...props(menuStyles.groupLabel, inset && menuStyles.inset)}
		>
			{children}
		</BaseContextMenu.GroupLabel>
	);
}

export function ContextMenuSeparator({
	render,
	ref: forwardedRef,
	...rest
}: ContextMenuSeparatorProps) {
	return (
		<BaseContextMenu.Separator
			{...rest}
			data-slot="context-menu-separator"
			ref={forwardedRef}
			render={protectSlot("context-menu-separator", render)}
			{...props(menuStyles.separator)}
		/>
	);
}

export function ContextMenuShortcut({
	children,
	ref: forwardedRef,
	...rest
}: ContextMenuShortcutProps) {
	return (
		// Key order reads left to right in every language.
		<kbd
			dir="ltr"
			{...rest}
			data-slot="context-menu-shortcut"
			ref={forwardedRef}
			{...mergeProps(props(kbdStyles.group, menuStyles.shortcut), {})}
		>
			{controlLabel(children)}
		</kbd>
	);
}

export function ContextMenuCheckboxItem({
	render,
	children,
	ref: forwardedRef,
	variant = "default",
	...rest
}: ContextMenuCheckboxItemProps) {
	const indicator =
		variant === "switch" ? (
			<BaseContextMenu.CheckboxItemIndicator
				keepMounted
				render={renderSwitchIndicator}
			/>
		) : (
			<BaseContextMenu.CheckboxItemIndicator
				keepMounted
				{...props(menuStyles.indicator)}
			>
				<CheckIcon />
			</BaseContextMenu.CheckboxItemIndicator>
		);
	return (
		<BaseContextMenu.CheckboxItem
			{...rest}
			data-slot="context-menu-checkbox-item"
			ref={forwardedRef}
			render={protectSlot("context-menu-checkbox-item", render)}
			{...props(menuStyles.item, menuStyles.itemDefault)}
		>
			{variant === "default" && indicator}
			{controlLabel(children)}
			{variant === "switch" && indicator}
		</BaseContextMenu.CheckboxItem>
	);
}

export function ContextMenuRadioGroup<Value = unknown>({
	render,
	...rest
}: ContextMenuRadioGroupProps<Value>) {
	return (
		<BaseContextMenu.RadioGroup
			{...rest}
			data-slot="context-menu-radio-group"
			render={protectSlot("context-menu-radio-group", render)}
		/>
	);
}

export function ContextMenuRadioItem<Value = unknown>({
	render,
	children,
	ref: forwardedRef,
	...rest
}: ContextMenuRadioItemProps<Value>) {
	return (
		<BaseContextMenu.RadioItem
			{...rest}
			data-slot="context-menu-radio-item"
			ref={forwardedRef}
			render={protectSlot("context-menu-radio-item", render)}
			{...props(menuStyles.item, menuStyles.itemDefault)}
		>
			<BaseContextMenu.RadioItemIndicator
				keepMounted
				{...props(menuStyles.indicator)}
			>
				<span {...props(menuStyles.radioDot)} />
			</BaseContextMenu.RadioItemIndicator>
			{controlLabel(children)}
		</BaseContextMenu.RadioItem>
	);
}
