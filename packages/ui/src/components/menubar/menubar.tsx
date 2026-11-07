"use client";

import { Menu as BaseMenu } from "@base-ui/react/menu";
import { Menubar as BaseMenubar } from "@base-ui/react/menubar";
import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import type { Closed } from "../../closed";
import { controlLabel } from "../../control-label";
import { protectRenderSlot } from "../../render-utils";
import { typeRoles } from "../../styles/typography.styles";
import type { MenuTriggerProps } from "../menu/menu";
import { MenuAlignContext } from "../menu/menu-align-context";
import { menubarStyles } from "./menubar.styles";

type BaseMenubarProps = ComponentPropsWithRef<typeof BaseMenubar>;

type Part<T> = Omit<Closed<T>, "data-slot" | "role">;

export type MenubarProps = Omit<Part<BaseMenubarProps>, "aria-orientation"> & {
	ref?: BaseMenubarProps["ref"];
};
export type MenubarTriggerProps<Payload = unknown> = Omit<
	Closed<MenuTriggerProps<Payload>>,
	"data-slot" | "role"
>;

function stripReservedProps(rest: Record<string, unknown>) {
	for (const name of [
		"aria-orientation",
		"className",
		"data-slot",
		"role",
		"style",
	]) {
		Reflect.deleteProperty(rest, name);
	}
}

export function Menubar({
	children,
	orientation = "horizontal",
	ref: forwardedRef,
	render,
	...rest
}: MenubarProps) {
	stripReservedProps(rest);
	return (
		<BaseMenubar
			{...rest}
			aria-orientation={orientation}
			data-slot="menubar"
			orientation={orientation}
			ref={forwardedRef}
			render={protectRenderSlot("menubar", render, {
				"aria-orientation": orientation,
				role: "menubar",
			})}
			{...props(menubarStyles.root)}
		>
			<MenuAlignContext.Provider value="start">
				{children}
			</MenuAlignContext.Provider>
		</BaseMenubar>
	);
}

export function MenubarTrigger<Payload = unknown>({
	children,
	ref: forwardedRef,
	render,
	type,
	...rest
}: MenubarTriggerProps<Payload>) {
	stripReservedProps(rest);
	return (
		<BaseMenu.Trigger
			{...rest}
			data-slot="menubar-trigger"
			ref={forwardedRef}
			render={protectRenderSlot("menubar-trigger", render, {
				role: "menuitem",
			})}
			type={render ? type : (type ?? "button")}
			{...props(menubarStyles.trigger, typeRoles.ui)}
		>
			{controlLabel(children)}
		</BaseMenu.Trigger>
	);
}
