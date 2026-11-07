"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { props } from "@stylexjs/stylex";
import type { ReactElement, ReactNode } from "react";
import { protectRenderSlot as protectSlot } from "../../render-utils";
import { fieldStyles } from "../field/field.styles";
import type {
	ComboboxClearProps,
	ComboboxInputProps,
	ComboboxSize,
	ComboboxTriggerProps,
} from "./combobox.types";
import { ChevronsUpDownIcon, XIcon } from "./combobox-context";
import { comboboxFieldStyles } from "./combobox-field.styles";

const sizeStyles = {
	default: comboboxFieldStyles.sizeDefault,
	lg: comboboxFieldStyles.sizeLg,
	sm: comboboxFieldStyles.sizeSm,
};

function getSizeStyle(size?: ComboboxSize | number) {
	if (size === "lg") {
		return sizeStyles.lg;
	}
	if (size === "sm") {
		return sizeStyles.sm;
	}
	return sizeStyles.default;
}

function StartAddon({
	children,
}: {
	children?: ReactNode;
}): ReactElement | null {
	if (!children) {
		return null;
	}
	return (
		<div
			aria-hidden="true"
			data-slot="combobox-start-addon"
			{...props(comboboxFieldStyles.startAddon)}
		>
			{children}
		</div>
	);
}

function TriggerAction({
	props: triggerProps,
	show = false,
}: {
	props?: ComboboxPrimitive.Trigger.Props;
	show?: boolean;
}): ReactElement | null {
	if (!show) {
		return null;
	}
	return (
		<ComboboxTrigger {...triggerProps} {...props(comboboxFieldStyles.trigger)}>
			<ComboboxPrimitive.Icon
				data-slot="combobox-icon"
				{...props(comboboxFieldStyles.icon)}
			>
				<ChevronsUpDownIcon />
			</ComboboxPrimitive.Icon>
		</ComboboxTrigger>
	);
}

function ClearAction({
	props: clearProps,
	show = false,
}: {
	props?: ComboboxPrimitive.Clear.Props;
	show?: boolean;
}): ReactElement | null {
	if (!show) {
		return null;
	}
	return (
		<ComboboxClear {...clearProps}>
			<XIcon />
		</ComboboxClear>
	);
}

function resolveInputProps(
	sizeStyle: (typeof sizeStyles)[keyof typeof sizeStyles],
	startAddon?: ReactNode,
	hasEndAction?: boolean
) {
	return props(
		fieldStyles.input,
		sizeStyle,
		startAddon ? comboboxFieldStyles.inputWithStartAddon : null,
		hasEndAction ? comboboxFieldStyles.inputWithEndAction : null
	);
}

export function ComboboxTrigger({
	children,
	ref: forwardedRef,
	render,
	...rest
}: ComboboxTriggerProps): ReactElement {
	Reflect.deleteProperty(rest, "data-slot");

	return (
		<ComboboxPrimitive.Trigger
			{...rest}
			data-slot="combobox-trigger"
			ref={forwardedRef}
			render={protectSlot("combobox-trigger", render)}
		>
			{children}
		</ComboboxPrimitive.Trigger>
	);
}

export function ComboboxClear({
	children,
	ref: forwardedRef,
	render,
	...rest
}: ComboboxClearProps): ReactElement {
	Reflect.deleteProperty(rest, "data-slot");

	return (
		<ComboboxPrimitive.Clear
			aria-label="Clear selection"
			{...rest}
			data-slot="combobox-clear"
			ref={forwardedRef}
			render={protectSlot("combobox-clear", render)}
			{...props(comboboxFieldStyles.clear)}
		>
			{children}
		</ComboboxPrimitive.Clear>
	);
}

export function ComboboxInput({
	clearProps,
	disabled = false,
	readOnly = false,
	ref: forwardedRef,
	render,
	showClear = false,
	showTrigger = true,
	size = "default",
	startAddon,
	triggerProps,
	...rest
}: ComboboxInputProps): ReactElement {
	Reflect.deleteProperty(rest, "data-slot");

	const sizeStyle = getSizeStyle(size);
	const sizeProp = typeof size === "number" ? size : undefined;
	const hasEndAction = Boolean(showTrigger || showClear);

	return (
		<ComboboxPrimitive.InputGroup
			data-slot="combobox-input-group"
			{...props(comboboxFieldStyles.inputGroup)}
		>
			<StartAddon>{startAddon}</StartAddon>
			<ComboboxPrimitive.Input
				{...rest}
				data-slot="combobox-input"
				disabled={disabled}
				readOnly={readOnly}
				ref={forwardedRef}
				render={protectSlot("combobox-input", render)}
				size={sizeProp}
				{...resolveInputProps(sizeStyle, startAddon, hasEndAction)}
			/>
			<TriggerAction props={triggerProps} show={showTrigger} />
			<ClearAction props={clearProps} show={showClear} />
		</ComboboxPrimitive.InputGroup>
	);
}
