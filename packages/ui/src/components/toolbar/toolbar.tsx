"use client";

import {
	Toolbar as BaseToolbar,
	type ToolbarButtonProps as BaseToolbarButtonProps,
	type ToolbarGroupProps as BaseToolbarGroupProps,
	type ToolbarInputProps as BaseToolbarInputProps,
	type ToolbarLinkProps as BaseToolbarLinkProps,
	type ToolbarRootProps as BaseToolbarRootProps,
	type ToolbarSeparatorProps as BaseToolbarSeparatorProps,
} from "@base-ui/react/toolbar";
import { props } from "@stylexjs/stylex";
import { type ReactElement, type ReactNode, useContext } from "react";
import type { Closed } from "../../closed";
import { controlLabel } from "../../control-label";
import { protectRenderSlot } from "../../render-utils";
import type { ButtonProps } from "../button/button";
import { Button } from "../button/button";
import { Input } from "../input/input";
import { toolbarStyles } from "./toolbar.styles";
import { ToolbarOrientationContext } from "./toolbar-context";

type ClosedProps<T> = Omit<Closed<T>, "data-slot" | "ref" | "render" | "role">;

function stripStyleProps<T extends object>(target: T): T {
	Reflect.deleteProperty(target, "className");
	Reflect.deleteProperty(target, "data-slot");
	Reflect.deleteProperty(target, "style");
	return target;
}

function stripClosedProps<T extends object>(target: T): T {
	const safe = stripStyleProps(target);
	Reflect.deleteProperty(safe, "render");
	Reflect.deleteProperty(safe, "role");
	return safe;
}

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
	? Omit<T, K>
	: never;

export type ToolbarProps = ClosedProps<BaseToolbarRootProps> & {
	ref?: BaseToolbarRootProps["ref"];
};

export type ToolbarGroupProps = ClosedProps<BaseToolbarGroupProps> & {
	ref?: BaseToolbarGroupProps["ref"];
};

export type ToolbarLinkProps = ClosedProps<BaseToolbarLinkProps> & {
	ref?: BaseToolbarLinkProps["ref"];
};

export type ToolbarSeparatorProps = Omit<
	Closed<BaseToolbarSeparatorProps>,
	"data-slot" | "ref" | "render" | "role"
> & {
	ref?: BaseToolbarSeparatorProps["ref"];
};

type ToolbarButtonBaseProps = Omit<
	Closed<BaseToolbarButtonProps>,
	"children" | "data-slot" | "ref" | "render"
> & {
	children?: ReactNode;
	ref?: BaseToolbarButtonProps["ref"];
};

export type ToolbarButtonProps = ToolbarButtonBaseProps &
	(
		| (DistributiveOmit<
				ButtonProps,
				"children" | "nativeButton" | "ref" | "render"
		  > & {
				render?: never;
		  })
		| { render: ReactElement }
	);

export function Toolbar({
	children,
	orientation = "horizontal",
	ref: forwardedRef,
	...rest
}: ToolbarProps) {
	return (
		<ToolbarOrientationContext value={orientation}>
			<BaseToolbar.Root
				{...stripClosedProps(rest)}
				data-slot="toolbar"
				orientation={orientation}
				ref={forwardedRef}
				{...props(
					toolbarStyles.root,
					orientation === "horizontal"
						? toolbarStyles.horizontal
						: toolbarStyles.vertical
				)}
			>
				{children}
			</BaseToolbar.Root>
		</ToolbarOrientationContext>
	);
}

export function ToolbarButton(toolbarButtonProps: ToolbarButtonProps) {
	const { children, ref: forwardedRef, render, ...rest } = toolbarButtonProps;
	const safeProps = stripStyleProps(rest);

	if (toolbarButtonProps.render) {
		return (
			<BaseToolbar.Button
				{...safeProps}
				data-slot="toolbar-button"
				ref={forwardedRef}
				render={protectRenderSlot("toolbar-button", render)}
			>
				{children}
			</BaseToolbar.Button>
		);
	}

	const defaultButtonProps = toolbarButtonProps;
	const { loading, size, variant, ...buttonProps } = defaultButtonProps;
	const buttonRenderProps = {
		"aria-label": defaultButtonProps["aria-label"],
		"aria-labelledby": defaultButtonProps["aria-labelledby"],
		focusableWhenDisabled: defaultButtonProps.focusableWhenDisabled ?? true,
		loading,
		size: size ?? "default",
		variant: variant ?? "ghost",
	} as ButtonProps;

	return (
		<BaseToolbar.Button
			{...stripStyleProps(buttonProps)}
			data-slot="toolbar-button"
			ref={forwardedRef}
			render={<Button {...buttonRenderProps} />}
		>
			{children}
		</BaseToolbar.Button>
	);
}

export function ToolbarGroup({
	children,
	ref: forwardedRef,
	...rest
}: ToolbarGroupProps) {
	const orientation = useContext(ToolbarOrientationContext);
	return (
		<BaseToolbar.Group
			{...stripClosedProps(rest)}
			data-slot="toolbar-group"
			ref={forwardedRef}
			{...props(
				toolbarStyles.group,
				orientation === "vertical" && toolbarStyles.vertical
			)}
		>
			{children}
		</BaseToolbar.Group>
	);
}

export function ToolbarLink({
	children,
	ref: forwardedRef,
	...rest
}: ToolbarLinkProps) {
	return (
		<BaseToolbar.Link
			{...stripClosedProps(rest)}
			data-slot="toolbar-link"
			ref={forwardedRef}
			{...props(toolbarStyles.link)}
		>
			{controlLabel(children)}
		</BaseToolbar.Link>
	);
}

export function ToolbarSeparator({
	orientation,
	ref: forwardedRef,
	...rest
}: ToolbarSeparatorProps) {
	const toolbarOrientation = useContext(ToolbarOrientationContext);
	const resolvedOrientation =
		orientation ??
		(toolbarOrientation === "horizontal" ? "vertical" : "horizontal");

	return (
		<BaseToolbar.Separator
			{...stripClosedProps(rest)}
			data-slot="toolbar-separator"
			orientation={resolvedOrientation}
			ref={forwardedRef}
			{...props(toolbarStyles.separator)}
		/>
	);
}

export type ToolbarInputProps = ClosedProps<BaseToolbarInputProps> & {
	ref?: BaseToolbarInputProps["ref"];
};

export function ToolbarInput({ ref, size, ...rest }: ToolbarInputProps) {
	return (
		<BaseToolbar.Input
			{...stripClosedProps(rest)}
			data-slot="toolbar-input"
			ref={ref}
			render={<Input render={<input size={size} />} />}
		/>
	);
}
