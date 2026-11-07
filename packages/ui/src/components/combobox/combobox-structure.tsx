"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { props } from "@stylexjs/stylex";
import type { ReactElement } from "react";
import { protectRenderSlot as protectSlot } from "../../render-utils";
import type {
	ComboboxEmptyProps,
	ComboboxGroupLabelProps,
	ComboboxGroupProps,
	ComboboxRowProps,
	ComboboxSeparatorProps,
	ComboboxStatusProps,
} from "./combobox.types";
import { comboboxPopupStyles } from "./combobox-popup.styles";

export function ComboboxSeparator({
	ref: forwardedRef,
	render,
	...rest
}: ComboboxSeparatorProps): ReactElement {
	Reflect.deleteProperty(rest, "data-slot");

	return (
		<ComboboxPrimitive.Separator
			{...rest}
			data-slot="combobox-separator"
			ref={forwardedRef}
			render={protectSlot("combobox-separator", render)}
			{...props(comboboxPopupStyles.separator)}
		/>
	);
}

export function ComboboxGroup({
	children,
	ref: forwardedRef,
	render,
	...rest
}: ComboboxGroupProps): ReactElement {
	Reflect.deleteProperty(rest, "data-slot");

	return (
		<ComboboxPrimitive.Group
			{...rest}
			data-slot="combobox-group"
			ref={forwardedRef}
			render={protectSlot("combobox-group", render)}
			{...props(comboboxPopupStyles.group)}
		>
			{children}
		</ComboboxPrimitive.Group>
	);
}

export function ComboboxGroupLabel({
	children,
	ref: forwardedRef,
	render,
	...rest
}: ComboboxGroupLabelProps): ReactElement {
	Reflect.deleteProperty(rest, "data-slot");

	return (
		<ComboboxPrimitive.GroupLabel
			{...rest}
			data-slot="combobox-group-label"
			ref={forwardedRef}
			render={protectSlot("combobox-group-label", render)}
			{...props(comboboxPopupStyles.groupLabel)}
		>
			{children}
		</ComboboxPrimitive.GroupLabel>
	);
}

export function ComboboxEmpty({
	children,
	ref: forwardedRef,
	render,
	...rest
}: ComboboxEmptyProps): ReactElement {
	Reflect.deleteProperty(rest, "data-slot");

	return (
		<ComboboxPrimitive.Empty
			{...rest}
			data-slot="combobox-empty"
			ref={forwardedRef}
			render={protectSlot("combobox-empty", render)}
			{...props(comboboxPopupStyles.empty)}
		>
			{children}
		</ComboboxPrimitive.Empty>
	);
}

export function ComboboxRow({
	children,
	ref: forwardedRef,
	render,
	...rest
}: ComboboxRowProps): ReactElement {
	Reflect.deleteProperty(rest, "data-slot");

	return (
		<ComboboxPrimitive.Row
			{...rest}
			data-slot="combobox-row"
			ref={forwardedRef}
			render={protectSlot("combobox-row", render)}
			{...props(comboboxPopupStyles.row)}
		>
			{children}
		</ComboboxPrimitive.Row>
	);
}

export function ComboboxStatus({
	children,
	ref: forwardedRef,
	render,
	...rest
}: ComboboxStatusProps): ReactElement {
	Reflect.deleteProperty(rest, "data-slot");

	return (
		<ComboboxPrimitive.Status
			{...rest}
			data-slot="combobox-status"
			ref={forwardedRef}
			render={protectSlot("combobox-status", render)}
			{...props(comboboxPopupStyles.status)}
		>
			{children}
		</ComboboxPrimitive.Status>
	);
}
