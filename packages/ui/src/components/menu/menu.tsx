"use client";

import { useDirection } from "@base-ui/react/direction-provider";
import {
	Menu as BaseMenu,
	type MenuRootProps as BaseMenuRootProps,
	type MenuCheckboxItemIndicatorState,
	type MenuRadioGroupChangeEventDetails,
	type MenuSubmenuRootProps,
} from "@base-ui/react/menu";
import { mergeProps } from "@base-ui/react/merge-props";
import { props } from "@stylexjs/stylex";
import { type ComponentPropsWithRef, type ReactNode, useContext } from "react";
import type { Closed } from "../../closed";
import { controlLabel } from "../../control-label";
import { IconCheck, IconChevronLeft, IconChevronRight } from "../../icons";
import { protectRenderSlot } from "../../render-utils";
import { kbdStyles } from "../kbd/kbd.styles";
import { ScrollArea } from "../scroll-area/scroll-area";
import { menuStyles } from "./menu.styles";
import { MenuAlignContext } from "./menu-align-context";

type MenuPositionerProps = ComponentPropsWithRef<typeof BaseMenu.Positioner>;
export type MenuPortalProps = Closed<
	ComponentPropsWithRef<typeof BaseMenu.Portal>
>;

export type MenuProps<Payload = unknown> = Closed<BaseMenuRootProps<Payload>>;
export type MenuTriggerProps<Payload = unknown> = Closed<
	Omit<ComponentPropsWithRef<typeof BaseMenu.Trigger>, "handle" | "payload"> & {
		handle?: BaseMenuRootProps<Payload>["handle"];
		payload?: Payload;
	}
>;
export type MenuPopupProps = Closed<
	Omit<ComponentPropsWithRef<typeof BaseMenu.Popup>, "ref"> & {
		align?: MenuPositionerProps["align"];
		alignOffset?: MenuPositionerProps["alignOffset"];
		portalProps?: MenuPortalProps;
		anchor?: MenuPositionerProps["anchor"];
		ref?: ComponentPropsWithRef<typeof BaseMenu.Popup>["ref"];
		side?: MenuPositionerProps["side"];
		sideOffset?: MenuPositionerProps["sideOffset"];
	}
>;
export type MenuItemVariant = "default" | "destructive";
export type MenuItemProps = Closed<
	Omit<ComponentPropsWithRef<typeof BaseMenu.Item>, "ref"> & {
		inset?: boolean;
		ref?: ComponentPropsWithRef<typeof BaseMenu.Item>["ref"];
		variant?: MenuItemVariant;
	}
>;
export type MenuLinkItemProps = Closed<
	ComponentPropsWithRef<typeof BaseMenu.LinkItem> & {
		inset?: boolean;
		variant?: MenuItemVariant;
	}
>;
export type MenuGroupProps = Closed<
	ComponentPropsWithRef<typeof BaseMenu.Group>
>;
export type MenuGroupLabelProps = Closed<
	ComponentPropsWithRef<typeof BaseMenu.GroupLabel> & {
		inset?: boolean;
	}
>;
export type MenuSeparatorProps = Closed<
	ComponentPropsWithRef<typeof BaseMenu.Separator>
>;
export type MenuShortcutProps = Closed<ComponentPropsWithRef<"kbd">>;
export type MenuCheckboxItemVariant = "default" | "switch";
export type MenuCheckboxItemProps = Closed<
	Omit<ComponentPropsWithRef<typeof BaseMenu.CheckboxItem>, "ref"> & {
		ref?: ComponentPropsWithRef<typeof BaseMenu.CheckboxItem>["ref"];
		variant?: MenuCheckboxItemVariant;
	}
>;
type BaseMenuRadioGroupProps = ComponentPropsWithRef<
	typeof BaseMenu.RadioGroup
>;
export type MenuRadioGroupProps<Value = unknown> = Closed<
	Omit<BaseMenuRadioGroupProps, "defaultValue" | "onValueChange" | "value"> & {
		defaultValue?: Value;
		onValueChange?: (
			value: Value,
			eventDetails: MenuRadioGroupChangeEventDetails
		) => void;
		value?: Value;
	}
>;
type BaseMenuRadioItemProps = ComponentPropsWithRef<typeof BaseMenu.RadioItem>;
export type MenuRadioItemProps<Value = unknown> = Closed<
	Omit<BaseMenuRadioItemProps, "value"> & {
		value: Value;
	}
>;
export type MenuSubProps = Closed<MenuSubmenuRootProps>;
export type MenuSubTriggerProps = Closed<
	Omit<ComponentPropsWithRef<typeof BaseMenu.SubmenuTrigger>, "ref"> & {
		inset?: boolean;
		ref?: ComponentPropsWithRef<typeof BaseMenu.SubmenuTrigger>["ref"];
	}
