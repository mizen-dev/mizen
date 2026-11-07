"use client";

import { NavigationMenu as BaseNavigationMenu } from "@base-ui/react/navigation-menu";
import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef, ReactNode } from "react";
import type { Closed } from "../../closed";
import { controlLabel } from "../../control-label";
import { IconChevronDown } from "../../icons";
import { protectRenderSlot } from "../../render-utils";
import { popoverStyles } from "../popover/popover.styles";
import { navigationMenuStyles } from "./navigation-menu.styles";

type Part<T> = Omit<Closed<T>, "data-slot" | "render" | "role">;
type BaseRootProps = ComponentPropsWithRef<typeof BaseNavigationMenu.Root>;
type BaseListProps = ComponentPropsWithRef<typeof BaseNavigationMenu.List>;
type BaseItemProps = ComponentPropsWithRef<typeof BaseNavigationMenu.Item>;
type BaseTriggerProps = ComponentPropsWithRef<
	typeof BaseNavigationMenu.Trigger
>;
type BaseContentProps = ComponentPropsWithRef<
	typeof BaseNavigationMenu.Content
>;
type BaseLinkProps = ComponentPropsWithRef<typeof BaseNavigationMenu.Link>;
type BasePortalProps = Closed<
	ComponentPropsWithRef<typeof BaseNavigationMenu.Portal>
>;
type BasePositionerProps = ComponentPropsWithRef<
	typeof BaseNavigationMenu.Positioner
>;
type BasePopupProps = ComponentPropsWithRef<typeof BaseNavigationMenu.Popup>;

export type NavigationMenuProps = Omit<
	Part<BaseRootProps>,
	"aria-label" | "orientation"
> & { "aria-label"?: string };
export type NavigationMenuListProps = Part<BaseListProps>;
export type NavigationMenuItemProps = Part<BaseItemProps>;
export type NavigationMenuTriggerProps = Omit<
	Closed<BaseTriggerProps>,
	"data-slot" | "role"
>;
export type NavigationMenuContentProps = Omit<
	Closed<BaseContentProps>,
	"data-slot" | "role"
>;
export type NavigationMenuLinkProps = Omit<
	Closed<BaseLinkProps>,
	"data-slot" | "role"
> & {
	/** One line under the label, for links in a menu panel. */
	description?: ReactNode;
};
export type NavigationMenuPopupProps = Omit<
	Part<BasePopupProps>,
	"children"
> & {
	align?: BasePositionerProps["align"];
	alignOffset?: BasePositionerProps["alignOffset"];
	collisionPadding?: BasePositionerProps["collisionPadding"];
	portalProps?: Omit<Part<BasePortalProps>, "children">;
	side?: BasePositionerProps["side"];
	sideOffset?: BasePositionerProps["sideOffset"];
};

function stripProtectedProps(rest: Record<string, unknown>) {
	for (const name of ["className", "data-slot", "render", "role", "style"]) {
		Reflect.deleteProperty(rest, name);
	}
}

function ChevronDown() {
	return <IconChevronDown aria-hidden="true" focusable="false" size="1rem" />;
}

export function NavigationMenu({
	"aria-label": ariaLabel = "Navigation",
	ref: forwardedRef,
	...rest
}: NavigationMenuProps) {
	stripProtectedProps(rest);
	Reflect.deleteProperty(rest, "orientation");
	return (
		<BaseNavigationMenu.Root
			{...rest}
			aria-label={ariaLabel}
			data-slot="navigation-menu"
			orientation="horizontal"
			ref={forwardedRef}
			{...props(navigationMenuStyles.root)}
		/>
	);
}

export function NavigationMenuList({
	ref: forwardedRef,
	...rest
}: NavigationMenuListProps) {
	stripProtectedProps(rest);
	return (
		<BaseNavigationMenu.List
			{...rest}
			data-slot="navigation-menu-list"
			ref={forwardedRef}
			{...props(navigationMenuStyles.list)}
		/>
	);
}

