"use client";

import {
	Separator as BaseSeparator,
	type SeparatorProps as BaseSeparatorProps,
} from "@base-ui/react/separator";
import {
	Toggle as BaseToggle,
	type ToggleProps as BaseToggleProps,
} from "@base-ui/react/toggle";
import {
	ToggleGroup as BaseToggleGroup,
	type ToggleGroupProps as BaseToggleGroupProps,
} from "@base-ui/react/toggle-group";
import { props } from "@stylexjs/stylex";
import { createContext, useContext } from "react";
import { controlLabel } from "../../control-label";
import { buttonStyles } from "../button/button.styles";
import { ToolbarOrientationContext } from "../toolbar/toolbar-context";
import { toggleStyles } from "./toggle.styles";

type AccessibleIconName =
	| { "aria-label": string; "aria-labelledby"?: string }
	| { "aria-label"?: string; "aria-labelledby": string };

export type ToggleVariant = "default" | "outline";
export type ToggleSize =
	| "default"
	| "icon"
	| "icon-lg"
	| "icon-sm"
	| "lg"
	| "sm";

type SharedToggleProps<Value extends string> = Omit<
	BaseToggleProps<Value>,
	"className" | "nativeButton" | "ref" | "render" | "style"
> & {
	ref?: BaseToggleProps<Value>["ref"];
	variant?: ToggleVariant;
};

export type ToggleProps<Value extends string = string> =
	SharedToggleProps<Value> &
		(
			| {
					size?: Exclude<ToggleSize, "icon" | "icon-lg" | "icon-sm">;
			  }
			| ({
					size: "icon" | "icon-lg" | "icon-sm";
			  } & AccessibleIconName)
		);

export type ToggleGroupProps<Value extends string = string> = Omit<
	BaseToggleGroupProps<Value>,
	"className" | "ref" | "render" | "style"
> & {
	ref?: BaseToggleGroupProps<Value>["ref"];
	size?: ToggleSize;
	variant?: ToggleVariant;
};

interface ToggleContextValue {
	orientation: "horizontal" | "vertical";
	size: ToggleSize;
	variant: ToggleVariant;
}

const defaultToggleContext: ToggleContextValue = {
	orientation: "horizontal",
	size: "default",
	variant: "default",
};
const ToggleContext = createContext(defaultToggleContext);

const sizeStyles = {
	default: buttonStyles.defaultSize,
	icon: buttonStyles.icon,
	"icon-lg": buttonStyles["icon-lg"],
	"icon-sm": buttonStyles["icon-sm"],
	lg: buttonStyles.lg,
	sm: buttonStyles.sm,
};

const orientationStyles = {
	horizontal: toggleStyles.horizontal,
	vertical: toggleStyles.vertical,
};

export function Toggle<Value extends string = string>({
	children,
	ref: forwardedRef = undefined,
	size,
	type,
	variant,
	...rest
}: ToggleProps<Value>) {
	const group = useContext(ToggleContext);
	const resolvedSize = size ?? group.size;
	const resolvedVariant = variant ?? group.variant;
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "style");
	Reflect.deleteProperty(rest, "render");
	Reflect.deleteProperty(rest, "nativeButton");

	return (
		<BaseToggle
			{...rest}
			data-size={resolvedSize}
			data-slot="toggle"
			data-variant={resolvedVariant}
			ref={forwardedRef}
			type={type ?? "button"}
			{...props(
				toggleStyles.base,
				resolvedVariant === "outline" && toggleStyles.outline,
				sizeStyles[resolvedSize],
				group.variant === "outline" &&
					resolvedVariant === "outline" &&
					(group.orientation === "horizontal"
						? toggleStyles.joinedHorizontal
						: toggleStyles.joinedVertical),
				toggleStyles.content
			)}
		>
			{controlLabel(children)}
		</BaseToggle>
	);
}

export function ToggleGroup<Value extends string = string>({
	children,
	orientation,
	ref: forwardedRef = undefined,
	size = "default",
	variant = "default",
	...rest
}: ToggleGroupProps<Value>) {
	const toolbarOrientation = useContext(ToolbarOrientationContext);
	const resolvedOrientation = orientation ?? toolbarOrientation ?? "horizontal";
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "style");
	Reflect.deleteProperty(rest, "render");
	return (
		<ToggleContext value={{ orientation: resolvedOrientation, size, variant }}>
			<BaseToggleGroup
				{...rest}
				data-size={size}
				data-slot="toggle-group"
				data-variant={variant}
				orientation={resolvedOrientation}
				ref={forwardedRef}
				{...props(
					toggleStyles.group,
					orientationStyles[resolvedOrientation],
					variant === "outline" && toggleStyles.groupOutline,
					(size === "sm" || size === "icon-sm") && toggleStyles.smallGroup,
					toolbarOrientation !== null && toggleStyles.embeddedGroup
				)}
			>
				{children}
			</BaseToggleGroup>
		</ToggleContext>
	);
}

export const ToggleGroupItem = Toggle;
export type ToggleGroupItemProps<Value extends string = string> =
	ToggleProps<Value>;
export type ToggleGroupSeparatorProps = Omit<
	BaseSeparatorProps,
	"className" | "style" | "render"
>;

export function ToggleGroupSeparator({
	orientation = "vertical",
	...rest
}: ToggleGroupSeparatorProps) {
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "style");
	Reflect.deleteProperty(rest, "render");
	return (
		<BaseSeparator
			{...rest}
			data-slot="toggle-group-separator"
			orientation={orientation}
			{...props(
				toggleStyles.separator,
				orientation === "horizontal" && toggleStyles.horizontalSeparator
			)}
		/>
	);
}