>;
export type MenuSubPopupProps = Closed<MenuPopupProps>;

const itemVariantStyles = {
	default: menuStyles.itemDefault,
	destructive: menuStyles.itemDestructive,
};

export const MenuCreateHandle = BaseMenu.createHandle;
export const MenuPrimitive = BaseMenu;
export const MenuPortal: (props: MenuPortalProps) => ReactNode =
	BaseMenu.Portal;
export const Menu = BaseMenu.Root;
export const MenuSub = BaseMenu.SubmenuRoot;

function CheckIcon() {
	return (
		<IconCheck
			aria-hidden="true"
			focusable="false"
			{...props(menuStyles.checkIcon)}
			size="1em"
		/>
	);
}

function renderSwitchIndicator(
	indicatorProps: ComponentPropsWithRef<"span">,
	state: MenuCheckboxItemIndicatorState
) {
	return (
		<span
			{...indicatorProps}
			{...props(
				menuStyles.switchIndicator,
				state.checked && menuStyles.switchIndicatorChecked
			)}
		>
			<span
				{...props(
					menuStyles.switchThumb,
					state.checked && menuStyles.switchThumbChecked
				)}
			/>
		</span>
	);
}

function MenuPopupSurface({
	dataSlot = "menu-popup",
	render,
	anchor,
	align,
	alignOffset,
	children,
	portalProps,
	ref: forwardedRef,
	side,
	sideOffset,
	...rest
}: MenuPopupProps & { dataSlot?: string }) {
	return (
		<BaseMenu.Portal {...portalProps}>
			<BaseMenu.Positioner
				align={align}
				alignOffset={alignOffset}
				anchor={anchor}
				data-slot="menu-positioner"
				side={side}
				sideOffset={sideOffset}
				{...props(menuStyles.positioner)}
			>
				<BaseMenu.Popup
					{...rest}
					data-slot={dataSlot}
					ref={forwardedRef}
					render={protectRenderSlot(dataSlot, render)}
					{...props(menuStyles.popup)}
				>
					{/* A long menu scrolls inside, and its edges fade where more rows
					    wait, as in Combobox and Select. */}
					<ScrollArea overscrollContain scrollFade>
						<div {...props(menuStyles.content)}>{children}</div>
					</ScrollArea>
				</BaseMenu.Popup>
			</BaseMenu.Positioner>
		</BaseMenu.Portal>
	);
}

export function MenuTrigger<Payload = unknown>({
	ref: forwardedRef,
	render,
	type,
	...rest
}: MenuTriggerProps<Payload>) {
	return (
		<BaseMenu.Trigger
			{...rest}
			data-slot="menu-trigger"
			ref={forwardedRef}
			render={protectRenderSlot("menu-trigger", render)}
			type={render ? type : (type ?? "button")}
		/>
	);
}

export function MenuPopup({
	align,
	alignOffset,
	side = "bottom",
	sideOffset = 4,
	...rest
}: MenuPopupProps) {
	const contextAlign = useContext(MenuAlignContext);
	return (
		<MenuPopupSurface
			align={align ?? contextAlign ?? "center"}
			alignOffset={alignOffset}
			side={side}
			sideOffset={sideOffset}
			{...rest}
		/>
	);
}

export function MenuItem({
	render,
	children,
	inset = false,
	ref: forwardedRef,
	variant = "default",
	...rest
}: MenuItemProps) {
	return (
		<BaseMenu.Item
			{...rest}
			data-inset={inset || undefined}
			data-slot="menu-item"
			data-variant={variant}
			ref={forwardedRef}
			render={protectRenderSlot("menu-item", render)}
			{...props(
				menuStyles.item,
				itemVariantStyles[variant],
				inset && menuStyles.inset
			)}
		>
			{controlLabel(children)}
		</BaseMenu.Item>
	);
}

export function MenuLinkItem({
	children,
	inset = false,
	ref: forwardedRef,
	render,
	variant = "default",
	...rest
}: MenuLinkItemProps) {
	return (
		<BaseMenu.LinkItem
			{...rest}
			data-inset={inset || undefined}
			data-slot="menu-link-item"
			data-variant={variant}
			ref={forwardedRef}
			render={protectRenderSlot("menu-link-item", render)}
			{...props(
				menuStyles.item,
				itemVariantStyles[variant],
				inset && menuStyles.inset
			)}
		>
			{controlLabel(children)}
		</BaseMenu.LinkItem>
	);
}

export function MenuGroup({
	render,
	ref: forwardedRef,
	...rest
}: MenuGroupProps) {
	return (
		<BaseMenu.Group
			{...rest}
			data-slot="menu-group"
			ref={forwardedRef}
			render={protectRenderSlot("menu-group", render)}
			{...props(menuStyles.group)}
		/>
	);
}

