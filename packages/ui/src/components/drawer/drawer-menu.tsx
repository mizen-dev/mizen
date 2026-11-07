"use client";

import type { CheckboxIndicatorState } from "@base-ui/react/checkbox";
import { Checkbox } from "@base-ui/react/checkbox";
import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import { mergeProps } from "@base-ui/react/merge-props";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { useRender } from "@base-ui/react/use-render";
import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import type { Closed } from "../../closed";
import { controlLabel } from "../../control-label";
import { IconCheck, IconChevronRight } from "../../icons";
import { menuStyles } from "../menu/menu.styles";
import { drawerMenuStyles } from "./drawer-menu.styles";

export type DrawerMenuProps = Closed<useRender.ComponentProps<"nav">>;
export type DrawerMenuItemProps = Closed<
	useRender.ComponentProps<"button"> & {
		variant?: "default" | "destructive";
	}
>;
export type DrawerMenuSeparatorProps = Closed<useRender.ComponentProps<"div">>;
export type DrawerMenuGroupProps = Closed<useRender.ComponentProps<"div">>;
export type DrawerMenuGroupLabelProps = Closed<useRender.ComponentProps<"div">>;
export type DrawerMenuTriggerProps<Payload = unknown> = Closed<
	BaseDrawer.Trigger.Props<Payload>
>;
export type DrawerMenuCheckboxItemProps = Closed<
	Checkbox.Root.Props & {
		variant?: "default" | "switch";
	}
>;
export type DrawerMenuRadioGroupProps = Closed<RadioGroup.Props>;
export type DrawerMenuRadioItemProps = Closed<
	Radio.Root.Props & { value: string }
>;

export function DrawerMenu({ render, ref, ...rest }: DrawerMenuProps) {
	return useRender({
		defaultTagName: "nav",
		props: mergeProps(props(menuStyles.group), rest, {
			"data-slot": "drawer-menu",
		}),
		ref,
		render,
	});
}

export function DrawerMenuItem({
	render,
	ref,
	children,
	variant = "default",
	...rest
}: DrawerMenuItemProps) {
	return useRender({
		defaultTagName: "button",
		props: mergeProps(
			{
				type: "button",
				...props(
					menuStyles.item,
					drawerMenuStyles.item,
					variant === "destructive"
						? menuStyles.itemDestructive
						: menuStyles.itemDefault
				),
			},
			rest,
			{
				children: controlLabel(children),
				"data-slot": "drawer-menu-item",
				"data-variant": variant,
			}
		),
		ref,
		render,
	});
}

export function DrawerMenuSeparator({
	render,
	ref,
	...rest
}: DrawerMenuSeparatorProps) {
	return useRender({
		defaultTagName: "div",
		props: mergeProps(
			{ ...props(menuStyles.separator), role: "separator" },
			rest,
			{ "data-slot": "drawer-menu-separator" }
		),
		ref,
		render,
	});
}

export function DrawerMenuGroup({
	render,
	ref,
	...rest
}: DrawerMenuGroupProps) {
	return useRender({
		defaultTagName: "div",
		props: mergeProps(props(menuStyles.group), rest, {
			"data-slot": "drawer-menu-group",
		}),
		ref,
		render,
	});
}

export function DrawerMenuGroupLabel({
	render,
	ref,
	...rest
}: DrawerMenuGroupLabelProps) {
	return useRender({
		defaultTagName: "div",
		props: mergeProps(props(menuStyles.groupLabel), rest, {
			"data-slot": "drawer-menu-group-label",
		}),
		ref,
		render,
	});
}

export function DrawerMenuTrigger<Payload = unknown>({
	children,
	...rest
}: DrawerMenuTriggerProps<Payload>) {
	return (
		<BaseDrawer.Trigger
			{...rest}
			data-slot="drawer-menu-trigger"
			{...props(menuStyles.item, menuStyles.itemDefault, drawerMenuStyles.item)}
		>
			{controlLabel(children)}
			<IconChevronRight aria-hidden="true" {...props(menuStyles.chevron)} />
		</BaseDrawer.Trigger>
	);
}

export function DrawerMenuCheckboxItem({
	children,
	variant = "default",
	...rest
}: DrawerMenuCheckboxItemProps) {
	return (
		<Checkbox.Root
			{...rest}
			data-slot="drawer-menu-checkbox-item"
			{...props(menuStyles.item, menuStyles.itemDefault, drawerMenuStyles.item)}
		>
			{variant === "switch" ? (
				<>
					{controlLabel(children)}
					<Checkbox.Indicator keepMounted render={renderSwitchIndicator} />
				</>
			) : (
				<>
					<Checkbox.Indicator keepMounted {...props(menuStyles.indicator)}>
						<IconCheck aria-hidden="true" {...props(menuStyles.checkIcon)} />
					</Checkbox.Indicator>
					{controlLabel(children)}
				</>
			)}
		</Checkbox.Root>
	);
}

export function DrawerMenuRadioGroup({ ...rest }: DrawerMenuRadioGroupProps) {
	return (
		<RadioGroup
			{...rest}
			data-slot="drawer-menu-radio-group"
			{...props(menuStyles.group)}
		/>
	);
}

export function DrawerMenuRadioItem({
	children,
	...rest
}: DrawerMenuRadioItemProps) {
	return (
		<Radio.Root
			{...rest}
			data-slot="drawer-menu-radio-item"
			{...props(menuStyles.item, menuStyles.itemDefault, drawerMenuStyles.item)}
		>
			<Radio.Indicator keepMounted {...props(menuStyles.indicator)}>
				<IconCheck aria-hidden="true" {...props(menuStyles.checkIcon)} />
			</Radio.Indicator>
			{controlLabel(children)}
		</Radio.Root>
	);
}

function renderSwitchIndicator(
	indicatorProps: ComponentPropsWithRef<"span">,
	state: CheckboxIndicatorState
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
