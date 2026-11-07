"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { props } from "@stylexjs/stylex";
import type { ReactElement } from "react";
import { useContext } from "react";
import { controlLabel } from "../../control-label";
import { protectRenderSlot as protectSlot } from "../../render-utils";
import { ScrollArea } from "../scroll-area/scroll-area";
import type {
	ComboboxItemProps,
	ComboboxListProps,
	ComboboxPopupProps,
} from "./combobox.types";
import { CheckIcon, ComboboxContext } from "./combobox-context";
import { comboboxPopupStyles } from "./combobox-popup.styles";

export function ComboboxPopup({
	align = "start",
	alignOffset,
	anchor: anchorProp,
	children,
	portalProps,
	ref: forwardedRef,
	render,
	side = "bottom",
	sideOffset = 4,
	...rest
}: ComboboxPopupProps): ReactElement {
	Reflect.deleteProperty(rest, "data-slot");

	const { chipsRef, multiple } = useContext(ComboboxContext);
	const anchor = anchorProp ?? (multiple ? chipsRef : undefined);

	return (
		<ComboboxPrimitive.Portal {...portalProps}>
			<ComboboxPrimitive.Positioner
				align={align}
				alignOffset={alignOffset}
				anchor={anchor}
				data-slot="combobox-positioner"
				side={side}
				sideOffset={sideOffset}
				{...props(comboboxPopupStyles.positioner)}
			>
				<ComboboxPrimitive.Popup
					{...rest}
					data-slot="combobox-popup"
					ref={forwardedRef}
					render={protectSlot("combobox-popup", render)}
					{...props(comboboxPopupStyles.popup)}
				>
					{children}
				</ComboboxPrimitive.Popup>
			</ComboboxPrimitive.Positioner>
		</ComboboxPrimitive.Portal>
	);
}

export function ComboboxItem({
	children,
	ref: forwardedRef,
	render,
	...rest
}: ComboboxItemProps): ReactElement {
	Reflect.deleteProperty(rest, "data-slot");

	return (
		<ComboboxPrimitive.Item
			{...rest}
			data-slot="combobox-item"
			ref={forwardedRef}
			render={protectSlot("combobox-item", render)}
			{...props(comboboxPopupStyles.item)}
		>
			<ComboboxPrimitive.ItemIndicator
				data-slot="combobox-item-indicator"
				{...props(comboboxPopupStyles.itemIndicator)}
			>
				<CheckIcon />
			</ComboboxPrimitive.ItemIndicator>
			<div
				data-slot="combobox-item-content"
				{...props(comboboxPopupStyles.itemContent)}
			>
				{controlLabel(children)}
			</div>
		</ComboboxPrimitive.Item>
	);
}

export function ComboboxList({
	children,
	ref: forwardedRef,
	render,
	...rest
}: ComboboxListProps): ReactElement {
	Reflect.deleteProperty(rest, "data-slot");

	return (
		<ScrollArea overscrollContain scrollbarGutter scrollFade>
			<ComboboxPrimitive.List
				{...rest}
				data-slot="combobox-list"
				ref={forwardedRef}
				render={protectSlot("combobox-list", render)}
				{...props(comboboxPopupStyles.list)}
			>
				{children}
			</ComboboxPrimitive.List>
		</ScrollArea>
	);
}