export function MenuGroupLabel({
	render,
	inset = false,
	ref: forwardedRef,
	...rest
}: MenuGroupLabelProps) {
	return (
		<BaseMenu.GroupLabel
			{...rest}
			data-inset={inset || undefined}
			data-slot="menu-label"
			ref={forwardedRef}
			render={protectRenderSlot("menu-label", render)}
			{...props(menuStyles.groupLabel, inset && menuStyles.inset)}
		/>
	);
}

export function MenuSeparator({
	render,
	ref: forwardedRef,
	...rest
}: MenuSeparatorProps) {
	return (
		<BaseMenu.Separator
			{...rest}
			data-slot="menu-separator"
			ref={forwardedRef}
			render={protectRenderSlot("menu-separator", render)}
			{...props(menuStyles.separator)}
		/>
	);
}

export function MenuShortcut({
	children,
	ref: forwardedRef,
	...rest
}: MenuShortcutProps) {
	return (
		// Key order reads left to right in every language.
		<kbd
			dir="ltr"
			{...rest}
			data-slot="menu-shortcut"
			ref={forwardedRef}
			{...mergeProps(props(kbdStyles.group, menuStyles.shortcut), {})}
		>
			{controlLabel(children)}
		</kbd>
	);
}

export function MenuCheckboxItem({
	render,
	children,
	ref: forwardedRef,
	variant = "default",
	...rest
}: MenuCheckboxItemProps) {
	const indicator =
		variant === "switch" ? (
			<BaseMenu.CheckboxItemIndicator
				keepMounted
				render={renderSwitchIndicator}
			/>
		) : (
			<BaseMenu.CheckboxItemIndicator
				keepMounted
				{...props(menuStyles.indicator)}
			>
				<CheckIcon />
			</BaseMenu.CheckboxItemIndicator>
		);
	return (
		<BaseMenu.CheckboxItem
			{...rest}
			data-slot="menu-checkbox-item"
			ref={forwardedRef}
			render={protectRenderSlot("menu-checkbox-item", render)}
			{...props(menuStyles.item, menuStyles.itemDefault)}
		>
			{variant === "default" && indicator}
			{controlLabel(children)}
			{variant === "switch" && indicator}
		</BaseMenu.CheckboxItem>
	);
}

export function MenuRadioGroup<Value = unknown>({
	render,
	...rest
}: MenuRadioGroupProps<Value>) {
	return (
		<BaseMenu.RadioGroup
			{...rest}
			data-slot="menu-radio-group"
			render={protectRenderSlot("menu-radio-group", render)}
		/>
	);
}

export function MenuRadioItem<Value = unknown>({
	render,
	children,
	...rest
}: MenuRadioItemProps<Value>) {
	return (
		<BaseMenu.RadioItem
			{...rest}
			data-slot="menu-radio-item"
			render={protectRenderSlot("menu-radio-item", render)}
			{...props(menuStyles.item, menuStyles.itemDefault)}
		>
			<BaseMenu.RadioItemIndicator keepMounted {...props(menuStyles.indicator)}>
				<span {...props(menuStyles.radioDot)} />
			</BaseMenu.RadioItemIndicator>
			{controlLabel(children)}
		</BaseMenu.RadioItem>
	);
}

function ChevronIcon() {
	const direction = useDirection();
	return direction === "rtl" ? (
		<IconChevronLeft
			aria-hidden="true"
			focusable="false"
			{...props(menuStyles.chevron)}
			size="1em"
		/>
	) : (
		<IconChevronRight
			aria-hidden="true"
			focusable="false"
			{...props(menuStyles.chevron)}
			size="1em"
		/>
	);
}

export function MenuSubTrigger({
	render,
	children,
	inset = false,
	ref: forwardedRef,
	...rest
}: MenuSubTriggerProps) {
	return (
		<BaseMenu.SubmenuTrigger
			{...rest}
			data-inset={inset || undefined}
			data-slot="menu-sub-trigger"
			ref={forwardedRef}
			render={protectRenderSlot("menu-sub-trigger", render)}
			{...props(
				menuStyles.item,
				menuStyles.itemDefault,
				menuStyles.subTrigger,
				inset && menuStyles.inset
			)}
		>
			{controlLabel(children)}
			<ChevronIcon />
		</BaseMenu.SubmenuTrigger>
	);
}

export function MenuSubPopup({
	align = "start",
	alignOffset,
	side = "inline-end",
	sideOffset = 0,
	...rest
}: MenuSubPopupProps) {
	return (
		<MenuPopupSurface
			align={align}
			alignOffset={alignOffset ?? (align === "center" ? undefined : -5)}
			dataSlot="menu-sub-content"
			side={side}
			sideOffset={sideOffset}
			{...rest}
		/>
	);
}