export function NavigationMenuItem({
	ref: forwardedRef,
	...rest
}: NavigationMenuItemProps) {
	stripProtectedProps(rest);
	return (
		<BaseNavigationMenu.Item
			{...rest}
			data-slot="navigation-menu-item"
			ref={forwardedRef}
			{...props(navigationMenuStyles.item)}
		/>
	);
}

export function NavigationMenuTrigger({
	children,
	disabled,
	ref: forwardedRef,
	render,
	type,
	...rest
}: NavigationMenuTriggerProps) {
	stripProtectedProps(rest);
	const triggerStyles = props(
		navigationMenuStyles.link,
		navigationMenuStyles.trigger,
		!disabled && navigationMenuStyles.interactive
	);
	return (
		<BaseNavigationMenu.Trigger
			{...rest}
			data-slot="navigation-menu-trigger"
			disabled={disabled}
			ref={forwardedRef}
			render={protectRenderSlot("navigation-menu-trigger", render)}
			type={render ? type : (type ?? "button")}
			{...triggerStyles}
		>
			{controlLabel(children)}
			<BaseNavigationMenu.Icon
				data-slot="navigation-menu-icon"
				{...props(navigationMenuStyles.icon)}
			>
				<ChevronDown />
			</BaseNavigationMenu.Icon>
		</BaseNavigationMenu.Trigger>
	);
}

export function NavigationMenuContent({
	ref: forwardedRef,
	render,
	...rest
}: NavigationMenuContentProps) {
	stripProtectedProps(rest);
	const contentStyles = props(navigationMenuStyles.content);
	return (
		<BaseNavigationMenu.Content
			{...rest}
			data-slot="navigation-menu-content"
			ref={forwardedRef}
			render={protectRenderSlot("navigation-menu-content", render)}
			{...contentStyles}
		/>
	);
}

export function NavigationMenuLink({
	children,
	description,
	active,
	ref: forwardedRef,
	render,
	...rest
}: NavigationMenuLinkProps) {
	stripProtectedProps(rest);
	const linkStyles = props(
		navigationMenuStyles.link,
		navigationMenuStyles.interactive,
		description !== undefined && navigationMenuStyles.linkWithDescription,
		active && navigationMenuStyles.active
	);
	return (
		<BaseNavigationMenu.Link
			{...rest}
			active={active}
			aria-current={active ? "page" : undefined}
			data-slot="navigation-menu-link"
			ref={forwardedRef}
			render={protectRenderSlot("navigation-menu-link", render, {
				"aria-current": active ? "page" : undefined,
			})}
			{...linkStyles}
		>
			{description === undefined ? (
				controlLabel(children)
			) : (
				<>
					<span {...props(navigationMenuStyles.linkTitle)}>{children}</span>
					<span {...props(navigationMenuStyles.linkDescription)}>
						{description}
					</span>
				</>
			)}
		</BaseNavigationMenu.Link>
	);
}

export function NavigationMenuPopup({
	align = "start",
	alignOffset,
	collisionPadding = 12,
	portalProps,
	ref: forwardedRef,
	side = "bottom",
	sideOffset = 8,
	...rest
}: NavigationMenuPopupProps) {
	const { ...safePortalProps } = (portalProps ?? {}) as BasePortalProps;
	stripProtectedProps(rest);
	stripProtectedProps(safePortalProps);
	return (
		<BaseNavigationMenu.Portal {...safePortalProps}>
			<BaseNavigationMenu.Positioner
				align={align}
				alignOffset={alignOffset}
				collisionPadding={collisionPadding}
				side={side}
				sideOffset={sideOffset}
				{...props(popoverStyles.positioner, navigationMenuStyles.positioner)}
			>
				<BaseNavigationMenu.Popup
					{...rest}
					data-slot="navigation-menu-popup"
					ref={forwardedRef}
					{...props(popoverStyles.popup, navigationMenuStyles.popup)}
				>
					<BaseNavigationMenu.Viewport
						data-slot="navigation-menu-viewport"
						{...props(navigationMenuStyles.viewport)}
					/>
				</BaseNavigationMenu.Popup>
			</BaseNavigationMenu.Positioner>
		</BaseNavigationMenu.Portal>
	);
}
