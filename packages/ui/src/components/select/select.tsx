"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import type { SelectRootProps } from "@base-ui/react/select";
import { Select as BaseSelect } from "@base-ui/react/select";
import { useRender } from "@base-ui/react/use-render";
import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { controlLabel } from "../../control-label";
import { IconCheck, IconChevronDown, IconSelector } from "../../icons";
import { selectStyles } from "./select.styles";

type Closed<T> = Omit<T, "className" | "style" | "render">;
type SelectPositionerProps = ComponentPropsWithRef<
	typeof BaseSelect.Positioner
>;
type SelectPortalProps = Omit<
	ComponentPropsWithRef<typeof BaseSelect.Portal>,
	"className" | "style"
>;

export type SelectProps<
	Value = unknown,
	Multiple extends boolean | undefined = false,
> = Closed<SelectRootProps<Value, Multiple>>;
export type SelectLabelProps = Closed<
	ComponentPropsWithRef<typeof BaseSelect.Label>
>;
export type SelectTriggerProps = Closed<
	Omit<
		Closed<ComponentPropsWithRef<typeof BaseSelect.Trigger>>,
		"children" | "disabled" | "ref"
	> & {
		children?: ReactNode;
		disabled?: boolean;
		invalid?: boolean;
		ref?: ComponentPropsWithRef<typeof BaseSelect.Trigger>["ref"];
		size?: SelectSize;
	}
>;
export type SelectValueProps = Closed<
	Omit<
		Closed<ComponentPropsWithRef<typeof BaseSelect.Value>>,
		"children" | "placeholder" | "ref"
	> & {
		children?: ReactNode;
		placeholder?: ReactNode;
		ref?: ComponentPropsWithRef<typeof BaseSelect.Value>["ref"];
	}
>;
export type SelectPopupProps = Closed<
	Omit<
		Closed<ComponentPropsWithRef<typeof BaseSelect.Popup>>,
		"children" | "ref"
	> & {
		align?: SelectPositionerProps["align"];
		alignItemWithTrigger?: SelectPositionerProps["alignItemWithTrigger"];
		children?: ReactNode;
		container?: SelectPortalProps["container"];
		ref?: ComponentPropsWithRef<typeof BaseSelect.Popup>["ref"];
		sideOffset?: SelectPositionerProps["sideOffset"];
	}
>;
export type SelectItemProps = Closed<
	Omit<
		Closed<ComponentPropsWithRef<typeof BaseSelect.Item>>,
		"children" | "ref"
	> & {
		children?: ReactNode;
		ref?: ComponentPropsWithRef<typeof BaseSelect.Item>["ref"];
	}
>;
export type SelectItemIconProps = Closed<
	Omit<ComponentPropsWithRef<"span">, "children" | "className" | "style"> & {
		children: ReactNode;
	}
>;
export type SelectGroupProps = Closed<
	ComponentPropsWithRef<typeof BaseSelect.Group>
>;
export type SelectGroupLabelProps = Closed<
	ComponentPropsWithRef<typeof BaseSelect.GroupLabel>
>;
export type SelectSeparatorProps = Closed<
	ComponentPropsWithRef<typeof BaseSelect.Separator>
>;
export type SelectSize = "default" | "lg" | "sm";

const sizeStyles = {
	default: selectStyles.sizeDefault,
	lg: selectStyles.sizeLg,
	sm: selectStyles.sizeSm,
};

function ChevronIcon() {
	return (
		<IconChevronDown
			aria-hidden="true"
			focusable="false"
			{...props(selectStyles.chevron)}
			size="1em"
		/>
	);
}

function CheckIcon() {
	return (
		<IconCheck
			aria-hidden="true"
			focusable="false"
			{...props(selectStyles.checkIcon)}
			size="1em"
		/>
	);
}

export function Select<Value, Multiple extends boolean | undefined = false>(
	rootProps: SelectProps<Value, Multiple>
) {
	return <BaseSelect.Root {...rootProps} />;
}

export function SelectLabel({
	children,
	ref: forwardedRef,
	...rest
}: SelectLabelProps) {
	return (
		<BaseSelect.Label
			{...rest}
			ref={forwardedRef}
			{...props(selectStyles.label)}
		>
			{children}
		</BaseSelect.Label>
	);
}

export interface SelectButtonProps
	extends Omit<useRender.ComponentProps<"button">, "className" | "style"> {
	size?: SelectSize;
}

