"use client";

import { ContextMenu as BaseContextMenu } from "@base-ui/react/context-menu";
import { mergeProps } from "@base-ui/react/merge-props";
import { props } from "@stylexjs/stylex";
import type { KeyboardEvent, ReactNode } from "react";
import { controlLabel } from "../../control-label";
import { protectRenderSlot as protectSlot } from "../../render-utils";
import { menuStyles } from "../menu/menu.styles";
import { ScrollArea } from "../scroll-area/scroll-area";
import type {
	ContextMenuPopupProps,
	ContextMenuPortalProps,
	ContextMenuSubPopupProps,
	ContextMenuSubTriggerProps,
	ContextMenuTriggerProps,
} from "./context-menu.types";
import {
	ContextMenuCheckboxItem as ContextMenuCheckboxItemImpl,
	ContextMenuGroup as ContextMenuGroupImpl,
	ContextMenuGroupLabel as ContextMenuGroupLabelImpl,
	ContextMenuItem as ContextMenuItemImpl,
	ContextMenuLinkItem as ContextMenuLinkItemImpl,
	ContextMenuRadioGroup as ContextMenuRadioGroupImpl,
	ContextMenuRadioItem as ContextMenuRadioItemImpl,
	ContextMenuSeparator as ContextMenuSeparatorImpl,
	ContextMenuShortcut as ContextMenuShortcutImpl,
} from "./context-menu-items";
import { ChevronIcon, itemVariantStyles } from "./context-menu-utils";

export type * from "./context-menu.types";

export const ContextMenuItem = ContextMenuItemImpl;
export const ContextMenuLinkItem = ContextMenuLinkItemImpl;
export const ContextMenuGroup = ContextMenuGroupImpl;
export const ContextMenuGroupLabel = ContextMenuGroupLabelImpl;
export const ContextMenuSeparator = ContextMenuSeparatorImpl;
export const ContextMenuShortcut = ContextMenuShortcutImpl;
export const ContextMenuCheckboxItem = ContextMenuCheckboxItemImpl;
export const ContextMenuRadioGroup = ContextMenuRadioGroupImpl;
export const ContextMenuRadioItem = ContextMenuRadioItemImpl;

export const ContextMenu = BaseContextMenu.Root;
export const ContextMenuPortal: (props: ContextMenuPortalProps) => ReactNode =
	BaseContextMenu.Portal;
export const ContextMenuPrimitive = BaseContextMenu;

function ContextMenuPopupSurface({
	render,
	align,
	alignOffset,
	anchor,
	children,
	dataSlot,
	portalProps,
	ref: forwardedRef,
	side,
	sideOffset,
	...rest
}: ContextMenuPopupProps & { dataSlot: string }) {
	return (
		<BaseContextMenu.Portal {...portalProps}>
			<BaseContextMenu.Positioner
				align={align}
				alignOffset={alignOffset}
				anchor={anchor}
				data-slot="context-menu-positioner"
				side={side}
				sideOffset={sideOffset}
				{...props(menuStyles.positioner)}
			>
				<BaseContextMenu.Popup
					{...rest}
					data-slot={dataSlot}
					ref={forwardedRef}
					render={protectSlot(dataSlot, render)}
					{...props(menuStyles.popup)}
				>
					{/* Scrolls and fades like Menu's popup. */}
					<ScrollArea overscrollContain scrollFade>
						<div {...props(menuStyles.content)}>{children}</div>
					</ScrollArea>
				</BaseContextMenu.Popup>
			</BaseContextMenu.Positioner>
		</BaseContextMenu.Portal>
	);
}

function handleContextMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
	if (
		event.defaultPrevented ||
		event.altKey ||
		event.ctrlKey ||
		event.metaKey ||
		!(event.key === "ContextMenu" || (event.key === "F10" && event.shiftKey))
	) {
		return;
	}
	event.preventDefault();
	const rect = event.currentTarget.getBoundingClientRect();
	event.currentTarget.dispatchEvent(
		new MouseEvent("contextmenu", {
			bubbles: true,
			button: 2,
			cancelable: true,
			clientX: rect.left + rect.width / 2,
			clientY: rect.top + rect.height / 2,
			composed: true,
		})
	);
}

export function ContextMenuTrigger({
	ref: forwardedRef,
	render,
	...rest
}: ContextMenuTriggerProps) {
	return (
		<BaseContextMenu.Trigger
			{...mergeProps({ onKeyDown: handleContextMenuKeyDown }, rest)}
			data-slot="context-menu-trigger"
			ref={forwardedRef}
			render={protectSlot("context-menu-trigger", render)}
		/>
	);
}

export function ContextMenuPopup({
	align = "center",
	alignOffset,
	anchor,
	side = "bottom",
	sideOffset = 4,
	...rest
}: ContextMenuPopupProps) {
	return (
		<ContextMenuPopupSurface
			align={align}
			alignOffset={alignOffset}
			anchor={anchor}
			dataSlot="context-menu-popup"
			side={side}
			sideOffset={sideOffset}
			{...rest}
		/>
	);
}

export const ContextMenuSub = BaseContextMenu.SubmenuRoot;

export function ContextMenuSubTrigger({
	render,
	children,
	inset = false,
	ref: forwardedRef,
	...rest
}: ContextMenuSubTriggerProps) {
	return (
		<BaseContextMenu.SubmenuTrigger
			{...rest}
			data-inset={inset || undefined}
			data-slot="context-menu-sub-trigger"
			ref={forwardedRef}
			render={protectSlot("context-menu-sub-trigger", render)}
			{...props(
				menuStyles.item,
				itemVariantStyles.default,
				menuStyles.subTrigger,
				inset && menuStyles.inset
			)}
		>
			{controlLabel(children)}
			<ChevronIcon />
		</BaseContextMenu.SubmenuTrigger>
	);
}

export function ContextMenuSubPopup({
	align = "start",
	alignOffset,
	anchor,
	side = "inline-end",
	sideOffset = 0,
	...rest
}: ContextMenuSubPopupProps) {
	const defaultAlignOffset = align === "center" ? undefined : -5;
	return (
		<ContextMenuPopupSurface
			align={align}
			alignOffset={alignOffset ?? defaultAlignOffset}
			anchor={anchor}
			dataSlot="context-menu-sub-content"
			side={side}
			sideOffset={sideOffset}
			{...rest}
		/>
	);
}
