"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { props } from "@stylexjs/stylex";
import type { ReactElement } from "react";
import { useCallback, useContext } from "react";
import { controlLabel } from "../../control-label";
import { protectRenderSlot as protectSlot } from "../../render-utils";
import type {
	ComboboxChipProps,
	ComboboxChipRemoveProps,
	ComboboxChipsInputProps,
	ComboboxChipsProps,
	ComboboxSize,
} from "./combobox.types";
import { comboboxChipsStyles } from "./combobox-chips.styles";
import { ComboboxContext, XIcon } from "./combobox-context";

export function ComboboxChipRemove({
	children,
	ref: forwardedRef,
	render,
	...rest
}: ComboboxChipRemoveProps): ReactElement {
	Reflect.deleteProperty(rest, "data-slot");

	return (
		<ComboboxPrimitive.ChipRemove
			aria-label="Remove"
			{...rest}
			data-slot="combobox-chip-remove"
			ref={forwardedRef}
			render={protectSlot("combobox-chip-remove", render)}
			{...props(comboboxChipsStyles.chipRemove)}
		>
			{children ?? <XIcon />}
		</ComboboxPrimitive.ChipRemove>
	);
}

export function ComboboxChip({
	children,
	ref: forwardedRef,
	removeProps,
	render,
	...rest
}: ComboboxChipProps): ReactElement {
	Reflect.deleteProperty(rest, "data-slot");

	return (
		<ComboboxPrimitive.Chip
			{...rest}
			data-slot="combobox-chip"
			ref={forwardedRef}
			render={protectSlot("combobox-chip", render)}
			{...props(comboboxChipsStyles.chip)}
		>
			{controlLabel(children)}
			<ComboboxChipRemove aria-label="Remove" {...removeProps} />
		</ComboboxPrimitive.Chip>
	);
}

export function ComboboxChips({
	children,
	ref: forwardedRef,
	render,
	startAddon,
	...rest
}: ComboboxChipsProps): ReactElement {
	Reflect.deleteProperty(rest, "data-slot");

	const { chipsRef } = useContext(ComboboxContext);
	const targetRef = useCallback(
		(element: HTMLDivElement | null) => {
			if (chipsRef) {
				chipsRef.current = element;
			}
			const cleanup =
				typeof forwardedRef === "function" ? forwardedRef(element) : undefined;
			if (forwardedRef && "current" in forwardedRef) {
				forwardedRef.current = element;
			}

			return () => {
				if (chipsRef) {
					chipsRef.current = null;
				}
				if (typeof cleanup === "function") {
					cleanup();
				} else if (typeof forwardedRef === "function") {
					if (element !== null) {
						forwardedRef(null);
					}
				} else if (forwardedRef && "current" in forwardedRef) {
					forwardedRef.current = null;
				}
			};
		},
		[chipsRef, forwardedRef]
	);

	return (
		<ComboboxPrimitive.Chips
			{...rest}
			data-slot="combobox-chips"
			ref={targetRef}
			render={protectSlot("combobox-chips", render)}
			{...props(comboboxChipsStyles.chips)}
		>
			{startAddon ? (
				<div
					aria-hidden="true"
					data-slot="combobox-start-addon"
					{...props(comboboxChipsStyles.startAddon)}
				>
					{startAddon}
				</div>
			) : null}
			{children}
		</ComboboxPrimitive.Chips>
	);
}

const chipsInputSizeStyles = {
	default: comboboxChipsStyles.chipsInputDefault,
	lg: comboboxChipsStyles.chipsInputLg,
	sm: comboboxChipsStyles.chipsInputSm,
};

function getChipsInputSizeStyle(size?: ComboboxSize | number) {
	if (size === "lg") {
		return chipsInputSizeStyles.lg;
	}
	if (size === "sm") {
		return chipsInputSizeStyles.sm;
	}
	return chipsInputSizeStyles.default;
}

export function ComboboxChipsInput({
	ref: forwardedRef,
	render,
	size = "default",
	...rest
}: ComboboxChipsInputProps): ReactElement {
	Reflect.deleteProperty(rest, "data-slot");

	const sizeProp = typeof size === "number" ? size : undefined;
	const dataSize = typeof size === "string" ? size : undefined;
	const sizeStyle = getChipsInputSizeStyle(size);

	return (
		<ComboboxPrimitive.Input
			{...rest}
			data-size={dataSize}
			data-slot="combobox-chips-input"
			ref={forwardedRef}
			render={protectSlot("combobox-chips-input", render)}
			size={sizeProp}
			{...props(comboboxChipsStyles.chipsInput, sizeStyle)}
		/>
	);
}
