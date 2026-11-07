import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { propertyListStyles } from "./property-list.styles";

export type PropertyListProps = Omit<
	ComponentPropsWithRef<"dl">,
	"className" | "data-slot" | "style"
>;

export type PropertyListItemProps = Omit<
	ComponentPropsWithRef<"div">,
	"className" | "data-slot" | "style"
>;

export type PropertyListLabelProps = Omit<
	ComponentPropsWithRef<"dt">,
	"className" | "data-slot" | "style"
>;

export type PropertyListValueProps = Omit<
	ComponentPropsWithRef<"dd">,
	"className" | "data-slot" | "style"
>;

export function PropertyList({
	children,
	ref: forwardedRef,
	...rest
}: PropertyListProps) {
	return (
		<dl
			{...rest}
			data-slot="property-list"
			ref={forwardedRef}
			{...props(propertyListStyles.root)}
		>
			{children}
		</dl>
	);
}

export function PropertyListItem({
	children,
	ref: forwardedRef,
	...rest
}: PropertyListItemProps) {
	return (
		<div
			{...rest}
			data-slot="property-list-item"
			ref={forwardedRef}
			{...props(propertyListStyles.item)}
		>
			{children}
		</div>
	);
}

export function PropertyListLabel({
	children,
	ref: forwardedRef,
	...rest
}: PropertyListLabelProps) {
	return (
		<dt
			{...rest}
			data-slot="property-list-label"
			ref={forwardedRef}
			{...props(propertyListStyles.label)}
		>
			{children}
		</dt>
	);
}

export function PropertyListValue({
	children,
	ref: forwardedRef,
	...rest
}: PropertyListValueProps) {
	return (
		<dd
			{...rest}
			data-slot="property-list-value"
			ref={forwardedRef}
			{...props(propertyListStyles.value)}
		>
			{children}
		</dd>
	);
}