export function SelectButton({
	children,
	size = "default",
	render,
	...rest
}: SelectButtonProps) {
	const defaults = {
		...props(selectStyles.trigger, sizeStyles[size]),
		children: (
			<>
				{controlLabel(children)}
				<IconSelector
					aria-hidden="true"
					focusable="false"
					size="1em"
					{...props(selectStyles.chevron)}
				/>
			</>
		),
		"data-slot": "select-button",
		type: render ? undefined : ("button" as const),
	};
	return useRender({
		defaultTagName: "button",
		props: mergeProps<"button">(defaults, rest),
		render,
	});
}

export function SelectTrigger({
	children,
	disabled = false,
	invalid = false,
	ref: forwardedRef,
	size = "default",
	...rest
}: SelectTriggerProps) {
	return (
		<BaseSelect.Trigger
			{...rest}
			aria-invalid={invalid || undefined}
			disabled={disabled}
			ref={forwardedRef}
			{...props(selectStyles.trigger, sizeStyles[size])}
		>
			{controlLabel(children)}
			<BaseSelect.Icon {...props(selectStyles.icon)}>
				<ChevronIcon />
			</BaseSelect.Icon>
		</BaseSelect.Trigger>
	);
}

export function SelectValue({
	children,
	placeholder,
	ref: forwardedRef,
	...rest
}: SelectValueProps) {
	return (
		<BaseSelect.Value
			{...rest}
			placeholder={controlLabel(placeholder)}
			ref={forwardedRef}
			render={renderValue}
			{...props(selectStyles.value)}
		>
			{controlLabel(children)}
		</BaseSelect.Value>
	);
}

function renderValue({
	children,
	...attributes
}: ComponentPropsWithRef<"span">) {
	return <span {...attributes}>{controlLabel(children)}</span>;
}

export function SelectPopup({
	align,
	alignItemWithTrigger,
	children,
	container,
	ref: forwardedRef,
	sideOffset = 4,
	...rest
}: SelectPopupProps) {
	return (
		<BaseSelect.Portal container={container}>
			<BaseSelect.Positioner
				align={align}
				alignItemWithTrigger={alignItemWithTrigger}
				sideOffset={sideOffset}
				{...props(selectStyles.positioner)}
			>
				<BaseSelect.Popup
					{...rest}
					ref={forwardedRef}
					{...props(selectStyles.popup)}
				>
					<BaseSelect.List {...props(selectStyles.list)}>
						{children}
					</BaseSelect.List>
				</BaseSelect.Popup>
			</BaseSelect.Positioner>
		</BaseSelect.Portal>
	);
}

export function SelectItem({
	children,
	ref: forwardedRef,
	...rest
}: SelectItemProps) {
	return (
		<BaseSelect.Item {...rest} ref={forwardedRef} {...props(selectStyles.item)}>
			<BaseSelect.ItemText {...props(selectStyles.itemText)}>
				{controlLabel(children)}
			</BaseSelect.ItemText>
			<BaseSelect.ItemIndicator
				keepMounted
				{...props(selectStyles.itemIndicator)}
			>
				<CheckIcon />
			</BaseSelect.ItemIndicator>
		</BaseSelect.Item>
	);
}

export function SelectItemIcon({
	children,
	ref: forwardedRef,
	...rest
}: SelectItemIconProps) {
	return (
		<span
			{...rest}
			aria-hidden="true"
			data-slot="select-item-icon"
			ref={forwardedRef}
			{...props(selectStyles.itemIcon)}
		>
			{children}
		</span>
	);
}

export function SelectGroup({
	children,
	ref: forwardedRef,
	...rest
}: SelectGroupProps) {
	return (
		<BaseSelect.Group
			{...rest}
			ref={forwardedRef}
			{...props(selectStyles.group)}
		>
			{children}
		</BaseSelect.Group>
	);
}

export function SelectGroupLabel({
	children,
	ref: forwardedRef,
	...rest
}: SelectGroupLabelProps) {
	return (
		<BaseSelect.GroupLabel
			{...rest}
			ref={forwardedRef}
			{...props(selectStyles.groupLabel)}
		>
			{children}
		</BaseSelect.GroupLabel>
	);
}

export function SelectSeparator({
	ref: forwardedRef,
	...rest
}: SelectSeparatorProps) {
	return (
		<BaseSelect.Separator
			{...rest}
			ref={forwardedRef}
			{...props(selectStyles.separator)}
		/>
	);
}
